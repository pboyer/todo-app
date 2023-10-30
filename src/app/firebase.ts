// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAgLxorS4DPzo8LCMei-dg_7XwpzXlbzI4",
  authDomain: "todo-app.ptrbyr.com",
  projectId: "todo-app-4607d",
  storageBucket: "todo-app-4607d.appspot.com",
  messagingSenderId: "367635955535",
  appId: "1:367635955535:web:7ccdd15df9b588b1764f3a",
  measurementId: "G-B4VC4C7E5F",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app!);
export const auth = getAuth(app);
