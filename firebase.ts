import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCm_bT4cDt7uXSBhOPPqTseHyTZkNox9Xw",
  authDomain: "expense-analyzer-app-9c678.firebaseapp.com",
  projectId: "expense-analyzer-app-9c678",
  storageBucket: "expense-analyzer-app-9c678.firebasestorage.app",
  messagingSenderId: "452157810425",
  appId: "1:452157810425:web:d048c1ffbd01f7d5996428"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
