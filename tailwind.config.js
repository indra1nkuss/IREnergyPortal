/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./admin.html",
        "./js/**/*.js"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
                serif: ['Outfit', 'sans-serif'],
                mono: ['Courier New', 'monospace']
            },
            colors: {
                darkbg: '#050508',
                darkcard: '#0a0a0f',
                energi: {
                    cyan: '#00ffff',
                    blue: '#0066ff',
                    purple: '#9900ff',
                    gold: '#D4AF37',
                    goldlight: '#F3E5AB'
                }
            }
        }
    },
    plugins: []
}
