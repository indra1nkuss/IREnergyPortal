/**
 * WINNERS LIST
 * Pure Firestore — tidak ada fallback static.
 * Data dari window.__fireWinners yang diisi oleh realtime listener.
 * Support: filter per tahun + search + pagination.
 */

const itemsPerPage = 10;
let winnersPage = 1;
let searchTerm = '';
let selectedYear = 'all'; // 'all' atau angka tahun
let selectedDept = 'all'; // 'all' atau nama departemen

// ─── Data Access ─────────────────────────────────────────────────────────────
function getAllWinners() {
    const fw = window.__fireWinners;
    return (fw && fw.length > 0)
        ? fw.map(w => ({ nik: w.nik, name: w.name, dept: w.dept, year: w.year, id: w.id }))
        : [];
}

function getAvailableYears() {
    const all = getAllWinners();
    const years = [...new Set(all.map(w => w.year).filter(Boolean))].sort((a, b) => b - a);
    return years;
}

function getAvailableDepts() {
    const fd = window.__fireDepartments;
    if (fd && fd.length > 0) {
        return fd.map(d => d.name).sort();
    }
    return [];
}

function getFilteredWinners() {
    let all = getAllWinners();
    // Filter tahun
    if (selectedYear !== 'all') {
        all = all.filter(w => String(w.year) === String(selectedYear));
    }
    // Filter departemen
    if (selectedDept !== 'all') {
        all = all.filter(w => w.dept === selectedDept);
    }
    // Filter search
    if (searchTerm) {
        const q = searchTerm.toLowerCase();
        all = all.filter(w =>
            (w.name || '').toLowerCase().includes(q) ||
            (w.dept || '').toLowerCase().includes(q) ||
            (w.nik || '').includes(q)
        );
    }
    return all;
}

// ─── Year Pills ───────────────────────────────────────────────────────────────
function renderYearPills() {
    const container = document.getElementById('winners-year-pills');
    if (!container) return;

    const years = getAvailableYears();
    const currentYear = new Date().getFullYear();

    let html = `
        <button class="year-pill ${selectedYear === 'all' ? 'active' : ''}" onclick="window.setWinnersYear('all')">
            Semua
        </button>
    `;
    years.forEach(y => {
        const isActive = String(selectedYear) === String(y);
        const isCurrent = y === currentYear;
        html += `
            <button class="year-pill ${isActive ? 'active' : ''}" onclick="window.setWinnersYear(${y})">
                ${y}${isCurrent ? ' <span class="text-energi-cyan text-[8px] font-black">●</span>' : ''}
            </button>
        `;
    });
    container.innerHTML = html;
}

// ─── Dept Pills ───────────────────────────────────────────────────────────────
function renderDeptPills() {
    const container = document.getElementById('winners-dept-pills');
    if (!container) return;

    const depts = getAvailableDepts();
    if (depts.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = `
        <button class="year-pill ${selectedDept === 'all' ? 'active' : ''}" onclick="window.setWinnersDept('all')">
            Semua Dept
        </button>
    `;
    depts.forEach(d => {
        html += `
            <button class="year-pill ${selectedDept === d ? 'active' : ''}" onclick="window.setWinnersDept('${d.replace(/'/g, "\\'")}')">
                ${d}
            </button>
        `;
    });
    container.innerHTML = html;
}

// ─── Public API ───────────────────────────────────────────────────────────────
window.setWinnersYear = (year) => {
    selectedYear = year;
    winnersPage = 1;
    renderYearPills();
    displayWinners(1);
};

window.setWinnersDept = (dept) => {
    selectedDept = dept;
    winnersPage = 1;
    renderDeptPills();
    displayWinners(1);
};

export function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            searchTerm = e.target.value;
            winnersPage = 1;
            displayWinners();
        });
    }
}

export function refreshWinners() {
    renderYearPills();
    renderDeptPills();
    displayWinners();
}

