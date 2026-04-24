import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Case } from '../types';
import { initialCases } from '../data/initialData';

export const CaseService = {
  getCases: async (): Promise<Case[]> => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured. Falling back to initial data.");
      return initialCases.sort((a, b) => b.createdAt - a.createdAt);
    }

    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        // If the table is empty and we haven't initialized, we could seed it
        // But in a shared DB, we probably don't want everyone seeding automatically.
        return [];
      }

      return data as Case[];
    } catch (e) {
      console.error("Failed to load cases from Supabase", e);
      return [];
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    if (!isSupabaseConfigured()) {
      console.error("Supabase is not configured.");
      return null;
    }

    try {
      const id = crypto.randomUUID();
      const createdAt = Date.now();
      const caseWithId = { ...newCase, id, createdAt };
      
      const { data, error } = await supabase
        .from('cases')
        .insert([caseWithId])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      
      console.log("[v0] Case added successfully:", id);
      return data as Case;
    } catch (e) {
      console.error("Failed to save case to Supabase", e);
      // Return null silently instead of alerting - the caller can handle errors
      return null;
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase
        .from('cases')
        .upsert(updatedCase);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Failed to upsert case in Supabase", e);
      alert("Failed to save or update case.");
      return false;
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error("Failed to delete case from Supabase", e);
      throw e;
    }
  },

  clearAllCases: async (): Promise<void> => {
    if (!isSupabaseConfigured()) return;

    try {
      // Small trick: delete all where ID is not null (or any other always-true condition)
      const { error } = await supabase
        .from('cases')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes everything

      if (error) throw error;
    } catch (e) {
      console.error("Failed to clear cases from Supabase", e);
      throw e;
    }
  }
};

