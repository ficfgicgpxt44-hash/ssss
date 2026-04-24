import { 
  collection, 
  getDocs, 
  getDocsFromCache,
  getDocsFromServer,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Case } from '../types';

const COLLECTION_NAME = 'cases';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  if (error.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'unauthenticated',
        email: user?.email || 'N/A',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || false,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

let inMemoryCache: Case[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const CaseService = {
  getCases: async (forceRefresh: boolean = false): Promise<Case[]> => {
    const now = Date.now();
    
    // 0. Return in-memory cache if fresh
    if (!forceRefresh && inMemoryCache && (now - lastFetchTime < CACHE_TTL)) {
      return inMemoryCache;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      // Use getDocsFromServer to ensure we hit the real quota check first
      const querySnapshot = await getDocsFromServer(q);
      const cases = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Case[];
      
      // Update caches
      inMemoryCache = cases;
      lastFetchTime = now;

      // Mirror to localStorage for emergency quota fallback
      try {
        localStorage.setItem('cases_emergency_backup', JSON.stringify(cases));
      } catch (e) {
        console.warn("Failed to update emergency backup", e);
      }
      
      return cases;
    } catch (e: any) {
      if (e.message && (e.message.includes('Quota exceeded') || e.code === 'resource-exhausted')) {
        console.warn("Firebase Quota Limit Reached. Falling back to Emergency Local Backup.");
        
        // 1. Try In-Memory first (even if stale)
        if (inMemoryCache) return inMemoryCache;

        // 2. Try Firestore's internal persisted cache
        try {
          const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
          const cachedSnapshot = await getDocsFromCache(q);
          const cachedCases = cachedSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Case[];
          if (cachedCases.length > 0) {
            inMemoryCache = cachedCases;
            return cachedCases;
          }
        } catch (cacheErr) {
          console.warn("Firestore internal cache failed, trying manual backup...", cacheErr);
        }

        // 3. Try Manual LocalStorage Backup
        const backup = localStorage.getItem('cases_emergency_backup');
        if (backup) {
          try {
            const parsed = JSON.parse(backup) as Case[];
            inMemoryCache = parsed;
            return parsed;
          } catch {
            return [];
          }
        }
      } else {
        console.error("Failed to load cases from Firestore", e);
      }
      return inMemoryCache || [];
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    try {
      const createdAt = Date.now();
      
      // Basic size check for Firestore document limit (approx 1MB)
      const dataSize = JSON.stringify(newCase).length;
      if (dataSize > 1000000) {
        throw new Error("Case data is too large for Firestore (Over 1MB). Please reduce number of images or compress more.");
      }

      // Use addDoc for auto-generated unique IDs to prevent collisions
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...newCase,
        createdAt: createdAt
      });
      
      // Update with the generated ID as a field for UI consistency
      await updateDoc(docRef, { id: docRef.id });
      
      return { ...newCase, id: docRef.id, createdAt } as Case;
    } catch (e: any) {
      console.error("Failed to save case to Firestore", e);
      if (e.message && e.message.includes('Quota exceeded')) {
        alert("Firestore quota reached. Changes cannot be saved today.");
      }
      handleFirestoreError(e, 'create', COLLECTION_NAME);
      return null;
    }
  },

  upsertCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const dataSize = JSON.stringify(updatedCase).length;
      if (dataSize > 1000000) {
        console.warn(`Case ${updatedCase.id} is too large (${dataSize} bytes). Skipping or needs compression.`);
        return false;
      }

      const docRef = doc(db, COLLECTION_NAME, updatedCase.id);
      // setDoc handles both create (if ID doesn't exist) and update
      await setDoc(docRef, { ...updatedCase }, { merge: true });
      return true;
    } catch (e: any) {
      console.error("Failed to upsert case in Firestore", e);
      if (e.message && e.message.includes('Quota exceeded')) {
        console.error("Quota exceeded during upsert");
      }
      handleFirestoreError(e, 'write', `${COLLECTION_NAME}/${updatedCase.id}`);
      return false;
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const dataSize = JSON.stringify(updatedCase).length;
      if (dataSize > 1000000) {
        throw new Error("Case data is too large for Firestore (Over 1MB).");
      }

      const docRef = doc(db, COLLECTION_NAME, updatedCase.id);
      await updateDoc(docRef, { ...updatedCase });
      return true;
    } catch (e: any) {
      console.error("Failed to update case in Firestore", e);
      if (e.message && e.message.includes('Quota exceeded')) {
        alert("Firestore quota reached. Update failed.");
      }
      handleFirestoreError(e, 'update', `${COLLECTION_NAME}/${updatedCase.id}`);
      return false;
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error("Failed to delete case from Firestore", e);
      handleFirestoreError(e, 'delete', `${COLLECTION_NAME}/${id}`);
    }
  }
};
