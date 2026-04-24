// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0GUrnHMBLoh5X0510IsuJcizSt7ganvk",
  authDomain: "grammar-quest-d2e28.firebaseapp.com",
  projectId: "grammar-quest-d2e28",
  storageBucket: "grammar-quest-d2e28.firebasestorage.app",
  messagingSenderId: "89617948117",
  appId: "1:89617948117:web:0614b6851b7a4c0b56315c",
  measurementId: "G-89GLYHWPJ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;