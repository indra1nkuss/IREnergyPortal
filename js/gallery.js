/**
 * GALLERY & LIGHTBOX
 * Menangani tampilan dokumentasi dan pembukaan gambar
 */
export function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    container.innerHTML = ''; 

    const galleryImages = [
        'pemenang_ip.jpeg', 'pemenang_p1.jpeg', 'pemenang_p3.jpeg', 'pemenang_2nd.jpeg', 'pemenang_p2.jpeg',
        'pemenang_p4.jpeg', 'pemenang_rubber.jpeg', 'pemenang_p1..jpeg', 'pemenang_rubber2.jpeg', 'pemenang_rubber1.jpeg'
    ];

    galleryImages.forEach((imgName, index) => {
        const delay = (index + 1) * 0.05;
        const imgSrc = `images/${imgName}`; 
        
        container.insertAdjacentHTML('beforeend', `
            <div class="stagger-item gallery-item bg-darkcard/60 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 shadow-lg hover:-translate-y-2 hover:border-energi-gold/50 transition-all duration-300 group cursor-pointer flex flex-col" style="animation-delay: ${delay}s" data-src="${imgSrc}">
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

    // Add click events
    container.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => openLightbox(item.getAttribute('data-src')));
    });
}

export function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lightbox || !img) return;

    img.src = src;
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex'); 
    
    setTimeout(() => {
        lightbox.classList.remove('opacity-0');
        img.classList.remove('scale-95');
    }, 10);
}

export function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lightbox || !img) return;
    
    lightbox.classList.add('opacity-0');
    img.classList.add('scale-95');
    
    setTimeout(() => {
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex'); 
        img.src = ''; 
    }, 300);
}
