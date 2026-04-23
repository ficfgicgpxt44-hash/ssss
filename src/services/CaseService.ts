import { openDB, IDBPDatabase } from 'idb';
import { Case } from '../types';
import { initialCases } from '../data/initialData';

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
