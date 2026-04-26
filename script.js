/* ==============================================
   0. MOBILE HAMBURGER MENU & HINT
   ============================================== */
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

/* ==============================================
   1. LOGIKA NAVIGASI TAB (Smooth SPA & Scroll)
   ============================================== */
let isAnimating = false;

function openTab(tabId, btnElement) {
    if (isAnimating) return; 

    const targetSection = document.getElementById(tabId);
    if (!targetSection || targetSection.classList.contains('block')) return;

    isAnimating = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
        if (targetSection.id === 'tentang' && document.getElementById('team-container').innerHTML === '') renderTeam();
        if (targetSection.id === 'dokumentasi' && document.getElementById('gallery-container').innerHTML === '') renderGallery();
    }, 400);
}

/* ==============================================
   2. LOGIKA DATA PEMENANG & FITUR SEARCH
   ============================================== */
const winnersData = [
    { nik: '101001', name: 'Ahmad Subarjo', dept: 'Operasional Produksi' },
    { nik: '101002', name: 'Budi Santoso', dept: 'Engineering & Maintenance' },
    { nik: '101003', name: 'Citra Kirana', dept: 'Health, Safety & Environment' },
    { nik: '101004', name: 'Dadan Hermawan', dept: 'Logistik & Supply Chain' },
    { nik: '101005', name: 'Euis Komalasari', dept: 'Quality Control Analyst' },
    { nik: '101006', name: 'Fajar Nugraha', dept: 'Operasional Produksi' },
    { nik: '101007', name: 'Gita Savitri', dept: 'Human Resources' },
    { nik: '101008', name: 'Hendra Wijaya', dept: 'Engineering & Maintenance' },
    { nik: '101009', name: 'Intan Permatasari', dept: 'Finance & Accounting' },
    { nik: '101010', name: 'Joko Anwar', dept: 'Security & Patrol' },
    { nik: '101011', name: 'Kiki Amalia', dept: 'Dokumen Kontrol' },
    { nik: '101012', name: 'Lukman Hakim', dept: 'Logistik & Supply Chain' },
    { nik: '101013', name: 'Mila Rosmiati', dept: 'Health, Safety & Environment' },
    { nik: '101014', name: 'Nanda Pratama', dept: 'Information Technology' },
    { nik: '101015', name: 'Oki Setiawan', dept: 'Operasional Produksi' },
    { nik: '101016', name: 'Putri Marino', dept: 'Quality Control Analyst' },
    { nik: '101017', name: 'Qori Akbar', dept: 'Engineering & Maintenance' },
    { nik: '101018', name: 'Rina Nose', dept: 'Dokumen Kontrol' },
    { nik: '101019', name: 'Surya Saputra', dept: 'Security & Patrol' },
    { nik: '101020', name: 'Tono Hartono', dept: 'Logistik & Supply Chain' }
];

let filteredWinners = [...winnersData]; 
const itemsPerPage = 10;
let currentPage = 1;

document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredWinners = winnersData.filter(winner => 
        winner.name.toLowerCase().includes(searchTerm) || 
        winner.dept.toLowerCase().includes(searchTerm) ||
        winner.nik.includes(searchTerm)
    );
    currentPage = 1;
    displayWinners(currentPage);
});

