// Vercel Serverless Function: Proxy for YouTube Data API
// Digunakan untuk menyembunyikan API Key dari frontend

export default async function handler(req, res) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "YouTube API Key is not configured in Vercel" });
    }

    try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=${encodeURIComponent(q)}&key=${apiKey}`;
        
        const response = await fetch(youtubeUrl);
        const data = await response.json();

        // Cache-Control: S-Maxage (1 jam) di Edge Network Vercel
        // Ini akan menghemat kuota API meskipun diakses 10.000 orang
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        return res.status(200).json(data);
    } catch (error) {
        console.error("YouTube Proxy Error:", error);
        return res.status(500).json({ error: "Failed to fetch data from YouTube" });
    }
}
