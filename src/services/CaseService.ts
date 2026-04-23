import { openDB, IDBPDatabase } from 'idb';
import { Case } from '../types';

const DB_NAME = 'dentist_portfolio';
const STORE_NAME = 'cases';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Default initial data
const initialCases: Case[] = [
  {
    id: '1',
    createdAt: 1713830400000, // Fixed old date
    title: 'Smile Enhancement (Veneers)',
    category: 'Prosthodontics',
    description: 'Elevating the smile aesthetics by changing teeth color and shape naturally to harmonize with facial features.',
    images: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop'
    ],
  },
  {
    id: '2',
    createdAt: 1713834000000, // Fixed old date
    title: 'Anterior Fracture Restoration',
    category: 'Prosthodontics',
    description: 'Using aesthetic composite fillings to repair fractured upper central incisors while maintaining pulp vitality.',
    images: [
      'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop'
    ],
  },
];

export const CaseService = {
  getCases: async (): Promise<Case[]> => {
    try {
      const db = await getDB();
      const cases = await db.getAll(STORE_NAME);
      
      // Only initialize if data has NEVER been set (checking a special flag in localStorage)
      const isInitialized = localStorage.getItem('db_initialized');
      
      if (cases.length === 0 && !isInitialized) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        for (const c of initialCases) {
          await tx.store.put(c);
        }
        await tx.done;
        localStorage.setItem('db_initialized', 'true');
        return initialCases.sort((a, b) => b.createdAt - a.createdAt);
      }
      
      return cases.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.error("Failed to load cases from IndexedDB", e);
      return initialCases.sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    try {
      const db = await getDB();
      const id = Date.now().toString();
      const createdAt = Date.now();
      const caseWithId = { ...newCase, id, createdAt } as Case;
      await db.put(STORE_NAME, caseWithId);
      return caseWithId;
    } catch (e) {
      console.error("Failed to save case to IndexedDB", e);
      alert("Sorry, failed to save case. Please check your device storage.");
      return null;
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, updatedCase);
      return true;
    } catch (e) {
      console.error("Failed to update case in IndexedDB", e);
      alert("Sorry, failed to update case.");
      return false;
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await tx.store.delete(id);
      await tx.done;
      
      // Ensure the initialization flag is set even after a manual delete
      if (!localStorage.getItem('db_initialized')) {
        localStorage.setItem('db_initialized', 'true');
      }
    } catch (e) {
      console.error("Failed to delete case from IndexedDB", e);
      throw e;
    }
  }
};
