/**
 * CONFIGURATION PROVIDER
 *
 * ✅ AMAN UNTUK GITHUB — Tidak ada API key di sini.
 * Semua API key sensitif disimpan di Vercel Environment Variables.
 * Frontend hanya memanggil endpoint proxy serverless /api/* milik sendiri.
 */
const CONFIG = {
    // ─── Proxy Endpoints (Vercel Serverless Functions) ───────────────────────
    CHAT_API_URL: "/api/chat",
    NEWS_API_URL: "/api/news",
    YOUTUBE_API_URL: "/api/youtube",

    // ─── Google Gemini AI (GRATIS — tanpa kartu kredit) ───────────────────────
    // 🔐 API key disimpan di Vercel Environment Variables (GEMINI_API_KEY)
    // Frontend memanggil proxy /api/chat — key tidak pernah ke browser.
    GEMINI: {
        apiKey: "", // Kosong — dipakai sebagai fallback; utama via Vercel env
        model: "gemini-2.0-flash"
    },

    // ─── Cloudinary (Upload Gambar Gratis) ────────────────────────────────────
    CLOUDINARY: {
        cloudName: "r6ntfx6e",
        uploadPreset: "portal_energy"
    },

    // ─── Firebase Configuration ───────────────────────────────────────────────
    // Firebase config boleh ada di frontend (ini adalah public config, bukan secret key)
    // Keamanan Firebase diatur oleh Firebase Security Rules di console.
    FIREBASE: {
        apiKey: "AIzaSyC1vnpi98cqTQDgSsz32yJ-pVmxKclnJiE",
        authDomain: "portal-saya.firebaseapp.com",
        databaseURL: "https://portal-saya-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "portal-saya",
        storageBucket: "portal-saya.firebasestorage.app",
        messagingSenderId: "185591839287",
        appId: "1:185591839287:web:00f8eaf9f943c41b8addb2"
    }
};

export default CONFIG;

