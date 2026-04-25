import { initialCases } from '../data/initialData';
import { FirebaseCaseService } from './FirebaseCaseService';
import { openDB, IDBPDatabase } from 'idb';
import { Case } from '../types';

const DB_NAME = 'dentist_portfolio_v2';
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
      const localCases = await db.getAll(STORE_NAME);
      if (localCases.length > 0) return localCases;

      return initialCases;
    } catch (e) {
      console.error("Load failed, falling back to initial data", e);
      return initialCases;
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const caseWithId = { ...newCase, id, createdAt } as Case;
    
    try {
      const db = await getDB();
      await db.put(STORE_NAME, caseWithId);
      return caseWithId;
    } catch (e) {
      console.error("Local save failed", e);
      return null;
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, updatedCase);
      return true;
    } catch (e) {
      console.error("Local update failed", e);
      return false;
    }
  },

  importCases: async (cases: Case[]): Promise<boolean> => {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const c of cases) {
        await tx.store.put(c);
      }
      await tx.done;
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, id);
    } catch (e) {
      console.error("Local delete failed", e);
    }
  },
  syncAllToSupabase: async (): Promise<{ success: boolean, count?: number, error?: any }> => {
    return { success: false, error: { message: "Cloud sync not configured" } };
  }
};


