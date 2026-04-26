/**
 * CHAT SERVICE
 * Menangani komunikasi dengan Gemini API secara otomatis
 */
import CONFIG from './config.js';

const fallbackLocal = (userText, msg = "") => {
    const lowerText = userText.toLowerCase();
    if (lowerText.includes('siapa') || lowerText.includes('pemenang')) return "Daftar pemenang training ada di tab 'Pemenang'. Ada 100 orang hebat di sana!";
    if (lowerText.includes('halo') || lowerText.includes('hi')) return "Halo! Saya asisten AI Portal Energi. Senang bisa membantu Anda.";
    return msg || "Maaf, AI sedang beristirahat sejenak. Silakan coba lagi nanti.";
};

export const getAiResponse = async (userText) => {
    const API_KEY = CONFIG.GEMINI_API_KEY.trim(); 
    
    // Menggunakan Groq API (Sangat cepat dan gratis)
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant", 
                messages: [
                    {
                        role: "system",
                        content: "Anda adalah Energy AI, asisten virtual profesional untuk website 'Portal Energi'. Jawablah dengan ramah, ringkas, dan profesional dalam Bahasa Indonesia."
                    },
                    {
                        role: "user",
                        content: userText
                    }
                ],
                max_tokens: 300
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content.trim();
        } else {
            console.error("DEBUG - Groq Error:", data);
            return fallbackLocal(userText, `Error: ${data.error?.message || 'Gagal memproses jawaban'}`);
        }
    } catch (error) {
        console.error("DEBUG - Koneksi Error:", error);
        return fallbackLocal(userText, "Gagal terhubung ke server AI Groq.");
    }
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

    /**
     * OPEN: Set display:flex dulu, force reflow, lalu tambah
     * class .chat-visible untuk trigger animasi slide-up.
     */
    function openChat() {
        if (closeTimer) clearTimeout(closeTimer); // batalkan timer tutup jika ada
        isChatOpen = true;

        chatWindow.classList.remove('hidden', 'chat-closing');
        chatWindow.classList.add('flex'); // tampilkan dulu
        void chatWindow.offsetWidth;     // force reflow agar animasi terpicu
        chatWindow.classList.add('chat-visible');

        if (hintBox) {
            hintBox.style.opacity = '0';
            hintBox.style.pointerEvents = 'none';
        }
        // Fokus input setelah animasi selesai
        setTimeout(() => { if (input) input.focus(); }, 360);
    }

    /**
     * CLOSE: Tambah class .chat-closing untuk animasi slide-down,
     * baru setelah animasi selesai set display:none via class 'hidden'.
     * Ini kunci agar elemen TIDAK blocking klik saat tertutup.
     */
    function closeChat() {
        if (!isChatOpen) return;
        isChatOpen = false;

        chatWindow.classList.remove('chat-visible');
        chatWindow.classList.add('chat-closing');

        closeTimer = setTimeout(() => {
            chatWindow.classList.remove('chat-closing', 'flex');
            chatWindow.classList.add('hidden');
        }, 290); // sedikit lebih pendek dari durasi animasi (280ms)
    }

    toggleBtn.addEventListener('click', () => {
        isChatOpen ? closeChat() : openChat();
    });

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
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}
