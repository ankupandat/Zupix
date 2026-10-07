import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: rawConfig.apiKey || "AIzaSyCgcV8rnJYc5o8mRqi0sVs8nDoPhp7MlNw",
  authDomain: rawConfig.authDomain || "lexical-plexus-3wjrd.firebaseapp.com",
  projectId: rawConfig.projectId || "lexical-plexus-3wjrd",
  storageBucket: rawConfig.storageBucket || "lexical-plexus-3wjrd.firebasestorage.app",
  messagingSenderId: rawConfig.messagingSenderId || "96423207903",
  appId: rawConfig.appId || "1:96423207903:web:b853a90e1f4095153f5a6a"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with explicit databaseId and long-polling support for robust connectivity in web sandbox
const dbId = (rawConfig as any).firestoreDatabaseId || '(default)';
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true
  }, dbId);
} catch (e) {
  try {
    firestoreInstance = getFirestore(app, dbId);
  } catch (err) {
    firestoreInstance = getFirestore(app);
  }
}
export const db = firestoreInstance;

export { 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
};
export type { FirebaseUser };
