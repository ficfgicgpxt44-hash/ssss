import { createClient } from '@supabase/supabase-js';
import { Case } from '../types';
import { initialCases } from '../data/initialData';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('[Supabase] Environment variables not configured. Using localStorage fallback.');
}

const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// LocalStorage fallback functions
const getLocalCases = (): Case[] => {
  try {
    const stored = localStorage.getItem('cases_data');
    return stored ? JSON.parse(stored) : initialCases;
  } catch (e) {
    console.error('[LocalStorage] Failed to parse stored cases:', e);
    return initialCases;
  }
};

const saveLocalCases = (cases: Case[]): void => {
  try {
    localStorage.setItem('cases_data', JSON.stringify(cases));
  } catch (e) {
    console.error('[LocalStorage] Failed to save cases:', e);
  }
};

export const SupabaseCaseService = {
  getCases: async (): Promise<Case[]> => {
    // If Supabase is not configured, use localStorage
    if (!isSupabaseConfigured) {
      console.log('[SupabaseCaseService] Using localStorage fallback');
      return getLocalCases().sort((a, b) => b.createdAt - a.createdAt);
    }

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase] Failed to load cases:', error);
        // Fallback to localStorage if Supabase query fails
        return getLocalCases().sort((a, b) => b.createdAt - a.createdAt);
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
      console.error('[SupabaseCaseService] Failed to load cases:', e);
      // Fallback to localStorage
      return getLocalCases().sort((a, b) => b.createdAt - a.createdAt);
    }
  },

  seedInitialCases: async (): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[SupabaseCaseService] Supabase not configured, skipping seed');
      return;
    }

    try {
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
          console.error('[Supabase] Failed to seed initial cases:', error);
        }
      }
    } catch (e) {
      console.error('[SupabaseCaseService] Failed to seed initial cases:', e);
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    const id = Date.now().toString();
    const createdAt = Date.now();
    const caseWithId = { ...newCase, id, createdAt } as Case;

    // If Supabase is not configured, save to localStorage
    if (!isSupabaseConfigured || !supabase) {
      try {
        const allCases = getLocalCases();
        allCases.push(caseWithId);
        saveLocalCases(allCases);
        console.log('[SupabaseCaseService] Case saved to localStorage');
        return caseWithId;
      } catch (e) {
        console.error('[LocalStorage] Failed to save case:', e);
        alert('Sorry, failed to save case. Please check your storage.');
        return null;
      }
    }

    try {
      const { error } = await supabase.from('cases').insert({
        id,
        title: newCase.title,
        category: newCase.category,
        description: newCase.description,
        images: newCase.images,
        created_at: createdAt
      });

      if (error) {
        console.error('[Supabase] Failed to save case:', error);
        alert('Sorry, failed to save case. Please check your connection.');
        return null;
      }

      return caseWithId;
    } catch (e) {
      console.error('[SupabaseCaseService] Failed to save case:', e);
      alert('Sorry, failed to save case.');
      return null;
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    // If Supabase is not configured, update in localStorage
    if (!isSupabaseConfigured || !supabase) {
      try {
        const allCases = getLocalCases();
        const index = allCases.findIndex(c => c.id === updatedCase.id);
        if (index === -1) {
          alert('Case not found.');
          return false;
        }
        allCases[index] = updatedCase;
        saveLocalCases(allCases);
        console.log('[SupabaseCaseService] Case updated in localStorage');
        return true;
      } catch (e) {
        console.error('[LocalStorage] Failed to update case:', e);
        alert('Sorry, failed to update case.');
        return false;
      }
    }

    try {
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
        console.error('[Supabase] Failed to update case:', error);
        alert('Sorry, failed to update case.');
        return false;
      }

      return true;
    } catch (e) {
      console.error('[SupabaseCaseService] Failed to update case:', e);
      alert('Sorry, failed to update case.');
      return false;
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    // If Supabase is not configured, delete from localStorage
    if (!isSupabaseConfigured || !supabase) {
      try {
        const allCases = getLocalCases();
        const filtered = allCases.filter(c => c.id !== id);
        saveLocalCases(filtered);
        console.log('[SupabaseCaseService] Case deleted from localStorage');
        return;
      } catch (e) {
        console.error('[LocalStorage] Failed to delete case:', e);
        throw e;
      }
    }

    try {
      const { error } = await supabase.from('cases').delete().eq('id', id);

      if (error) {
        console.error('[Supabase] Failed to delete case:', error);
        throw error;
      }
    } catch (e) {
      console.error('[SupabaseCaseService] Failed to delete case:', e);
      throw e;
    }
  }
};
