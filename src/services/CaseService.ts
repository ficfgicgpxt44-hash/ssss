import { 
  collection, 
  getDocs, 
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

export const CaseService = {
  getCases: async (): Promise<Case[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Case[];
    } catch (e) {
      console.error("Failed to load cases from Firestore", e);
      return [];
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    try {
      const createdAt = Date.now();
      // Use addDoc for auto-generated unique IDs to prevent collisions
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...newCase,
        createdAt: createdAt
      });
      
      // Update with the generated ID as a field for UI consistency
      await updateDoc(docRef, { id: docRef.id });
      
      return { ...newCase, id: docRef.id, createdAt } as Case;
    } catch (e) {
      console.error("Failed to save case to Firestore", e);
      handleFirestoreError(e, 'create', COLLECTION_NAME);
      return null;
    }
  },

  upsertCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedCase.id);
      // setDoc handles both create (if ID doesn't exist) and update
      await setDoc(docRef, { ...updatedCase }, { merge: true });
      return true;
    } catch (e) {
      console.error("Failed to upsert case in Firestore", e);
      handleFirestoreError(e, 'write', `${COLLECTION_NAME}/${updatedCase.id}`);
      return false;
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, updatedCase.id);
      await updateDoc(docRef, { ...updatedCase });
      return true;
    } catch (e) {
      console.error("Failed to update case in Firestore", e);
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
