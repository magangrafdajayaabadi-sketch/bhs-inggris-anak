# Panduan Lengkap — Bhs Inggris

Panduan ini mencakup: analisa isi proyek, cara deploy ke Vercel (dari nol sampai
online), cara mengaktifkan database & fitur AI, cara bermain, cara memakai panel
admin, referensi API, dan troubleshooting.

Semua isi panduan ini diverifikasi langsung dari source code, bukan dari
dokumentasi lama. Beberapa poin di `README.md` sudah tidak akurat — lihat bagian
[Catatan & keterbatasan yang perlu diketahui](#12-catatan--keterbatasan-yang-perlu-diketahui).

---

## Daftar isi

1. [Apa ini sebenarnya](#1-apa-ini-sebenarnya)
2. [Struktur file](#2-struktur-file)
3. [Dua mode: Lokal vs Server](#3-dua-mode-lokal-vs-server)
4. [Persiapan sebelum deploy](#4-persiapan-sebelum-deploy)
5. [Deploy ke Vercel](#5-deploy-ke-vercel)
6. [Mengaktifkan Mode Server (database)](#6-mengaktifkan-mode-server-database)
7. [Mengaktifkan AI Native Speaker (Gemini)](#7-mengaktifkan-ai-native-speaker-gemini)
8. [Menjalankan di komputer sendiri](#8-menjalankan-di-komputer-sendiri)
9. [Cara bermain (untuk anak / orang tua / guru)](#9-cara-bermain)
10. [Panel admin & white-label](#10-panel-admin--white-label)
11. [Referensi API](#11-referensi-api)
12. [Catatan & keterbatasan yang perlu diketahui](#12-catatan--keterbatasan-yang-perlu-diketahui)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Apa ini sebenarnya

Game edukasi Bahasa Inggris berbasis web untuk anak usia 6–12 tahun, berisi
**43 mini-game**, 3 tingkat kesulitan, papan bintang, room multiplayer, panel
admin white-label, dashboard belajar, misi, koleksi lencana, Tantangan Harian,
paket latihan campuran, Latihan Salahku, dan frontend game
utama di `index.html`.

Yang penting untuk dipahami sebelum deploy:

- **Tanpa framework, tanpa `npm install`, tanpa build step.** HTML + CSS +
  JavaScript murni. Tidak ada `package.json` sama sekali, dan itu memang
  disengaja.
- **Backend-nya opsional.** Folder `api/` berisi serverless function Node.js
  murni (tanpa dependency). Kalau database tidak dipasang, semua endpoint
  membalas `503` dan aplikasi otomatis jatuh ke mode offline tanpa error.
- **Semua konten soal ada di satu file**, `js/config.default.js`. Mengganti
  kosakata, kalimat, warna, branding — semuanya dari sana atau dari panel admin.

---

## 2. Struktur file

```
├── index.html            → Halaman utama frontend / game (yang dimainkan anak)
├── admin.html            → Panel admin (login + white-label)
├── vercel.json           → Konfigurasi Vercel (clean URLs + header keamanan)
├── css/style.css         → Seluruh tampilan
├── js/
│   ├── config.default.js → ⭐ Branding + SELURUH bank soal
│   ├── shared.js         → Deteksi mode, API client, auth, TTS, helper
│   ├── app.js            → Logika 43 mini-game (file terbesar)
│   └── admin.js          → Logika panel admin
└── api/                  → Serverless functions (aktif hanya di Vercel)
    ├── _lib.js           → Helper: koneksi Redis, token admin, util HTTP
    ├── status.js         → GET  — apakah database aktif?
    ├── login.js          → POST — login admin → token
    ├── config.js         → GET/POST — konfigurasi global
    ├── password.js       → POST — ganti kata sandi admin
    ├── leaderboard.js    → GET/POST/DELETE — papan bintang global & per room
    ├── gemini-tts.js     → POST — suara native speaker dari Gemini
    └── gemini-speaking.js→ POST — penilaian pronunciation dari rekaman suara
```

File yang diawali garis bawah (`_lib.js`) tidak menjadi endpoint — itu aturan
Vercel, jadi jangan diganti namanya.

---

## 3. Dua mode: Lokal vs Server

Aplikasi memanggil `/api/status` saat dimuat. Jawabannya menentukan mode, dan
tidak ada setting manual yang perlu Anda ubah.

| | 💻 Mode Lokal | 🌐 Mode Server |
|---|---|---|
| Syarat | Tidak ada | Database Redis terpasang |
| Pengaturan admin | Tersimpan di browser itu saja | Tersimpan di server, berlaku untuk **semua pengunjung** |
| Papan bintang | Per perangkat | **Global** + per room |
| Login admin | Diverifikasi di browser (lemah) | Diverifikasi di server (aman) |
| Ganti branding | Harus edit file + deploy ulang | Cukup klik Simpan di panel admin |

Deploy tanpa database tetap jalan sempurna untuk dipakai satu keluarga atau satu
kelas di satu perangkat. Database baru wajib kalau Anda ingin papan bintang
bersama, atau ingin mengatur branding tanpa deploy ulang.

---

## 4. Persiapan sebelum deploy

Yang perlu disiapkan:

1. **Akun Vercel** — daftar gratis di [vercel.com/signup](https://vercel.com/signup)
   (paling praktis: login pakai akun GitHub).
2. **Akun GitHub** — opsional, tapi sangat disarankan (lihat Cara B).
3. **Folder proyek ini** dalam keadaan utuh.

Yang **tidak** perlu: Node.js, npm, build tool, kartu kredit.

Satu hal yang sebaiknya dilakukan sekarang: **kata sandi admin bawaan adalah
`admin123`**. Rencanakan untuk menggantinya tepat setelah deploy (caranya ada di
bagian 10).

---

## 5. Deploy ke Vercel

Pilih salah satu dari tiga cara berikut. Hasilnya sama; yang berbeda hanya cara
update ke depannya.

### Cara A — Drag & drop (paling cepat, ±2 menit)

Cocok kalau Anda hanya ingin cepat online dan jarang mengubah kode.

1. Buka [vercel.com/new](https://vercel.com/new).
2. Cari opsi **"Deploy a folder"** / area drag & drop.
3. Tarik **folder proyek** (folder yang berisi `index.html`) ke area tersebut.
   ⚠️ Tarik foldernya, bukan file ZIP, dan bukan isi foldernya satu per satu.
4. Klik **Deploy**, tunggu ±30 detik.
5. Situs Anda hidup di `https://nama-proyek.vercel.app`.

Kekurangan: untuk update, Anda harus drag & drop ulang setiap kali.

### Cara B — Lewat GitHub (paling disarankan)

Setiap kali Anda mengubah kode dan push, Vercel otomatis deploy ulang.

1. Buat repository baru di GitHub (boleh private).
2. Upload seluruh isi folder proyek ke repository itu (bisa lewat tombol
   **Add file → Upload files** di GitHub, tidak harus pakai Git di terminal).
3. Buka [vercel.com/new](https://vercel.com/new) → **Import Git Repository** →
   pilih repository tadi.
4. Di halaman konfigurasi, isi seperti ini:

   | Kolom | Isi |
   |---|---|
   | Framework Preset | **Other** |
   | Root Directory | `./` (biarkan; kalau file ada di subfolder, pilih subfolder itu) |
   | Build Command | **kosongkan** |
   | Output Directory | **kosongkan** |
   | Install Command | **kosongkan** |

5. Klik **Deploy**.

Kalau Vercel salah menebak framework dan mencoba menjalankan build, dia akan
gagal — pastikan Framework Preset benar-benar **Other** dan ketiga command
dikosongkan.

### Cara C — Lewat CLI

```bash
npm i -g vercel
cd folder-proyek
vercel          # deploy preview
vercel --prod   # deploy ke domain produksi
```

### Setelah deploy — cek hasilnya

Buka dua alamat ini:

| Alamat | Harusnya menampilkan |
|---|---|
| `https://situs-anda.vercel.app/` | Halaman game, layar "Halo, teman kecil!" |
| `https://situs-anda.vercel.app/admin` | Kotak login admin |

Perhatikan: tanpa `.html`. Itu efek `cleanUrls: true` di `vercel.json` — `/admin`
dan `/admin.html` sama-sama bekerja.

Sampai di sini Anda berjalan di **Mode Lokal**. Badge di header panel admin akan
tertulis "💻 Mode lokal". Kalau itu sudah cukup, Anda selesai.

### Install di HP / Tablet (PWA)

Setelah situs aktif di HTTPS, aplikasi bisa dipasang seperti aplikasi biasa:

- Android Chrome/Edge: buka situs, menu titik tiga, pilih **Install app** atau **Add to Home screen**.
- iPhone/iPad Safari: buka situs, tombol **Share**, pilih **Add to Home Screen**.

PWA memakai `logo.png` sebagai sumber ikon. Ikon turunan `192x192`, `512x512`,
dan `apple-touch-icon` sudah disiapkan. Service worker juga menyimpan halaman
utama, admin, CSS, JS, config, dan logo agar aplikasi tetap punya cache offline
dasar.

---

## 6. Mengaktifkan Mode Server (database)

Butuh ±3 menit. Gratis. Aktifkan kalau Anda mau papan bintang global atau
pengaturan admin yang berlaku untuk semua pengunjung.

1. Buka dashboard proyek Anda di Vercel → tab **Storage**.
2. Klik **Create Database** → pilih **Upstash** (Redis). Pilih plan gratis, lalu
   **Connect** ke proyek ini.
3. Vercel otomatis menyuntikkan environment variable yang dibutuhkan. Kode ini
   menerima dua penamaan sekaligus, jadi apa pun yang muncul akan cocok:
   - `KV_REST_API_URL` + `KV_REST_API_TOKEN`, **atau**
   - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
4. **Tambahkan satu env var manual** (sangat disarankan):
   Settings → Environment Variables → tambah `ADMIN_SECRET` berisi teks acak
   panjang bebas (misalnya hasil dari password generator). Ini memperkuat token
   sesi admin.
5. **Redeploy** proyek: tab Deployments → titik tiga pada deployment terakhir →
   **Redeploy**. Environment variable baru hanya terbaca setelah redeploy.

Cara memastikan berhasil: buka `https://situs-anda.vercel.app/api/status`.

- `{"server":true}` → Mode Server aktif. Badge di panel admin berubah jadi
  "🌐 Mode server aktif".
- `{"server":false}` → variable belum terbaca; ulangi langkah 3–5.

> **Penting soal migrasi:** pengaturan yang sudah Anda buat di Mode Lokal
> tersimpan di browser, bukan di server. Kalau ingin memindahkannya, sebelum
> beralih: panel admin → tab **Data** → **Unduh JSON**. Setelah Mode Server
> aktif, login lagi → tab **Data** → **Impor JSON** → **Simpan perubahan**.

---

## 7. Mengaktifkan AI Native Speaker (Gemini)

Opsional. Kalau tidak diaktifkan, fitur listening tetap jalan memakai suara
bawaan browser (Web Speech API), dan game **"Ucapkan kata"** / **"Ucapkan kalimat"** akan memberi tahu
bahwa AI belum aktif.

Dengan Gemini aktif, Anda dapat:
- suara native speaker yang jauh lebih natural (`/api/gemini-tts`), dan
- penilaian pronunciation dari rekaman suara anak (`/api/gemini-speaking`):
  skor 0–100 + komentar singkat berbahasa Indonesia.

Langkah:

1. Ambil API key di [Google AI Studio](https://aistudio.google.com/apikey).
2. Vercel → Settings → **Environment Variables** → tambahkan:

   ```text
   GEMINI_API_KEY=isi_api_key_anda
   ```

   Tiga variable berikut opsional; isi hanya kalau Anda ingin mengganti default:

   ```text
   GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview
   GEMINI_SPEAKING_MODEL=gemini-3.1-flash-lite
   GEMINI_TTS_VOICE=Kore
   ```

3. **Redeploy**.

Catatan keamanan: `GEMINI_API_KEY` hanya dibaca di sisi server (`api/*.js`) dan
tidak pernah dikirim ke browser — aman. Tapi endpoint TTS-nya publik, artinya
siapa pun yang tahu URL situs Anda bisa memanggilnya dan itu terhitung kuota
Google Anda. Untuk pemakaian sekolah/keluarga ini tidak masalah; untuk situs
publik berlalu lintas tinggi, pertimbangkan menambahkan rate limiting.

Fitur "Ucapkan kata" dan "Ucapkan kalimat" memerlukan **mikrofon** dan **HTTPS**. Domain `.vercel.app`
sudah HTTPS, jadi aman. Browser akan meminta izin mikrofon saat pertama kali
dipakai.

---

## 8. Menjalankan di komputer sendiri

**Hanya frontend** (Mode Lokal, tanpa API):

```bash
npx serve .
```

Lalu buka `http://localhost:3000`.

Jangan membuka `index.html` langsung lewat klik dua kali (protokol `file://`) —
beberapa fitur browser tidak jalan di sana. Selalu lewat server lokal.

**Frontend + API + database** (meniru kondisi produksi):

```bash
npm i -g vercel
vercel link      # hubungkan folder ini ke proyek Vercel Anda
vercel env pull  # tarik environment variable ke .env.local
vercel dev
```

---

## 9. Cara bermain

Alur untuk anak, dari buka situs sampai masuk papan bintang.

### Langkah 1 — Tulis nama

Layar pertama meminta nama panggilan. **Minimal 2 karakter, maksimal 20.** Kalau
papan bintang global aktif, sebaiknya pakai nama panggilan saja, bukan nama
lengkap.

### Langkah 2 — Atur ronde (di menu utama)

Di menu utama ada empat hal yang bisa dipilih:

**Level** — menentukan tingkat kesulitan semua game sekaligus:

| Level | Angka | Panjang kata/kalimat | Jumlah pilihan jawaban |
|---|---|---|---|
| Beginner | 1–10 | pendek | 3 |
| Intermediate | 6–20 | sedang | 4 |
| Advanced | 11–30 | panjang | 5 |

**Fokus belajar** — menyaring daftar game yang ditampilkan:

| Fokus | Isinya |
|---|---|
| Semua | 43 game |
| Vocabulary | Warna, hitung, kosakata, lawan kata, tubuh, kata kerja, perasaan, cuaca, hewan, buah, sayur, keluarga, sekolah, pakaian, transportasi, tempat umum, makanan, minuman, rumah, pekerjaan, hobi, waktu, kalender, mainan, olahraga, alam |
| Listening & Speaking | Susun huruf, dengar & pilih, dengar arti, dengar kalimat, dengar & susun, ucapkan kata, ucapkan kalimat |
| Grammar | Bentuk jamak, preposition, kata tanya, to be, pronoun, article, possessive, simple present |
| Sentence Practice | Susun kalimat, isi kata kosong |

**Timer** — pilihan: tanpa timer, 10 detik, 20 detik, atau 30 detik per soal.

**Room** (opsional) — lihat langkah 5.

### Langkah 3 — Pilih game

Ada 43 mini-game:

| Game | Yang dilatih |
|---|---|
| 🎨 Tebak warna | Nama warna |
| ⭐ Hitung bintang | Angka 1–30 dalam Bahasa Inggris |
| 📚 Cocokkan kata | Kosakata & artinya |
| 🧩 Susun huruf | Ejaan (spelling) |
| 👂 Dengar & pilih | Listening |
| 🔊 Dengar arti | Listening makna kata |
| 🎧 Dengar kalimat | Listening makna kalimat |
| 🔤 Dengar & susun | Dikte kata dan spelling |
| 🎙 Ucapkan kata | Pronunciation, dinilai AI (butuh Gemini + mikrofon) |
| 🗣 Ucapkan kalimat | Pronunciation kalimat, dinilai AI (butuh Gemini + mikrofon) |
| 🧱 Susun kalimat | Struktur kalimat |
| 🔁 Lawan kata | Antonim |
| 👫 Bentuk jamak | Singular/plural, termasuk yang tak beraturan |
| ✏️ Isi kata kosong | Melengkapi kalimat |
| 🧒 Bagian tubuh | Body parts |
| 🏃 Kata kerja | Action verbs |
| 📍 Di mana? | Preposition (in, on, under, …) |
| 😊 Perasaan | Feelings |
| ☀️ Cuaca | Weather words |
| ❓ Kata tanya | What, Who, Where, When, Why, How, Which, Whose |
| 🔤 To be | am, is, are |
| 👤 Pronoun | I, you, he, she, it, we, they |
| 📖 Article | a, an, the |
| 🔑 Possessive | my, your, his, her, its, our, their |
| 🕓 Simple Present | do/does dan verb -s/-es |
| 🦁 Nama hewan | Animals |
| 🍎 Buah-buahan | Fruits |
| 🥕 Sayuran | Vegetables |
| 👪 Keluarga | Family members |
| 🎒 Sekolah | School things |
| 👕 Pakaian | Clothes |
| 🚌 Transportasi | Transportation |
| 🏠 Tempat umum | Places |
| 🍚 Makanan | Food |
| 🥃 Minuman | Drinks |
| 🛋 Rumah | House things |
| 🧑‍🏫 Pekerjaan | Jobs |
| 🎲 Hobi | Hobbies |
| ⏰ Waktu | Time words |
| 📅 Kalender | Days & months |
| 🧸 Mainan | Toys |
| ⚽ Olahraga | Sports |
| 🌳 Alam | Nature |

### Langkah 4 — Bintang dan skor

- Satu ronde = **8 soal** secara bawaan (admin bisa mengaturnya 3–20).
- Jawaban benar = **+1 bintang**.
- **Bonus kecepatan** (hanya kalau timer dinyalakan): menjawab benar dalam 40%
  waktu pertama = **+2 bintang** ekstra; dalam 70% pertama = **+1** ekstra.
  Jadi satu soal bisa bernilai sampai 3 bintang.
- Di akhir ronde muncul **rating 1–3 bintang** berdasarkan persentase benar,
  lalu ringkasan hasil ronde (game, fokus, level, jumlah benar, perolehan).
- Bintang bersifat **kumulatif per pemain**, disimpan terus, dan yang masuk
  papan bintang adalah **total tertinggi** (skor tidak pernah turun).

### Langkah 5 — Main bareng teman (Room)

Room membuat papan bintang terpisah dari papan global — cocok untuk satu kelas
atau satu keluarga.

**Sebagai pembuat room:**
1. Di menu, klik **Buat room** → muncul kode 6 karakter (misal `K7M2QP`).
2. Atur level, fokus, dan timer sesuai keinginan.
3. Salin **link invite** dan bagikan (WhatsApp, grup kelas, dll).

**Sebagai teman yang diundang:**
Cukup buka link invite. Anda otomatis masuk room yang sama, dan **level, fokus,
serta timer terkunci mengikuti pembuat room** — pilihan itu disembunyikan dari
menu, supaya semua orang bermain di kondisi yang benar-benar sama. Ini yang
membuat papan bintang room jadi adil.

Kalau ingin lepas dari pengaturan terkunci itu, keluar dari room lewat tombol di
menu.

Catatan: papan bintang room hanya benar-benar bersama antar perangkat kalau
**Mode Server aktif**. Di Mode Lokal, "room" hanya memisahkan papan bintang di
perangkat itu sendiri.

---

## 10. Panel admin & white-label

Buka `https://situs-anda.vercel.app/admin`.

**Kata sandi bawaan: `admin123`** — ganti sekarang juga.

### Cara ganti kata sandi

Tab **Keamanan** → isi kata sandi lama, kata sandi baru (minimal 5 karakter),
konfirmasi → **Ganti kata sandi**.

- Di **Mode Server**, kata sandi baru tersimpan di database, langsung berlaku,
  dan semua sesi admin lama otomatis logout. Ini cara yang benar.
- Di **Mode Lokal**, kata sandi baru hanya tersimpan di browser itu. Untuk
  mengganti kata sandi bawaan secara permanen, buat hash-nya lewat Console
  browser (F12):

  ```js
  EFQ.sha256("kata-sandi-baru").then(console.log)
  ```

  Salin hasilnya ke `settings.adminPasswordHash` di `js/config.default.js`, lalu
  deploy ulang.

### Isi tiap tab

| Tab | Fungsi |
|---|---|
| **Branding** | Nama aplikasi, tagline, logo (URL atau upload), warna utama & aksen, teks footer |
| **Konten soal** | Edit **seluruh 38 bank soal** — lihat rincian di bawah |
| **Game** | Nyalakan/matikan tiap game, atur jumlah soal per ronde (3–20) |
| **Keamanan** | Ganti kata sandi admin |
| **Data** | Ekspor/impor JSON, salin sebagai `config.default.js`, reset ke pengaturan pabrik, hapus papan bintang global atau papan room tertentu |

Jangan lupa klik **💾 Simpan perubahan** di kanan atas. Di Mode Server, sekali
klik itu langsung mengubah tampilan untuk **semua pengunjung** — tanpa deploy
ulang.

### Mengedit bank soal (tab "Konten soal")

Tiap game punya satu kartu bank soal. **Satu baris = satu soal**, dan kolomnya
dipisah tanda `=`. Kotak **Cari bank soal** di atas membantu menemukan kartu yang
dituju (ketik nama game atau nama bank, misalnya `hewan` atau `plural`).

Formatnya mengikuti kebutuhan tiap game:

| Bentuk | Format | Dipakai oleh |
|---|---|---|
| 1 kolom | `Cat` | Kata listening, kalimat pujian |
| 2 kolom | `English = Arti` | Kosakata, kata ejaan, kalimat, bagian tubuh, kata kerja, perasaan, cuaca, hewan, buah, sayuran, keluarga, sekolah, pakaian, transportasi, tempat umum, makanan, minuman, rumah, pekerjaan, hobi, waktu, kalender, mainan, olahraga, alam |
| 2 kolom (warna) | `Red = #E5484D` | Tebak warna — kolom kanan **wajib** kode heksadesimal |
| 3 kolom | `Big = Small = Besar - kecil` | Lawan kata |
| 3 kolom | `cat = cats = kucing` | Bentuk jamak |
| 3 kolom (isian) | `I ____ a cat = have = Aku punya kucing` | Isi kata kosong, preposition, kata tanya, to be, pronoun, article, possessive, simple present — tulis bagian kosong sebagai `____` |

Aturan yang berlaku saat menyimpan:

- **Minimal 5 baris per bank.** Level Advanced menampilkan 5 pilihan jawaban, jadi
  bank yang lebih pendek dari itu akan membuat pilihan jawaban kurang. (Kalimat
  pujian dikecualikan — cukup 1 baris.)
- Di bawah tiap kotak ada **penghitung baris**. Kalau ada baris yang formatnya
  salah, nomor barisnya disebutkan dan kartunya ditandai merah.
- Kalau ada bank yang bermasalah, **penyimpanan dibatalkan seluruhnya** dan panel
  otomatis membuka kartu yang bermasalah. Ini disengaja: tidak ada penyimpanan
  setengah jalan di mana sebagian bank tersimpan dan sebagian ditolak diam-diam.
- Tanda `=` di dalam teks aman — hanya pemisah kolom pertama yang dibaca, sisanya
  ikut masuk ke kolom terakhir.
- Untuk kata ejaan, kolom kiri otomatis diubah jadi huruf besar tanpa spasi.

Bank soal yang salah format juga menghentikan **Unduh JSON** dan **Salin sebagai
config.default.js**, supaya Anda tidak pernah mengekspor konfigurasi rusak.

### Cara white-label (jual ulang dengan merek sendiri)

**Kalau Mode Server aktif** — cara termudah: login admin → ubah nama, logo,
warna, konten → Simpan. Selesai, berlaku global seketika.

**Kalau Mode Lokal** — pengaturan hanya ada di browser Anda, jadi harus
dipermanenkan ke kode:

1. Atur semuanya lewat panel admin sampai puas.
2. Tab **Data** → **📋 Salin sebagai config.default.js**.
3. Buka `js/config.default.js`, **hapus seluruh isinya**, tempel hasil salinan.
4. Deploy ulang.

Sekarang branding itu menjadi bawaan untuk semua pengunjung.

---

## 11. Referensi API

Semua endpoint di bawah hanya hidup di Mode Server. Tanpa database, mereka
membalas `503` — dan itu wajar, bukan error yang perlu diperbaiki.

| Endpoint | Method | Auth | Fungsi |
|---|---|---|---|
| `/api/status` | GET | — | `{ server: true/false }` |
| `/api/config` | GET | — | Konfigurasi publik (hash sandi dibuang) |
| `/api/config` | POST | Bearer | Simpan konfigurasi |
| `/api/login` | POST | — | `{ password }` → `{ token }` |
| `/api/password` | POST | Bearer | `{ current, newPass }` → token baru |
| `/api/leaderboard` | GET | — | Top 10 global |
| `/api/leaderboard?room=ABC123` | GET | — | Top 10 room tertentu |
| `/api/leaderboard` | POST | — | `{ name, stars, room?, meta? }` — skor hanya naik, tak pernah turun |
| `/api/leaderboard` | DELETE | Bearer | Kosongkan papan global |
| `/api/leaderboard?room=ABC123` | DELETE | Bearer | Kosongkan papan room |
| `/api/gemini-tts` | POST | — | `{ text }` → audio native speaker |
| `/api/gemini-speaking` | POST | — | `{ audioBase64, mimeType, expected, level }` → `{ heard, score, correct, feedback }` |

Validasi di sisi server: nama pemain 2–20 karakter, skor 0–100.000, kode room
maksimal 16 karakter A–Z/0–9. Token admin adalah HMAC-SHA256 dan otomatis tidak
berlaku begitu kata sandi diganti.

---

## 12. Catatan & keterbatasan yang perlu diketahui

Hasil pemeriksaan kode. Tidak ada yang merusak, tapi sebaiknya Anda tahu:

**1. ✅ Sudah diperbaiki — `README.md` dulu menyebut 15 mini-game.**
Jumlah sekarang **43**. README sudah dikoreksi, termasuk menambahkan game
Listening & Speaking baru, materi Grammar baru, Nama hewan, Buah-buahan, dan
Sayuran ke daftar, serta mendokumentasikan timer & bonus kecepatan.

**2. ✅ Sudah diperbaiki — tiga game tidak bisa dimatikan dari panel admin.**
Daftar `GAME_INFO` di [js/admin.js](js/admin.js#L24-L44) dulu hanya memuat 16
game, sehingga tombol on/off untuk **hewan**, **buah**, dan **sayur** tidak
pernah muncul di tab Game. Ketiganya sudah ditambahkan; sekarang seluruh 43 game
bisa dinyalakan/dimatikan dari panel.

**3. ✅ Sudah diperbaiki — tab "Konten soal" dulu hanya bisa mengedit 4 bank soal.**
Sekarang **seluruh 38 bank soal** bisa diedit dari panel admin: kosakata, kata
ejaan, kata listening, kalimat, lawan kata, bentuk jamak, isi kata kosong,
preposition, kata tanya, to be, pronoun, article, possessive, simple present,
bagian tubuh, kata kerja, perasaan, cuaca, hewan, buah,
sayuran, keluarga, sekolah, pakaian, transportasi, tempat umum, makanan,
minuman, rumah, pekerjaan, hobi, waktu, kalender, mainan, olahraga, alam, warna,
dan kalimat pujian. Lihat bagian 10 untuk cara pakainya.

**4. ✅ Sudah diperbaiki — timer & bonus kecepatan tidak terdokumentasi.**
Fiturnya sudah ada dan berfungsi sejak awal (lihat bagian 9), termasuk
penguncian level/fokus/timer untuk anggota room. Sekarang sudah tertulis di
README — ini nilai jual yang layak disebut saat memasarkan produk.

**5. Keamanan Mode Lokal itu lemah — dan memang begitu adanya.**
Di Mode Lokal, verifikasi kata sandi admin terjadi di browser. Cukup untuk
mencegah anak iseng, tapi tidak untuk pengguna yang paham teknis. Kalau situs
dipublikasikan luas tanpa database, lindungi `/admin` dengan **Vercel Password
Protection** (fitur berbayar) atau hapus `admin.html` dari deploy publik.

**6. Token admin tidak punya masa berlaku.**
Token adalah HMAC dari string tetap, jadi nilainya sama sampai kata sandi
diganti. Ganti kata sandi = semua token lama mati. Untuk skala kecil ini
memadai; untuk produksi serius, tambahkan expiry pada token di `api/_lib.js`.

**7. Endpoint skor bersifat publik tanpa rate limit.**
Ini disengaja supaya anak tidak perlu membuat akun. Konsekuensinya, skor palsu
bisa dikirim oleh siapa pun yang paham API. Kalau butuh anti-curang, tambahkan
rate limiting (misalnya Upstash Ratelimit) di `api/_lib.js`.

**8. Privasi anak.**
Papan bintang hanya menyimpan nama panggilan + jumlah bintang + metadata ronde
terakhir. Tidak ada email, umur, atau data pribadi lain. Tetap sarankan anak
memakai nama panggilan.

---

## 13. Troubleshooting

**Halaman putih / game tidak muncul**
Buka Console (F12) dan cari error. Penyebab paling umum: `js/config.default.js`
rusak setelah diedit manual — biasanya koma atau kurung yang hilang. Kembalikan
dari backup, atau panel admin → tab Data → **Kembalikan ke pengaturan pabrik**.

**Badge tetap "💻 Mode lokal" padahal database sudah dipasang**
Cek `/api/status`. Kalau `{"server":false}`: environment variable belum terbaca.
Pastikan database benar-benar **Connect**-ed ke proyek ini (bukan hanya dibuat),
lalu **Redeploy**. Env var tidak pernah aktif tanpa redeploy.

**"Kata sandi salah" padahal yakin benar**
Di Mode Server, kata sandi yang berlaku adalah yang tersimpan di **database** —
bukan yang ada di `config.default.js`. Kalau belum pernah diganti lewat panel,
kata sandinya masih `admin123`. Kalau lupa: hapus key `efq:config` dari
dashboard Upstash, dan kata sandi kembali ke `admin123` (⚠️ konfigurasi lain
ikut hilang — ekspor JSON dulu kalau masih ada yang ingin diselamatkan).

**Suara listening tidak keluar**
Tanpa `GEMINI_API_KEY`, aplikasi memakai Web Speech API bawaan browser. Chrome
dan Edge paling stabil; beberapa browser mobile membisukan audio sampai ada
sentuhan dari pengguna. Minta anak menyentuh layar dulu, lalu tekan tombol suara.

**Game "Ucapkan kata/kalimat" bilang AI belum aktif**
`GEMINI_API_KEY` belum diset, atau sudah diset tapi belum redeploy. Cek juga
kuota API key di Google AI Studio.

**Mikrofon tidak bisa dipakai**
Butuh HTTPS (otomatis di Vercel) dan izin browser. Kalau izin pernah ditolak,
buka ikon gembok di address bar → izinkan mikrofon → muat ulang halaman.

**Papan bintang kosong terus**
Di Mode Lokal itu normal — papan hanya berisi skor dari perangkat itu sendiri.
Papan bersama antar perangkat butuh Mode Server.

**Deploy gagal dengan error build**
Proyek ini tidak punya build step. Pastikan Framework Preset = **Other**, dan
Build/Output/Install Command dikosongkan semua.

**Perubahan tidak muncul setelah deploy**
Cache browser. Tekan Ctrl+Shift+R (atau Cmd+Shift+R di Mac). File CSS/JS
diberi versi lewat query string (`?v=...`) — kalau Anda mengubah CSS atau JS,
naikkan angka versinya di `index.html` dan `admin.html` agar
pengunjung lama ikut mendapat versi baru.
