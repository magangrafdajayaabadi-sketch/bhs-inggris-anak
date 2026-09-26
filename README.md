# Bhs Inggris v2 — Game Belajar Bahasa Inggris Anak (White-Label + Backend)

Game edukasi berbasis web untuk anak usia 6–12 tahun: **43 mini-game** Bahasa Inggris
(tebak warna, hitung bintang, cocokkan kata, susun huruf, listening, dengar arti,
dengar kalimat, dengar & susun, ucapkan kata, ucapkan kalimat,
susun kalimat, lawan kata, bentuk jamak, isi kata kosong, bagian tubuh, kata kerja,
preposition, perasaan, cuaca, kata tanya, to be, pronoun, article, possessive,
simple present, nama hewan, buah-buahan, sayuran,
keluarga, sekolah, pakaian, transportasi, tempat umum, makanan, minuman, rumah,
pekerjaan, hobi, waktu, kalender, mainan, olahraga, alam)
dengan level Beginner, Intermediate,
dan Advanced,
lengkap dengan **timer & bonus kecepatan**, **panel admin white-label**,
**backend serverless opsional** untuk konfigurasi terpusat, papan bintang global,
dan room invite dengan leaderboard per room.

Menu game dikelompokkan berdasarkan fokus belajar: **Vocabulary**,
**Listening & Speaking**, **Grammar**, dan **Sentence Practice**.
Halaman utama juga menyediakan dashboard belajar dengan **misi**, **statistik**,
**koleksi lencana**, **Tantangan Harian**, **Paket Latihan** campuran, dan
**Latihan Salahku** untuk mengulang soal yang pernah dijawab salah oleh
masing-masing pemain.

Panduan lengkap langkah demi langkah (deploy, database, AI, cara main,
troubleshooting) ada di **[PANDUAN.md](PANDUAN.md)**.

## Dua mode — otomatis, tanpa setting

| | 💻 Mode Lokal | 🌐 Mode Server |
|---|---|---|
| Butuh database? | Tidak | Ya (Vercel KV / Upstash Redis, gratis) |
| Deploy | Sekali klik, langsung jalan | +2 menit setup database |
| Pengaturan admin | Tersimpan per browser | Tersimpan di server — **berlaku semua pengunjung** |
| Papan bintang | Per perangkat / per room lokal | **Global antar semua pemain + per room invite** |
| Login admin | Verifikasi sisi-klien | **Verifikasi di server (aman produksi)** |

Aplikasi mendeteksi mode secara otomatis lewat `/api/status`: jika database belum
dipasang, semuanya berjalan dalam Mode Lokal tanpa error. Badge mode tampil di
header panel admin.

---

## Struktur proyek

```
bhs-inggris/
├── index.html            → Halaman utama frontend / game (user/anak)
├── admin.html            → Panel admin (login + white-label)
├── css/style.css         → Seluruh tampilan
├── js/
│   ├── config.default.js → ⭐ Branding & konten bawaan
│   ├── shared.js         → Deteksi mode, API client, helper
│   ├── app.js            → Logika game
│   └── admin.js          → Logika panel admin
├── api/                  → Serverless functions (Vercel)
│   ├── _lib.js           → Helper (KV client, auth, util)
│   ├── status.js         → GET  status mode server
│   ├── login.js          → POST login admin → token
│   ├── config.js         → GET/POST konfigurasi
│   ├── password.js       → POST ganti kata sandi admin
│   └── leaderboard.js    → GET/POST/DELETE papan bintang global / per room
├── vercel.json
└── README.md
```

Tanpa framework, tanpa npm install, tanpa build step. API ditulis dengan Node.js
murni (fetch bawaan) — nol dependency.

---

## Deploy ke Vercel

