import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export const googleProvider = new GoogleAuthProvider();

export function getFirebase() {
  if (!app && firebaseConfig.apiKey) {
    try {
      const { firestoreDatabaseId, ...standardConfig } = firebaseConfig;
      app = initializeApp(standardConfig);
      
      if (!firestoreDatabaseId || firestoreDatabaseId === '(default)') {
        db = getFirestore(app);
      } else {
        db = getFirestore(app, firestoreDatabaseId);
      }
      
      auth = getAuth(app);

      // Verify connection
      getDocFromServer(doc(db, 'test', 'connection')).catch(() => {});
    } catch (error) {
      console.error("Firebase Initialization Error:", error);
    }
  }
  return { app, db, auth };
}
