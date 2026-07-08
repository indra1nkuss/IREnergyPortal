/**
 * VERCEL SERVERLESS FUNCTION: /api/chat
 * Proxy untuk Groq API (Llama 3) — FREE, tanpa kartu kredit.
 * API Key disimpan di Vercel Environment Variables.
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const GROQ_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY tidak ditemukan di Vercel env." });
    }

    const { messages } = req.body;
    const userText = messages?.find(m => m.role === 'user')?.content || '';
    const systemText = messages?.find(m => m.role === 'system')?.content || 'Anda adalah Energy AI, asisten virtual Portal Energi IR. Jawab dengan ramah dan informatif dalam Bahasa Indonesia. Maksimal 4 kalimat.';

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemText },
                    { role: "user", content: userText }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq Error:", JSON.stringify(data));
            return res.status(response.status).json({ error: data.error?.message || "Groq API error." });
        }

        return res.status(200).json(data);

    } catch (err) {
        console.error("Groq Network Error:", err);
        return res.status(500).json({ error: "Gagal terhubung ke Groq API." });
    }
}
