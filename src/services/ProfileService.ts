import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { CVData } from '../types';

const COLLECTION_NAME = 'cv';

export const ProfileService = {
  getProfile: async (userId: string): Promise<CVData | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as CVData;
      }
      return null;
    } catch (e) {
      return handleFirestoreError(e, OperationType.GET, `${COLLECTION_NAME}/${userId}`);
    }
  },

  updateProfile: async (userId: string, data: CVData): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== userId) throw new Error('Unauthorized');

      await setDoc(doc(db, COLLECTION_NAME, userId), {
        ...data,
        ownerId: userId,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${COLLECTION_NAME}/${userId}`);
    }
  }
};
