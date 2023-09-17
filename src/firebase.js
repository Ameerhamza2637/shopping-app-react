// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import {getFirestore} from 'firebase/firestore'
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7FSRmWMdO4Xa_i0iFfvR0V13bH-wwbxc",
  authDomain: "musketeers-bazar.firebaseapp.com",
  projectId: "musketeers-bazar",
  storageBucket: "musketeers-bazar.appspot.com",
  messagingSenderId: "1098973706791",
  appId: "1:1098973706791:web:26095cc88e155181a62c02",
  measurementId: "G-G6BXGGJ420"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;