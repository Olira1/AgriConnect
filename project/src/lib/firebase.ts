import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApXBLK4eN5Ba0zm_KWgNYglRwIwLQ0Gig",
  authDomain: "farmer-4a89d.firebaseapp.com",
  projectId: "farmer-4a89d",
  storageBucket: "farmer-4a89d.firebasestorage.app",
  messagingSenderId: "879161556727",
  appId: "1:879161556727:web:04cbf2bc3bebc4e9029df2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
