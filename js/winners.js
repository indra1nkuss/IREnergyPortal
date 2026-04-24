/**
 * WINNERS LIST
 * Menangani tampilan daftar pemenang dan pagination
 */
import { winnersData } from './data.js';

let filteredWinners = [...winnersData];
const itemsPerPage = 10;

export function initSearch() {
    document.getElementById('search-input').addEventListener('input', function(e) {
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
    if (!paginationContainer) return;
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
