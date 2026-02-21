import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkLMUYSsXjyvq-eD1GHPliFEY2Fo_Zvbg",
  authDomain: "studio-6211681780-1626c.firebaseapp.com",
  projectId: "studio-6211681780-1626c",
  storageBucket: "studio-6211681780-1626c.firebasestorage.app",
  messagingSenderId: "609372897739",
  appId: "1:609372897739:web:4e77bec326bfd8e98c764e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
