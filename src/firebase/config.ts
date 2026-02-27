import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase - Remplace ces valeurs par celles de TON projet Firebase
// Voir les instructions dans Settings > Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDemo-RemplaceMoiParTaCleFirebase",
  authDomain: "hiace-manager.firebaseapp.com",
  projectId: "hiace-manager",
  storageBucket: "hiace-manager.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

export function initFirebase(config: typeof firebaseConfig) {
  try {
    app = initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
    return { app, db, auth };
  } catch (e) {
    console.error('Firebase init error:', e);
    return null;
  }
}

export function getDB() {
  return db;
}

export function getFirebaseAuth() {
  return auth;
}

export { firebaseConfig as defaultConfig };
