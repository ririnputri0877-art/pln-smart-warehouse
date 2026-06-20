import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration - PLN Gudang Barang
// Firebase configuration - PLN Gudang Barang
// Firebase configuration - PLN Gudang Barang
// Firebase configuration - PLN Gudang Barang
export const firebaseConfig = {
  apiKey: "AIzaSyDSfYB0mbTvqJlv6ZZBTkRvKVvXG0THZQI",
  authDomain: "://firebaseapp.com",
  projectId: "wms-pln-tabing",
  storageBucket: "wms-pln-tabing.firebasestorage.app",
  messagingSenderId: "964629874965",
  appId: "1:964629874965:web:0a1028701542e89cba411c"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

export default app;
