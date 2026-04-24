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
  migrateLocalToFirebase: async (): Promise<void> => {
    localStorage.setItem('firebase_migrated', 'true');
  },

  syncAllToFirebase: async (): Promise<{ success: boolean; count: number; error?: any }> => {
    try {
      const db = await getDB();
      const localCases = await db.getAll(STORE_NAME);
      
      if (localCases.length === 0) return { success: true, count: 0 };
      
      for (const c of localCases) {
        const { id, ...data } = c;
        await FirebaseCaseService.addCase(data);
      }
      
      return { success: true, count: localCases.length };
    } catch (e) {
      return { success: false, count: 0, error: e };
    }
  },

  getCases: async (): Promise<Case[]> => {
    try {
      const cases = await FirebaseCaseService.getCases();
      if (cases.length > 0) return cases;

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
    } catch (e) {
      console.error("Local save failed", e);
    }

    try {
      const cloudResult = await FirebaseCaseService.addCase(newCase);
      if (cloudResult) return cloudResult;
    } catch (e) {
      console.error("Cloud save failed", e);
    }

    return caseWithId;
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, updatedCase);
    } catch (e) {
      console.error("Local update failed", e);
    }

    try {
      const { id, ...updates } = updatedCase;
      await FirebaseCaseService.updateCase(id, updates);
      return true;
    } catch (e) {
      console.error("Firebase update failed", e);
      return false;
    }
  },

  importCases: async (cases: Case[]): Promise<boolean> => {
    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const c of cases) {
        await tx.store.put(c);
        const { id, ...data } = c;
        FirebaseCaseService.addCase(data).catch(() => {});
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

    await FirebaseCaseService.deleteCase(id);
  },

  syncAllToSupabase: async () => {
    return CaseService.syncAllToFirebase();
  }
};


