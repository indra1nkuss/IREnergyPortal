/**
 * VERCEL SERVERLESS FUNCTION: /api/news
 * Proxy untuk GNews API.
 * API Key TIDAK pernah dikirim ke browser — aman dari eksposur GitHub.
 */
export default async function handler(req, res) {
    // Ambil API key dari Vercel Environment Variables
    const API_KEY = process.env.GNEWS_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "Server tidak terkonfigurasi: News API key tidak ditemukan." });
    }

    const url = `https://gnews.io/api/v4/search?q=energi+OR+teknologi+OR+surya&lang=id&country=id&max=6&sortby=publishedAt&token=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Caching 2 jam di Vercel Edge Network agar hemat kuota API
        res.setHeader('Cache-Control', 's-maxage=7200, stale-while-revalidate');
        // Set CORS header agar bisa diakses dari frontend
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json(data);
    } catch (error) {
        console.error("Gagal mengambil berita:", error);
        res.status(500).json({ error: "Gagal mengambil berita dari server." });
    }
}