function displayWinners(page) {
    const listContainer = document.getElementById('winner-list');
    const emptyState = document.getElementById('empty-state');
    const paginationContainer = document.getElementById('pagination-container');
    
    listContainer.innerHTML = ''; 

    if(filteredWinners.length === 0) {
        emptyState.classList.remove('hidden');
        paginationContainer.innerHTML = '';
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredWinners.slice(start, end);

    paginatedItems.forEach((winner, index) => {
        const actualNumber = start + index + 1;
        const formatNo = actualNumber.toString().padStart(2, '0');
        const delay = index * 0.05; 
        
        const itemHTML = `
            <div class="stagger-item flex items-center gap-3 md:gap-5 p-3 md:p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-energi-gold/40 hover:bg-white/10 transition-all group" style="animation-delay: ${delay}s">
                <div class="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 bg-darkbg rounded-lg flex items-center justify-center font-800 text-slate-400 group-hover:text-energi-gold transition-colors border border-white/10 shadow-inner">
                    ${formatNo}
                </div>
                <div class="flex-grow min-w-0">
                    <h3 class="text-sm md:text-base font-700 text-white truncate group-hover:text-energi-goldlight transition-colors">${winner.name}</h3>
                </div>
                <div class="hidden md:block">
                    <span class="px-4 py-1.5 bg-white/5 text-slate-300 border border-white/10 rounded-full text-xs font-semibold tracking-widest group-hover:bg-energi-gold/10 group-hover:text-energi-gold group-hover:border-energi-gold/30 transition-all">TERBAIK</span>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', itemHTML);
    });
    setupPagination(page);
}

function setupPagination(page) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';
    const pageCount = Math.ceil(filteredWinners.length / itemsPerPage);
    
    if(pageCount <= 1) return; 

    const createBtn = (text, onClick, isActive, isDisabled) => {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.disabled = isDisabled;
        if (isActive) {
            btn.className = 'px-3 md:px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-energi-gold to-yellow-200 text-darkbg shadow-[0_0_15px_rgba(212,175,55,0.4)]';
        } else if (isDisabled) {
            btn.className = 'px-3 md:px-4 py-2 rounded-lg font-bold bg-white/5 text-slate-600 cursor-not-allowed border border-white/5';
        } else {
            btn.className = 'px-3 md:px-4 py-2 rounded-lg font-bold bg-white/5 text-slate-400 hover:text-white hover:border-white/30 border border-white/5 transition-all';
            btn.onclick = onClick;
        }
        paginationContainer.appendChild(btn);
    };

    createBtn('←', () => { window.scrollTo({top: 0, behavior: 'smooth'}); displayWinners(page - 1); }, false, page === 1);
    
    let startPage = Math.max(1, page - 1);
    let endPage = Math.min(pageCount, startPage + 2);
    if (page === 1) endPage = Math.min(pageCount, 3);
    if (page === pageCount) startPage = Math.max(1, pageCount - 2);

    for (let i = startPage; i <= endPage; i++) {
        createBtn(i, () => { window.scrollTo({top: 0, behavior: 'smooth'}); displayWinners(i); }, i === page, false);
    }

    createBtn('→', () => { window.scrollTo({top: 0, behavior: 'smooth'}); displayWinners(page + 1); }, false, page === pageCount);
}

/* ==============================================
   3. RENDER KONTEN DINAMIS & LIGHTBOX
   ============================================== */
function renderGallery() {
    const container = document.getElementById('gallery-container');
    container.innerHTML = ''; 

    const galleryImages = [
        'pemenang_ip.jpeg', 'pemenang_p1.jpeg', 'pemenang_p3.jpeg', 'pemenang_2nd.jpeg', 'pemenang_p2.jpeg',
        'pemenang_p4.jpeg', 'pemenang_rubber.jpeg', 'pemenang_p1..jpeg', 'pemenang_rubber2.jpeg', 'pemenang_rubber1.jpeg'
    ];

    galleryImages.forEach((imgName, index) => {
        const delay = (index + 1) * 0.05;
        const imgSrc = `images/${imgName}`; 
        
        container.insertAdjacentHTML('beforeend', `
            <div onclick="openLightbox('${imgSrc}')" class="stagger-item bg-darkcard/60 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-lg hover:-translate-y-2 hover:border-energi-gold/50 transition-all duration-300 group cursor-pointer flex flex-col" style="animation-delay: ${delay}s">
                <div class="relative h-32 md:h-40 overflow-hidden">
                    <img src="${imgSrc}" alt="Dokumentasi ${index + 1}" loading="lazy" 
                         onerror="this.src='images/default.jpg'" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-darkcard via-transparent to-transparent opacity-90"></div>
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="text-white text-2xl drop-shadow-lg">🔍</span>
                    </div>
                </div>
                <div class="p-3 md:p-4 relative bg-transparent flex-grow text-center">
                    <h3 class="text-sm md:text-base font-700 text-white group-hover:text-energi-gold transition-colors font-serif">Momen ${index + 1 < 10 ? '0'+(index+1) : index+1}</h3>
                    <p class="text-[10px] md:text-xs text-slate-400 mt-1">Klik untuk perbesar</p>
                </div>
            </div>
        `);
    });
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex'); 
    
    setTimeout(() => {
        lightbox.classList.remove('opacity-0');
        img.classList.remove('scale-95');
    }, 10);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    
    lightbox.classList.add('opacity-0');
    img.classList.add('scale-95');
    
    setTimeout(() => {
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex'); 
        img.src = ''; 
    }, 300);
}

/* ==============================================
   4. RENDER TEAM ENERGY (LUXURY STO + GITHUB LINK)
   ============================================= */
function renderTeam() {
    const container = document.getElementById('team-container');
    if (!container) return; 
    
    const createCard = (person, delay) => {
        const imagePath = person.img ? `images/${person.img}` : `images/default.jpg`;
        const isClickable = !!person.link; 
        
        const wrapperTag = isClickable ? 'a' : 'div';
        const linkAttr = isClickable ? `href="${person.link}" target="_blank" rel="noopener noreferrer"` : '';
        const cursorClass = isClickable ? 'cursor-pointer hover:-translate-y-2' : '';
        
        // HINT BARU: Selalu terlihat, tidak menghalangi gambar, ada efek melayang (bounce)
        const hintHTML = isClickable ? `
            <div class="mt-4 flex justify-center w-full">
                <div class="animate-bounce flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-energi-cyan/10 to-energi-gold/10 border border-energi-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.2)] backdrop-blur-sm">
                    <span class="text-[10px] md:text-xs text-energi-gold">✨</span>
                    <span class="text-[9px] md:text-[10px] text-white font-medium tracking-wide drop-shadow-md">Klik disini untuk melihat portofolio</span>
                </div>
            </div>
        ` : '';

        return `
        <${wrapperTag} ${linkAttr} class="block luxury-card group w-[220px] md:w-[240px] p-6 text-center z-10 relative transition-transform duration-500 ${cursorClass}" style="animation: fadeInUpTeam 0.6s ease backwards ${delay}s;">
            <div class="absolute inset-0 bg-gradient-to-br from-energi-cyan/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-xl"></div>
            
            <div class="hex-container relative z-10 mx-auto">
                <div class="hex-border"></div>
                <div class="hex-photo-wrap">
                    <img src="${imagePath}" 
                         alt="${person.name}" 
                         class="hex-photo object-cover w-full h-full transition-transform duration-500">
                </div>
            </div>

            <div class="relative z-10 mt-4 flex flex-col items-center">
                <h3 class="text-base md:text-lg font-bold text-white tracking-wide group-hover:text-energi-gold transition-colors duration-300">${person.name}</h3>
                <div class="inline-block px-3 py-1.5 mt-2 rounded-full bg-[#050508]/80 border border-white/10 group-hover:border-energi-cyan/40 group-hover:bg-energi-cyan/10 transition-all duration-300 shadow-inner">
                    <p class="text-energi-cyan text-[10px] md:text-[11px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">${person.role}</p>
                </div>
                
                ${hintHTML} </div>
            
        </${wrapperTag}>
        `;
    };

    const mobileLine = `
        <div class="md:hidden flex justify-center w-full my-2">
            <div class="w-[2px] h-8 relative overflow-hidden line-glow">
                <div class="absolute inset-0 energy-flow-y"></div>
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="flex flex-col items-center w-full relative py-6 max-w-5xl mx-auto overflow-x-hidden">
            
            ${createCard({ name: 'Goldy Raymond PPS', role: 'EC Manager', img: 'susanto.jpg' }, '0.1')}
            
            <div class="flex justify-center w-full my-2 md:my-0">
                <div class="w-[2px] h-10 md:h-12 relative overflow-hidden line-glow">
                    <div class="absolute inset-0 energy-flow-y"></div>
                </div>
            </div>

            ${createCard({ name: 'M Priyo Pambudi', role: 'EC Supervisor', img: 'sarah.jpg' }, '0.3')}

            <div class="flex justify-center w-full my-2 md:my-0">
                <div class="w-[2px] h-8 md:h-10 relative overflow-hidden line-glow">
                    <div class="absolute inset-0 energy-flow-y" style="animation-delay: 0.2s"></div>
                </div>
            </div>

            <div class="hidden md:block w-full max-w-[800px] relative">
                <div class="absolute top-0 left-[16.66%] right-[16.66%] h-[2px] overflow-hidden line-glow">
                    <div class="absolute inset-0 energy-flow-x"></div>
                </div>
                
                <div class="grid grid-cols-3 w-full">
                    <div class="flex justify-center"><div class="w-[2px] h-10 relative overflow-hidden line-glow"><div class="absolute inset-0 energy-flow-y" style="animation-delay: 0.4s"></div></div></div>
                    <div class="flex justify-center"><div class="w-[2px] h-10 relative overflow-hidden line-glow"><div class="absolute inset-0 energy-flow-y" style="animation-delay: 0.5s"></div></div></div>
                    <div class="flex justify-center"><div class="w-[2px] h-10 relative overflow-hidden line-glow"><div class="absolute inset-0 energy-flow-y" style="animation-delay: 0.6s"></div></div></div>
                </div>
            </div>

            <div class="flex flex-col items-center md:grid md:grid-cols-3 w-full max-w-[800px] gap-0 md:gap-4 justify-items-center relative z-10 pb-10">
                ${createCard({ name: 'Marini', role: 'EC Document Control', img: 'marini.jpg' }, '0.5')}
                ${mobileLine}
                
                ${createCard({ 
                    name: 'Indra Nurul Kusuma', 
                    role: 'EC Staff', 
                    img: 'indra.png', 
                    link: 'https://indra1nkuss.github.io/mycv/'
                }, '0.7')}
                
                ${mobileLine}
                ${createCard({ name: 'Juliansyah', role: 'EC Patrol & Control', img: 'juliansyah.jpg' }, '0.9')}
            </div>

        </div>
    `;
}

/* ==============================================
   5. LOGIKA LIVE RADIO PLAYER
   ============================================== */
let isRadioPlaying = false;

function toggleRadio(e) {
    e.stopPropagation(); 
    
    const audio = document.getElementById('radio-stream');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const eq = document.getElementById('radio-eq');
    const radioBtn = document.getElementById('radio-btn');

    if(!audio) return;

    if (isRadioPlaying) {
        audio.pause();
        if(iconPlay) iconPlay.classList.remove('hidden');
        if(iconPause) iconPause.classList.add('hidden');
        if(eq) {
            eq.classList.remove('flex');
            eq.classList.add('hidden');
        }
        if(radioBtn) radioBtn.classList.remove('animate-pulse');
    } else {
        audio.play();
        if(iconPlay) iconPlay.classList.add('hidden');
        if(iconPause) iconPause.classList.remove('hidden');
        if(eq) {
            eq.classList.remove('hidden');
            eq.classList.add('flex');
        }
        if(radioBtn) radioBtn.classList.add('animate-pulse');
    }
    isRadioPlaying = !isRadioPlaying;
}

/* ==============================================
   6. EFEK MENGETIK (TYPEWRITER) DI BERANDA
   ============================================== */
const textArray = [
    "Selamat kepada 100 para pemenang training online energi.",
    "Kerja keras dan dedikasi Anda telah membuahkan hasil yang luar biasa.",
    "Anda adalah standar emas bagi masa depan Team Energi.",
    "Kemenangan ini adalah awal dari pencapaian yang lebih besar!"
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
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

/* ==============================================
   7. INISIALISASI UTAMA (Semua digabung di sini agar bersih)
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. RENDER DATA PEMENANG ---
    displayWinners(1);

    // --- 2. FITUR HINT MOBILE ---
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

    // --- 3. FITUR DARK/LIGHT MODE ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙'; 
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            themeToggleBtn.style.transform = 'scale(0.5) rotate(180deg)';
            themeToggleBtn.style.opacity = '0';
            
            setTimeout(() => {
                body.classList.toggle('light-mode');
                
                if (body.classList.contains('light-mode')) {
                    localStorage.setItem('theme', 'light');
                    themeToggleBtn.textContent = '🌙';
                } else {
                    localStorage.setItem('theme', 'dark');
                    themeToggleBtn.textContent = '☀️';
                }

                themeToggleBtn.style.transform = 'scale(1) rotate(0deg)';
                themeToggleBtn.style.opacity = '1';
            }, 200); 
        });
    }

    // --- 4. LOGIKA LOADING SCREEN (BURN EFFECT) ---
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
                    initInteractiveElements();
                    initTerminal(); 
                    initChatbot(); // Initialize AI Chatbot
                }, 1000); 
                
            }, 600); 
 
        }, 2500); 
    } else {
        // Jika tidak ada loading screen di HTML, langsung jalankan Typewriter
        setTimeout(() => {
            typeWriter();
            initInteractiveElements();
        }, 1500);
    }
});

/* ==============================================
   8. FITUR BARU: INTERACTIVE ELEMENTS
   ============================================== */
function initInteractiveElements() {
    // A. SCROLL REVEAL (Intersection Observer)
    const observerOptions = { threshold: 0.1 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.querySelectorAll('.counter').length > 0) {
                    entry.target.querySelectorAll('.counter').forEach(count => startCounter(count));
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // B. MAGNETIC EFFECTS
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate(0px, 0px)`;
        });
    });

    // C. FLOATING BAR VISIBILITY
    const floatingBar = document.getElementById('floating-bar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            floatingBar.classList.add('active');
        } else {
            floatingBar.classList.remove('active');
        }
    });
}

