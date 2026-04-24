/**
 * WINNERS LIST
 * Menangani tampilan daftar pemenang dengan NIK, Dept, dan animasi premium
 */
import { winnersData } from './data.js';

let filteredWinners = [...winnersData];
const itemsPerPage = 10;

export function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filteredWinners = winnersData.filter(winner => 
            winner.name.toLowerCase().includes(searchTerm) || 
            winner.dept.toLowerCase().includes(searchTerm) ||
            winner.nik.includes(searchTerm)
        );
        displayWinners(1);
    });
}

export function displayWinners(page) {
    const listContainer = document.getElementById('winner-list');
    const emptyState = document.getElementById('empty-state');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (!listContainer) return;
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
        const delay = index * 0.1; // Staggered reveal delay
        
        const itemHTML = `
            <div class="stagger-item group flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-energi-gold/50 hover:bg-energi-gold/5 transition-all duration-500 opacity-0 transform translate-y-8" 
                 style="animation: fadeInUpWinner 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards ${delay}s">
                
                <!-- BADGE NOMOR -->
                <div class="w-12 h-12 flex-shrink-0 bg-darkbg rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-energi-gold group-hover:scale-110 transition-all border border-white/10 shadow-inner overflow-hidden relative">
                    <div class="absolute inset-0 bg-gradient-to-br from-energi-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span class="relative z-10">${formatNo}</span>
                </div>

                <!-- INFO PEMENANG -->
                <div class="flex-grow min-w-0">
                    <h3 class="text-base md:text-lg font-bold text-white group-hover:text-energi-gold transition-colors truncate">${winner.name}</h3>
                    <div class="flex flex-wrap gap-2 mt-1">
                        <span class="text-[10px] md:text-xs font-mono text-energi-cyan bg-energi-cyan/10 px-2 py-0.5 rounded border border-energi-cyan/20">ID: ${winner.nik}</span>
                        <span class="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <span class="w-1 h-1 rounded-full bg-slate-600"></span> ${winner.dept}
                        </span>
                    </div>
                </div>

                <!-- STATUS BADGE -->
                <div class="hidden sm:flex flex-col items-end gap-1">
                    <div class="px-3 py-1 bg-gradient-to-r from-energi-gold/20 to-transparent text-energi-gold border border-energi-gold/30 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                        TERBAIK
                    </div>
                    <div class="text-[9px] text-slate-500 font-mono italic">Validated ✓</div>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', itemHTML);
    });
    setupPagination(page);
}

function setupPagination(page) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const pageCount = Math.ceil(filteredWinners.length / itemsPerPage);
    
    if(pageCount <= 1) return; 

    const createBtn = (text, onClick, isActive, isDisabled) => {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.disabled = isDisabled;
        if (isActive) {
            btn.className = 'w-10 h-10 rounded-xl font-bold bg-energi-gold text-darkbg shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all scale-110 z-10';
        } else if (isDisabled) {
            btn.className = 'w-10 h-10 rounded-xl font-bold bg-white/5 text-slate-600 cursor-not-allowed border border-white/5';
        } else {
            btn.className = 'w-10 h-10 rounded-xl font-bold bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all';
            btn.onclick = onClick;
        }
        paginationContainer.appendChild(btn);
    };

    createBtn('←', () => { displayWinners(page - 1); }, false, page === 1);
    
    let startPage = Math.max(1, page - 1);
    let endPage = Math.min(pageCount, startPage + 2);
    if (page === 1) endPage = Math.min(pageCount, 3);
    if (page === pageCount) startPage = Math.max(1, pageCount - 2);

    for (let i = startPage; i <= endPage; i++) {
        createBtn(i, () => { displayWinners(i); }, i === page, false);
    }

    createBtn('→', () => { displayWinners(page + 1); }, false, page === pageCount);
}
