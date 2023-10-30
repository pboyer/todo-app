// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgLxorS4DPzo8LCMei-dg_7XwpzXlbzI4",
  authDomain: "todo-app-4607d.firebaseapp.com",
  projectId: "todo-app-4607d",
  storageBucket: "todo-app-4607d.appspot.com",
  messagingSenderId: "367635955535",
  appId: "1:367635955535:web:7ccdd15df9b588b1764f3a",
  measurementId: "G-B4VC4C7E5F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore(app);
