import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpEpQZanjwF0ssh6BmJxS_T6nbc1F1CtY",
  authDomain: "men-matter-too-space.firebaseapp.com",
  databaseURL: "https://men-matter-too-space-default-rtdb.firebaseio.com",
  projectId: "men-matter-too-space",
  storageBucket: "men-matter-too-space.firebasestorage.app",
  messagingSenderId: "475249759344",
  appId: "1:475249759344:web:8c53eba04a778a58fbd0b5",
  measurementId: "G-LS507P0SQC",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
