import { openDB, IDBPDatabase } from 'idb';
import { Case } from '../types';
import { initialCases } from '../data/initialData';
import { supabase } from '../lib/supabase';

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
  migrateLocalToSupabase: async (): Promise<void> => {
    const isMigrated = localStorage.getItem('supabase_migrated');
    if (isMigrated) return;

    try {
      const db = await getDB();
      const localCases = await db.getAll(STORE_NAME);

      if (localCases.length > 0) {
        console.log(`Migrating ${localCases.length} cases to Supabase...`);
        const { error } = await supabase.from('cases').upsert(localCases);
        if (error) throw error;
        localStorage.setItem('supabase_migrated', 'true');
        console.log('Migration successful');
      } else {
        // Even if local is empty, we mark as migrated to stop checking every time
        localStorage.setItem('supabase_migrated', 'true');
      }
    } catch (e) {
      console.error("Migration to Supabase failed", e);
    }
  },

  syncAllToSupabase: async (): Promise<{ success: boolean; count: number; error?: any }> => {
    try {
      const db = await getDB();
      const localCases = await db.getAll(STORE_NAME);

      if (localCases.length === 0) {
        return { success: true, count: 0 };
      }

      console.log(`Syncing ${localCases.length} cases to Supabase...`);
      const { error } = await supabase.from('cases').upsert(localCases);
      
      if (error) throw error;
      
      localStorage.setItem('supabase_migrated', 'true');
      return { success: true, count: localCases.length };
    } catch (e) {
      console.error("Sync to Supabase failed", e);
      return { success: false, count: 0, error: e };
    }
  },

  getCases: async (): Promise<Case[]> => {
    try {
      // Try fetching from Supabase first
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data as Case[];
      }

      // If Supabase is empty, check if we need to migrate first
      await CaseService.migrateLocalToSupabase();

      // Recurse once if we just migrated
      if (localStorage.getItem('supabase_migrated') === 'true') {
        const { data: migratedData } = await supabase
          .from('cases')
          .select('*')
          .order('createdAt', { ascending: false });
        if (migratedData && migratedData.length > 0) return migratedData as Case[];
      }

      // Fallback to initial data if both are empty
      return initialCases.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.error("Failed to load cases from Supabase, falling back to local/initial", e);
      // Fallback to local IndexedDB during errors
      const db = await getDB();
      const cases = await db.getAll(STORE_NAME);
      return (cases.length > 0 ? cases : initialCases).sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    try {
      const id = crypto.randomUUID();
      const createdAt = Date.now();
      const caseWithId = { ...newCase, id, createdAt } as Case;
      
      const { data, error } = await supabase
        .from('cases')
        .insert([caseWithId])
        .select();

      if (error) throw error;
      
      // Also save to local for persistence during offline or errors
      const db = await getDB();
      await db.put(STORE_NAME, caseWithId);

      return (data ? data[0] : caseWithId) as Case;
    } catch (e) {
      console.error("Failed to save case to Supabase", e);
      alert("Failed to save to cloud. Saved locally instead.");
      
      // Fallback local save
      const db = await getDB();
      const caseWithId = { ...newCase, id: Date.now().toString(), createdAt: Date.now() } as Case;
      await db.put(STORE_NAME, caseWithId);
      return caseWithId;
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('cases')
        .upsert(updatedCase)
        .eq('id', updatedCase.id);

      if (error) throw error;

      const db = await getDB();
      await db.put(STORE_NAME, updatedCase);
      return true;
    } catch (e) {
      console.error("Failed to update case in Supabase", e);
      return false;
    }
  },

  importCases: async (cases: Case[]): Promise<boolean> => {
    try {
      if (cases.length === 0) return true;
      
      const { error } = await supabase
        .from('cases')
        .upsert(cases);

      if (error) throw error;

      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const c of cases) {
        await tx.store.put(c);
      }
      await tx.done;
      
      return true;
    } catch (e) {
      console.error("Failed to import cases to Supabase", e);
      return false;
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      await tx.store.delete(id);
      await tx.done;
    } catch (e) {
      console.error("Failed to delete case from Supabase", e);
      throw e;
    }
  }
};
