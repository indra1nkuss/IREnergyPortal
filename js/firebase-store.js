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
 * Fallback: jika orderBy gagal (index belum dibuat / field tidak ada),
 * coba lagi tanpa ordering agar data tetap tampil.
 * Returns unsubscribe function untuk cleanup.
 */
export function listenCollection(collectionName, callback, orderField = 'order') {
    const q = query(collection(db, collectionName), orderBy(orderField));

    const unsub = onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(items);
    }, async (error) => {
        console.warn(`🔥 Firestore ${collectionName} (orderBy gagal, fallback tanpa order):`, error.message);
        // Fallback: ambil tanpa orderBy
        try {
            const snap = await getDocs(collection(db, collectionName));
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(items.length > 0 ? items : []);
        } catch (e2) {
            console.error(`🔥 Firestore ${collectionName} fallback juga gagal:`, e2.message);
            callback([]);
        }
    });

    return unsub;
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
