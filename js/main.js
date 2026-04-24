/**
 * MAIN ENTRY POINT
 * Menghubungkan semua modul dan menginisialisasi website
 */
import { initMobileMenu, openTab, typeWriter } from './ui.js';
import { initSearch, displayWinners } from './winners.js';
import { renderTeam } from './team.js';
import { renderGallery, closeLightbox } from './gallery.js';
import { initRadio, toggleRadio } from './radio.js';
import { initTerminal } from './terminal.js';
import { initTheme } from './theme.js';
import { initInteractions } from './interactions.js';
import { initChatbot } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Dasar
    initTheme();
    initMobileMenu();
    initRadio();
    initInteractions();
    initSearch();
    displayWinners(1);
    
    // Global functions for HTML onclick
    window.openTab = openTab;
    window.closeLightbox = closeLightbox;
    window.toggleRadio = toggleRadio;

    // 2. Chatbot Helpers
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

    // 3. Section Event Listeners
    window.addEventListener('sectionShown', (e) => {
        const sectionId = e.detail;
        if (sectionId === 'tentang' && document.getElementById('team-container').innerHTML === '') {
            renderTeam();
        }
        if (sectionId === 'dokumentasi' && document.getElementById('gallery-container').innerHTML === '') {
            renderGallery();
        }
    });

    // 4. Loading Screen Logic
    const loadingScreen = document.getElementById('loading-screen');
    const loadingContent = document.getElementById('loading-content');
    const burnEffect = document.getElementById('burn-effect');
    
    if (loadingScreen) {
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            if(loadingContent) {
                loadingContent.style.opacity = '0';
                loadingContent.style.transform = 'scale(0.5)';
            }
            if(burnEffect) {
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
                    initTerminal(); 
                }, 1000);
            }, 600);
        }, 2500);
    } else {
        setTimeout(typeWriter, 1500);
    }

    // 5. Hint Mobile Logic
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