### Langkah 1 — Deploy (Mode Lokal langsung jalan)
- **Drag & drop**: buka [vercel.com/new](https://vercel.com/new), tarik folder proyek ini.
- **Via Git**: push ke GitHub → Add New Project → import → Framework Preset:
  **Other**, Build Command & Output Directory dikosongkan → Deploy.
- **Via CLI**: `npm i -g vercel && vercel --prod`

### Langkah 2 — Aktifkan Mode Server (opsional, ±2 menit)
1. Di dashboard proyek Vercel → tab **Storage** → **Create Database** →
   pilih **Upstash (Redis)** — paket gratis tersedia.
2. Hubungkan ke proyek ini. Vercel otomatis menambahkan environment variables
   (`KV_REST_API_URL` + `KV_REST_API_TOKEN`, atau `UPSTASH_REDIS_REST_URL` +
   `UPSTASH_REDIS_REST_TOKEN` — keduanya didukung).
3. **Redeploy** proyek. Selesai — badge di panel admin berubah menjadi
   "🌐 Mode server aktif".

Opsional tapi disarankan: tambahkan env var `ADMIN_SECRET` (teks acak apa pun)
untuk memperkuat token sesi admin.

### Install di HP / Tablet (PWA)

Setelah deploy HTTPS, aplikasi bisa di-install seperti app:

- Android Chrome/Edge: buka situs, menu titik tiga, pilih **Install app** atau **Add to Home screen**.
- iPhone/iPad Safari: buka situs, tombol **Share**, pilih **Add to Home Screen**.

PWA memakai `logo.png` sebagai sumber ikon, dengan ikon turunan di folder `icons/`.
Mode offline dasar aktif untuk halaman utama, admin, CSS, JS, config, dan logo.

### Menjalankan secara lokal
```bash
npx serve .          # Mode Lokal (tanpa API)
# atau, dengan API + env database:
npm i -g vercel && vercel dev
```

---

## Role & cara pakai

### 👧 User (anak) — `index.html`
`index.html` adalah halaman utama frontend. Saat domain dibuka di `/`, pemain
langsung masuk ke aplikasi game.

Anak menulis nama panggilan (2–20 karakter) → opsional membuat/masuk room →
memilih level → memilih fokus belajar → mengatur timer → memilih mini-game →
mengumpulkan bintang. Di Mode Server, skor terbaiknya
otomatis masuk **papan bintang global** atau **papan bintang room** (top 10).

Dashboard belajar menampilkan misi harian, statistik jawaban, dan koleksi
lencana yang terbuka berdasarkan progres. Untuk latihan rutin, anak bisa memilih **Tantangan Harian** berisi 15 soal
campuran dan streak harian per pemain. Untuk latihan lebih panjang, anak bisa
memilih **Paket Latihan**. Paket ini mencampur beberapa game dalam satu ronde
20 soal, misalnya Paket Pemula, Paket Dengar & Eja, Paket Grammar, Paket
Kalimat, Paket Sehari-hari, Paket Aktivitas, dan Paket Jelajah. Jika anak salah
menjawab, soal itu otomatis masuk **Latihan Salahku** di browser pemain tersebut
dan akan hilang dari daftar setelah berhasil dijawab benar.

**Timer & bonus kecepatan.** Timer per soal bisa diatur: tanpa timer, 10, 20,
atau 30 detik. Saat timer aktif, jawaban benar yang cepat memberi bintang ekstra
— dijawab dalam 40% waktu pertama = **+2 bintang**, dalam 70% pertama = **+1**.
Jadi satu soal bernilai 1–3 bintang. Tanpa timer, jawaban benar tetap +1 bintang.

Fitur room: klik **Buat room** untuk membuat kode, salin kode atau link invite,
lalu bagikan ke teman. Teman yang membuka link invite akan masuk ke
room yang sama dan leaderboard-nya terpisah dari room lain. Link invite membawa
**level, fokus, dan timer** milik pembuat room — bagi penerima link, ketiga
pengaturan itu **terkunci dan disembunyikan** dari menu, sehingga semua anggota
room bermain dengan kondisi yang sama persis dan papan bintangnya adil.
Keluar dari room lewat tombol di menu untuk membuka kembali pengaturan itu.

Papan bintang menyimpan total bintang serta metadata ronde terakhir: game, fokus,
level, jumlah benar, dan perolehan bintang. Setelah ronde selesai, pemain melihat
modal ringkasan hasil sebelum kembali ke menu atau papan bintang.

### 🔑 Admin — `admin.html`
Kata sandi bawaan: **`admin123`** (⚠️ segera ganti di tab Keamanan).

| Tab | Fungsi |
|---|---|
| **Branding** | Nama aplikasi, tagline, logo (URL/upload), warna utama & aksen, footer |
| **Konten soal** | Edit **seluruh 38 bank soal** (kosakata, ejaan, listening, kalimat, lawan kata, plural, isi kosong, preposition, kata tanya, to be, pronoun, article, possessive, simple present, tubuh, kata kerja, perasaan, cuaca, hewan, buah, sayur, keluarga, sekolah, pakaian, transportasi, tempat umum, makanan, minuman, rumah, pekerjaan, hobi, waktu, kalender, mainan, olahraga, alam, warna, pujian). Satu baris = satu soal, kolom dipisah `=`. Baris salah format dilaporkan per nomor baris dan penyimpanan dibatalkan |
| **Game** | Aktif/nonaktifkan tiap game, jumlah soal per ronde |
| **Keamanan** | Ganti kata sandi (Mode Server: diverifikasi & disimpan di server) |
| **Data** | Ekspor/impor JSON, salin sebagai `config.default.js`, reset config, papan bintang global & papan room |

Di **Mode Server**, klik "Simpan perubahan" langsung memperbarui tampilan untuk
**semua pengunjung** — tidak perlu edit file atau redeploy.

---

## White-label

### Mode Server (paling praktis)
Login admin → ubah apa pun → **Simpan**. Berlaku global seketika.

### Mode Lokal / branding bawaan
1. Atur lewat panel admin → tab **Data** → **"Salin sebagai config.default.js"**.
2. Tempel (replace) seluruh isi `js/config.default.js` → deploy ulang.

### Ganti kata sandi bawaan di source code
Kata sandi disimpan sebagai hash SHA-256. Buat hash baru dari Console browser (F12):
```js
EFQ.sha256("kata-sandi-baru").then(console.log)
```
Tempel hasilnya ke `settings.adminPasswordHash` di `js/config.default.js`.
Catatan: di Mode Server, hash yang berlaku adalah yang tersimpan di database
(diubah lewat tab Keamanan).

---

## Dokumentasi API (Mode Server)

| Endpoint | Method | Auth | Fungsi |
|---|---|---|---|
| `/api/status` | GET | — | `{ server: true/false }` |
| `/api/config` | GET | — | Konfigurasi publik (hash sandi disembunyikan) |
| `/api/config` | POST | Bearer | Simpan konfigurasi |
| `/api/login` | POST | — | `{ password }` → `{ token }` |
| `/api/password` | POST | Bearer | `{ current, newPass }` → token baru |
| `/api/leaderboard` | GET | — | Top 10 global |
| `/api/leaderboard?room=ABC123` | GET | — | Top 10 room tertentu |
| `/api/leaderboard` | POST | — | `{ name, stars, room?, meta? }` — hanya menaikkan skor (ZADD GT) |
| `/api/leaderboard` | DELETE | Bearer | Kosongkan papan global |
| `/api/leaderboard?room=ABC123` | DELETE | Bearer | Kosongkan papan room tertentu |

Token = HMAC-SHA256 stateless; otomatis tidak berlaku ketika kata sandi diganti.

---

## Catatan keamanan & privasi (penting untuk pembeli)

- **Mode Server**: verifikasi sandi, penyimpanan config, dan otorisasi dilakukan
  di server — layak untuk produksi.
- **Mode Lokal**: proteksi admin bersifat sisi-klien; cukup untuk mencegah
  pengguna biasa, bukan pengguna teknis. Untuk produksi tanpa database, lindungi
  `admin.html` dengan Vercel Password Protection atau hapus dari deploy publik.
- **Privasi anak**: papan bintang global hanya menyimpan nama panggilan + jumlah
  bintang (tanpa data lain). Aplikasi menyarankan anak memakai nama panggilan.
  Validasi server membatasi nama maks 20 karakter dan skor 0–100.000.
- Endpoint skor bersifat publik agar anak tak perlu akun; jika butuh anti-curang
  ketat, tambahkan rate limiting (mis. Upstash Ratelimit) — struktur `api/_lib.js`
  mudah dikembangkan.

## Kustomisasi lanjutan

- **Tambah mini-game**: pola ada di `js/app.js` (`buildQs` + `render`), daftarkan
  di array `GAMES`, `settings.games`, dan `GAME_INFO` pada `js/admin.js`. Kalau
  game itu punya bank soal sendiri, tambahkan satu entri ke `CONTENT_BANKS`
  (`js/admin.js`) — kartu editornya otomatis muncul di tab Konten soal.
- **Atur level**: level Beginner/Intermediate/Advanced ada di `LEVELS` pada
  `js/app.js`; tiap level mengatur rentang angka, panjang kata/kalimat, dan
  jumlah pilihan jawaban.
- **Suara listening**: Web Speech API bawaan browser — gratis, tanpa file audio.
- **Font**: Baloo 2 + Nunito (Google Fonts), ganti di `<head>` dan `style.css`.
- **Multi-tenant** (satu deploy banyak sekolah): tambahkan prefix key per tenant
  di `api/_lib.js` (mis. dari subdomain) — arsitektur KV sudah siap ke arah itu.

## AI Native Speaker Gemini

Fitur Listening & Speaking sekarang dapat memakai Gemini secara opsional:

- `/api/gemini-tts` menghasilkan suara native speaker dari teks.
- `/api/gemini-speaking` menilai pronunciation dari rekaman audio.
- Game **Ucapkan kata** dan **Ucapkan kalimat** memakai mikrofon dan feedback AI.
- Jika `GEMINI_API_KEY` belum aktif, listening tetap fallback ke Web Speech API browser.

Environment variables untuk Vercel:

```text
GEMINI_API_KEY=isi_api_key_google_ai_studio
GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
GEMINI_SPEAKING_MODEL=gemini-3.1-flash-lite
GEMINI_TTS_VOICE=Kore
```

`GEMINI_API_KEY` hanya dibaca di serverless endpoint, bukan di JavaScript frontend.

## Lisensi penggunaan

Source code ini dibuat untuk dijual ulang / white-label oleh pemiliknya.
Sesuaikan bagian lisensi ini dengan ketentuan penjualan Anda.
