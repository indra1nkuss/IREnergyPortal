/**
 * ADMIN MODULE — Portal Energi IR
 * CRUD + Realtime Firebase Firestore
 */
import CONFIG from './config.js';

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, onSnapshot, query, orderBy, getDocs, writeBatch, deleteField } from "firebase/firestore";

// ─── Firebase Init ──────────────────────────────────────────────────────────
const app = initializeApp(CONFIG.FIREBASE);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ─── Cloudinary ─────────────────────────────────────────────────────────────
const CLOUD_NAME = CONFIG.CLOUDINARY.cloudName;
const UPLOAD_PRESET = CONFIG.CLOUDINARY.uploadPreset;

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST', body: formData
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.secure_url;
}

// ─── Config ─────────────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['energypratama3@gmail.com'];

// ─── State ──────────────────────────────────────────────────────────────────
let currentUser = null;
let currentCollection = '';
let currentEditId = null;
let winnersData = [];
let unsubscribers = {};

// ─── DOM Helpers ────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const show = (el) => el?.classList.remove('hidden');
const hide = (el) => el?.classList.add('hidden');
const toast = (msg, type = 'success') => {
    const t = $('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 4000);
};

// ─── Auth ────────────────────────────────────────────────────────────────────
$('admin-login-btn').onclick = async () => {
    try { await signInWithPopup(auth, provider); }
    catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') showError(e.message);
    }
};
$('admin-logout-btn').onclick = () => signOut(auth);

function showError(msg) {
    const el = $('login-error');
    el.textContent = msg; el.classList.remove('hidden');
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const email = user.email?.toLowerCase();
        if (!ADMIN_EMAILS.includes(email)) {
            showError(`Akses ditolak. Email "${email}" tidak terdaftar sebagai admin.`);
            signOut(auth); return;
        }
        currentUser = user;
        $('admin-avatar').src = user.photoURL || '';
        $('admin-avatar').classList.remove('hidden');
        $('admin-name').textContent = user.displayName || email;
        $('admin-name').classList.remove('hidden');
        hide($('login-screen'));
        show($('admin-dashboard'));
        initRealtimeListeners();
        updateStats();
        // Cek Firestore
        checkFirestoreOnce();
    } else {
        currentUser = null;
        show($('login-screen'));
        hide($('admin-dashboard'));
        Object.values(unsubscribers).forEach(fn => fn?.());
        unsubscribers = {};
    }
});

async function checkFirestoreOnce() {
    try {
        await setDoc(doc(db, '_admin_check_', 'test'), { t: Date.now() });
        await deleteDoc(doc(db, '_admin_check_', 'test'));
        console.log('✅ Firestore OK');
    } catch (e) {
        toast('❌ Firestore error: ' + e.message + '\nCek: (1) Database sudah dibuat? (2) Rules: allow read, write: if true', 'error');
    }
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        $(btn.dataset.tab)?.classList.add('active');
    });
});

// ─── Modal ──────────────────────────────────────────────────────────────────
window.openModal = (collection, editId = null) => {
    currentCollection = collection;
    currentEditId = editId;
    const title = editId ? 'Edit' : 'Tambah';
    const box = $('modal-body');
    const MODALS = {
        winners: `
            <h3 class="text-lg font-bold text-white mb-6">${title} Pemenang</h3>
            <div class="space-y-4">
                <div><label class="text-xs text-slate-400 block mb-1">NIK</label><input type="text" id="m-nik" class="w-full"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Nama Lengkap</label><input type="text" id="m-name" class="w-full"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Departemen</label><input type="text" id="m-dept" class="w-full"></div>
                <div class="flex gap-3 mt-6 justify-end">
                    <button class="btn-outline" onclick="closeModal()">Batal</button>
                    <button class="btn-primary" onclick="saveData('winners')">${editId ? 'Update' : 'Simpan'}</button>
                </div>
            </div>`,
        seu: `
            <h3 class="text-lg font-bold text-white mb-6">${title} Mesin SEU</h3>
            <div class="space-y-4">
                <div><label class="text-xs text-slate-400 block mb-1">Nama Mesin</label><input type="text" id="m-name" class="w-full"></div>
                <div><label class="text-xs text-slate-400 block mb-1">KWh / Year</label><input type="number" id="m-kwh" step="0.01" class="w-full"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Persentase (%)</label><input type="number" id="m-percentage" step="0.01" class="w-full"></div>
                <div class="flex gap-3 mt-6 justify-end">
                    <button class="btn-outline" onclick="closeModal()">Batal</button>
                    <button class="btn-primary" onclick="saveData('seu')">${editId ? 'Update' : 'Simpan'}</button>
                </div>
            </div>`,
        enpi: `
            <h3 class="text-lg font-bold text-white mb-6">${title} Data ENPI</h3>
            <div class="space-y-4">
                <div><label class="text-xs text-slate-400 block mb-1">Indikator</label>
                    <select id="m-indicator" class="w-full">
                        <option value="kwhe">KWHe/Pairs (Energi)</option>
                        <option value="co2">KgCO2/Pairs (Emisi)</option>
                        <option value="usd">USD/Pairs (Biaya)</option>
                    </select>
                </div>
                <div><label class="text-xs text-slate-400 block mb-1">Tahun</label><input type="number" id="m-year" class="w-full" min="2020" max="2030" placeholder="2025"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Aktual</label><input type="number" id="m-actual" step="0.001" class="w-full" placeholder="3.20"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Target</label><input type="number" id="m-target" step="0.001" class="w-full" placeholder="3.20"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Next Target</label><input type="number" id="m-nextTarget" step="0.001" class="w-full" placeholder="3.20"></div>
                <div class="flex gap-3 mt-6 justify-end">
                    <button class="btn-outline" onclick="closeModal()">Batal</button>
                    <button class="btn-primary" onclick="saveData('enpi')">${editId ? 'Update' : 'Simpan'}</button>
                </div>
            </div>`,
        project: `
            <h3 class="text-lg font-bold text-white mb-6">${title} Project</h3>
            <div class="space-y-4">
                <div><label class="text-xs text-slate-400 block mb-1">Ikon (emoji)</label><input type="text" id="m-icon" class="w-full" placeholder="💡"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Judul</label><input type="text" id="m-title" class="w-full"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Deskripsi</label><textarea id="m-desc" class="w-full"></textarea></div>
                <div class="flex gap-3 mt-6 justify-end">
                    <button class="btn-outline" onclick="closeModal()">Batal</button>
                    <button class="btn-primary" onclick="saveData('project')">${editId ? 'Update' : 'Simpan'}</button>
                </div>
            </div>`,
        gallery: `
            <h3 class="text-lg font-bold text-white mb-6">${title} Dokumentasi</h3>
            <div class="space-y-4">
                <div><label class="text-xs text-slate-400 block mb-1">Upload Foto</label><input type="file" id="m-file" accept="image/*" class="w-full file:bg-white/5 file:border file:border-white/10 file:rounded-lg file:text-white file:px-4 file:py-2 file:outline-none file:cursor-pointer file:text-xs"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Caption</label><input type="text" id="m-caption" class="w-full" placeholder="Momen 01"></div>
                <div id="m-preview" class="hidden"><img class="preview-img"></div>
                <div class="flex gap-3 mt-6 justify-end">
                    <button class="btn-outline" onclick="closeModal()">Batal</button>
                    <button class="btn-primary" id="m-upload-btn" onclick="saveData('gallery')">${editId ? 'Update' : 'Upload'}</button>
                </div>
            </div>`,
        team: `
            <h3 class="text-lg font-bold text-white mb-6">${title} Anggota Tim</h3>
            <div class="space-y-4">
                <div><label class="text-xs text-slate-400 block mb-1">Nama Lengkap</label><input type="text" id="m-name" class="w-full"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Role / Jabatan</label><input type="text" id="m-role" class="w-full" placeholder="EC Manager"></div>
                <div><label class="text-xs text-slate-400 block mb-1">URL Foto</label><input type="text" id="m-image" class="w-full" placeholder="images/nama.png"></div>
                <div><label class="text-xs text-slate-400 block mb-1">Portfolio Link</label><input type="text" id="m-portfolioLink" class="w-full" placeholder="https://..."></div>
                <div class="flex gap-3 mt-6 justify-end">
                    <button class="btn-outline" onclick="closeModal()">Batal</button>
                    <button class="btn-primary" onclick="saveData('team')">${editId ? 'Update' : 'Simpan'}</button>
                </div>
            </div>`
    };
    box.innerHTML = MODALS[collection] || '<p class="text-red-400">Modal tidak dikenal</p>';
    $('modal').classList.add('open');
    if (editId) populateForm(collection, editId);
};

