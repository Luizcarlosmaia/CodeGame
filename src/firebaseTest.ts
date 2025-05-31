import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

async function testFirebase() {
  try {
    const docRef = await addDoc(collection(db, "testCollection"), {
      test: true,
      timestamp: Date.now(),
    });
    console.log("Firebase conectado! Documento criado com ID:", docRef.id);
  } catch (e) {
    console.error("Erro ao conectar ao Firebase:", e);
  }
}

testFirebase();
