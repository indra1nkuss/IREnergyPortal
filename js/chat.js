/**
 * CHAT SERVICE — Energy AI
 * Hanya via proxy /api/chat (Vercel Serverless Function).
 * API key AMAN di Vercel Environment Variables.
 */
import CONFIG from './config.js';

const fallbackLocal = (userText) => {
    const t = userText.toLowerCase();
    if (t.includes('pemenang') || t.includes('siapa') || t.includes('winner'))
        return "🏆 Daftar pemenang training ada di tab <strong>Pemenang</strong>.";
    if (t.includes('halo') || t.includes('hi') || t.includes('hai'))
        return "👋 Halo! Saya <strong>Energy AI</strong>. Ada yang bisa saya bantu?";
    if (t.includes('training') || t.includes('pelatihan'))
        return "📚 Training online diikuti 1.500+ trainee dari berbagai departemen.";
    if (t.includes('seu') || t.includes('mesin'))
        return "⚡ Data konsumsi energi ada di menu <strong>Kinerja > SEU IR</strong>.";
    if (t.includes('enpi'))
        return "📋 Informasi ENPI ada di menu <strong>Kinerja > ENPI</strong>.";
    if (t.includes('efisiensi') || t.includes('project'))
        return "🔧 Detail project efisiensi ada di menu <strong>Kinerja > Project Efisiensi</strong>.";
    return "💡 Coba tanya tentang pemenang, training, SEU, ENPI, atau project efisiensi!";
};

export const getAiResponse = async (userText) => {
    // Hanya lewat proxy /api/chat (Vercel)
    try {
        console.log("🤖 Energy AI: Proxy /api/chat...");
        const res = await fetch(CONFIG.CHAT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Anda adalah Energy AI, asisten virtual Portal Energi IR. Jawab ramah, profesional, Bahasa Indonesia. Maksimal 3 kalimat." },
                    { role: "user", content: userText }
                ]
            })
        });
        const data = await res.json();
        if (res.ok && data.choices?.[0]?.message?.content) {
            return data.choices[0].message.content.trim();
        }
        console.warn("Proxy error:", data.error || res.status);
    } catch (err) {
        console.warn("Proxy network error:", err.message);
    }

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
