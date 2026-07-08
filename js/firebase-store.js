/**
 * FIRESTORE DATA STORE — Shared untuk frontend & admin
 * Semua Firebase import via importmap yang sudah ada di halaman.
 */
import CONFIG from './config.js';
import { initializeApp, getApps } from "firebase/app";
import {
    getFirestore, collection, query, orderBy,
    onSnapshot, getDocs
} from "firebase/firestore";

// Hanya inisialisasi SEKALI (amankan dari double-init)
const app = getApps().length === 0 ? initializeApp(CONFIG.FIREBASE) : getApps()[0];
const db = getFirestore(app);

/**
 * Realtime listener — callback dipanggil setiap ada perubahan.
 * Returns unsubscribe function untuk cleanup.
 */
export function listenCollection(collectionName, callback, orderField = 'order') {
    const q = query(collection(db, collectionName), orderBy(orderField));

    return onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(items);
    }, (error) => {
        console.warn(`🔥 Firestore ${collectionName}:`, error.message);
        callback(null);
    });
}

/**
 * One-time fetch (tanpa realtime).
 */
export async function getCollectionOnce(collectionName) {
    const q = query(collection(db, collectionName), orderBy('order'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Export db untuk dipakai inline script index.html */
export { db, app, getFirestore };
