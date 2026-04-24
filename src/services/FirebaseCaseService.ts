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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const { auth } = getFirebase();
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
    }
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
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'cases');
      return [];
    }
  },

  async addCase(newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> {
    const { db } = getFirebase();
    if (!db) return null;

    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const caseData = { ...newCase, id, createdAt };

    try {
      await setDoc(doc(db, 'cases', id), caseData);
      return caseData as Case;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `cases/${id}`);
      return null;
    }
  },

  async updateCase(id: string, updates: Partial<Case>): Promise<void> {
    const { db } = getFirebase();
    if (!db) return;

    try {
      await updateDoc(doc(db, 'cases', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `cases/${id}`);
    }
  },

  async deleteCase(id: string): Promise<void> {
    const { db } = getFirebase();
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'cases', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cases/${id}`);
    }
  }
};
