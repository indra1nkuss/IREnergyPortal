/**
 * UI & NAVIGATION
 * Menangani interaksi UI, menu mobile, navigasi tab, dan efek typewriter
 */
import { teamData, winnersData } from './data.js';

export function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const mobileHint = document.getElementById('mobile-hint');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
            if (mobileHint && !mobileHint.classList.contains('hidden')) {
                mobileHint.classList.remove('opacity-100', 'animate-bounce');
                mobileHint.classList.add('opacity-0');
                setTimeout(() => mobileHint.classList.add('hidden'), 300);
            }
        });
    }
}

let isAnimating = false;
export function openTab(tabId, btnElement) {
    if (isAnimating) return; 

    const targetSection = document.getElementById(tabId);
    if (!targetSection || targetSection.classList.contains('block')) return;

    isAnimating = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const navMenu = document.getElementById('nav-menu');
    if(navMenu && !navMenu.classList.contains('hidden') && window.innerWidth < 768) {
        navMenu.classList.add('hidden');
    }

    const currentSection = document.querySelector('.section-content.block');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.classList.remove('active', 'text-darkbg');
        btn.classList.add('text-slate-400', 'hover:text-white');
    });
    btnElement.classList.add('active');
    btnElement.classList.remove('text-slate-400', 'hover:text-white');

    if (currentSection) {
        currentSection.classList.remove('animate-fade-in');
        currentSection.classList.add('animate-fade-out');

        setTimeout(() => {
            currentSection.classList.remove('block', 'animate-fade-out');
            currentSection.classList.add('hidden');
            showNewSection(targetSection);
        }, 300);
    } else {
        showNewSection(targetSection);
    }
}

function showNewSection(targetSection) {
    targetSection.classList.remove('hidden');
    void targetSection.offsetWidth; 
    targetSection.classList.add('block', 'animate-fade-in');
    
    setTimeout(() => {
        isAnimating = false;
        // Logic render tim & galeri dipindah ke main event listener
        window.dispatchEvent(new CustomEvent('sectionShown', { detail: targetSection.id }));
    }, 400);
}

// TYPEWRITER EFFECT
const textArray = [
    "Selamat kepada 100 para pemenang training online energi.",
    "Kerja keras dan dedikasi Anda telah membuahkan hasil yang luar biasa.",
    "Anda adalah standar emas bagi masa depan Team Energi.",
    "Kemenangan ini adalah awal dari pencapaian yang lebih besar!"
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

export function typeWriter() {
    const typingElement = document.getElementById("typing-text");
    if (!typingElement) return;

    const currentText = textArray[textIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 25 : 50; 
    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2500; 
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % textArray.length;
        typeSpeed = 500; 
    }
    setTimeout(typeWriter, typeSpeed);
}