window.closeModal = () => {
    $('modal').classList.remove('open');
    currentEditId = null;
    currentCollection = '';
};

async function populateForm(collection, id) {
    const colMap = { winners: 'winners', seu: 'seuMachines', enpi: 'enpiItems', project: 'projectItems', gallery: 'gallery', team: 'team' };
    const colName = colMap[collection];
    if (!colName) return;
    try {
        const snap = await getDoc(doc(db, colName, id));
        if (snap.exists()) {
            const data = snap.data();
            const keyMap = { description: 'desc', portfolioLink: 'portfolioLink' };
            Object.keys(data).forEach(key => {
                const formKey = keyMap[key] || key;
                const el = $(`m-${formKey}`);
                if (el) el.value = data[key];
            });
            if (data.imageUrl) {
                const prev = document.querySelector('#m-preview img');
                if (prev) { prev.src = data.imageUrl; $('#m-preview').classList.remove('hidden'); }
            }
        }
    } catch (e) {
        console.error('Populate error:', e);
        toast('Gagal memuat data: ' + e.message, 'error');
    }
}

// ─── CRUD Save ──────────────────────────────────────────────────────────────
window.saveData = async (collType) => {
    console.log('🔥 saveData:', collType, 'editId:', currentEditId);
    const colMap = { winners: 'winners', seu: 'seuMachines', enpi: 'enpiItems', project: 'projectItems', gallery: 'gallery', team: 'team' };
    const colName = colMap[collType];
    if (!colName) { toast('Koleksi tidak dikenal!', 'error'); return; }

    const getVal = (id) => $(id)?.value?.trim() || '';

    if (collType === 'gallery') {
        const file = $('m-file')?.files?.[0];
        const caption = getVal('m-caption');
        if (!file && !currentEditId) { toast('Pilih file untuk diupload.', 'error'); return; }
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            toast('⚠️ Cloudinary belum dikonfigurasi. Cek config.js', 'error');
            return;
        }
        const btn = $('m-upload-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span> Uploading...';
        try {
            if (file) {
                const url = await uploadToCloudinary(file);
                console.log('☁️ Cloudinary OK:', url.slice(0, 60));
                if (currentEditId) {
                    await updateDoc(doc(db, colName, currentEditId), { imageUrl: url, caption });
                } else {
                    const all = await getDocs(query(collection(db, colName), orderBy('order', 'desc')));
                    const lastOrder = all.empty ? 0 : (all.docs[0]?.data()?.order || 0);
                    await addDoc(collection(db, colName), { imageUrl: url, caption, order: lastOrder + 1 });
                }
                toast('✅ Foto berhasil diupload!');
            } else if (caption && currentEditId) {
                await updateDoc(doc(db, colName, currentEditId), { caption });
                toast('Caption diupdate!');
            }
        } catch (e) {
            toast('❌ ' + e.message, 'error');
            console.error('Upload error:', e);
        }
        btn.disabled = false;
        btn.innerHTML = currentEditId ? 'Update' : 'Upload';
        closeModal();
        return;
    }

    // ─── Non-gallery ─────────────────────────────────────────────────────────
    const fields = collType === 'winners' ? ['nik', 'name', 'dept'] :
                   collType === 'seu' ? ['name', 'kwh', 'percentage'] :
                   collType === 'team' ? ['name', 'role', 'image', 'portfolioLink'] :
                   collType === 'enpi' ? ['indicator', 'year', 'actual', 'target', 'nextTarget'] :
                   ['icon', 'title', 'description'];
    const formFieldMap = { description: 'desc' };

    const data = {};
    let hasValue = false;
    fields.forEach(f => {
        const formId = formFieldMap[f] || f;
        let val = getVal(`m-${formId}`);
        if (f === 'kwh' || f === 'percentage' || f === 'actual' || f === 'target' || f === 'nextTarget' || f === 'year') val = parseFloat(val) || 0;
        data[f] = val;
        if (val) hasValue = true;
    });

    if (!hasValue) { toast('Lengkapi data terlebih dahulu.', 'error'); return; }

    if (collType === 'winners' && !currentEditId && data.nik) {
        const existing = await getDocs(query(collection(db, colName)));
        for (const d of existing.docs) {
            if (d.data().nik === data.nik) {
                toast(`NIK ${data.nik} sudah ada!`, 'error');
                return;
            }   // tutup: if (d.data().nik === data.nik)
        }       // tutup: for (const d of existing.docs)
    }           // tutup: if (collType === 'winners' ...) — INI YANG HILANG SEBELUMNYA

    try {
        if (currentEditId) {
            await updateDoc(doc(db, colName, currentEditId), data);
            toast('✅ Data berhasil diupdate!');
        } else {
            const all = await getDocs(query(collection(db, colName), orderBy('order', 'desc')));
            const lastOrder = all.empty ? 0 : (all.docs[0]?.data()?.order || 0);
            data.order = lastOrder + 1;
            await addDoc(collection(db, colName), data);
            toast('✅ Data berhasil ditambahkan!');
        }
        closeModal();
    } catch (e) {
        toast('❌ Gagal menyimpan: ' + e.message, 'error');
        console.error('Save error:', e);
    }
};

