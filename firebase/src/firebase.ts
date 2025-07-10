// Import the functions you need from the SDKs you need
// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Import getDatabase for Realtime Database
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAymT-9ftX3ANhYb2-nFhnLKsSeMOrMMg8",
  authDomain: "tanstack-starter-dcm.firebaseapp.com",
  databaseURL:
    "https://tanstack-starter-dcm-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "tanstack-starter-dcm",
  storageBucket: "tanstack-starter-dcm.firebasestorage.app",
  messagingSenderId: "352134560332",
  appId: "1:352134560332:web:b136ec0a9a2c68ded352e9",
  measurementId: "G-YSPGFRQ427",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database service
const database = getDatabase(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Export the database and auth instances for use in your components
export { database, auth, googleProvider };
