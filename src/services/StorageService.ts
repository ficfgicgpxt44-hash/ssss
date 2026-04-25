import { ref, uploadString, uploadBytes, getBytes, deleteObject } from 'firebase/storage';
import { getFirebase } from '../lib/firebase';
import { Case } from '../types';

export class StorageService {
  /**
   * Uploads an image (base64 or blob) to Cloud Storage
   */
  static async uploadImage(imageData: string, caseId: string, imageName: string): Promise<string> {
    const { storage } = getFirebase();
    if (!storage) throw new Error('Cloud Storage not initialized');

    try {
      // Create a reference to the file
      const imageRef = ref(storage, `cases/${caseId}/${imageName}.jpg`);
      
      // Upload the image
      if (imageData.startsWith('data:')) {
        // Base64 data URL
        await uploadString(imageRef, imageData, 'data_url');
      } else {
        // Binary blob
        await uploadBytes(imageRef, new Blob([imageData]));
      }

      console.log(`[v0] Image uploaded: cases/${caseId}/${imageName}.jpg`);
      
      // Return the reference path for later retrieval
      return imageRef.fullPath;
    } catch (error) {
      console.error('[v0] Image upload failed:', error);
      throw error;
    }
  }

  /**
   * Uploads a JSON representation of a case to Cloud Storage
   */
  static async uploadCaseJson(caseData: Case): Promise<string> {
    const { storage } = getFirebase();
    if (!storage) throw new Error('Cloud Storage not initialized');

    try {
      const jsonString = JSON.stringify(caseData, null, 2);
      const jsonRef = ref(storage, `cases/${caseData.id}/case.json`);
      
      // Upload JSON metadata
      await uploadString(jsonRef, jsonString, 'raw');
      
      console.log(`[v0] Case JSON uploaded: cases/${caseData.id}/case.json`);
      return jsonRef.fullPath;
    } catch (error) {
      console.error('[v0] Case JSON upload failed:', error);
      throw error;
    }
  }

  /**
   * Uploads entire case with all images to Cloud Storage
   */
  static async uploadFullCase(caseData: Case): Promise<{ caseJsonPath: string; imagePaths: string[] }> {
    const { storage } = getFirebase();
    if (!storage) throw new Error('Cloud Storage not initialized');

    const imagePaths: string[] = [];

    try {
      console.log(`[v0] Starting full case upload for ${caseData.id}`);

      // Upload images if they exist
      if (caseData.images && Array.isArray(caseData.images)) {
        for (let i = 0; i < caseData.images.length; i++) {
          const imageData = caseData.images[i];
          
          // Only upload if it's base64 data (not already a storage path)
          if (imageData.startsWith('data:')) {
            try {
              const imagePath = await this.uploadImage(imageData, caseData.id, `image_${i}`);
              imagePaths.push(imagePath);
              console.log(`[v0] Uploaded image ${i + 1}/${caseData.images.length}`);
            } catch (error) {
              console.warn(`[v0] Failed to upload image ${i}, continuing:`, error);
            }
          }
        }
      }

      // Upload case JSON metadata
      const caseJsonPath = await this.uploadCaseJson(caseData);

      console.log(`[v0] Full case upload completed. JSON path: ${caseJsonPath}, Images: ${imagePaths.length}`);
      return { caseJsonPath, imagePaths };
    } catch (error) {
      console.error('[v0] Full case upload failed:', error);
      throw error;
    }
  }

  /**
   * Exports a case as JSON and uploads to Cloud Storage
   */
  static async exportCaseAsJson(caseData: Case): Promise<string> {
    try {
      console.log(`[v0] Exporting case ${caseData.id} as JSON`);
      const jsonPath = await this.uploadCaseJson(caseData);
      console.log(`[v0] Case exported to: ${jsonPath}`);
      return jsonPath;
    } catch (error) {
      console.error('[v0] Case export failed:', error);
      throw error;
    }
  }

  /**
   * Deletes an image from Cloud Storage
   */
  static async deleteImage(imagePath: string): Promise<void> {
    const { storage } = getFirebase();
    if (!storage) throw new Error('Cloud Storage not initialized');

    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      console.log(`[v0] Image deleted: ${imagePath}`);
    } catch (error) {
      console.error('[v0] Image deletion failed:', error);
      throw error;
    }
  }

  /**
   * Deletes an entire case folder from Cloud Storage
   */
  static async deleteCase(caseId: string): Promise<void> {
    const { storage } = getFirebase();
    if (!storage) throw new Error('Cloud Storage not initialized');

    try {
      console.log(`[v0] Deleting case folder: cases/${caseId}`);
      
      // Delete case.json
      try {
        const jsonRef = ref(storage, `cases/${caseId}/case.json`);
        await deleteObject(jsonRef);
      } catch (error) {
        console.warn('[v0] Case JSON not found or already deleted');
      }

      // Note: Firebase Storage doesn't support folder deletion
      // Individual files must be deleted separately
      // This is a limitation - consider implementing a Cloud Function for full folder cleanup
      console.log(`[v0] Case metadata deleted. Note: Images must be deleted individually or via Cloud Function`);
    } catch (error) {
      console.error('[v0] Case deletion failed:', error);
      throw error;
    }
  }

  /**
   * Gets download URL for an image
   */
  static async getImageUrl(imagePath: string): Promise<string> {
    const { storage } = getFirebase();
    if (!storage) throw new Error('Cloud Storage not initialized');

    try {
      const imageRef = ref(storage, imagePath);
      const blob = await getBytes(imageRef);
      return URL.createObjectURL(new Blob([blob]));
    } catch (error) {
      console.error('[v0] Failed to get image URL:', error);
      throw error;
    }
  }
}
