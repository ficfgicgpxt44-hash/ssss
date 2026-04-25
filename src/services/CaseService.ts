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
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { Case } from '../types';

const COLLECTION_NAME = 'cases';

export const CaseService = {
  getCases: async (): Promise<Case[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt
        } as Case;
      });
    } catch (e) {
      return handleFirestoreError(e, OperationType.GET, COLLECTION_NAME);
    }
  },

  addCase: async (newCase: Omit<Case, 'id' | 'createdAt'>): Promise<Case | null> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Must be logged in to add cases');

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...newCase,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      return {
        ...newCase,
        id: docRef.id,
        createdAt: Date.now(), // Optimistic return
        ownerId: user.uid
      } as Case;
    } catch (e) {
      return handleFirestoreError(e, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  updateCase: async (updatedCase: Case): Promise<boolean> => {
    try {
      const { id, ...data } = updatedCase;
      const caseDoc = doc(db, COLLECTION_NAME, id);
      await updateDoc(caseDoc, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${COLLECTION_NAME}/${updatedCase.id}`);
      return false;
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  }
};
