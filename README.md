# ⚡ Portal Energi IR

Portal informasi dan manajemen data energi untuk **Team Energi Internal Relations** — menampilkan data konsumsi energi, ENPI, project efisiensi, pemenang training, dokumentasi, dan struktur tim.

**Live Portal:** [your-domain.vercel.app](https://your-domain.vercel.app)
**Admin Panel:** [your-domain.vercel.app/admin.html](https://your-domain.vercel.app/admin.html)

![Status](https://img.shields.io/badge/status-active-00ffff?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📸 Tampilan

| Portal Utama | Admin Dashboard |
|:---:|:---:|
| Hero section dengan 3D particle background | CRUD penuh untuk semua data |
| Grafik SEU & ENPI real-time | Seed data default (100 pemenang, 7 mesin) |
| AI Chatbot & Radio Widget | Upload foto via Cloudinary |

---

## 🗂️ Fitur Utama

### Portal Publik (`index.html`)
| Fitur | Deskripsi |
|---|---|
| 🏆 **Daftar Pemenang** | 100 pemenang training online dengan search & pagination |
| ⚡ **SEU IR** | Grafik bar konsumsi energi 7 mesin (KWh/tahun) + insight dinamis |
| 📋 **ENPI** | 3 chart combo (bar + line): KWHe/Pairs, KgCO2/Pairs, USD/Pairs (2020–2025) |
| 🔧 **Project Efisiensi** | Grid card inisiatif efisiensi energi |
| 📸 **Dokumentasi** | Galeri foto pemenang dengan lightbox zoom |
| 👥 **Team** | Struktur organisasi hierarkis (Manager → Supervisor → Staff) |
| 💬 **Kotak Masukan** | Chat room real-time (login Google) |
| 🤖 **AI Chatbot** | Energy Assistant berbasis Groq (Llama 3.3-70B) |
| 📻 **Radio Widget** | YouTube live radio: Global Hits, Prambors FM, Tomorrowland |
| 🌗 **Dark/Light Mode** | Toggle tema dengan animasi transisi |
| 🌐 **Google Translate** | Terjemahan halaman otomatis |
| 🎬 **Video Dokumentasi** | Embed video Solar Photovoltaic dari Google Drive |
| 📰 **Energy News** | Berita energi terbaru dari GNews API |

### Admin Dashboard (`admin.html`)
| Fitur | Deskripsi |
|---|---|
| 📊 **Dashboard** | Ringkasan statistik semua koleksi data |
| 🏆 **CRUD Pemenang** | Tambah, edit, hapus, search, pagination (15/halaman) |
| ⚡ **CRUD SEU IR** | Kelola data konsumsi 7 mesin |
| 📋 **CRUD ENPI** | Kelola data grafik ENPI per indikator |
| 🔧 **CRUD Project** | Kelola program efisiensi |
| 📸 **Upload Foto** | Upload ke Cloudinary + CRUD caption |
| 👥 **CRUD Team** | Kelola anggota tim + portfolio link |
| 📥 **Seed Data** | Generate data default satu klik (batch Firestore) |

---

## 🏛️ Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│                                                         │
│  ┌──────────────┐              ┌──────────────┐        │
│  │  index.html  │              │  admin.html  │        │
│  │  (Portal)    │              │  (Dashboard) │        │
│  └──────┬───────┘              └──────┬───────┘        │
│         │                             │                 │
│    ES Modules (js/*.js)          js/admin.js            │
│         │                             │                 │
└─────────┼─────────────────────────────┼─────────────────┘
          │                             │
          ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│                   FIREBASE                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Firestore   │  │  Realtime DB │  │   Firebase   │ │
│  │  (7 collect.)│  │  (messages)  │  │    Auth      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL SERVERLESS FUNCTIONS                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ /api/chat│  │/api/news │  │/api/youtube│            │
│  │ (Groq)   │  │ (GNews)  │  │ (YouTube) │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur File

```
IREnergyPortal/
├── index.html              # Portal utama (SPA)
├── admin.html              # Dashboard admin
├── style.css               # CSS: aurora, hexagon, animasi, light mode
├── bg-animation.js         # Three.js particle network background
├── fix.js                  # Script fix encoding karakter (Node.js)
├── package.json
│
├── api/                    # Vercel Serverless Functions
│   ├── chat.js             # Proxy → Groq API (Llama 3.3-70B)
│   ├── news.js             # Proxy → GNews API
│   └── youtube.js          # Proxy → YouTube Data API v3
│
├── js/                     # Frontend Modules
│   ├── main.js             # Entry point (inisialisasi semua modul)
│   ├── config.js           # Firebase + Cloudinary + API URL config
│   ├── firebase-store.js   # Shared Firestore realtime listener
│   ├── ui.js               # Navigation, tab switching, typewriter
│   ├── interactions.js     # Scroll reveal, magnetic effect, counter
│   ├── winners.js          # Pemenang: list, search, pagination
│   ├── team.js             # Struktur tim (hierarki cards)
│   ├── gallery.js          # Lightbox foto
│   ├── chat.js             # AI Chatbot (Groq + fallback lokal)
│   ├── music.js            # YouTube Radio widget
│   ├── theme.js            # Dark/Light mode toggle
│   ├── news.js             # Berita dari GNews API
│   ├── admin.js            # Admin CRUD + seed + realtime listeners
│   └── data.js             # Fallback kosong (semua data dari Firestore)
│
└── images/
    ├── energylogo.png      # Logo portal
    ├── energiteam.png      # Hero image
    ├── energybackground.png # Background utama
    ├── indra.png           # Foto anggota tim
    └── pemenang_*.jpeg     # Foto dokumentasi pemenang
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Tailwind CSS (CDN), Chart.js 4, Three.js 0.160 |
| **JavaScript** | Vanilla JS (ES Modules) |
| **Database** | Firebase Firestore (data utama), Firebase Realtime DB (chat) |
| **Auth** | Firebase Auth (Google Sign-In) |
| **Hosting** | Vercel |
| **API Proxy** | Vercel Serverless Functions (3 endpoint) |
| **AI** | Groq API — Llama 3.3-70B-Versatile |
| **News** | GNews API |
| **Video** | YouTube IFrame API + YouTube Data API v3 |
| **Image Upload** | Cloudinary |
| **Font** | Google Fonts (Outfit + Inter) |
| **Icons** | Emoji (native) |

---

## 🚀 Deployment

### Prerequisites
- Akun [Firebase](https://console.firebase.google.com) + project Firestore
- Akun [Vercel](https://vercel.com)
- Akun [Groq](https://console.groq.com) (gratis)
- Akun [GNews](https://gnews.io) (gratis)
- Akun [Cloudinary](https://cloudinary.com)
- YouTube Data API key dari [Google Cloud Console](https://console.cloud.google.com)

### 1. Firebase Setup
1. Buat project Firebase baru
2. Enable **Firestore Database** (mode test: `allow read, write: if true`)
3. Enable **Realtime Database** (mode test)
4. Enable **Authentication** → Google provider
5. Salin Firebase config ke `js/config.js`

### 2. Vercel Deployment
```bash
# Clone repo
git clone https://github.com/your-username/IREnergyPortal.git
cd IREnergyPortal

# Deploy ke Vercel
npx vercel
```

### 3. Environment Variables (di Vercel Dashboard)
| Variable | Deskripsi |
|---|---|
| `GROQ_API_KEY` | API key dari [console.groq.com](https://console.groq.com) |
| `GNEWS_API_KEY` | API key dari [gnews.io](https://gnews.io) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |

### 4. Seed Data
Buka admin panel → login → klik tombol **"Seed"** di masing-masing tab untuk generate data default.

---

## 📊 Koleksi Firestore

| Collection | Fields | Deskripsi |
|---|---|---|
| `winners` | nik, name, dept, order | 100 pemenang training |
| `seuMachines` | name, kwh, percentage, order | 7 mesin konsumsi energi |
| `enpiData` | indicator, year, actual, target, nextTarget, order | Data grafik ENPI (3×6 = 18 record) |
| `enpiItems` | icon, title, description, order | Fitur ENPI |
| `projectItems` | icon, title, description, order | Project efisiensi |
| `gallery` | imageUrl, caption, order | Foto dokumentasi |
| `team` | name, role, image, portfolioLink, order | Anggota tim |

**Realtime Database:** `messages` — chat room Kotak Masukan

---

## 🎨 Tema & Warna

| Token | Warna | Penggunaan |
|---|---|---|
| `energi-gold` | `#D4AF37` | Aksen utama, judul, border aktif |
| `energi-cyan` | `#00FFFF` | Highlight, link, chart sekunder |
| `energi-blue` | `#0066FF` | Gradient, gradien tombol |
| `energi-purple` | `#9900FF` | Aurora background, aksen |
| `darkbg` | `#050508` | Background utama |
| `darkcard` | `#0A0A0F` | Background kartu |

Mode terang tersedia dengan platinum theme (`#f1f5f9` background).

---

## 🔐 Keamanan

- ✅ API keys disimpan di **Vercel Environment Variables** (tidak di kode)
- ✅ Frontend hanya memanggil **proxy serverless** (`/api/*`)
- ✅ Admin panel dibatasi hanya **1 email** (`energypratama3@gmail.com`)
- ✅ Firebase config bersifat public (keamanan via Security Rules)
- ✅ Cloudinary upload menggunakan **unsigned preset**

---

## 👥 Tim Energi IR

| Nama | Role |
|---|---|
| Goldy Raymond PPS | EC Manager |
| M Priyo Pambudi | EC Supervisor |
| Indra Nurul Kusuma | EC Staff |
| Marini | EC Dokumen Control |
| Juliansyah | EC Patrol & Control |

---

## 📝 Catatan Pengembangan

### Fix Encoding
Jika terjadi masalah encoding karakter (emoji/unicode), jalankan:
```bash
node fix.js
```

### Menambah Data
1. Login ke admin panel (`admin.html`)
2. Pilih tab yang sesuai
3. Klik **"+ Tambah"** atau gunakan **"Seed"** untuk data default

### Menambah Admin
Edit array `ADMIN_EMAILS` di `js/admin.js`:
```javascript
const ADMIN_EMAILS = ['email1@gmail.com', 'email2@gmail.com'];
```

---

## 📄 License

MIT License — Silakan gunakan untuk keperluan internal.

---

> **Portal Energi IR** — *Precision • Integrity • Synergy*
> Built with ❤️ by Energy Team
