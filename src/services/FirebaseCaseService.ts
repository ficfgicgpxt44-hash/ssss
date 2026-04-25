import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  type Firestore 
} from 'firebase/firestore';
import { getFirebase } from '../lib/firebase';
import { Case } from '../types';
import { StorageService } from './StorageService';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const { auth } = getFirebase();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const FirebaseCaseService = {
  async getCases(): Promise<Case[]> {
    const { db } = getFirebase();
    if (!db) return [];

    try {
      const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Case[];
    } catch (error: any) {
      // If index is missing, fallback to unsorted and sort in memory
      if (error.message && error.message.includes('requires an index')) {
        try {
          const snapshot = await getDocs(collection(db, 'cases'));
          const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Case[];
          return docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } catch (innerError) {
          handleFirestoreError(innerError, OperationType.LIST, 'cases');
          return [];
        }
      }
      handleFirestoreError(error, OperationType.LIST, 'cases');
      return [];
    }
  },

  async addCaseWithId(id: string, data: Omit<Case, 'id'>): Promise<void> {
    const { db } = getFirebase();
    if (!db) throw new Error("Firebase not initialized");

    try {
      await setDoc(doc(db, 'cases', id), { ...data, id });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `cases/${id}`);
    }
  },

  async addCase(newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> {
    const { db } = getFirebase();
    if (!db) return null;

    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const caseData = { ...newCase, id, createdAt } as Case;

    try {
      // Upload case JSON to Cloud Storage
      console.log(`[v0] Uploading case JSON for ${id}`);
      try {
        await StorageService.exportCaseAsJson(caseData);
        console.log(`[v0] Case JSON uploaded successfully`);
      } catch (storageError) {
        console.warn('[v0] Cloud Storage upload failed, but continuing with Firestore:', storageError);
      }

      // Save to Firestore
      await setDoc(doc(db, 'cases', id), caseData);
      return caseData;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `cases/${id}`);
      return null;
    }
  },

  async updateCase(id: string, updates: Partial<Case>): Promise<void> {
    const { db } = getFirebase();
    if (!db) return;

    try {
      // First update Firestore
      await updateDoc(doc(db, 'cases', id), updates);

      // Then upload updated case JSON to Cloud Storage
      // Fetch the complete updated case
      try {
        const q = query(collection(db, 'cases'));
        const snapshot = await getDocs(q);
        const updatedCaseDoc = snapshot.docs.find(d => d.id === id);
        
        if (updatedCaseDoc) {
          const updatedCase = { ...updatedCaseDoc.data(), id } as Case;
          console.log(`[v0] Uploading updated case JSON for ${id}`);
          await StorageService.exportCaseAsJson(updatedCase);
          console.log(`[v0] Updated case JSON uploaded to Cloud Storage`);
        }
      } catch (storageError) {
        console.warn('[v0] Cloud Storage update failed, but Firestore was updated:', storageError);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `cases/${id}`);
    }
  },

  async deleteCase(id: string): Promise<void> {
    const { db } = getFirebase();
    if (!db) return;

    try {
      // Delete from Cloud Storage first
      try {
        console.log(`[v0] Deleting case from Cloud Storage: ${id}`);
        await StorageService.deleteCase(id);
        console.log(`[v0] Case deleted from Cloud Storage`);
      } catch (storageError) {
        console.warn('[v0] Cloud Storage deletion failed, continuing with Firestore:', storageError);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'cases', id));
      console.log(`[v0] Case deleted from Firestore and Cloud Storage`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cases/${id}`);
    }
  }
};
