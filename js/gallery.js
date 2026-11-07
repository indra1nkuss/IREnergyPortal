/**
 * GALLERY — Lightbox only
 * Gallery content di-render oleh Firestore listener di index.html
 */

export function openLightbox(src, caption, tag) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const tagEl = document.getElementById('lightbox-tag');
    if (!lightbox || !img) return;

    img.src = src;
    if (captionEl) {
        captionEl.textContent = caption || 'Dokumentasi Pemenang';
    }
    if (tagEl) {
        tagEl.textContent = tag || 'Momen Penghargaan';
    }

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
    if (img) img.classList.add('scale-95');

    setTimeout(() => {
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex');
        img.src = '';
    }, 300);
}