// D. STATS COUNTER ANIMATION
function startCounter(el) {
    if (el.classList.contains('counted')) return;
    el.classList.add('counted');
    
    const target = parseInt(el.getAttribute('data-target'));
    let count = 0;
    const speed = 20; 

    const updateCount = () => {
        const increment = Math.ceil(target / 100);
        if (count < target) {
            count += increment;
            if (count > target) count = target;
            el.innerText = count;
            setTimeout(updateCount, speed);
        } else {
            el.innerText = target;
        }
    };
    updateCount();
}

// E. DIGITAL ENERGY TERMINAL LOGS
function initTerminal() {
    const terminal = document.getElementById('terminal-content');
    if (!terminal) return;

    const logs = [
        "System initialization sequence started...",
        "Establishing secure connection to Energy Grid...",
        "Grid sync: SUCCESS (Latency 4ms)",
        "Monitoring 1,500 active participants...",
        "Insight: Solar PV output optimized by 12%",
        "Thermal management active: 24.5°C",
        "Weekly training data backup completed.",
        "Security protocol Alpha-9 engaged.",
        "Core energy output stable at 100%.",
        "New milestone reached: 10,000+ total hours.",
        "Optimization complete. Standing by..."
    ];

    let logIndex = 0;
    
    const addLog = () => {
        const time = new THREE.Clock().getElapsedTime().toFixed(2);
        const log = logs[logIndex % logs.length];
        const line = document.createElement('div');
        line.className = 'mb-1 opacity-0 transition-opacity duration-500';
        line.innerHTML = `<span class="text-energi-gold">[${time}s]</span> <span class="text-white">></span> ${log}`;
        
        terminal.appendChild(line);
        void line.offsetWidth; // Force reflow
        line.classList.remove('opacity-0');
        
        if (terminal.children.length > 8) {
            terminal.removeChild(terminal.children[0]);
        }
        
        logIndex++;
        setTimeout(addLog, 3000 + Math.random() * 2000);
    };

    setTimeout(addLog, 1000);
}
// F. AI CHATBOT LOGIC (Inline fallback — logika utama ada di js/chat.js)
function initChatbot() {
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

    /* -------------------------------------------------------
       SMOOTH OPEN / CLOSE
       - Buka: hapus hidden → tambah flex → force reflow → chat-visible
       - Tutup: tambah chat-closing → tunggu animasi → set hidden
         Ini memastikan display:none aktif saat tertutup (tidak blocking klik)
       ------------------------------------------------------- */
    function openChat() {
        if (closeTimer) clearTimeout(closeTimer);
        isChatOpen = true;

        chatWindow.classList.remove('hidden', 'chat-closing');
        chatWindow.classList.add('flex');
        void chatWindow.offsetWidth; // force reflow
        chatWindow.classList.add('chat-visible');

        if (hintBox) {
            hintBox.style.opacity = '0';
            hintBox.style.pointerEvents = 'none';
        }
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

    toggleBtn.addEventListener('click', () => {
        isChatOpen ? closeChat() : openChat();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeChat);
    }



    /* -------------------------------------------------------
       PESAN & RESPONSE AI
       ------------------------------------------------------- */
    const addMessage = (text, isAi = false) => {
        const msg = document.createElement('div');
        msg.className = isAi 
            ? 'bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-sm max-w-[85%] text-slate-300 leading-relaxed self-start animate-fade-in'
            : 'bg-energi-cyan/20 border border-energi-cyan/30 p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-white leading-relaxed self-end animate-fade-in ml-auto';
        msg.innerHTML = text.replace(/\n/g, '<br>');
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    };

    const getAiResponse = async (userText) => {
        const API_KEY = "AIzaSyBzQ5X21f54r7TJ-rIecc5DUwZTVgzfaqU".trim(); 
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const fallbackLocal = (msg = "") => {
            const lowerText = userText.toLowerCase();
            if (lowerText.includes('siapa') || lowerText.includes('pemenang')) return "Daftar pemenang training ada di tab 'Pemenang'. Ada 100 orang hebat di sana!";
            if (lowerText.includes('halo') || lowerText.includes('hi')) return "Halo! Saya asisten AI Portal Energi. Senang bisa membantu Anda.";
            return msg || "Maaf, AI sedang beristirahat sejenak. Silakan coba lagi nanti.";
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `Anda adalah Energy AI, asisten virtual profesional untuk website 'Portal Energi'. Jawablah pertanyaan pengunjung dengan ramah, ringkas, dan profesional dalam Bahasa Indonesia. Pertanyaan: ${userText}` }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                const errorMsg = data.error?.message || "Kunci API tidak valid atau model tidak tersedia.";
                return fallbackLocal(`Error: ${errorMsg}`);
            }
        } catch (error) {
            return fallbackLocal("Gagal terhubung ke server AI.");
        }
    };

    const handleSend = async () => {
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        addMessage(text, false);

        addMessage("...", true);
        const typing = messages.lastChild;

        const response = await getAiResponse(text);
        
        if (typing) typing.remove();
        addMessage(response, true);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}


