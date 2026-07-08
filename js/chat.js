/**
 * CHAT SERVICE — Energy AI
 * Prioritas: proxy Vercel (/api/chat) → direct Gemini (fallback) → local fallback
 *
 * ✅ GRATIS — Google Gemini Free Tier (60 req/menit)
 * ✅ API key AMAN di Vercel Environment Variables
 * ✅ Bisa jalan di local via fallback langsung
 */
import CONFIG from './config.js';

const GEMINI_KEY = CONFIG.GEMINI.apiKey;
const GEMINI_MODEL = CONFIG.GEMINI.model;

const systemPrompt = `Anda adalah Energy AI, asisten virtual untuk website 'Portal Energi' milik Team Energi IR.

INFORMASI PORTAL:
- Portal berisi daftar pemenang training, data konsumsi energi (SEU IR), ENPI, project efisiensi, dokumentasi, dan struktur tim.
- Tim: Goldy Raymond PPS (Manager), M Priyo Pambudi (Supervisor), Indra Nurul Kusuma (Staff), Marini (Dokumen), Juliansyah (Patrol).

INSTRUKSI:
- Jawab ramah, profesional, Bahasa Indonesia. Maksimal 3 kalimat.
- Jika ditanya di luar konteks portal, arahkan kembali ke fitur portal.`;

const fallbackLocal = (userText) => {
    const t = userText.toLowerCase();
    if (t.includes('pemenang') || t.includes('siapa') || t.includes('winner'))
        return "🏆 Daftar pemenang training ada di tab <strong>Pemenang</strong>.";
    if (t.includes('halo') || t.includes('hi') || t.includes('hai') || t.includes('helo'))
        return "👋 Halo! Saya <strong>Energy AI</strong>, asisten Portal Energi. Ada yang bisa saya bantu?";
    if (t.includes('training') || t.includes('pelatihan'))
        return "📚 Training online diikuti 1.500+ trainee dari berbagai departemen.";
    if (t.includes('tim') || t.includes('team') || t.includes('energi'))
        return "⚡ Team Energi IR adalah divisi inti pengembangan SDM.";
    if (t.includes('seu') || t.includes('mesin'))
        return "⚡ Data konsumsi energi ada di menu <strong>Kinerja > SEU IR</strong>.";
    if (t.includes('enpi'))
        return "📋 Informasi ENPI ada di menu <strong>Kinerja > ENPI</strong>.";
    if (t.includes('efisiensi') || t.includes('project'))
        return "🔧 Detail project efisiensi ada di menu <strong>Kinerja > Project Efisiensi</strong>.";
    return "💡 Coba tanya tentang pemenang, training, SEU, ENPI, atau project efisiensi!";
};

async function callDirectGemini(userText) {
    if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY tidak dikonfigurasi');
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\nPertanyaan: ${userText}` }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
            })
        }
    );
    const data = await res.json();
    if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
    }
    throw new Error(data.error?.message || `HTTP ${res.status}`);
}

async function callProxy(userText) {
    const res = await fetch(CONFIG.CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userText }
            ]
        })
    });
    const data = await res.json();
    if (res.ok && data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content.trim();
    }
    throw new Error(data.error || `Proxy HTTP ${res.status}`);
}

export const getAiResponse = async (userText) => {
    // 1. Coba proxy Vercel dulu
    try {
        console.log("🤖 Energy AI: Mencoba proxy /api/chat...");
        return await callProxy(userText);
    } catch (proxyErr) {
        console.warn("Proxy gagal, fallback ke direct Gemini:", proxyErr.message);
    }

    // 2. Fallback direct Gemini
    try {
        console.log("🤖 Energy AI: Direct Gemini...");
        return await callDirectGemini(userText);
    } catch (geminiErr) {
        console.warn("Gemini langsung gagal:", geminiErr.message);
    }

    // 3. Local fallback
    return fallbackLocal(userText);
};

export function initChatbot(addMessageCallback) {
    const toggleBtn = document.getElementById('toggle-chat');
    const closeBtn = document.getElementById('close-chat');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.getElementById('send-ai');
    const input = document.getElementById('ai-input');
    const messages = document.getElementById('chat-messages');
    const hintBox = document.getElementById('chatbot-hint');

    if (!toggleBtn || !chatWindow) return;

    let isChatOpen = false;
    let closeTimer = null;

    function openChat() {
        if (closeTimer) clearTimeout(closeTimer);
        isChatOpen = true;
        chatWindow.classList.remove('hidden', 'chat-closing');
        chatWindow.classList.add('flex');
        void chatWindow.offsetWidth;
        chatWindow.classList.add('chat-visible');
        if (hintBox) { hintBox.style.opacity = '0'; hintBox.style.pointerEvents = 'none'; }
        setTimeout(() => { if (input) input.focus(); }, 360);
    }

    function closeChat() {
        if (!isChatOpen) return;
        isChatOpen = false;
        chatWindow.classList.remove('chat-visible');
        chatWindow.classList.add('chat-closing');
        closeTimer = setTimeout(() => {
            chatWindow.classList.remove('chat-closing', 'flex');
            chatWindow.classList.add('hidden');
        }, 290);
    }

    toggleBtn.addEventListener('click', () => { isChatOpen ? closeChat() : openChat(); });
    closeBtn.addEventListener('click', closeChat);

    const handleSend = async () => {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        addMessageCallback(text, false, messages);
        addMessageCallback("...", true, messages);
        const typing = messages.lastChild;
        const response = await getAiResponse(text);
        if (typing) typing.remove();
        addMessageCallback(response, true, messages);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
}
