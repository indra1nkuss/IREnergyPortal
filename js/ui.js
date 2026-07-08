/**
 * UI & NAVIGATION
 * Menangani interaksi UI, menu mobile, navigasi tab, dan efek typewriter
 */

export function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const mobileHint = document.getElementById('mobile-hint');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
            // Tutup semua dropdown saat mobile menu ditutup
            if (navMenu.classList.contains('hidden')) {
                closeAllDropdowns();
            }
            if (mobileHint && !mobileHint.classList.contains('hidden')) {
                mobileHint.classList.remove('opacity-100', 'animate-bounce');
                mobileHint.classList.add('opacity-0');
                setTimeout(() => mobileHint.classList.add('hidden'), 300);
            }
        });
    }
}

// ─── DROPDOWN KINERJA ─────────────────────────────────────────────────
export function toggleDropdown(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const li = btn.closest('.dropdown-nav');
    const menu = li?.querySelector('.dropdown-menu');
    const arrow = btn.querySelector('.dropdown-arrow');
    if (!menu) return;

    const isOpen = menu.classList.contains('open') || !menu.classList.contains('hidden');

    if (window.innerWidth < 768) {
        // Mobile: accordion toggle
        if (isOpen) {
            menu.classList.remove('open');
            menu.classList.add('hidden');
            arrow?.classList.remove('rotated');
        } else {
            menu.classList.remove('hidden');
            menu.classList.add('open');
            arrow?.classList.add('rotated');
        }
    } else {
        // Desktop: toggle via click (supplement hover)
        menu.classList.toggle('hidden');
        menu.classList.toggle('md:opacity-0');
        menu.classList.toggle('md:invisible');
        menu.classList.toggle('md:translate-y-3');
        arrow?.classList.toggle('rotated');
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => {
        m.classList.add('hidden', 'md:opacity-0', 'md:invisible', 'md:translate-y-3');
        m.classList.remove('open');
    });
    document.querySelectorAll('.dropdown-arrow').forEach(a => a.classList.remove('rotated'));
}

// Tutup dropdown saat klik di luar
document.addEventListener('click', () => {
    if (window.innerWidth >= 768) closeAllDropdowns();
});

let isAnimating = false;
export function openTab(tabId, btnElement) {
    if (isAnimating) return;

    const targetSection = document.getElementById(tabId);
    if (!targetSection || targetSection.classList.contains('block')) return;

    isAnimating = true;
    window.scrollTo({ top: 0, behavior: 'auto' });

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

    // Bersihkan active state dari dropdown items
    document.querySelectorAll('.dropdown-item-btn').forEach(btn => btn.classList.remove('active'));

    // Jika btnElement diberikan, set active padanya (kecuali dropdown item — parent toggle yang akan aktif)
    const isDropdownItem = btnElement?.closest('.dropdown-menu');
    if (btnElement && !isDropdownItem) {
        btnElement.classList.add('active');
        btnElement.classList.remove('text-slate-400', 'hover:text-white');
    }

    // Jika item yang diklik ada di dalam dropdown, aktifkan parent toggle-nya
    if (isDropdownItem) {
        const parentToggle = isDropdownItem.closest('.dropdown-nav')?.querySelector('.dropdown-toggle-btn');
        if (parentToggle) {
            parentToggle.classList.add('active');
            parentToggle.classList.remove('text-slate-400', 'hover:text-white');
        }
        // Tutup dropdown setelah klik item
        closeAllDropdowns();
    }

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