// ─── Delete ──────────────────────────────────────────────────────────────────
window.deleteData = async (collType, id) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    const colMap = { winners: 'winners', seu: 'seuMachines', enpi: 'enpiItems', project: 'projectItems', gallery: 'gallery', team: 'team' };
    const colName = colMap[collType];
    if (!colName) return;
    try {
        await deleteDoc(doc(db, colName, id));
        toast('Data berhasil dihapus!');
    } catch (e) {
        toast('Gagal menghapus: ' + e.message, 'error');
    }
};

// ─── Seed Functions ─────────────────────────────────────────────────────────
window.seedTeam = async () => {
    if (!confirm('Tambahkan 5 anggota tim default?')) return;
    const members = [
        { name: 'Goldy Raymond PPS', role: 'EC Manager', image: 'images/susanto.png', portfolioLink: '', order: 1 },
        { name: 'M Priyo Pambudi', role: 'EC Supervisor', image: 'images/sarah.png', portfolioLink: '', order: 2 },
        { name: 'Indra Nurul Kusuma', role: 'EC Staff', image: 'images/indra.png', portfolioLink: 'https://indra1nkuss.github.io/cv1nkus/', order: 3 },
        { name: 'Marini', role: 'EC Dokumen Control', image: 'images/marini.png', portfolioLink: '', order: 4 },
        { name: 'Juliansyah', role: 'EC Patrol & Control', image: 'images/juliansyah.png', portfolioLink: '', order: 5 }
    ];
    const batch = writeBatch(db);
    members.forEach(m => batch.set(doc(collection(db, 'team')), m));
    await batch.commit();
    toast('5 anggota tim berhasil ditambahkan! 👥');
};

window.seedWinners = async () => {
    if (!confirm('Ini akan menambahkan 100 data pemenang default. Lanjutkan?')) return;
    const names = ['Ahmad Subarjo','Budi Santoso','Citra Kirana','Dadan Hermawan','Euis Komalasari',
        'Fajar Nugraha','Gita Savitri','Hendra Wijaya','Intan Permatasari','Joko Anwar',
        'Kiki Amalia','Lukman Hakim','Mila Rosmiati','Nanda Pratama','Oki Setiawan',
        'Putri Marino','Qori Akbar','Rina Nose','Surya Saputra','Tono Hartono'];
    const depts = ['Operasional Produksi','Engineering & Maintenance','Logistik & Supply Chain','Quality Control Analyst','Human Resources',
        'Health, Safety & Environment','Finance & Accounting','Security & Patrol','Dokumen Kontrol','Information Technology'];
    const batch = writeBatch(db);
    let order = 1;
    for (let i = 0; i < 100; i++) {
        const nik = (101001 + i).toString();
        const name = i < 20 ? names[i] : `${['Andi','Budi','Cici','Deni','Eka','Fani','Gani','Hana','Indra','Joni'][i % 10]} ${['Pratama','Wijaya','Saputra','Kusuma','Santoso'][i % 5]}`;
        const dept = depts[i % depts.length];
        batch.set(doc(collection(db, 'winners')), { nik, name, dept, order: order++ });
    }
    await batch.commit();
    toast('100 data pemenang berhasil ditambahkan! 🎉');
};

window.seedSEU = async () => {
    if (!confirm('Tambahkan data 7 mesin SEU default?')) return;
    const machines = [
        { name: 'Hot Machine', kwh: 662572.48, percentage: 36.74 },
        { name: 'Hot Machine', kwh: 423933.39, percentage: 23.51 },
        { name: 'Compressor', kwh: 192944.66, percentage: 10.70 },
        { name: 'Mixing', kwh: 136168.84, percentage: 7.55 },
        { name: 'Cutting', kwh: 134318.64, percentage: 7.45 },
        { name: 'Washing Machine', kwh: 134203.18, percentage: 7.44 },
        { name: 'HF Welding', kwh: 119211.84, percentage: 6.61 }
    ];
    const batch = writeBatch(db);
    machines.forEach((m, i) => batch.set(doc(collection(db, 'seuMachines')), { ...m, order: i + 1 }));
    await batch.commit();
    toast('7 data mesin SEU berhasil ditambahkan! ⚡');
};

window.seedENPI = async () => {
    if (!confirm('Tambahkan data 3 fitur ENPI default?')) return;
    const items = [
        { icon: '📈', title: 'Monitoring Real-Time', description: 'Pemantauan indikator kinerja energi secara langsung melalui dashboard terintegrasi.' },
        { icon: '📊', title: 'Analisis Data', description: 'Pengolahan data konsumsi energi untuk mengidentifikasi peluang penghematan.' },
        { icon: '📋', title: 'Laporan Kinerja', description: 'Output laporan periodik yang menjadi acuan pengambilan keputusan strategis.' }
    ];
    const batch = writeBatch(db);
    items.forEach((item, i) => batch.set(doc(collection(db, 'enpiItems')), { ...item, order: i + 1 }));
    await batch.commit();
    toast('3 fitur ENPI berhasil ditambahkan! 📋');
};

