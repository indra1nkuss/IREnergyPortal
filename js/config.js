/**
 * CONFIGURATION
 * Tempat menyimpan API Key dan pengaturan global
 */
const CONFIG = {
    GEMINI_API_KEY: "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",
    GEMINI_API_URL: (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`
};

export default CONFIG;
