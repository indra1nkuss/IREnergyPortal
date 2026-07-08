/**
 * VERCEL SERVERLESS FUNCTION: /api/chat
 * Proxy untuk Google Gemini API (Free Tier).
 *
 * API Key disimpan di Vercel Environment Variables (aman).
 * Fallback: jika key ada di Vercel, pake server; kalau tidak, frontend langsung panggil Gemini.
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({
            error: "GEMINI_API_KEY tidak ditemukan. Set di Vercel Environment Variables, atau gunakan key di config.js."
        });
    }

    try {
        const { messages } = req.body;
        const userText = messages?.find(m => m.role === 'user')?.content || '';
        const systemText = messages?.find(m => m.role === 'system')?.content || '';

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemText}\n\nPertanyaan: ${userText}` }]
                    }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Proxy Error:", data);
            return res.status(response.status).json({
                error: data.error?.message || "Error dari Gemini API."
            });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({
            choices: [{ message: { content: text } }]
        });

    } catch (err) {
        console.error("Gemini Proxy Network Error:", err);
        return res.status(500).json({ error: "Gagal terhubung ke Gemini API." });
    }
}
