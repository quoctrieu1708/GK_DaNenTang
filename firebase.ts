// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYNhSqIYLvTgn0fnJKh3Bxbc9RDz65D0Q",
  authDomain: "danentang-2a5e4.firebaseapp.com",
  projectId: "danentang-2a5e4",
  storageBucket: "danentang-2a5e4.firebasestorage.app",
  messagingSenderId: "753805706099",
  appId: "1:753805706099:web:8f730dcbf20cbc74a47b06",
  measurementId: "G-8FH4XFX4NN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);