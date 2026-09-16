import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isQuotaOrOfflineError } from '../lib/firebase';
import { CVData } from '../types';
import { defaultCVData } from '../data/initialData';

const COLLECTION_NAME = 'cv';
const LOCAL_STORAGE_KEY = 'sami_portfolio_cv';
export const DEFAULT_DOCTOR_ID = '7MI8gihA7CO7319M2S9MDpWfVHh1';

let memoryCvCache: CVData | null = null;

function getLocalCv(): CVData {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore JSON/storage errors
  }
  return defaultCVData;
}

function saveLocalCv(data: CVData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    memoryCvCache = data;
  } catch {
    // Ignore storage quota/private mode errors
  }
}

export const ProfileService = {
  getProfile: async (userId?: string): Promise<CVData> => {
    if (memoryCvCache) {
      return memoryCvCache;
    }

    const localData = getLocalCv();
    const targetId = userId || DEFAULT_DOCTOR_ID;

    try {
      const docRef = doc(db, COLLECTION_NAME, targetId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as CVData;
        const merged = { ...defaultCVData, ...firestoreData };
        saveLocalCv(merged);
        return merged;
      }
    } catch (e) {
      if (isQuotaOrOfflineError(e)) {
        // Quota exceeded or offline - fallback safely to local/default data
        memoryCvCache = localData;
        return localData;
      }
      console.warn('Could not retrieve remote profile, using local fallback');
    }

    memoryCvCache = localData;
    return localData;
  },

  updateProfile: async (userId?: string, data?: CVData): Promise<void> => {
    if (!data) return;
    const targetId = userId || DEFAULT_DOCTOR_ID;
    
    // Always persist to local cache first
    saveLocalCv(data);

    try {
      await setDoc(doc(db, COLLECTION_NAME, targetId), {
        ...data,
        ownerId: targetId,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      if (isQuotaOrOfflineError(e)) {
        console.warn('Profile saved locally (cloud quota reached or client offline)');
        return;
      }
      console.warn('Profile saved locally; cloud sync deferred:', e);
    }
  }
};
