// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 1. Added this import line

const firebaseConfig = {
  apiKey: "AIzaSyDQGTIAjAizludrpY1hF2rrP_AZS8wso7Q",
  authDomain: "mergency-a5b9e.firebaseapp.com",
  databaseURL: "https://mergency-a5b9e-default-rtdb.firebaseio.com",
  projectId: "mergency-a5b9e",
  storageBucket: "mergency-a5b9e.firebasestorage.app",
  messagingSenderId: "960451266993",
  appId: "1:960451266993:web:fc1dd7bf4f4c5d89f29590",
  measurementId: "G-P9XGXEEK8S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Changed to camelCase with a capital 'S'
export const db = getFirestore(app);