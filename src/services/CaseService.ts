import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth, isQuotaOrOfflineError } from '../lib/firebase';
import { Case } from '../types';
import { initialCases } from '../data/initialData';

const COLLECTION_NAME = 'cases';
const LOCAL_STORAGE_KEY = 'sami_portfolio_cases';

function getLocalCases(): Case[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  // If no cases saved locally, populate with default portfolio cases
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialCases));
  } catch {
    // Ignore storage quota
  }
  return initialCases;
}

function saveLocalCases(cases: Case[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cases));
  } catch {
    // Ignore storage quota
  }
}

export const CaseService = {
  getCases: async (): Promise<Case[]> => {
    const local = getLocalCases();

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const remoteCases = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt || Date.now())
          } as Case;
        });

        // Merge remote cases with any locally created items that might not have synced yet
        const remoteIds = new Set(remoteCases.map(c => c.id));
        const unsyncedLocal = local.filter(c => !remoteIds.has(c.id) && c.id.startsWith('local_'));
        const combined = [...unsyncedLocal, ...remoteCases];

        saveLocalCases(combined);
        return combined;
      } else if (local.length > 0) {
        return local;
      }
    } catch (e) {
      if (isQuotaOrOfflineError(e)) {
        // Quota limit exceeded or client offline - seamlessly return local cases
        return local;
      }
      console.warn('Could not fetch cases from server, using local data');
    }

    return local;
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case> => {
    const tempId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const created: Case = {
      ...newCase,
      id: tempId,
      createdAt: Date.now()
    };

    // 1. Immediately store in local cache
    const current = getLocalCases();
    const updated = [created, ...current];
    saveLocalCases(updated);

    // 2. Try Firestore persist
    try {
      const user = auth.currentUser;
      const ownerId = user?.uid || 'admin_sami';

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...newCase,
        ownerId,
        createdAt: serverTimestamp(),
      });

      // Update the local case with real Firestore document ID
      created.id = docRef.id;
      const synced = updated.map(c => c.id === tempId ? { ...c, id: docRef.id } : c);
      saveLocalCases(synced);
    } catch (e) {
      if (isQuotaOrOfflineError(e)) {
        console.warn('Case saved locally (cloud quota reached or client offline)');
      } else {
        console.warn('Case saved locally; remote sync deferred:', e);
      }
    }

    return created;
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    // 1. Update locally
    const current = getLocalCases();
    const updated = current.map(c => c.id === updatedCase.id ? updatedCase : c);
    saveLocalCases(updated);

    // 2. Try Firestore update
    try {
      const { id, ...data } = updatedCase;
      if (!id.startsWith('local_')) {
        const caseDoc = doc(db, COLLECTION_NAME, id);
        await updateDoc(caseDoc, {
          ...data,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      if (isQuotaOrOfflineError(e)) {
        console.warn('Case updated locally (cloud quota reached or client offline)');
      } else {
        console.warn('Case updated locally; remote sync deferred:', e);
      }
    }
    return true;
  },

  deleteCase: async (id: string): Promise<void> => {
    // 1. Remove locally
    const current = getLocalCases();
    const updated = current.filter(c => c.id !== id);
    saveLocalCases(updated);

    // 2. Try Firestore delete
    try {
      if (!id.startsWith('local_')) {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
      }
    } catch (e) {
      if (isQuotaOrOfflineError(e)) {
        console.warn('Case removed locally (cloud quota reached or client offline)');
      } else {
        console.warn('Case removed locally; remote sync deferred:', e);
      }
    }
  }
};
