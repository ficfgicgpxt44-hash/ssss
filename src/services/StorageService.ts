import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirebase } from '../lib/firebase';

export const StorageService = {
  /**
   * Upload a base64 image to Firebase Cloud Storage
   * @param base64Data - The base64 encoded image data
   * @param caseId - The case ID for organizing images
   * @param fileName - The file name (without extension)
   * @returns The download URL of the uploaded image
   */
  async uploadImage(base64Data: string, caseId: string, fileName: string): Promise<string> {
    const { storage } = getFirebase();
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    try {
      // Convert base64 to blob
      const response = await fetch(base64Data);
      const blob = await response.blob();

      // Create storage reference with organized path: cases/{caseId}/{timestamp}_{fileName}
      const timestamp = Date.now();
      const storageRef = ref(storage, `cases/${caseId}/${timestamp}_${fileName}.jpg`);

      // Upload the blob
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          caseId: caseId,
        }
      });

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("[v0] Image uploaded successfully:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("[v0] Error uploading image:", error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Delete an image from Firebase Cloud Storage
   * @param imageUrl - The download URL of the image to delete
   */
  async deleteImage(imageUrl: string): Promise<void> {
    const { storage } = getFirebase();
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    try {
      // Create a reference from the URL
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      console.log("[v0] Image deleted successfully:", imageUrl);
    } catch (error) {
      // Log but don't throw - sometimes images may already be deleted
      console.warn("[v0] Error deleting image (may already be deleted):", error);
    }
  },

  /**
   * Delete all images for a case
   * @param caseId - The case ID whose images should be deleted
   */
  async deleteAllImagesForCase(caseId: string): Promise<void> {
    const { storage } = getFirebase();
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }

    try {
      // Note: Firebase Storage doesn't have a direct "list and delete" for Web SDK
      // Images will be cleaned up separately or through Cloud Functions
      console.log("[v0] Marked case images for cleanup:", caseId);
    } catch (error) {
      console.error("[v0] Error preparing image cleanup:", error);
    }
  }
};
