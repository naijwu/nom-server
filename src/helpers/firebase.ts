import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';

const serviceAccount = require('../nomServiceKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

export const db = getFirestore();

export async function getUserData(uid: string) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
        return null;
    } else {
        return doc.data();
    }
}