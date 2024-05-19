// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyD8zILnvpC6YaXhKoHNLzZATBUs2Nc-6_A",
  authDomain: "nomnomnomnomnomnom.firebaseapp.com",
  projectId: "nomnomnomnomnomnom",
  storageBucket: "nomnomnomnomnomnom.appspot.com",
  messagingSenderId: "319368335728",
  appId: "1:319368335728:web:60f48f7943a4f458573fb5",
  measurementId: "G-4LXV92DV53"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function getUserData(uid: string) {

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    }

    return null
}