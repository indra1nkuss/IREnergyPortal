import CONFIG from './config.js';

export async function initNews() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    newsGrid.innerHTML = '<div class="col-span-full text-center py-20 animate-pulse text-energi-gold text-xs font-black tracking-widest uppercase">Sinkronisasi Server...</div>';

    try {
        // Panggil Serverless Function Anda sendiri di Vercel
        console.log("🌐 Memanggil Serverless API...");
        const response = await fetch('/api/news');
        
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            console.log("✅ Berita berhasil ditarik dari Server!");
            renderNews(data.articles);
        } else {
            renderNews(getStaticFallbacks());
        }
    } catch (error) {
        console.error("❌ API Error:", error);
        renderNews(getStaticFallbacks());
    }
}

function renderNews(articles) {
    const newsGrid = document.getElementById('news-grid');
    newsGrid.innerHTML = articles.map(article => `
        <div class="news-card group rounded-3xl overflow-hidden flex flex-col h-full animate-fade-in shadow-2xl relative border border-white/5">
            <div class="relative h-56 overflow-hidden">
                <img src="${article.image || 'https://images.unsplash.com/photo-1509391366360-fe5bb5848e22?q=80&w=800'}" 
                     class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="News">
                <div class="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-2xl z-10">
                    🔴 LIVE UPDATE
                </div>
            </div>
            <div class="p-7 flex flex-col flex-grow bg-darkcard/50 backdrop-blur-2xl border-t border-white/5">
                <div class="flex items-center gap-3 mb-4">
                    <span class="text-[10px] text-energi-cyan font-black uppercase tracking-widest">
                        ${new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <h3 class="text-lg font-bold text-white mb-4 line-clamp-2 leading-snug group-hover:text-energi-gold transition-colors duration-300">
                    <a href="${article.url}" target="_blank">${article.title}</a>
                </h3>
                <p class="text-slate-400 text-xs mb-8 line-clamp-3 leading-relaxed flex-grow font-medium opacity-80">
                    ${article.description}
                </p>
                <a href="${article.url}" target="_blank" class="inline-flex items-center gap-3 text-energi-gold hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] group/btn">
                    BACA SELENGKAPNYA
                </a>
            </div>
        </div>
    `).join('');
}

function getStaticFallbacks() {
    return [
        {
            title: "PLTS Terapung Cirata: Masa Depan Energi Terbarukan Indonesia",
            description: "Proyek prestisius ini menempatkan Indonesia sebagai pemimpin energi surya di Asia Tenggara.",
            image: "https://images.unsplash.com/photo-1509391366360-fe5bb5848e22?q=80&w=800",
            publishedAt: new Date().toISOString(),
            url: "https://www.kompas.com/tag/plts-terapung-cirata"
        }
    ];
}
