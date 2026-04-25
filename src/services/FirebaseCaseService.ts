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

    try {
      // Upload images to Cloud Storage and get URLs
      const imageUrls: string[] = [];
      
      if (newCase.images && newCase.images.length > 0) {
        console.log(`[v0] Starting upload of ${newCase.images.length} images for case ${id}`);
        
        for (let i = 0; i < newCase.images.length; i++) {
          const base64Image = newCase.images[i];
          try {
            const url = await StorageService.uploadImage(base64Image, id, `image_${i}`);
            imageUrls.push(url);
            console.log(`[v0] Uploaded image ${i + 1}/${newCase.images.length}`);
          } catch (uploadError) {
            console.error(`[v0] Failed to upload image ${i}:`, uploadError);
            // Continue with other images rather than failing completely
          }
        }
      }

      // Create case document with image URLs instead of base64 data
      const caseData: Case = { 
        ...newCase, 
        id, 
        createdAt,
        images: imageUrls // Store only URLs, not base64
      };

      await setDoc(doc(db, 'cases', id), caseData);
      console.log(`[v0] Case saved successfully with ${imageUrls.length} images`);
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
      // Handle image uploads if images are provided
      let processedUpdates = { ...updates };
      
      if (updates.images && updates.images.length > 0) {
        const imageUrls: string[] = [];
        
        for (let i = 0; i < updates.images.length; i++) {
          const imageData = updates.images[i];
          
          // Only upload if it's still base64 (not already a URL)
          if (imageData.startsWith('data:') || imageData.startsWith('blob:')) {
            try {
              const url = await StorageService.uploadImage(imageData, id, `image_${i}`);
              imageUrls.push(url);
            } catch (uploadError) {
              console.error(`[v0] Failed to upload image ${i}:`, uploadError);
              // Keep existing URL if it's already uploaded
              if (!imageData.startsWith('data:') && !imageData.startsWith('blob:')) {
                imageUrls.push(imageData);
              }
            }
          } else {
            // Already a URL, keep it
            imageUrls.push(imageData);
          }
        }
        
        processedUpdates.images = imageUrls;
      }
      
      await updateDoc(doc(db, 'cases', id), processedUpdates);
      console.log(`[v0] Case updated successfully`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `cases/${id}`);
    }
  },

  async deleteCase(id: string): Promise<void> {
    const { db } = getFirebase();
    if (!db) return;

    try {
      // First, get the case to retrieve image URLs
      const caseDoc = doc(db, 'cases', id);
      const response = await getDocs(query(collection(db, 'cases')));
      const caseData = response.docs.find(d => d.id === id)?.data() as Case | undefined;

      // Delete images from Cloud Storage if they exist
      if (caseData?.images && Array.isArray(caseData.images)) {
        console.log(`[v0] Deleting ${caseData.images.length} images for case ${id}`);
        for (const imageUrl of caseData.images) {
          try {
            await StorageService.deleteImage(imageUrl);
          } catch (deleteError) {
            console.warn(`[v0] Failed to delete image, continuing:`, deleteError);
          }
        }
      }

      // Delete the case document
      await deleteDoc(caseDoc);
      console.log(`[v0] Case deleted successfully with all images`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cases/${id}`);
    }
  }
};
