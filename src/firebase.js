import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

export const configured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'PASTE_HERE';

let app = null;
export let auth = null;
export let db = null;

if (configured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Local cache keeps the app working on a spotty connection; changes sync when back online.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
}
