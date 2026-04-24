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

    if (!toggleBtn || !chatWindow) return;

    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        input.focus();
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

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
