import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';

let firestoreDb: Firestore | null = null;
let firebaseApp: FirebaseApp | null = null;
const BUS_ID = 'hiace-bus-001';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function connectFirebase(config: FirebaseConfig): boolean {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    firestoreDb = getFirestore(firebaseApp);
    return true;
  } catch (e) {
    console.error('Erreur connexion Firebase:', e);
    return false;
  }
}

export function isFirebaseConnected(): boolean {
  return firestoreDb !== null;
}

export function getDb(): Firestore | null {
  return firestoreDb;
}

function busDocRef(colName: string, id: string) {
  if (!firestoreDb) throw new Error('Firebase non connecté');
  return doc(firestoreDb, 'buses', BUS_ID, colName, id);
}

function settingsDocRef() {
  if (!firestoreDb) throw new Error('Firebase non connecté');
  return doc(firestoreDb, 'buses', BUS_ID, 'meta', 'settings');
}

function cashDocRef() {
  if (!firestoreDb) throw new Error('Firebase non connecté');
  return doc(firestoreDb, 'buses', BUS_ID, 'meta', 'cash');
}

export async function fbSaveDailyEntry(entry: object & { id: string }) {
  await setDoc(busDocRef('dailyEntries', entry.id), entry);
}
export async function fbDeleteDailyEntry(id: string) {
  await deleteDoc(busDocRef('dailyEntries', id));
}

export async function fbSaveDebt(debt: object & { id: string }) {
  await setDoc(busDocRef('debts', debt.id), debt);
}
export async function fbDeleteDebt(id: string) {
  await deleteDoc(busDocRef('debts', id));
}

export async function fbSaveProvisionalDebt(pd: object & { id: string }) {
  await setDoc(busDocRef('provisionalDebts', pd.id), pd);
}
export async function fbDeleteProvisionalDebt(id: string) {
  await deleteDoc(busDocRef('provisionalDebts', id));
}

export async function fbSaveAutomation(a: object & { id: string }) {
  await setDoc(busDocRef('automations', a.id), a);
}
export async function fbDeleteAutomation(id: string) {
  await deleteDoc(busDocRef('automations', id));
}

export async function fbSaveObjective(o: object & { id: string }) {
  await setDoc(busDocRef('objectives', o.id), o);
}
export async function fbDeleteObjective(id: string) {
  await deleteDoc(busDocRef('objectives', id));
}

export async function fbSaveNotification(n: object & { id: string }) {
  await setDoc(busDocRef('notifications', n.id), n);
}
export async function fbDeleteNotification(id: string) {
  await deleteDoc(busDocRef('notifications', id));
}

export async function fbSaveSettings(settings: object) {
  await setDoc(settingsDocRef(), settings);
}

export async function fbSaveCash(cashBalance: number) {
  await setDoc(cashDocRef(), { cashBalance });
}

type Unsub = () => void;

export function listenCollection(
  colName: string,
  callback: (data: Record<string, unknown>[]) => void
): Unsub {
  if (!firestoreDb) return () => {};
  const col = collection(firestoreDb, 'buses', BUS_ID, colName);
  return onSnapshot(col, (snap) => {
    const data = snap.docs.map((d) => ({ ...d.data() })) as Record<string, unknown>[];
    callback(data);
  });
}

export function listenMeta(
  docName: string,
  callback: (data: Record<string, unknown> | null) => void
): Unsub {
  if (!firestoreDb) return () => {};
  const ref = doc(firestoreDb, 'buses', BUS_ID, 'meta', docName);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as Record<string, unknown>);
    } else {
      callback(null);
    }
  });
}

export async function getSavedFirebaseConfig(): Promise<FirebaseConfig | null> {
  try {
    if (!firestoreDb) return null;
    const ref = doc(firestoreDb, 'buses', BUS_ID, 'meta', 'firebaseConfig');
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as FirebaseConfig;
    return null;
  } catch {
    return null;
  }
}
