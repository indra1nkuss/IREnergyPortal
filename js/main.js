/**
 * MAIN ENTRY POINT
 * Menghubungkan semua modul dan menginisialisasi website.
 * CRUD data sekarang dari Firestore via listener (index.html inline script).
 */
import { initMobileMenu, openTab, typeWriter, toggleDropdown } from './ui.js';
import { initSearch } from './winners.js';
import { renderTeam } from './team.js';
import { closeLightbox } from './gallery.js';
import { initTheme } from './theme.js';
import { initInteractions } from './interactions.js';
import { initChatbot } from './chat.js';
import { initMusic } from './music.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Dasar
    initTheme();
    initMobileMenu();
    initInteractions();
    initSearch();
    initMusic();

    // Global functions for HTML onclick
    window.openTab = openTab;
    window.closeLightbox = closeLightbox;
    window.toggleDropdown = toggleDropdown;

    // 2. Chatbot
    const addMessage = (text, isAi = false, container) => {
        const msg = document.createElement('div');
        msg.className = isAi
            ? 'bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-slate-300 leading-relaxed self-start animate-fade-in'
            : 'bg-energi-cyan/20 border border-energi-cyan/30 p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-white leading-relaxed self-end animate-fade-in';
        msg.innerHTML = text.replace(/\n/g, '<br>');
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    };
    initChatbot(addMessage);

    // 3. Section Event — render team ketika tab Team dibuka
    window.addEventListener('sectionShown', (e) => {
        if (e.detail === 'tentang') {
            renderTeam();
        }
    });

    // 4. Loading Screen
    const loadingScreen = document.getElementById('loading-screen');
    const loadingContent = document.getElementById('loading-content');
    const burnEffect = document.getElementById('burn-effect');

    if (loadingScreen) {
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            if (loadingContent) {
                loadingContent.style.opacity = '0';
                loadingContent.style.transform = 'scale(0.5)';
            }
            if (burnEffect) {
                burnEffect.style.opacity = '1';
                burnEffect.style.width = '300vw';
                burnEffect.style.height = '300vw';
            }
            setTimeout(() => {
                loadingScreen.classList.add('opacity-0');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    setTimeout(typeWriter, 200);
                }, 1000);
            }, 600);
        }, 2500);
    } else {
        setTimeout(typeWriter, 1500);
    }

    // 5. Mobile Hint
    const mobileHint = document.getElementById('mobile-hint');
    if (window.innerWidth < 768 && mobileHint) {
        setTimeout(() => {
            mobileHint.classList.remove('hidden');
            setTimeout(() => {
                mobileHint.classList.remove('opacity-0');
                mobileHint.classList.add('opacity-100', 'animate-bounce');
            }, 50);
        }, 1000);

        setTimeout(() => {
            if (mobileHint && mobileHint.classList.contains('opacity-100')) {
                mobileHint.classList.remove('opacity-100', 'animate-bounce');
                mobileHint.classList.add('opacity-0');
                setTimeout(() => mobileHint.classList.add('hidden'), 300);
            }
        }, 7000);
    }
});
