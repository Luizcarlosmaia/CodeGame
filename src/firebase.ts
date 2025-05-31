import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXtlzsVCca-EJasZNOstMp0QPBYjz6yYI",
  authDomain: "codegame-5270a.firebaseapp.com",
  projectId: "codegame-5270a",
  storageBucket: "codegame-5270a.appspot.com",
  messagingSenderId: "678571618083",
  appId: "1:678571618083:web:7b1a7928bd92b5c6832696",
  measurementId: "G-WXLS5XE6QG",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
