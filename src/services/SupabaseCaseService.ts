import { createClient } from '@supabase/supabase-js';
import { Case } from '../types';
import { initialCases } from '../data/initialData';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Falling back to local storage.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SupabaseCaseService = {
  getCases: async (): Promise<Case[]> => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load cases from Supabase:', error);
        // Fallback to initial data if table doesn't exist yet
        return initialCases.sort((a, b) => b.createdAt - a.createdAt);
      }

      // Check if data is empty - if so, seed with initial cases
      if (data && data.length === 0) {
        const isInitialized = localStorage.getItem('db_initialized_supabase');
        if (!isInitialized) {
          // Seed initial data
          await SupabaseCaseService.seedInitialCases();
          localStorage.setItem('db_initialized_supabase', 'true');
          return initialCases.sort((a, b) => b.createdAt - a.createdAt);
        }
      }

      return (data || []).sort((a: any, b: any) => b.created_at - a.created_at);
    } catch (e) {
      console.error('Failed to load cases:', e);
      return initialCases.sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  seedInitialCases: async (): Promise<void> => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      // Check if cases already exist
      const { count } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true });

      if ((count || 0) === 0) {
        const { error } = await supabase.from('cases').insert(
          initialCases.map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            description: c.description,
            images: c.images,
            created_at: c.createdAt
          }))
        );

        if (error) {
          console.error('Failed to seed initial cases:', error);
        }
      }
    } catch (e) {
      console.error('Failed to seed initial cases:', e);
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const id = Date.now().toString();
      const createdAt = Date.now();
      const caseWithId = { ...newCase, id, createdAt } as Case;

      const { error } = await supabase.from('cases').insert({
        id,
        title: newCase.title,
        category: newCase.category,
        description: newCase.description,
        images: newCase.images,
        created_at: createdAt
      });

      if (error) {
        console.error('Failed to save case to Supabase:', error);
        alert('Sorry, failed to save case. Please check your connection.');
        return null;
      }

      return caseWithId;
    } catch (e) {
      console.error('Failed to save case:', e);
      alert('Sorry, failed to save case.');
      return null;
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('cases')
        .update({
          title: updatedCase.title,
          category: updatedCase.category,
          description: updatedCase.description,
          images: updatedCase.images
        })
        .eq('id', updatedCase.id);

      if (error) {
        console.error('Failed to update case in Supabase:', error);
        alert('Sorry, failed to update case.');
        return false;
      }

      return true;
    } catch (e) {
      console.error('Failed to update case:', e);
      alert('Sorry, failed to update case.');
      return false;
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase.from('cases').delete().eq('id', id);

      if (error) {
        console.error('Failed to delete case from Supabase:', error);
        throw error;
      }
    } catch (e) {
      console.error('Failed to delete case:', e);
      throw e;
    }
  }
};