export function displayWinners(page) {
    if (page !== undefined) winnersPage = page;

    const listContainer = document.getElementById('winner-list');
    const emptyState = document.getElementById('empty-state');
    const paginationContainer = document.getElementById('pagination-container');

    if (!listContainer) return;
    listContainer.innerHTML = '';

    // Update year pills dan dept pills setiap kali di-render (data bisa baru masuk)
    renderYearPills();
    renderDeptPills();

    // Update stats label tahun
    const yearLabel = document.getElementById('winners-year-label');
    if (yearLabel) {
        yearLabel.textContent = selectedYear === 'all' ? 'Semua Tahun' : `Tahun ${selectedYear}`;
    }

    const filtered = getFilteredWinners();

    if (filtered.length === 0) {
        emptyState?.classList.remove('hidden');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    emptyState?.classList.add('hidden');

    const start = (winnersPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filtered.slice(start, end);

    pageItems.forEach((winner, index) => {
        const no = start + index + 1;
        const formatNo = String(no).padStart(2, '0');
        const delay = index * 0.07;
        const yearBadge = winner.year
            ? `<span class="text-[9px] font-black text-energi-gold bg-energi-gold/10 border border-energi-gold/20 px-1.5 py-0.5 rounded font-mono">${winner.year}</span>`
            : '';

        listContainer.insertAdjacentHTML('beforeend', `
            <div class="stagger-item group flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-energi-gold/50 hover:bg-energi-gold/5 transition-all duration-500 opacity-0 transform translate-y-8" style="animation: fadeInUpWinner 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards ${delay}s">
                <div class="w-12 h-12 flex-shrink-0 bg-darkbg rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-energi-gold group-hover:scale-110 transition-all border border-white/10 shadow-inner overflow-hidden relative">
                    <div class="absolute inset-0 bg-gradient-to-br from-energi-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span class="relative z-10">${formatNo}</span>
                </div>
                <div class="flex-grow min-w-0">
                    <h3 class="text-base md:text-lg font-bold text-white group-hover:text-energi-gold transition-colors truncate">${winner.name}</h3>
                    <div class="flex flex-wrap gap-2 mt-1 items-center">
                        <span class="text-[10px] md:text-xs font-mono text-energi-cyan bg-energi-cyan/10 px-2 py-0.5 rounded border border-energi-cyan/20">ID: ${winner.nik}</span>
                        <span class="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-slate-600"></span> ${winner.dept}</span>
                        ${yearBadge}
                    </div>
                </div>
                <div class="hidden sm:flex flex-col items-end gap-1">
                    <div class="px-3 py-1 bg-gradient-to-r from-energi-gold/20 to-transparent text-energi-gold border border-energi-gold/30 rounded-full text-[10px] font-black uppercase tracking-tighter">TERBAIK</div>
                    <div class="text-[9px] text-slate-500 font-mono italic">Validated ✓</div>
                </div>
            </div>
        `);
    });

    renderPagination(filtered.length);
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function renderPagination(total) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    container.innerHTML = '';

    const totalPages = Math.ceil(total / itemsPerPage);
    if (totalPages <= 1) return;

    const btn = (html, onClick, isActive, isDisabled) => {
        const b = document.createElement('button');
        b.innerHTML = html;
        b.disabled = isDisabled;
        if (isActive) {
            b.className = 'w-10 h-10 rounded-xl font-bold bg-energi-gold text-darkbg shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all scale-110 z-10';
        } else if (isDisabled) {
            b.className = 'w-10 h-10 rounded-xl font-bold bg-white/5 text-slate-600 cursor-not-allowed border border-white/5';
        } else {
            b.className = 'w-10 h-10 rounded-xl font-bold bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all';
            b.onclick = onClick;
        }
        container.appendChild(b);
    };

    btn('←', () => displayWinners(winnersPage - 1), false, winnersPage === 1);

    let start = Math.max(1, winnersPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (winnersPage === 1) end = Math.min(totalPages, 3);
    if (winnersPage === totalPages) start = Math.max(1, totalPages - 2);

    for (let i = start; i <= end; i++) {
        btn(String(i), () => displayWinners(i), i === winnersPage, false);
    }

    btn('→', () => displayWinners(winnersPage + 1), false, winnersPage === totalPages);
}