window.seedProject = async () => {
    if (!confirm('Tambahkan data 4 project efisiensi default?')) return;
    const items = [
        { icon: '💡', title: 'Energy Saving Campaign', description: 'Kampanye kesadaran hemat energi di seluruh area operasional.' },
        { icon: '☀️', title: 'Solar PV Optimization', description: 'Optimalisasi pembangkit listrik tenaga surya untuk kebutuhan internal.' },
        { icon: '📱', title: 'Digital Monitoring System', description: 'Sistem monitoring digital untuk tracking penggunaan energi real-time.' },
        { icon: '♻️', title: 'Waste to Energy', description: 'Inisiatif pengolahan limbah menjadi sumber energi alternatif.' }
    ];
    const batch = writeBatch(db);
    items.forEach((item, i) => batch.set(doc(collection(db, 'projectItems')), { ...item, order: i + 1 }));
    await batch.commit();
    toast('4 project efisiensi berhasil ditambahkan! 🔧');
};

// ─── Realtime Listeners ──────────────────────────────────────────────────────
function initRealtimeListeners() {
    unsubscribers.winners = onSnapshot(query(collection(db, 'winners'), orderBy('order')), (snap) => {
        winnersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderWinners();
        updateStats();
    });
    unsubscribers.seu = onSnapshot(query(collection(db, 'seuMachines'), orderBy('order')), (snap) => {
        renderTable('seu', snap.docs.map(d => ({ id: d.id, ...d.data() })));
        updateStats();
    });
    unsubscribers.enpi = onSnapshot(query(collection(db, 'enpiItems'), orderBy('order')), (snap) => {
        renderTable('enpi', snap.docs.map(d => ({ id: d.id, ...d.data() })));
        updateStats();
    });
    // ENPI Data (grafik)
    unsubscribers.enpiData = onSnapshot(query(collection(db, 'enpiData'), orderBy('order')), (snap) => {
        enpiDataAll = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderENPIDataTable();
        updateStats();
    });
    unsubscribers.project = onSnapshot(query(collection(db, 'projectItems'), orderBy('order')), (snap) => {
        renderTable('project', snap.docs.map(d => ({ id: d.id, ...d.data() })));
        updateStats();
    });
    unsubscribers.gallery = onSnapshot(query(collection(db, 'gallery'), orderBy('order')), (snap) => {
        renderGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        updateStats();
    });
    unsubscribers.team = onSnapshot(query(collection(db, 'team'), orderBy('order')), (snap) => {
        renderTeamTable(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        updateStats();
    });
}

// ─── Render Winners Table ───────────────────────────────────────────────────
let winnersPage = 1;
const WINNERS_PER_PAGE = 15;

function renderWinners() {
    const search = ($('winners-search')?.value || '').toLowerCase();
    let filtered = winnersData;
    if (search) filtered = winnersData.filter(w => w.nik?.includes(search) || w.name?.toLowerCase().includes(search) || w.dept?.toLowerCase().includes(search));

    const totalPages = Math.ceil(filtered.length / WINNERS_PER_PAGE) || 1;
    if (winnersPage > totalPages) winnersPage = totalPages;
    const start = (winnersPage - 1) * WINNERS_PER_PAGE;
    const pageItems = filtered.slice(start, start + WINNERS_PER_PAGE);
    const body = $('winners-body');

    if (pageItems.length === 0) { body.innerHTML = ''; show($('winners-empty')); $('winners-pagination').innerHTML = ''; return; }
    hide($('winners-empty'));

    body.innerHTML = pageItems.map((w, i) => `
        <tr>
            <td class="text-slate-500 font-mono text-xs">${start + i + 1}</td>
            <td class="font-mono text-energi-cyan text-xs">${w.nik}</td>
            <td class="text-white font-medium">${w.name}</td>
            <td class="text-slate-400 text-xs">${w.dept}</td>
            <td class="text-right">
                <button onclick="openModal('winners','${w.id}')" class="btn-outline btn-sm mr-1">✏️</button>
                <button onclick="deleteData('winners','${w.id}')" class="btn-danger btn-sm">🗑️</button>
            </td>
        </tr>
    `).join('');

    const pag = $('winners-pagination');
    if (totalPages <= 1) { pag.innerHTML = ''; return; }
    let html = `<button class="btn-outline btn-sm" onclick="winnersPage=${winnersPage-1};renderWinners()" ${winnersPage<=1?'disabled':''}>←</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += i === winnersPage
            ? `<span class="px-3 py-1 rounded-lg bg-energi-gold text-darkbg font-bold text-xs">${i}</span>`
            : `<button class="btn-outline btn-sm" onclick="winnersPage=${i};renderWinners()">${i}</button>`;
    }
    html += `<button class="btn-outline btn-sm" onclick="winnersPage=${winnersPage+1};renderWinners()" ${winnersPage>=totalPages?'disabled':''}>→</button>`;
    pag.innerHTML = html;
}

$('winners-search')?.addEventListener('input', () => { winnersPage = 1; renderWinners(); });

// ─── Render Generic Table ────────────────────────────────────────────────────
function renderTable(type, items) {
    const confs = {
        seu: { cols: ['name', 'kwh', 'percentage'], headers: ['Nama Mesin', 'KWh / Year', '%'], render: (v, k) => k === 'kwh' ? Number(v).toLocaleString('id-ID') : k === 'percentage' ? v + '%' : v },
        enpi: { cols: ['icon', 'title', 'description'], headers: ['Ikon', 'Judul', 'Deskripsi'], render: (v, k) => k === 'icon' ? `<span class="text-lg">${v}</span>` : v },
        project: { cols: ['icon', 'title', 'description'], headers: ['Ikon', 'Judul', 'Deskripsi'], render: (v, k) => k === 'icon' ? `<span class="text-lg">${v}</span>` : v }
    };
    const c = confs[type];
    if (!c) return;
    const body = $(`${type}-body`);
    if (items.length === 0) { body.innerHTML = ''; show($(`${type}-empty`)); return; }
    hide($(`${type}-empty`));
    body.innerHTML = items.map((item, i) => `
        <tr>
            <td class="text-slate-500 font-mono text-xs">${i + 1}</td>
            ${c.cols.map(k => `<td class="${k==='name'||k==='title'?'text-white font-medium':'text-slate-400 text-xs'}">${c.render(item[k], k) || '-'}</td>`).join('')}
            <td class="text-right">
                <button onclick="openModal('${type}','${item.id}')" class="btn-outline btn-sm mr-1">✏️</button>
                <button onclick="deleteData('${type}','${item.id}')" class="btn-danger btn-sm">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ─── Render Team Table ───────────────────────────────────────────────────────
function renderTeamTable(items) {
    const body = $('team-body');
    if (items.length === 0) { body.innerHTML = ''; show($('team-empty')); return; }
    hide($('team-empty'));
    body.innerHTML = items.map((item, i) => `
        <tr>
            <td class="text-slate-500 font-mono text-xs">${i + 1}</td>
            <td class="text-white font-medium">${item.name}</td>
            <td class="text-slate-400 text-xs">${item.role || '-'}</td>
            <td class="text-slate-400 text-xs">${item.image || '-'}</td>
            <td class="text-slate-400 text-xs">${item.portfolioLink ? '🔗' : '-'}</td>
            <td class="text-right">
                <button onclick="openModal('team','${item.id}')" class="btn-outline btn-sm mr-1">✏️</button>
                <button onclick="deleteData('team','${item.id}')" class="btn-danger btn-sm">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ─── Render Gallery Table ────────────────────────────────────────────────────
function renderGallery(items) {
    const body = $('gallery-body');
    if (items.length === 0) { body.innerHTML = ''; show($('gallery-empty')); return; }
    hide($('gallery-empty'));
    body.innerHTML = items.map((item, i) => `
        <tr>
            <td class="text-slate-500 font-mono text-xs">${i + 1}</td>
            <td><img src="${item.imageUrl}" class="preview-img" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%230a0a0f%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dominant-baseline=%22central%22 font-size=%2240%22>🖼️</text></svg>'"></td>
            <td class="text-slate-300 text-xs">${item.caption || '-'}</td>
            <td class="text-right">
                <button onclick="openModal('gallery','${item.id}')" class="btn-outline btn-sm mr-1">✏️</button>
                <button onclick="deleteData('gallery','${item.id}')" class="btn-danger btn-sm">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ─── File Preview ────────────────────────────────────────────────────────────
document.addEventListener('change', (e) => {
    if (e.target.id === 'm-file' && e.target.files?.[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const prev = document.querySelector('#m-preview img');
            const previewDiv = $('#m-preview');
            if (prev) prev.src = ev.target.result;
            if (previewDiv) previewDiv.classList.remove('hidden');
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// ─── Update Stats ────────────────────────────────────────────────────────────
async function updateStats() {
    try {
        const counts = await Promise.all(
            ['winners','seuMachines','enpiItems','projectItems','gallery','team'].map(c => getDocs(collection(db, c)).then(s => s.size))
        );
        if ($('stat-winners')) $('stat-winners').textContent = counts[0];
        if ($('stat-seu')) $('stat-seu').textContent = counts[1];
        if ($('stat-enpi')) $('stat-enpi').textContent = counts[2];
        if ($('stat-project')) $('stat-project').textContent = counts[3];
        if ($('stat-gallery')) $('stat-gallery').textContent = counts[4];
        if ($('stat-team')) $('stat-team').textContent = counts[5];
    } catch (e) { console.warn('Stats error:', e); }
}

console.log('✅ Admin Portal Energi siap!');

// ─── ENPI DATA CRUD ─────────────────────────────────────────────────────────

let enpiDataAll = []; // Semua data ENPI
let enpiFilter = 'all';

// Render table ENPI data
function renderENPIDataTable() {
    const body = $('enpi-data-body');
    if (!body) return;
    const filtered = enpiFilter === 'all' ? enpiDataAll : enpiDataAll.filter(d => d.indicator === enpiFilter);
    if (filtered.length === 0) { body.innerHTML = ''; show($('enpi-data-empty')); return; }
    hide($('enpi-data-empty'));

    const indicatorNames = { kwhe: '⚡ KWHe/Pairs', co2: '🌿 KgCO2/Pairs', usd: '💰 USD/Pairs' };
    body.innerHTML = filtered.map((d, i) => `
        <tr>
            <td class="text-slate-500 font-mono text-xs">${i + 1}</td>
            <td class="text-xs font-semibold">${indicatorNames[d.indicator] || d.indicator}</td>
            <td class="text-white font-bold text-xs">${d.year}</td>
            <td class="text-energi-cyan font-mono text-xs">${d.actual}</td>
            <td class="text-red-400 font-mono text-xs">${d.target}</td>
            <td class="text-green-400 font-mono text-xs">${d.nextTarget}</td>
            <td class="text-right">
                <button onclick="openModal('enpi','${d.id}')" class="btn-outline btn-sm mr-1">✏️</button>
                <button onclick="deleteData('enpi','${d.id}')" class="btn-danger btn-sm">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Filter indikator
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('enpi-filter')) {
        document.querySelectorAll('.enpi-filter').forEach(b => {
            b.classList.remove('active', 'bg-energi-cyan/20', 'border-energi-cyan/40', 'text-energi-cyan');
            b.classList.add('bg-white/5', 'border-white/10', 'text-slate-400');
        });
        e.target.classList.add('active', 'bg-energi-cyan/20', 'border-energi-cyan/40', 'text-energi-cyan');
        e.target.classList.remove('bg-white/5', 'border-white/10', 'text-slate-400');
        enpiFilter = e.target.dataset.filter;
        renderENPIDataTable();
    }
});

// Seed data ENPI dari gambar user
window.seedENPIData = async () => {
    if (!confirm('Tambahkan data ENPI default untuk 3 indikator x 6 tahun?')) return;

    const batch = writeBatch(db);
    let order = 1;

    // 1. KWHe/Pairs
    const kwhe = [
        { year: 2020, actual: 3.20, target: 3.20, nextTarget: 3.20 },
        { year: 2021, actual: 2.69, target: 3.14, nextTarget: 3.14 },
        { year: 2022, actual: 2.26, target: 3.08, nextTarget: 2.62 },
        { year: 2023, actual: 1.86, target: 3.02, nextTarget: 2.19 },
        { year: 2024, actual: 1.70, target: 2.95, nextTarget: 1.79 },
        { year: 2025, actual: 1.67, target: 2.89, nextTarget: 1.69 }
    ];
    kwhe.forEach(d => { batch.set(doc(collection(db, 'enpiData')), { indicator: 'kwhe', ...d, order: order++ }); });

    // 2. KgCO2/Pairs
    const co2 = [
        { year: 2020, actual: 1.81, target: 1.812, nextTarget: 1.81 },
        { year: 2021, actual: 1.55, target: 1.78, nextTarget: 1.78 },
        { year: 2022, actual: 0.77, target: 1.73, nextTarget: 1.37 },
        { year: 2023, actual: 0.06, target: 1.68, nextTarget: 0.59 },
        { year: 2024, actual: 0.05, target: 1.65, nextTarget: 0.05 },
        { year: 2025, actual: 0.04, target: 1.63, nextTarget: 0.05 }
    ];
    co2.forEach(d => { batch.set(doc(collection(db, 'enpiData')), { indicator: 'co2', ...d, order: order++ }); });

    // 3. USD/Pairs
    const usd = [
        { year: 2020, actual: 0.20, target: 0.20, nextTarget: 0.20 },
        { year: 2021, actual: 0.17, target: 0.19, nextTarget: 0.19 },
        { year: 2022, actual: 0.15, target: 0.19, nextTarget: 0.19 },
        { year: 2023, actual: 0.14, target: 0.19, nextTarget: 0.17 },
        { year: 2024, actual: 0.12, target: 0.18, nextTarget: 0.14 },
        { year: 2025, actual: 0.11, target: 0.18, nextTarget: 0.13 }
    ];
    usd.forEach(d => { batch.set(doc(collection(db, 'enpiData')), { indicator: 'usd', ...d, order: order++ }); });

    await batch.commit();
    toast('Data ENPI berhasil ditambahkan! (3 indikator x 6 tahun)');
};

// ─── Finalize ──────────────────────────────────────────────────────────────
console.log('✅ Admin Portal Energi siap!');

// ══════════════════════════════════════════════════════════════════════════════
// 📅 WEEKLY CONSUMPTION ADMIN MODULE
// Firestore: weeklyConsumption/{monthKey}
//   Fields: week1..week5 (map of areaId → {kwh, prod, ratio})
// ══════════════════════════════════════════════════════════════════════════════

const WC_AREAS_ADMIN = [
    { id: 'plant-ir-a',          name: 'Plant IR A' },
    { id: 'plant-ir-b',          name: 'Plant IR B' },
    { id: 'plant-ir-c',          name: 'Plant IR C' },
    { id: 'plant-ir-d',          name: 'Plant IR D' },
    { id: 'plant-ir-e-rubber',   name: 'Plant IR E (Rubber)' },
    { id: 'plant-ir-e-mixing',   name: 'Plant IR E (Mixing)' },
    { id: 'plant-ir-e-press',    name: 'Plant IR E (Press)' },
    { id: 'plant-ir-e-stockfit', name: 'Plant IR E (Stockfit)' },
    { id: 'plant-ir-e-grinding', name: 'Plant IR E (Grinding)' },
    { id: 'plant-ir-e-injection',name: 'Plant IR E (Injection Phylon)' },
    { id: 'plant-ir-f-2nd',      name: 'Plant IR F (2nd Process)' },
    { id: 'plant-ir-f-cutting',  name: 'Plant IR F (Cutting)' },
    { id: 'idc',                 name: 'IDC' },
    { id: 'mess-korea',          name: 'Mess Korea' },
    { id: 'kantor-pj023',        name: 'Kantor Umum (PJ023)' },
    { id: 'kantor-pj112',        name: 'Kantor Umum (PJ112)' },
    { id: 'manmod',              name: 'Manmod' },
    { id: 'office-dormitory',    name: 'Office Dormitory (Total)' },
    { id: 'kompressor',          name: 'Kompressor Engineering' },
    { id: 'wtp-wwtp',            name: 'WTP & WWTP' },
    { id: 'kantin-b',            name: 'Kantin B' },
    { id: 'others-pj023',        name: 'Others PJ023' },
    { id: 'others-pj112',        name: 'Others PJ112' },
    { id: 'utility',             name: 'Utility (Total)' },
];

let wcAdminCurrentMonth = '';
let wcAdminCurrentWeek  = 1;
let wcAdminData         = {}; // { "2025-09": { week1: {...}, ... } }
let wcAdminUnsubscribe  = null;

// ─── Listen to weeklyConsumption ────────────────────────────────────────────
function wcAdminStartListener() {
    if (wcAdminUnsubscribe) return;
    wcAdminUnsubscribe = onSnapshot(collection(db, 'weeklyConsumption'), (snap) => {
        wcAdminData = {};
        snap.docs.forEach(d => { wcAdminData[d.id] = d.data(); });
        wcRenderAdminMonthList();
        if (wcAdminCurrentMonth) wcRenderAdminWeekForm();
    }, err => console.warn('WC Admin error:', err.message));
}

// ─── Render Month List sidebar ───────────────────────────────────────────────
function wcRenderAdminMonthList() {
    const container = $('wc-admin-month-list');
    if (!container) return;
    const months = Object.keys(wcAdminData).sort((a, b) => b.localeCompare(a));
    if (months.length === 0) {
        container.innerHTML = '<p class="text-slate-600 text-xs text-center py-4">Belum ada data</p>';
        return;
    }
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    container.innerHTML = months.map(mk => {
        const [y, m] = mk.split('-');
        const label = monthNames[parseInt(m)-1] + ' ' + y;
        return `<button onclick="wcAdminSelectMonth('${mk}')"
            class="w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
                mk === wcAdminCurrentMonth
                ? 'bg-energi-gold/20 text-energi-gold border border-energi-gold/30 font-bold'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }">${label}</button>`;
    }).join('');
}

window.wcAdminSelectMonth = (mk) => {
    wcAdminCurrentMonth = mk;
    wcAdminCurrentWeek  = 1;
    wcRenderAdminMonthList();
    wcRenderAdminWeekForm();
};

// ─── Render week tab + form ──────────────────────────────────────────────────
function wcRenderAdminWeekForm() {
    const container = $('wc-admin-form-area');
    if (!container) return;
    if (!wcAdminCurrentMonth) {
        container.innerHTML = '<p class="text-slate-500 text-sm text-center py-10">Pilih bulan di sebelah kiri</p>';
        return;
    }

    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const [y, m] = wcAdminCurrentMonth.split('-');
    const monthLabel = monthNames[parseInt(m)-1] + ' ' + y;

    // Week tabs
    const weekTabs = [1,2,3,4,5].map(w => `
        <button onclick="wcAdminSelectWeek(${w})"
            class="px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                w === wcAdminCurrentWeek
                ? 'bg-energi-gold text-darkbg shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }">Week ${w}</button>
    `).join('');

    // Current week data
    const weekKey  = 'week' + wcAdminCurrentWeek;
    const weekData = (wcAdminData[wcAdminCurrentMonth] || {})[weekKey] || {};

    // ── IDs sub-area untuk kalkulasi otomatis total ───────────────────────
    const DORM_SUB_IDS    = ['idc','mess-korea','kantor-pj023','kantor-pj112','manmod'];
    const UTILITY_SUB_IDS = ['kompressor','wtp-wwtp','kantin-b','others-pj023','others-pj112'];

    function adminSumSubs(ids) {
        let kwh = 0, prod = 0;
        ids.forEach(id => {
            const d = weekData[id];
            if (d) { kwh += parseFloat(d.kwh || 0); prod += parseFloat(d.prod || 0); }
        });
        return { kwh: kwh || '', prod: prod || '', ratio: prod > 0 ? (kwh / prod).toFixed(4) : '' };
    }

    // Area rows
    const rows = WC_AREAS_ADMIN.map((area, i) => {
        const isAutoTotal = area.id === 'office-dormitory' || area.id === 'utility';
        const d = isAutoTotal
            ? adminSumSubs(area.id === 'office-dormitory' ? DORM_SUB_IDS : UTILITY_SUB_IDS)
            : weekData[area.id] || {};

        const rowBg = isAutoTotal
            ? (area.id === 'office-dormitory' ? 'bg-yellow-500/10 font-bold' : 'bg-orange-500/10 font-bold')
            : (i % 2 === 0 ? 'bg-white/2' : '');

        if (isAutoTotal) {
            // Read-only summary row
            return `
        <tr class="${rowBg} border-t border-white/10">
            <td class="py-2 px-3 text-xs text-slate-500 font-mono w-8">${String(i+1).padStart(2,'0')}</td>
            <td class="py-2 px-3 text-xs text-white font-bold min-w-[200px]">
                ${area.name}
                <span class="ml-2 text-[9px] font-normal text-slate-500">(auto)</span>
            </td>
            <td class="py-2 px-3">
                <input type="number" id="wca-kwh-${area.id}" value="${d.kwh}"
                    class="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-energi-gold font-mono cursor-not-allowed opacity-60" readonly tabindex="-1">
            </td>
            <td class="py-2 px-3">
                <input type="number" id="wca-prod-${area.id}" value="${d.prod}"
                    class="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-energi-cyan font-mono cursor-not-allowed opacity-60" readonly tabindex="-1">
            </td>
            <td class="py-2 px-3">
                <input type="number" id="wca-ratio-${area.id}" value="${d.ratio}"
                    class="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-mono cursor-not-allowed opacity-60" readonly tabindex="-1">
            </td>
        </tr>`;
        }

        return `
        <tr class="${rowBg} hover:bg-white/4 transition-colors">
            <td class="py-2 px-3 text-xs text-slate-500 font-mono w-8">${String(i+1).padStart(2,'0')}</td>
            <td class="py-2 px-3 text-xs text-slate-200 min-w-[200px]">${area.name}</td>
            <td class="py-2 px-3">
                <input type="number" step="0.01" placeholder="0"
                    id="wca-kwh-${area.id}"
                    value="${d.kwh !== undefined ? d.kwh : ''}"
                    oninput="wcAutoCalcRatio('${area.id}'); wcAdminRefreshTotals();"
                    class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-energi-gold font-mono focus:outline-none focus:border-energi-gold/50">
            </td>
            <td class="py-2 px-3">
                <input type="number" step="1" placeholder="0"
                    id="wca-prod-${area.id}"
                    value="${d.prod !== undefined ? d.prod : ''}"
                    oninput="wcAutoCalcRatio('${area.id}'); wcAdminRefreshTotals();"
                    class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-energi-cyan font-mono focus:outline-none focus:border-energi-cyan/50">
            </td>
            <td class="py-2 px-3">
                <input type="number" step="0.0001" placeholder="auto"
                    id="wca-ratio-${area.id}"
                    value="${d.ratio !== undefined ? d.ratio : ''}"
                    class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white/30" readonly>
            </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
            <div>
                <h3 class="text-white font-bold text-lg">${monthLabel}</h3>
                <p class="text-slate-500 text-sm mt-0.5">Edit data konsumsi minggu ke-${wcAdminCurrentWeek}</p>
            </div>
            <div class="flex flex-wrap gap-2">${weekTabs}</div>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-white/10">
            <table class="w-full min-w-[700px]">
                <thead>
                    <tr class="bg-white/5 border-b border-white/10">
                        <th class="py-3 px-3 text-[10px] uppercase tracking-[0.2em] text-slate-500 text-left w-8">#</th>
                        <th class="py-3 px-3 text-[10px] uppercase tracking-[0.2em] text-slate-500 text-left min-w-[200px]">Area / Departemen</th>
                        <th class="py-3 px-3 text-[10px] uppercase tracking-[0.2em] text-energi-gold text-left min-w-[140px] w-1/4">KWh</th>
                        <th class="py-3 px-3 text-[10px] uppercase tracking-[0.2em] text-energi-cyan text-left min-w-[140px] w-1/4">Produksi (Pairs)</th>
                        <th class="py-3 px-3 text-[10px] uppercase tracking-[0.2em] text-slate-400 text-left min-w-[140px] w-1/4">KWh/Pairs (auto)</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-4 mt-6">
            <button onclick="wcAdminSaveWeek()" class="btn-primary flex-1 w-full py-3 text-sm flex items-center justify-center gap-2">
                <span>💾</span> Simpan & Update Week ${wcAdminCurrentWeek}
            </button>
            <button onclick="wcAdminClearWeek()" class="btn-outline w-full md:w-auto py-3 px-6 text-sm flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10">
                <span>🗑️</span> Hapus Data Week ${wcAdminCurrentWeek}
            </button>
        </div>
    `;
}

window.wcAdminSelectWeek = (w) => {
    wcAdminCurrentWeek = w;
    wcRenderAdminWeekForm();
};

// ─── Auto-calc ratio ────────────────────────────────────────────────────────
window.wcAutoCalcRatio = (areaId) => {
    const kwh  = parseFloat($(`wca-kwh-${areaId}`)?.value)  || 0;
    const prod = parseFloat($(`wca-prod-${areaId}`)?.value) || 0;
    const ratioEl = $(`wca-ratio-${areaId}`);
    if (ratioEl) ratioEl.value = prod > 0 ? (kwh / prod).toFixed(4) : '';
};

// ─── Refresh auto-total rows (Office Dormitory & Utility) ────────────────────
window.wcAdminRefreshTotals = () => {
    const DORM_SUB_IDS    = ['idc','mess-korea','kantor-pj023','kantor-pj112','manmod'];
    const UTILITY_SUB_IDS = ['kompressor','wtp-wwtp','kantin-b','others-pj023','others-pj112'];

    function recalcTotal(subIds, totalId) {
        let kwh = 0, prod = 0;
        subIds.forEach(id => {
            kwh  += parseFloat($(`wca-kwh-${id}`)?.value  || 0);
            prod += parseFloat($(`wca-prod-${id}`)?.value || 0);
        });
        const kwhEl   = $(`wca-kwh-${totalId}`);
        const prodEl  = $(`wca-prod-${totalId}`);
        const ratioEl = $(`wca-ratio-${totalId}`);
        if (kwhEl)   kwhEl.value   = kwh  || '';
        if (prodEl)  prodEl.value  = prod || '';
        if (ratioEl) ratioEl.value = prod > 0 ? (kwh / prod).toFixed(4) : '';
    }

    recalcTotal(DORM_SUB_IDS,    'office-dormitory');
    recalcTotal(UTILITY_SUB_IDS, 'utility');
};

// ─── Save week data ──────────────────────────────────────────────────────────
window.wcAdminSaveWeek = async () => {
    if (!wcAdminCurrentMonth) { toast('Pilih bulan terlebih dahulu!', 'error'); return; }

    const weekKey = 'week' + wcAdminCurrentWeek;
    const areaData = {};

    WC_AREAS_ADMIN.forEach(area => {
        const kwh   = parseFloat($(`wca-kwh-${area.id}`)?.value)   || null;
        const prod  = parseFloat($(`wca-prod-${area.id}`)?.value)  || null;
        const ratio = parseFloat($(`wca-ratio-${area.id}`)?.value) || null;
        if (kwh !== null || prod !== null) {
            areaData[area.id] = {
                kwh:   kwh   ?? 0,
                prod:  prod  ?? 0,
                ratio: ratio ?? (prod > 0 ? kwh / prod : 0)
            };
        }
    });

    try {
        const docRef = doc(db, 'weeklyConsumption', wcAdminCurrentMonth);
        await setDoc(docRef, { [weekKey]: areaData, updatedAt: Date.now() }, { merge: true });
        toast(`✅ Data Week ${wcAdminCurrentWeek} — ${wcAdminCurrentMonth} berhasil disimpan!`);
        // Refresh local cache
        if (!wcAdminData[wcAdminCurrentMonth]) wcAdminData[wcAdminCurrentMonth] = {};
        wcAdminData[wcAdminCurrentMonth][weekKey] = areaData;
    } catch (e) {
        toast('❌ Gagal menyimpan: ' + e.message, 'error');
        console.error('WC Save error:', e);
    }
};

// ─── Delete / Reset week ──────────────────────────────────────────────────────────
window.wcAdminClearWeek = async () => {
    if (!confirm(`Hapus seluruh data Week ${wcAdminCurrentWeek} pada bulan ${wcAdminCurrentMonth}?`)) return;
    
    // Clear inputs in DOM
    WC_AREAS_ADMIN.forEach(area => {
        const kwh   = $(`wca-kwh-${area.id}`);
        const prod  = $(`wca-prod-${area.id}`);
        const ratio = $(`wca-ratio-${area.id}`);
        if (kwh)   kwh.value   = '';
        if (prod)  prod.value  = '';
        if (ratio) ratio.value = '';
    });

    // Delete from Firestore
    try {
        const weekKey = 'week' + wcAdminCurrentWeek;
        const docRef = doc(db, 'weeklyConsumption', wcAdminCurrentMonth);
        await setDoc(docRef, { [weekKey]: deleteField(), updatedAt: Date.now() }, { merge: true });
        toast(`✅ Data Week ${wcAdminCurrentWeek} berhasil dihapus!`);
        
        if (wcAdminData[wcAdminCurrentMonth]) {
            delete wcAdminData[wcAdminCurrentMonth][weekKey];
        }
    } catch (e) {
        toast('❌ Gagal menghapus: ' + e.message, 'error');
        console.error('WC Delete error:', e);
    }
};

// ─── Create new month ────────────────────────────────────────────────────────
window.wcAdminCreateMonth = async () => {
    const input = $('wc-admin-new-month');
    if (!input) return;
    const val = input.value.trim(); // "2025-09"
    if (!/^\d{4}-\d{2}$/.test(val)) { toast('Format bulan: YYYY-MM (cth: 2025-09)', 'error'); return; }
    if (wcAdminData[val]) { toast('Bulan ini sudah ada!', 'error'); return; }
    try {
        await setDoc(doc(db, 'weeklyConsumption', val), { createdAt: Date.now() });
        toast(`✅ Bulan ${val} berhasil dibuat!`);
        input.value = '';
        wcAdminCurrentMonth = val;
        wcAdminCurrentWeek  = 1;
    } catch (e) {
        toast('❌ ' + e.message, 'error');
    }
};

// ─── Delete month ────────────────────────────────────────────────────────────
window.wcAdminDeleteMonth = async (mk) => {
    if (!mk) mk = wcAdminCurrentMonth;
    if (!mk) { toast('Pilih bulan terlebih dahulu!', 'error'); return; }
    if (!confirm(`Hapus semua data bulan ${mk}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
        await deleteDoc(doc(db, 'weeklyConsumption', mk));
        toast(`Bulan ${mk} berhasil dihapus.`);
        if (wcAdminCurrentMonth === mk) {
            wcAdminCurrentMonth = '';
            const form = $('wc-admin-form-area');
            if (form) form.innerHTML = '<p class="text-slate-500 text-sm text-center py-10">Pilih bulan di sebelah kiri</p>';
        }
    } catch (e) {
        toast('❌ ' + e.message, 'error');
    }
};

// ─── Init when admin dashboard loads ────────────────────────────────────────
// Hook into sidebar link click for weekly tab
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab="weekly-admin"]');
    if (btn && currentUser) {
        wcAdminStartListener();
        // Also set default month to current
        if (!wcAdminCurrentMonth) {
            const now = new Date();
            const mm  = String(now.getMonth() + 1).padStart(2, '0');
            wcAdminCurrentMonth = `${now.getFullYear()}-${mm}`;
        }
        setTimeout(() => {
            wcRenderAdminMonthList();
            wcRenderAdminWeekForm();
        }, 200);
    }
});
