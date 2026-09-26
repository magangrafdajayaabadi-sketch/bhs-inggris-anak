/* Bhs Inggris — app.js (sisi pemain / user) */

(async () => {
  const { cfg, server } = await EFQ.ready();
  EFQ.applyBranding(cfg);

  const app = document.getElementById("app");
  const starEl = document.getElementById("star-count");
  const C = cfg.content;
  const PER_ROUND = Math.max(3, Math.min(20, cfg.settings.questionsPerRound || 8));

  const NUMWORDS = [
    "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
    "Twenty-one", "Twenty-two", "Twenty-three", "Twenty-four", "Twenty-five", "Twenty-six", "Twenty-seven", "Twenty-eight", "Twenty-nine", "Thirty"
  ];

  const LEVELS = {
    beginner: {
      nama: "Beginner",
      tag: "Pemula",
      sub: "Kata pendek, angka 1-10, 3 pilihan",
      options: 3,
      numberMin: 1,
      numberMax: 10,
      wordMin: 0,
      wordMax: 5,
      spellMin: 0,
      spellMax: 4,
      sentenceMin: 0,
      sentenceMax: 4
    },
    intermediate: {
      nama: "Intermediate",
      tag: "Menengah",
      sub: "Kata lebih panjang, angka 6-20, 4 pilihan",
      options: 4,
      numberMin: 6,
      numberMax: 20,
      wordMin: 4,
      wordMax: 8,
      spellMin: 4,
      spellMax: 6,
      sentenceMin: 4,
      sentenceMax: 6
    },
    advanced: {
      nama: "Advanced",
      tag: "Mahir",
      sub: "Kalimat panjang, angka 11-30, 5 pilihan",
      options: 5,
      numberMin: 11,
      numberMax: 30,
      wordMin: 6,
      wordMax: 99,
      spellMin: 5,
      spellMax: 12,
      sentenceMin: 6,
      sentenceMax: 99
    }
  };
  const LEVEL_ORDER = ["beginner", "intermediate", "advanced"];

  const FOCUSES = [
    { id: "all", nama: "Semua", sub: "43 game" },
    { id: "vocab", nama: "Vocabulary", sub: "Kata, waktu, mainan, alam" },
    { id: "listening", nama: "Listening & Speaking", sub: "Dengar, dikte, ucap" },
    { id: "grammar", nama: "Grammar", sub: "To be, pronoun, tense" },
    { id: "sentence", nama: "Sentence Practice", sub: "Kalimat & isi kosong" }
  ];

  const GAMES = [
    { id: "warna",   focus: "vocab",     nama: "Tebak warna",     sub: "What color is it?",  emoji: "\u{1F3A8}", bg: "#FAECE7", fg: "#993C1D" },
    { id: "angka",   focus: "vocab",     nama: "Hitung bintang",  sub: "How many stars?",    emoji: "\u{2B50}",  bg: "#FAEEDA", fg: "#854F0B" },
    { id: "kata",    focus: "vocab",     nama: "Cocokkan kata",   sub: "Kata dan artinya",   emoji: "\u{1F4DA}", bg: "#EEEDFE", fg: "#534AB7" },
    { id: "eja",     focus: "listening", nama: "Susun huruf",     sub: "Spell the word!",    emoji: "\u{1F9E9}", bg: "#E1F5EE", fg: "#0F6E56" },
    { id: "dengar",  focus: "listening", nama: "Dengar & pilih",  sub: "Listen carefully!",  emoji: "\u{1F442}", bg: "#E6F1FB", fg: "#185FA5" },
    { id: "dengararti", focus: "listening", nama: "Dengar arti",  sub: "Listen & meaning",   emoji: "\u{1F50A}", bg: "#EAF7FF", fg: "#146C94" },
    { id: "dengarkalimat", focus: "listening", nama: "Dengar kalimat", sub: "Listen to sentence", emoji: "\u{1F3A7}", bg: "#F0F9FF", fg: "#0369A1" },
    { id: "dengareja", focus: "listening", nama: "Dengar & susun", sub: "Listen and spell",  emoji: "\u{1F524}", bg: "#ECFDF5", fg: "#047857" },
    { id: "ucap",    focus: "listening", nama: "Ucapkan kata",    sub: "AI pronunciation",   emoji: "\u{1F399}", bg: "#EAF4FF", fg: "#1D5C96" },
    { id: "ucapkalimat", focus: "listening", nama: "Ucapkan kalimat", sub: "AI sentence speaking", emoji: "\u{1F5E3}", bg: "#F5F3FF", fg: "#6D28D9" },
    { id: "kalimat", focus: "sentence",  nama: "Susun kalimat",   sub: "Make a sentence!",   emoji: "\u{1F9F1}", bg: "#FBEAF0", fg: "#993556" },
    { id: "antonim", focus: "vocab",     nama: "Lawan kata",      sub: "Find the opposite",  emoji: "\u{1F501}", bg: "#EAF7FF", fg: "#146C94" },
    { id: "plural",  focus: "grammar",   nama: "Bentuk jamak",    sub: "One or many?",       emoji: "\u{1F46B}", bg: "#EEF8E7", fg: "#3E7C17" },
    { id: "kosong",  focus: "sentence",  nama: "Isi kata kosong", sub: "Complete it!",       emoji: "\u{270F}",  bg: "#FFF1E6", fg: "#A45010" },
    { id: "tubuh",   focus: "vocab",     nama: "Bagian tubuh",    sub: "Body parts",         emoji: "\u{1F9D2}", bg: "#F1F8FF", fg: "#1D4E89" },
    { id: "aksi",    focus: "vocab",     nama: "Kata kerja",      sub: "Action words",       emoji: "\u{1F3C3}", bg: "#F0FDF4", fg: "#166534" },
    { id: "posisi",  focus: "grammar",   nama: "Di mana?",        sub: "Prepositions",       emoji: "\u{1F4CD}", bg: "#FFF7ED", fg: "#9A3412" },
    { id: "perasaan", focus: "vocab",    nama: "Perasaan",        sub: "Feelings",           emoji: "\u{1F60A}", bg: "#FEF2F2", fg: "#B91C1C" },
    { id: "cuaca",   focus: "vocab",     nama: "Cuaca",           sub: "Weather words",      emoji: "\u{2600}",  bg: "#EFF6FF", fg: "#1D4ED8" },
    { id: "tanya",   focus: "grammar",   nama: "Kata tanya",      sub: "Question words",     emoji: "\u{2753}",  bg: "#F5F3FF", fg: "#6D28D9" },
    { id: "tobe",    focus: "grammar",   nama: "To be",           sub: "am, is, are",        emoji: "\u{1F524}", bg: "#ECFEFF", fg: "#0E7490" },
    { id: "pronoun", focus: "grammar",   nama: "Pronoun",         sub: "I, you, he, she",    emoji: "\u{1F464}", bg: "#EEF2FF", fg: "#4338CA" },
    { id: "article", focus: "grammar",   nama: "Article",         sub: "a, an, the",         emoji: "\u{1F4D6}", bg: "#FFF7ED", fg: "#9A3412" },
    { id: "possessive", focus: "grammar", nama: "Possessive",     sub: "my, your, his",      emoji: "\u{1F511}", bg: "#F0FDF4", fg: "#166534" },
    { id: "present", focus: "grammar",   nama: "Simple Present",  sub: "do, does, -s",       emoji: "\u{1F553}", bg: "#FEF3C7", fg: "#92400E" },
    { id: "hewan",   focus: "vocab",     nama: "Nama hewan",      sub: "Animal names",       emoji: "\u{1F981}", bg: "#FEF6E7", fg: "#92600A" },
    { id: "buah",    focus: "vocab",     nama: "Buah-buahan",     sub: "Fruits",             emoji: "\u{1F34E}", bg: "#FDECEC", fg: "#B3261E" },
    { id: "sayur",   focus: "vocab",     nama: "Sayuran",         sub: "Vegetables",         emoji: "\u{1F955}", bg: "#EDFAE7", fg: "#2E7D1F" },
    { id: "keluarga", focus: "vocab",    nama: "Keluarga",        sub: "Family members",     emoji: "\u{1F46A}", bg: "#FFF1F2", fg: "#B91C1C" },
    { id: "sekolah", focus: "vocab",     nama: "Sekolah",         sub: "School things",      emoji: "\u{1F392}", bg: "#EEF2FF", fg: "#4338CA" },
    { id: "pakaian", focus: "vocab",     nama: "Pakaian",         sub: "Clothes",            emoji: "\u{1F455}", bg: "#ECFDF5", fg: "#047857" },
    { id: "transport", focus: "vocab",   nama: "Transportasi",    sub: "Transportation",     emoji: "\u{1F68C}", bg: "#EFF6FF", fg: "#1D4ED8" },
    { id: "tempat",  focus: "vocab",     nama: "Tempat umum",     sub: "Places",             emoji: "\u{1F3E0}", bg: "#FFF7ED", fg: "#9A3412" },
    { id: "makanan", focus: "vocab",     nama: "Makanan",         sub: "Food",               emoji: "\u{1F35A}", bg: "#FEF2F2", fg: "#B91C1C" },
    { id: "minuman", focus: "vocab",     nama: "Minuman",         sub: "Drinks",             emoji: "\u{1F9C3}", bg: "#ECFEFF", fg: "#0E7490" },
    { id: "rumah",   focus: "vocab",     nama: "Rumah",           sub: "House things",       emoji: "\u{1F6CB}", bg: "#F8FAFC", fg: "#475569" },
    { id: "pekerjaan", focus: "vocab",   nama: "Pekerjaan",       sub: "Jobs",               emoji: "\u{1F9D1}\u{200D}\u{1F3EB}", bg: "#F0FDF4", fg: "#166534" },
    { id: "hobi",    focus: "vocab",     nama: "Hobi",            sub: "Hobbies",            emoji: "\u{1F3B2}", bg: "#FAE8FF", fg: "#A21CAF" },
    { id: "waktu",   focus: "vocab",     nama: "Waktu",           sub: "Time words",         emoji: "\u{23F0}",  bg: "#EFF6FF", fg: "#1D4ED8" },
    { id: "kalender", focus: "vocab",    nama: "Kalender",        sub: "Days & months",      emoji: "\u{1F4C5}", bg: "#F5F3FF", fg: "#6D28D9" },
    { id: "mainan",  focus: "vocab",     nama: "Mainan",          sub: "Toys",               emoji: "\u{1F9F8}", bg: "#FFF1F2", fg: "#BE123C" },
    { id: "olahraga", focus: "vocab",    nama: "Olahraga",        sub: "Sports",             emoji: "\u{26BD}",  bg: "#F0FDF4", fg: "#166534" },
    { id: "alam",    focus: "vocab",     nama: "Alam",            sub: "Nature",             emoji: "\u{1F333}", bg: "#ECFDF5", fg: "#047857" }
  ];

  const PRACTICE_PACKS = [
    {
      id: "pemula",
      nama: "Paket Pemula",
      sub: "Warna, angka, keluarga, sekolah, buah",
      games: ["warna", "angka", "kata", "keluarga", "sekolah", "hewan", "buah"],
      emoji: "\u{1F31F}",
      bg: "#FFF4D8",
      fg: "#8A5300"
    },
    {
      id: "listening",
      nama: "Paket Dengar & Eja",
      sub: "Listening, dikte, dan susun huruf",
      games: ["dengar", "dengararti", "dengareja", "dengarkalimat", "eja"],
      emoji: "\u{1F3A7}",
      bg: "#EAF4FF",
      fg: "#1D5C96"
    },
    {
      id: "grammar",
      nama: "Paket Grammar",
      sub: "Plural, posisi, kata tanya, to be, tense",
      games: ["plural", "posisi", "tanya", "tobe", "pronoun", "article", "possessive", "present", "kosong"],
      emoji: "\u{1F4DD}",
      bg: "#F5F3FF",
      fg: "#6D28D9"
    },
    {
      id: "kalimat",
      nama: "Paket Kalimat",
      sub: "Susun kalimat, isi kosong, aksi, perasaan",
      games: ["kalimat", "kosong", "aksi", "perasaan"],
      emoji: "\u{1F9E0}",
      bg: "#FBEAF0",
      fg: "#993556"
    },
    {
      id: "sehari-hari",
      nama: "Paket Sehari-hari",
      sub: "Pakaian, transportasi, tempat, rumah",
      games: ["pakaian", "transport", "tempat", "rumah", "aksi", "perasaan"],
      emoji: "\u{1F3E1}",
      bg: "#FFF7ED",
      fg: "#9A3412"
    },
    {
      id: "aktivitas",
      nama: "Paket Aktivitas",
      sub: "Makanan, minuman, pekerjaan, hobi",
      games: ["makanan", "minuman", "pekerjaan", "hobi"],
      emoji: "\u{1F37D}",
      bg: "#FEF3C7",
      fg: "#92400E"
    },
    {
      id: "jelajah",
      nama: "Paket Jelajah",
      sub: "Waktu, kalender, mainan, olahraga, alam",
      games: ["waktu", "kalender", "mainan", "olahraga", "alam"],
      emoji: "\u{1F9ED}",
      bg: "#ECFDF5",
      fg: "#047857"
    }
  ];
  const PACK_ROUND = 20;
  const MISTAKE_ROUND = 20;
  const DAILY_ROUND = 15;
  const MAX_MISTAKES = 60;
  const DAILY_GAMES = [
    "warna", "angka", "kata", "eja", "dengar", "dengararti", "dengareja",
    "dengarkalimat", "kalimat", "antonim",
    "plural", "kosong", "tubuh", "aksi", "posisi", "perasaan", "cuaca",
    "tanya", "tobe", "pronoun", "article", "possessive", "present",
    "hewan", "buah", "sayur", "keluarga", "sekolah", "pakaian",
    "transport", "tempat", "makanan", "minuman", "rumah", "pekerjaan", "hobi",
    "waktu", "kalender", "mainan", "olahraga", "alam"
  ];
  const BADGES = [
    { id: "first_round", nama: "Langkah Pertama", icon: "\u{1F31F}", hint: "Selesaikan 1 ronde", ok: (p) => p.rounds >= 1 },
    { id: "five_rounds", nama: "Rajin Main", icon: "\u{1F3AE}", hint: "Selesaikan 5 ronde", ok: (p) => p.rounds >= 5 },
    { id: "twenty_rounds", nama: "Petualang", icon: "\u{1F9ED}", hint: "Selesaikan 20 ronde", ok: (p) => p.rounds >= 20 },
    { id: "stars_50", nama: "Pemburu Bintang", icon: "\u{2B50}", hint: "Kumpulkan 50 bintang", ok: () => stars >= 50 },
    { id: "stars_150", nama: "Gudang Bintang", icon: "\u{1F3C6}", hint: "Kumpulkan 150 bintang", ok: () => stars >= 150 },
    { id: "daily_3", nama: "Streak 3 Hari", icon: "\u{1F525}", hint: "Tantangan 3 hari beruntun", ok: (_p, d) => d.streak >= 3 },
    { id: "daily_7", nama: "Streak 7 Hari", icon: "\u{1F4C5}", hint: "Tantangan 7 hari beruntun", ok: (_p, d) => d.streak >= 7 },
    { id: "perfect", nama: "Sempurna", icon: "\u{1F48E}", hint: "Ronde tanpa salah", ok: (p) => p.perfectRounds >= 1 },
    { id: "ten_perfect", nama: "Super Akurat", icon: "\u{1F3AF}", hint: "10 ronde sempurna", ok: (p) => p.perfectRounds >= 10 },
    { id: "five_posts", nama: "Jelajah Pos", icon: "\u{1F5FA}", hint: "Coba 5 jenis game", ok: (p) => Object.keys(p.perGame || {}).length >= 5 },
    { id: "all_posts", nama: "Master Quest", icon: "\u{1F451}", hint: "Coba semua game", ok: (p) => Object.keys(p.perGame || {}).length >= GAMES.length },
    { id: "repair", nama: "Pantang Menyerah", icon: "\u{1F6E0}", hint: "Kosongkan Latihan Salahku", ok: (p) => p.fixedMistakes >= 10 }
  ];

  let player = localStorage.getItem("efq_player") || "";
  const params = new URLSearchParams(location.search);
  const urlLevel = params.get("level");
  let level = LEVELS[urlLevel] ? urlLevel : (localStorage.getItem("efq_level") || "beginner");
  if (!LEVELS[level]) level = "beginner";
  if (LEVELS[urlLevel]) localStorage.setItem("efq_level", urlLevel);
  const urlFocus = params.get("focus");
  const urlFocusValid = urlFocus && FOCUSES.some(f => f.id === urlFocus);
  let focus = urlFocusValid ? urlFocus : (localStorage.getItem("efq_focus") || "all");
  if (!FOCUSES.some(f => f.id === focus)) focus = "all";
  if (urlFocusValid) localStorage.setItem("efq_focus", urlFocus);
  const ROOM_KEY = "efq_room";
  const urlRoom = EFQ.sanitizeRoom(params.get("room"));
  let room = urlRoom || EFQ.sanitizeRoom(localStorage.getItem(ROOM_KEY));
  if (urlRoom) localStorage.setItem(ROOM_KEY, urlRoom);
  let stars = parseInt(localStorage.getItem(scoreKey(player)), 10) || 0;
  let roomFlash = "";
  let mode = null, qs = [], qi = 0, score = 0, lock = false, roundBonus = 0;

  /* ================= TIMER ================= */
  // Timer hitung mundur per soal (detik). 0 = tanpa timer.
  const TIMER_OPTIONS = [0, 10, 20, 30];
  const TIMER_KEY = "efq_timer";
  const ROOM_LOCK_KEY = "efq_room_settings_lock"; // room yang level/fokus/timernya dikunci pembuat
  let qTimer = null;
  let qStartedAt = 0; // kapan soal sekarang mulai (untuk bonus kecepatan)

  // Bonus bintang untuk jawaban cepat (hanya saat timer aktif).
  // Jawab di 40% waktu pertama = +2, di 70% pertama = +1, selebihnya = 0.
  function speedBonus() {
    if (!(timer > 0) || !qStartedAt) return 0;
    const frac = (Date.now() - qStartedAt) / 1000 / timer;
    if (frac <= 0.4) return 2;
    if (frac <= 0.7) return 1;
    return 0;
  }

  function validTimer(v) {
    const n = parseInt(v, 10);
    return TIMER_OPTIONS.includes(n) ? n : null;
  }

  const urlTimer = params.has("timer") ? validTimer(params.get("timer")) : null;
  let timer = validTimer(localStorage.getItem(TIMER_KEY)) || 0;

  // "Member" room = membuka link invite (URL membawa parameter timer dari pembuat room).
  // Hanya link invite yang menyertakan "timer"; address bar pembuat room dibersihkan (roomAddr),
  // jadi pembuat room tidak salah terdeteksi sebagai member. Saat member: level, fokus, dan
  // timer mengikuti pembuat room dan disembunyikan dari menu.
  let roomMember = false;
  if (urlRoom && params.has("timer")) {
    roomMember = true;
    if (urlTimer !== null) timer = urlTimer;
    localStorage.setItem(TIMER_KEY, String(timer));
    localStorage.setItem(ROOM_LOCK_KEY, urlRoom);
  } else if (room && localStorage.getItem(ROOM_LOCK_KEY) === room) {
    // Muat ulang saat masih di room hasil invite → tetap terkunci.
    roomMember = true;
  }

  function timerLabel(sec) {
    return sec > 0 ? `${sec} detik` : "Tanpa timer";
  }

  function setTimerPref(sec) {
    if (roomMember) return;
    timer = validTimer(sec) || 0;
    localStorage.setItem(TIMER_KEY, String(timer));
    if (room) history.replaceState(null, "", roomAddr(room));
  }

  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const starPill = starEl.closest(".star-pill");

  function scoreKey(name) {
    return room ? `efq_stars_${room}_${name}` : "efq_stars_" + name;
  }

  function roomName() {
    return room ? `Room ${room}` : "Papan global";
  }

  // URL invite (dibagikan) — membawa level, fokus, dan timer pembuat room.
  // Penerima link ini menjadi "member": pengaturan tersebut dikunci & disembunyikan.
  function roomUrl(code = room) {
    const url = new URL(location.href);
    if (code) url.searchParams.set("room", code);
    else url.searchParams.delete("room");
    url.searchParams.set("level", level);
    url.searchParams.set("focus", focus);
    url.searchParams.set("timer", String(timer));
    url.hash = "";
    return url.toString();
  }

  // URL untuk address bar sendiri — hanya kode room, tanpa pengaturan.
  // Ini menjaga agar pembuat room TIDAK ikut terdeteksi sebagai member saat reload.
  function roomAddr(code = room) {
    const url = new URL(location.href);
    if (code) url.searchParams.set("room", code);
    else url.searchParams.delete("room");
    url.searchParams.delete("level");
    url.searchParams.delete("focus");
    url.searchParams.delete("timer");
    url.hash = "";
    return url.toString();
  }

  function inviteText(code = room) {
    return `Ayo main Bhs Inggris bareng! Kode room: ${code}, level: ${LEVELS[level].nama}, fokus: ${focusInfo(focus).nama}, timer: ${timerLabel(timer)}`;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      return false;
    }
  }

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function setRoom(nextRoom) {
    room = EFQ.sanitizeRoom(nextRoom);
    // Membuat/masuk/keluar room lewat tombol = kamu pengatur sendiri (bukan member terkunci).
    roomMember = false;
    localStorage.removeItem(ROOM_LOCK_KEY);
    if (room) localStorage.setItem(ROOM_KEY, room);
    else localStorage.removeItem(ROOM_KEY);
    history.replaceState(null, "", roomAddr(room));
    stars = parseInt(localStorage.getItem(scoreKey(player)), 10) || 0;
    starEl.textContent = stars;
    menu();
  }

  function gameInfo(id = mode) {
    if (id === "daily") {
      return { id, nama: "Tantangan Harian", focus: "all" };
    }
    if (id === "mistakes") {
      return { id, nama: "Latihan Salahku", focus: "all" };
    }
    if (String(id).startsWith("pack:")) {
      const pack = PRACTICE_PACKS.find(p => p.id === String(id).slice(5));
      if (pack) return { id, nama: pack.nama, focus: "all" };
    }
    return GAMES.find(g => g.id === id) || { id, nama: "Game", focus: "all" };
  }

  function focusInfo(id) {
    return FOCUSES.find(f => f.id === id) || FOCUSES[0];
  }

  function setStars(n) {
    const grew = n > stars;
    stars = n;
    starEl.textContent = n;
    if (grew && starPill && !REDUCED) {
      starPill.classList.remove("bump");
      void starPill.offsetWidth; // restart animasi
      starPill.classList.add("bump");
    }
    if (player) {
      localStorage.setItem(scoreKey(player), String(n));
      EFQ.submitScore(player, n, room);
    }
  }

  function playerStorageName() {
    return encodeURIComponent((player || "guest").trim().toLowerCase());
  }

  function mistakeKey() {
    return `efq_mistakes_${playerStorageName()}`;
  }

  function dailyKey() {
    return `efq_daily_${playerStorageName()}`;
  }

  function progressKey() {
    return `efq_progress_${playerStorageName()}`;
  }

  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return todayKey(d);
  }

  function readDailyState() {
    try {
      const state = JSON.parse(localStorage.getItem(dailyKey())) || {};
      return {
        lastDone: state.lastDone || "",
        streak: parseInt(state.streak, 10) || 0,
        best: parseInt(state.best, 10) || 0
      };
    } catch (e) {
      return { lastDone: "", streak: 0, best: 0 };
    }
  }

  function writeDailyState(state) {
    localStorage.setItem(dailyKey(), JSON.stringify(state));
  }

  function completeDailyChallenge() {
    const state = readDailyState();
    const today = todayKey();
    if (state.lastDone === today) return { ...state, firstToday: false };
    const nextStreak = state.lastDone === yesterdayKey() ? state.streak + 1 : 1;
    const next = {
      lastDone: today,
      streak: nextStreak,
      best: Math.max(state.best || 0, nextStreak)
    };
    writeDailyState(next);
    return { ...next, firstToday: true };
  }

  function emptyProgress() {
    return {
      rounds: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      perfectRounds: 0,
      fixedMistakes: 0,
      perGame: {}
    };
  }

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey())) || {};
      return {
        ...emptyProgress(),
        ...saved,
        rounds: parseInt(saved.rounds, 10) || 0,
        totalCorrect: parseInt(saved.totalCorrect, 10) || 0,
        totalQuestions: parseInt(saved.totalQuestions, 10) || 0,
        perfectRounds: parseInt(saved.perfectRounds, 10) || 0,
        fixedMistakes: parseInt(saved.fixedMistakes, 10) || 0,
        perGame: saved.perGame && typeof saved.perGame === "object" ? saved.perGame : {}
      };
    } catch (e) {
      return emptyProgress();
    }
  }

  function writeProgress(progress) {
    localStorage.setItem(progressKey(), JSON.stringify(progress));
  }

  function progressPercent(done, total) {
    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  }

  function unlockedBadges(progress = readProgress(), daily = readDailyState()) {
    return BADGES.filter(b => b.ok(progress, daily));
  }

  function updateProgressAfterRound() {
    if (!player) return;
    const progress = readProgress();
    progress.rounds += 1;
    progress.totalCorrect += score;
    progress.totalQuestions += qs.length;
    if (score === qs.length) progress.perfectRounds += 1;

    const touched = {};
    qs.forEach(q => {
      const source = q && q._gameId ? q._gameId : (GAMES.some(g => g.id === mode) ? mode : "");
      if (source && mode !== "mistakes") touched[source] = (touched[source] || 0) + 1;
    });
    Object.entries(touched).forEach(([id, count]) => {
      const current = progress.perGame[id] || { rounds: 0, questions: 0 };
      progress.perGame[id] = {
        rounds: (parseInt(current.rounds, 10) || 0) + 1,
        questions: (parseInt(current.questions, 10) || 0) + count,
        updatedAt: new Date().toISOString()
      };
    });

    writeProgress(progress);
  }

  function readMistakes() {
    try {
      const rows = JSON.parse(localStorage.getItem(mistakeKey())) || [];
      return Array.isArray(rows) ? rows.filter(x => x && x.q) : [];
    } catch (e) {
      return [];
    }
  }

  function writeMistakes(rows) {
    localStorage.setItem(mistakeKey(), JSON.stringify(rows.slice(0, MAX_MISTAKES)));
  }

  function sourceGameId(q) {
    const current = String(mode || "");
    if (q && q._gameId) return q._gameId;
    if (current.startsWith("pack:")) return "mixed";
    return current || "game";
  }

  function questionStem(q) {
    if (!q) return "";
    if (q.c) return q.c[0];
    if (q.n) return String(q.n);
    if (q.v) return q.v[0];
    if (Array.isArray(q.w)) return q.w[0];
    if (typeof q.w === "string") return q.w;
    if (q.s) return q.s[0];
    if (q.o) return q.o[0];
    if (q.p) return q.p[0];
    if (q.f) return q.f[0];
    if (q.b) return q.b[0];
    if (q.a) return q.a[0];
    if (q.qw) return q.qw[0];
    if (q.tb) return q.tb[0];
    if (q.pn) return q.pn[0];
    if (q.ar) return q.ar[0];
    if (q.po) return q.po[0];
    if (q.prs) return q.prs[0];
    if (q.h) return q.h[0];
    if (q.fr) return q.fr[0];
    if (q.vg) return q.vg[0];
    if (q.fm) return q.fm[0];
    if (q.sc) return q.sc[0];
    if (q.cl) return q.cl[0];
    if (q.tr) return q.tr[0];
    if (q.pl) return q.pl[0];
    if (q.fd) return q.fd[0];
    if (q.dr) return q.dr[0];
    if (q.hs) return q.hs[0];
    if (q.jb) return q.jb[0];
    if (q.hb) return q.hb[0];
    if (q.tm) return q.tm[0];
    if (q.ca) return q.ca[0];
    if (q.ty) return q.ty[0];
    if (q.sp) return q.sp[0];
    if (q.nt) return q.nt[0];
    return "";
  }

  function mistakeId(q) {
    return [sourceGameId(q), q && q.t, questionStem(q), answerText(q)].join("|");
  }

  function resetQuestionState(q) {
    const clean = JSON.parse(JSON.stringify(q));
    if (clean.t === "eja" || clean.t === "dengareja") {
      clean.got = "";
      if (clean.w) clean.letters = EFQ.shuffle(clean.w[0].toUpperCase().split(""));
    }
    if (clean.t === "kalimat") {
      clean.got = [];
      if (clean.s) clean.words = EFQ.shuffle(clean.s[0].split(" "));
    }
    return clean;
  }

  function saveMistake(q) {
    if (!player || !q) return;
    const id = mistakeId(q);
    const source = sourceGameId(q);
    const rows = readMistakes().filter(item => item.id !== id);
    rows.unshift({
      id,
      source,
      gameName: gameInfo(source).nama,
      q: resetQuestionState({ ...q, _gameId: source }),
      missedAt: new Date().toISOString()
    });
    writeMistakes(rows);
  }

  function clearMistake(q) {
    if (!player || !q) return;
    const id = mistakeId(q);
    const before = readMistakes();
    const rows = before.filter(item => item.id !== id);
    writeMistakes(rows);
    if (before.length !== rows.length) {
      const progress = readProgress();
      progress.fixedMistakes += 1;
      writeProgress(progress);
    }
  }

  /* ================= CONFETTI ================= */
  const CONFETTI_COLORS = ["#2EC4B6", "#FF6B6B", "#F5A623", "#FFD93D", "#8B5CF6", "#4ECDC4"];
  function celebrate(amount) {
    if (REDUCED) return;
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    const count = amount || 26;
    for (let i = 0; i < count; i++) {
      const bit = document.createElement("i");
      const dur = 1.1 + Math.random() * 1.1;
      const dx = (Math.random() * 2 - 1) * 34;
      bit.style.left = Math.random() * 100 + "vw";
      bit.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      bit.style.animationDuration = dur + "s";
      bit.style.animationDelay = Math.random() * 0.25 + "s";
      bit.style.setProperty("--dx", dx + "vw");
      bit.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      if (Math.random() > 0.6) bit.style.borderRadius = "50%";
      layer.appendChild(bit);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 2800);
  }

  /* ================= WELCOME ================= */
  function welcome() {
    app.innerHTML = `
      <div class="welcome">
        <div class="mascot">\u{1F31F}</div>
        <h2>Halo, teman kecil!</h2>
        <p>Siapa namamu? Ayo kumpulkan bintang sebanyak-banyaknya!</p>
        <form id="name-form">
          <input id="name-input" maxlength="20" placeholder="Tulis namamu di sini" autocomplete="off" />
          <button class="btn accent" type="submit">Mulai main! \u{1F680}</button>
        </form>
        ${room ? `<p class="room-welcome">Kamu akan masuk ke <b>${escapeHtml(roomName())}</b>.</p>` : ""}
        <p class="note" style="margin-top:14px;color:var(--ink-soft);font-size:13px">
          ${server ? "\u{1F310} Papan bintang global aktif — gunakan nama panggilan saja ya!" : ""}
        </p>
      </div>`;
    const input = document.getElementById("name-input");
    input.value = player;
    input.focus();
    document.getElementById("name-form").onsubmit = (e) => {
      e.preventDefault();
      const name = input.value.trim();
      if (name.length < 2) { input.focus(); return; }
      player = name;
      localStorage.setItem("efq_player", name);
      stars = parseInt(localStorage.getItem(scoreKey(name)), 10) || 0;
      starEl.textContent = stars;
      menu();
    };
  }

  /* ================= MENU ================= */
  async function menu() {
    mode = null;
    clearQTimer();
    const enabled = GAMES.filter(g => cfg.settings.games[g.id] !== false);
    const levels = LEVEL_ORDER.map(id => {
      const item = LEVELS[id];
      return `
        <button class="level-chip ${id === level ? "active" : ""}" data-level="${id}">
          <span>${item.nama}</span>
        </button>`;
    }).join("");
    const focusTabs = FOCUSES.map(item => {
      const count = item.id === "all" ? enabled.length : enabled.filter(g => g.focus === item.id).length;
      return `
        <button class="focus-chip ${item.id === focus ? "active" : ""}" data-focus="${item.id}">
          <span>${item.nama}</span>
          <small>${count}</small>
        </button>`;
    }).join("");
    const timerTabs = TIMER_OPTIONS.map(sec => `
      <button class="timer-chip ${sec === timer ? "active" : ""}" data-timer="${sec}">
        <span>${sec > 0 ? sec + "s" : "Mati"}</span>
      </button>`).join("");
    const focusSections = renderFocusSections(enabled);
    const learningDashboard = renderLearningDashboard(enabled);
    const practicePanel = renderPracticePanel(enabled);
    const activeFocus = focusInfo(focus);

    // Member room: level/fokus/timer disembunyikan (diatur pembuat). Selain itu tampilkan pemilihnya.
    const controlsHtml = roomMember ? `
      <div class="room-locked-panel">
        <span class="control-label">Pengaturan dari pembuat room \u{1F512}</span>
        <div>
          <div class="locked-summary">
            <span class="ls-item"><small>Level</small><b>${escapeHtml(LEVELS[level].nama)}</b></span>
            <span class="ls-item"><small>Fokus</small><b>${escapeHtml(activeFocus.nama)}</b></span>
            <span class="ls-item"><small>Timer</small><b>${escapeHtml(timerLabel(timer))}</b></span>
          </div>
          <p class="timer-note">Level, fokus, dan timer ditentukan pembuat room. Kamu tinggal pilih game dan main! \u{1F3AE}</p>
        </div>
      </div>` : `
      <div class="level-panel">
        <span class="control-label">Level</span>
        <div class="level-tabs">${levels}</div>
      </div>
      <div class="focus-panel">
        <span class="control-label">Fokus</span>
        <div class="focus-tabs">${focusTabs}</div>
      </div>
      <div class="timer-panel">
        <span class="control-label">Timer per soal</span>
        <div>
          <div class="timer-tabs">${timerTabs}</div>
          <p class="timer-note">\u{26A1} Jawab cepat dapat bonus bintang! (≤40% waktu: +2, ≤70%: +1)</p>
        </div>
      </div>`;

    app.innerHTML = `
      <div class="hello-row">
        <div>
          <h2>Halo, ${escapeHtml(player)}! \u{1F44B}</h2>
          <span class="sub">Pilih permainan favoritmu:</span>
        </div>
        <button class="btn ghost" id="switch-player">Ganti pemain</button>
      </div>
      <section class="menu-sheet" aria-label="Menu permainan">
        <div class="sheet-handle" aria-hidden="true"></div>
        <div class="sheet-head">
          <span class="sheet-icon">\u{1F9ED}</span>
          <div>
            <h2>Menu</h2>
            <p>Room, level, fokus, dan papan bintang</p>
          </div>
        </div>
        <div class="sheet-summary">
          <div>
            <strong>${escapeHtml(activeFocus.nama)}</strong>
            <span>${escapeHtml(LEVELS[level].nama)} · ${enabled.length} game</span>
          </div>
          <span>${room ? `Room ${escapeHtml(room)}` : "Solo play"}</span>
        </div>
        <div class="room-panel">
        <div>
          <span class="eyebrow">Room</span>
          <h3>${room ? `${escapeHtml(room)} · ${escapeHtml(LEVELS[level].nama)}` : "Main sendiri"}</h3>
          <p class="room-msg" id="room-msg">${escapeHtml(roomFlash)}</p>
        </div>
        <div class="room-tools">
          <div class="room-actions">
            ${roomMember ? "" : '<button class="btn compact" id="new-room" type="button">Buat room</button>'}
            <button class="btn ghost compact" id="copy-room" type="button">${room ? "Salin invite" : "Invite"}</button>
            ${room ? '<button class="btn ghost compact" id="leave-room" type="button">Keluar</button>' : ""}
          </div>
          ${roomMember ? "" : `<form class="room-form" id="room-form">
            <input id="room-input" maxlength="16" placeholder="Kode room" autocomplete="off" />
            <button class="btn ghost compact" type="submit">Masuk</button>
          </form>`}
        </div>
      </div>
      ${controlsHtml}
        ${learningDashboard}
        ${practicePanel}
        <div class="focus-sections">${focusSections}</div>
        <div class="board" id="board-box"></div>
      </section>`;

    document.getElementById("switch-player").onclick = welcome;
    bindRoomControls();
    roomFlash = "";
    app.querySelectorAll("[data-level]").forEach(el => {
      el.onclick = () => {
        level = el.dataset.level;
        localStorage.setItem("efq_level", level);
        if (room) history.replaceState(null, "", roomAddr(room));
        menu();
      };
    });
    app.querySelectorAll("[data-focus]").forEach(el => {
      el.onclick = () => {
        focus = el.dataset.focus;
        localStorage.setItem("efq_focus", focus);
        if (room) history.replaceState(null, "", roomAddr(room));
        menu();
      };
    });
    app.querySelectorAll("[data-timer]").forEach(el => {
      el.onclick = () => {
        if (roomMember) return;
        setTimerPref(parseInt(el.dataset.timer, 10));
        menu();
      };
    });
    app.querySelectorAll("[data-game]").forEach(el => {
      el.onclick = () => start(el.dataset.game);
    });
    app.querySelectorAll("[data-pack]").forEach(el => {
      el.onclick = () => start("pack:" + el.dataset.pack);
    });
    const dailyBtn = document.getElementById("start-daily");
    if (dailyBtn) dailyBtn.onclick = () => start("daily");
    const mistakeBtn = document.getElementById("start-mistakes");
    if (mistakeBtn) mistakeBtn.onclick = () => start("mistakes");
    renderBoard();
  }

  function gameCardHtml(g) {
    return `
      <button class="game-card" data-game="${g.id}">
        <span class="emoji" style="background:${g.bg};color:${g.fg}">${g.emoji}</span>
        <h3>${g.nama}</h3>
        <p>${g.sub}</p>
      </button>`;
  }

  function missionRow(title, done, total, note) {
    const pct = progressPercent(done, total);
    const complete = done >= total;
    return `
      <div class="mission-row ${complete ? "done" : ""}">
        <span class="mission-icon">${complete ? "\u{2705}" : "\u{1F3C1}"}</span>
        <div>
          <b>${escapeHtml(title)}</b>
          <small>${escapeHtml(note)}</small>
          <span class="mission-bar"><i style="width:${pct}%"></i></span>
        </div>
        <strong>${Math.min(done, total)}/${total}</strong>
      </div>`;
  }

  function renderLearningDashboard(enabled) {
    const progress = readProgress();
    const daily = readDailyState();
    const mistakes = readMistakes().length;
    const badgeCount = unlockedBadges(progress, daily).length;
    const completedGames = enabled.filter(g => progress.perGame[g.id]).length;
    const correctRate = progress.totalQuestions
      ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100)
      : 0;
    const dailyDone = daily.lastDone === todayKey() ? 1 : 0;
    const missions = [
      missionRow("Tantangan harian", dailyDone, 1, dailyDone ? "Sudah selesai hari ini" : "Selesaikan 15 soal campuran"),
      missionRow("20 jawaban benar", progress.totalCorrect, 20, `${progress.totalCorrect} jawaban benar terkumpul`),
      missionRow("Jelajahi 3 pos", completedGames, 3, `${completedGames} jenis game pernah dicoba`)
    ].join("");
    return `
      <section class="learning-dashboard">
        <div class="mission-card">
          <div class="dashboard-head">
            <div>
              <span class="eyebrow">Misi belajar</span>
              <h3>Hari ini</h3>
            </div>
            <span class="dashboard-pill">${daily.streak || 0} hari streak</span>
          </div>
          <div class="mission-list">${missions}</div>
        </div>
        <div class="stat-strip">
          <div><b>${completedGames}</b><span>pos selesai</span></div>
          <div><b>${progress.totalCorrect}</b><span>jawaban benar</span></div>
          <div><b>${mistakes}</b><span>latihan salah</span></div>
          <div><b>${correctRate}%</b><span>akurasi</span></div>
        </div>
        ${renderBadgeCollection(progress, daily, badgeCount)}
      </section>`;
  }

  function renderBadgeCollection(progress, daily, badgeCount) {
    const items = BADGES.map(badge => {
      const open = badge.ok(progress, daily);
      return `
        <div class="badge-tile ${open ? "open" : ""}">
          <span>${open ? badge.icon : "?"}</span>
          <b>${open ? escapeHtml(badge.nama) : "Terkunci"}</b>
          <small>${escapeHtml(badge.hint)}</small>
        </div>`;
    }).join("");
    return `
      <div class="badge-card">
        <div class="dashboard-head">
          <div>
            <span class="eyebrow">Koleksi lencana</span>
            <h3>${badgeCount}/${BADGES.length} terbuka</h3>
          </div>
          <span class="dashboard-pill">\u{1F381} Reward belajar</span>
        </div>
        <div class="badge-grid">${items}</div>
      </div>`;
  }

  function practiceCardHtml(item) {
    return `
      <button class="practice-card" data-pack="${item.id}">
        <span class="emoji" style="background:${item.bg};color:${item.fg}">${item.emoji}</span>
        <span>
          <b>${escapeHtml(item.nama)}</b>
          <small>${escapeHtml(item.sub)}</small>
        </span>
      </button>`;
  }

  function renderPracticePanel(enabled) {
    const enabledIds = new Set(enabled.map(g => g.id));
    const packs = PRACTICE_PACKS
      .filter(pack => pack.games.some(id => enabledIds.has(id)))
      .map(practiceCardHtml)
      .join("");
    const mistakes = readMistakes();
    const daily = readDailyState();
    const doneToday = daily.lastDone === todayKey();
    const disabled = mistakes.length ? "" : "disabled";
    return `
      <section class="practice-panel">
        <div class="practice-head">
          <div>
            <h3>Paket latihan</h3>
            <p>Campuran beberapa game supaya latihan terasa lebih panjang.</p>
          </div>
          <button class="practice-mistakes" id="start-mistakes" type="button" ${disabled}>
            <b>${mistakes.length}</b>
            <span>Latihan Salahku</span>
          </button>
        </div>
        <button class="daily-card ${doneToday ? "done" : ""}" id="start-daily" type="button">
          <span class="emoji">\u{1F3C5}</span>
          <span>
            <b>${doneToday ? "Tantangan hari ini selesai" : "Tantangan Hari Ini"}</b>
            <small>${DAILY_ROUND} soal campuran. Streak: ${daily.streak || 0} hari · Terbaik: ${daily.best || 0}</small>
          </span>
          <strong>${doneToday ? "\u{2713}" : "\u{1F525}"}</strong>
        </button>
        <div class="practice-grid">${packs}</div>
      </section>`;
  }

  function renderFocusSections(enabled) {
    const groups = focus === "all" ? FOCUSES.filter(f => f.id !== "all") : FOCUSES.filter(f => f.id === focus);
    return groups.map(group => {
      const games = enabled.filter(g => g.focus === group.id);
      if (!games.length) return "";
      return `
        <section class="focus-section">
          <div class="focus-head">
            <div>
              <h3>${escapeHtml(group.nama)}</h3>
              <p>${escapeHtml(group.sub)}</p>
            </div>
            <span>${games.length} game</span>
          </div>
          <div class="menu-grid">${games.map(g => gameCardHtml(g)).join("")}</div>
        </section>`;
    }).join("") || `<div class="board-empty">Belum ada game aktif untuk fokus ini.</div>`;
  }

  function bindRoomControls() {
    const msg = document.getElementById("room-msg");
    const roomInput = document.getElementById("room-input");
    const say = (text) => { roomFlash = text; if (msg) msg.textContent = text; };
    if (roomInput) roomInput.value = room;

    const newRoom = document.getElementById("new-room");
    if (newRoom) newRoom.onclick = () => {
      setRoom(generateRoomCode());
    };

    const copyCode = document.getElementById("copy-code");
    if (copyCode) copyCode.onclick = async () => {
      say(await copyText(room) ? "Kode room disalin." : `Kode room: ${room}`);
    };

    document.getElementById("copy-room").onclick = async () => {
      const code = room || generateRoomCode();
      let createdRoom = false;
      if (!room) {
        room = code;
        createdRoom = true;
        localStorage.setItem(ROOM_KEY, room);
        history.replaceState(null, "", roomAddr(room));
        stars = parseInt(localStorage.getItem(scoreKey(player)), 10) || 0;
        starEl.textContent = stars;
      }
      const invite = roomUrl(code);
      const ok = await copyText(invite);
      say(ok ? "Link invite disalin." : invite);
      if (createdRoom) menu();
    };

    const shareRoom = document.getElementById("share-room");
    if (shareRoom) shareRoom.onclick = async () => {
      const invite = roomUrl(room);
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Ayo main Bhs Inggris!",
            text: inviteText(room),
            url: invite
          });
          say("Invite siap dibagikan.");
        } else {
          say(await copyText(invite) ? "Link invite disalin." : invite);
        }
      } catch (e) {
        say(await copyText(invite) ? "Link invite disalin." : invite);
      }
    };

    const leave = document.getElementById("leave-room");
    if (leave) leave.onclick = () => setRoom("");

    const roomForm = document.getElementById("room-form");
    if (roomForm) roomForm.onsubmit = (e) => {
      e.preventDefault();
      const code = EFQ.sanitizeRoom(roomInput.value);
      if (!code) {
        roomInput.focus();
        say("Masukkan kode room dulu.");
        return;
      }
      setRoom(code);
    };
  }

  async function renderBoard() {
    const box = document.getElementById("board-box");
    if (!box) return;
    const board = await EFQ.fetchBoard(room);
    const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}", "\u{1F3C5}", "\u{1F3C5}",
                    "\u{2B50}", "\u{2B50}", "\u{2B50}", "\u{2B50}", "\u{2B50}"];
    box.innerHTML = `
      <div class="board-head">
        <h3>\u{1F3C6} Papan bintang <span>(${escapeHtml(roomName())}${server ? "" : " lokal"})</span></h3>
        <button class="btn ghost board-refresh" id="refresh-board" type="button">Refresh</button>
      </div>
      ${room ? `<p class="board-room-note">Teman bisa join dengan kode <b>${escapeHtml(room)}</b> atau link invite.</p>` : ""}
      ${board.length ? `<ol>${board.map((p, i) =>
        `<li data-board-index="${i}" tabindex="0" role="button" aria-label="Lihat detail skor ${escapeHtml(p.name)}">
          <span class="board-player">
            <span><span class="medal">${medals[i] || "\u{2B50}"}</span>${escapeHtml(p.name)}</span>
            ${boardMetaHtml(p)}
          </span>
          <span class="pts">\u{2B50} ${p.stars}</span>
        </li>`).join("")}
      </ol>` : `<div class="board-empty">Belum ada skor di ${escapeHtml(roomName())}. Main satu ronde untuk mulai mengisi papan bintang.</div>`}`;
    const refresh = document.getElementById("refresh-board");
    if (refresh) refresh.onclick = renderBoard;
    box.querySelectorAll("[data-board-index]").forEach(row => {
      const show = () => showBoardModal(board[parseInt(row.dataset.boardIndex, 10)]);
      row.onclick = show;
      row.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          show();
        }
      };
    });
  }

  function boardMetaHtml(p) {
    const bits = [];
    if (p.gameName) bits.push(escapeHtml(p.gameName));
    if (p.levelName) bits.push(escapeHtml(p.levelName));
    if (parseInt(p.roundTotal, 10)) bits.push(`${parseInt(p.roundScore, 10) || 0}/${parseInt(p.roundTotal, 10)} benar`);
    if (parseInt(p.earned, 10) > 0) bits.push(`+${parseInt(p.earned, 10)} bintang`);
    return bits.length ? `<small>${bits.join(" · ")}</small>` : "";
  }

  /* ================= QUESTION BUILDERS ================= */
  function levelCfg() {
    return LEVELS[level] || LEVELS.beginner;
  }

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function uniqueText(list) {
    return Array.from(new Set((list || []).map(x => String(x)).filter(Boolean)));
  }

  function answerOptions(answer, pool) {
    const size = levelCfg().options;
    const choices = uniqueText(pool).filter(x => x !== answer);
    return EFQ.shuffle([answer, ...EFQ.pick(choices, size - 1)]);
  }

  function letterCount(text) {
    return String(text).replace(/[^a-z]/gi, "").length;
  }

  function wordCount(text) {
    return String(text).trim().split(/\s+/).filter(Boolean).length;
  }

  function filterLetters(list, getter, min, max) {
    const pool = (list || []).filter(item => {
      const len = letterCount(getter(item));
      return len >= min && len <= max;
    });
    return pool.length >= 3 ? pool : (list || []);
  }

  function filterWords(list, getter, min, max) {
    const pool = (list || []).filter(item => {
      const len = wordCount(getter(item));
      return len >= min && len <= max;
    });
    return pool.length >= 3 ? pool : (list || []);
  }

  function roundSize(id) {
    // Semua game utama kini selalu 30 soal di semua level.
    const games30 = [
      "warna", "angka", "kata", "eja", "dengar", "dengararti",
      "dengarkalimat", "dengareja", "ucap", "ucapkalimat", "kalimat",
      "antonim", "plural", "kosong", "tubuh", "aksi", "posisi",
      "perasaan", "cuaca", "tanya", "tobe", "pronoun", "article",
      "possessive", "present", "hewan", "buah", "sayur",
      "keluarga", "sekolah", "pakaian", "transport", "tempat",
      "makanan", "minuman", "rumah", "pekerjaan", "hobi",
      "waktu", "kalender", "mainan", "olahraga", "alam"
    ];
    if (games30.includes(id)) return 30;
    return PER_ROUND;
  }

  function pickQuestions(pool, count) {
    if (!pool || !pool.length) return [];
    const out = [];
    while (out.length < count) {
      out.push(...EFQ.shuffle(pool).slice(0, count - out.length));
    }
    return out;
  }

  function buildDailyQs() {
    const enabled = new Set(GAMES.filter(g => cfg.settings.games[g.id] !== false).map(g => g.id));
    const games = DAILY_GAMES.filter(id => enabled.has(id));
    if (!games.length) return [];
    const out = [];
    while (out.length < DAILY_ROUND) {
      for (const gameId of EFQ.shuffle(games)) {
        const q = buildQs(gameId, 1)[0];
        if (q) out.push({ ...q, _gameId: gameId });
        if (out.length >= DAILY_ROUND) break;
      }
    }
    return out;
  }

  function buildPackQs(packId) {
    const pack = PRACTICE_PACKS.find(p => p.id === packId);
    if (!pack) return [];
    const enabled = new Set(GAMES.filter(g => cfg.settings.games[g.id] !== false).map(g => g.id));
    const games = pack.games.filter(id => enabled.has(id));
    if (!games.length) return [];
    const perGame = Math.ceil(PACK_ROUND / games.length);
    return EFQ.shuffle(games.flatMap(gameId =>
      buildQs(gameId, perGame).map(q => ({ ...q, _gameId: gameId }))
    )).slice(0, PACK_ROUND);
  }

  function buildMistakeQs() {
    return EFQ.shuffle(readMistakes())
      .slice(0, MISTAKE_ROUND)
      .map(item => resetQuestionState(item.q));
  }

  function buildQs(id, forcedCount) {
    if (id === "daily") return buildDailyQs();
    if (String(id).startsWith("pack:")) return buildPackQs(String(id).slice(5));
    if (id === "mistakes") return buildMistakeQs();

    const n = forcedCount || roundSize(id);
    const lv = levelCfg();
    if (id === "warna") return pickQuestions(C.colors, n).map(c => ({
      t: "warna", c,
      opts: answerOptions(c[0], C.colors.map(x => x[0])),
      ans: c[0]
    }));
    if (id === "angka") return Array.from({ length: n }, () => {
      const num = rand(lv.numberMin, lv.numberMax);
      const w = NUMWORDS[num - 1];
      return { t: "angka", n: num, opts: answerOptions(w, NUMWORDS.slice(lv.numberMin - 1, lv.numberMax)), ans: w };
    });
    if (id === "kata") {
      const pool = filterLetters(C.vocab, v => v[0], lv.wordMin, lv.wordMax);
      return pickQuestions(pool, n).map(v => ({
      t: "kata", v,
      opts: answerOptions(v[1], pool.map(x => x[1])),
      ans: v[1]
      }));
    }
    if (id === "eja") {
      // Filter panjang huruf tetap dipertahankan karena itulah pengatur kesulitan.
      // pickQuestions memastikan tercapai 30 soal walau pool per level < 30.
      const pool = filterLetters(C.spellWords, w => w[0], lv.spellMin, lv.spellMax);
      return pickQuestions(pool, n).map(w => ({
      t: "eja", w, letters: EFQ.shuffle(w[0].toUpperCase().split("")), got: ""
      }));
    }
    if (id === "dengar") {
      // Gunakan seluruh daftar kata agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.listenWords || []).slice();
      return pickQuestions(pool, n).map(w => ({
      t: "dengar", w,
      opts: answerOptions(w, pool),
      ans: w
      }));
    }
    if (id === "dengararti") {
      const pool = filterLetters(C.vocab, v => v[0], lv.wordMin, lv.wordMax);
      return pickQuestions(pool, n).map(v => ({
        t: "dengararti", v,
        opts: answerOptions(v[1], pool.map(x => x[1])),
        ans: v[1]
      }));
    }
    if (id === "dengarkalimat") {
      const pool = filterWords(C.sentences, s => s[0], lv.sentenceMin, lv.sentenceMax);
      return pickQuestions(pool, n).map(s => ({
        t: "dengarkalimat", s,
        opts: answerOptions(s[1], pool.map(x => x[1])),
        ans: s[1]
      }));
    }
    if (id === "dengareja") {
      const pool = filterLetters(C.spellWords, w => w[0], lv.spellMin, lv.spellMax);
      return pickQuestions(pool, n).map(w => ({
        t: "dengareja", w,
        letters: EFQ.shuffle(w[0].toUpperCase().split("")),
        got: "",
        ans: w[0]
      }));
    }
    if (id === "ucap") {
      // Gunakan seluruh daftar kata agar 30 soal unik di semua level.
      const pool = (C.listenWords || []).slice();
      return pickQuestions(pool, n).map(w => ({
        t: "ucap", w,
        ans: w
      }));
    }
    if (id === "ucapkalimat") {
      const pool = filterWords(C.sentences, s => s[0], lv.sentenceMin, lv.sentenceMax);
      return pickQuestions(pool, n).map(s => ({
        t: "ucapkalimat", s,
        w: s[0],
        ans: s[0]
      }));
    }
    if (id === "kalimat") {
      // Filter panjang kalimat tetap dipertahankan karena itulah pengatur kesulitan.
      // pickQuestions memastikan tercapai 30 soal walau pool per level < 30.
      const pool = filterWords(C.sentences, s => s[0], lv.sentenceMin, lv.sentenceMax);
      return pickQuestions(pool, n).map(s => ({
      t: "kalimat", s, words: EFQ.shuffle(s[0].split(" ")), got: []
      }));
    }
    if (id === "antonim") {
      // Gunakan seluruh pasangan antonim (tanpa filter panjang kata) agar 30 soal
      // benar-benar unik di semua level; tingkat kesulitan tetap dari jumlah pilihan.
      const pool = (C.opposites || []).slice();
      return pickQuestions(pool, n).map(o => ({
        t: "antonim", o,
        opts: answerOptions(o[1], pool.map(x => x[1])),
        ans: o[1]
      }));
    }
    if (id === "plural") {
      // Gunakan seluruh daftar bentuk jamak agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.plurals || []).slice();
      return pickQuestions(pool, n).map(p => ({
        t: "plural", p,
        opts: answerOptions(p[1], pool.map(x => x[1])),
        ans: p[1]
      }));
    }
    if (id === "kosong") {
      // Gunakan seluruh daftar isian agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.fillBlanks || []).slice();
      return pickQuestions(pool, n).map(f => ({
        t: "kosong", f,
        opts: answerOptions(f[1], pool.map(x => x[1])),
        ans: f[1]
      }));
    }
    if (id === "tubuh") {
      // Gunakan seluruh daftar bagian tubuh agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.bodyParts || []).slice();
      return pickQuestions(pool, n).map(b => ({
        t: "tubuh", b,
        opts: answerOptions(b[1], pool.map(x => x[1])),
        ans: b[1]
      }));
    }
    if (id === "aksi") {
      // Gunakan seluruh daftar kata kerja agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.actions || []).slice();
      return pickQuestions(pool, n).map(a => ({
        t: "aksi", a,
        opts: answerOptions(a[1], pool.map(x => x[1])),
        ans: a[1]
      }));
    }
    if (id === "posisi") {
      // Gunakan seluruh daftar preposisi agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.prepositions || []).slice();
      return pickQuestions(pool, n).map(p => ({
        t: "posisi", p,
        opts: answerOptions(p[1], pool.map(x => x[1])),
        ans: p[1]
      }));
    }
    if (id === "perasaan") {
      // Gunakan seluruh daftar perasaan agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.feelings || []).slice();
      return pickQuestions(pool, n).map(f => ({
        t: "perasaan", f,
        opts: answerOptions(f[1], pool.map(x => x[1])),
        ans: f[1]
      }));
    }
    if (id === "cuaca") {
      // Gunakan seluruh daftar cuaca agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.weatherWords || []).slice();
      return pickQuestions(pool, n).map(w => ({
        t: "cuaca", w,
        opts: answerOptions(w[1], pool.map(x => x[1])),
        ans: w[1]
      }));
    }
    if (id === "tanya") {
      // Gunakan seluruh daftar kata tanya agar 30 soal unik di semua level;
      // tingkat kesulitan tetap dari jumlah pilihan jawaban.
      const pool = (C.questionWords || []).slice();
      return pickQuestions(pool, n).map(qw => ({
        t: "tanya", qw,
        opts: answerOptions(qw[1], pool.map(x => x[1])),
        ans: qw[1]
      }));
    }
    if (id === "tobe") {
      const pool = (C.toBe || []).slice();
      return pickQuestions(pool, n).map(tb => ({
        t: "tobe", tb,
        opts: answerOptions(tb[1], pool.map(x => x[1])),
        ans: tb[1]
      }));
    }
    if (id === "pronoun") {
      const pool = (C.pronouns || []).slice();
      return pickQuestions(pool, n).map(pn => ({
        t: "pronoun", pn,
        opts: answerOptions(pn[1], pool.map(x => x[1])),
        ans: pn[1]
      }));
    }
    if (id === "article") {
      const pool = (C.articles || []).slice();
      return pickQuestions(pool, n).map(ar => ({
        t: "article", ar,
        opts: answerOptions(ar[1], pool.map(x => x[1])),
        ans: ar[1]
      }));
    }
    if (id === "possessive") {
      const pool = (C.possessives || []).slice();
      return pickQuestions(pool, n).map(po => ({
        t: "possessive", po,
        opts: answerOptions(po[1], pool.map(x => x[1])),
        ans: po[1]
      }));
    }
    if (id === "present") {
      const pool = (C.simplePresent || []).slice();
      return pickQuestions(pool, n).map(prs => ({
        t: "present", prs,
        opts: answerOptions(prs[1], pool.map(x => x[1])),
        ans: prs[1]
      }));
    }
    if (id === "hewan") {
      const pool = (C.animals || []).slice();
      return pickQuestions(pool, n).map(h => ({
        t: "hewan", h,
        opts: answerOptions(h[1], pool.map(x => x[1])),
        ans: h[1]
      }));
    }
    if (id === "buah") {
      const pool = (C.fruits || []).slice();
      return pickQuestions(pool, n).map(fr => ({
        t: "buah", fr,
        opts: answerOptions(fr[1], pool.map(x => x[1])),
        ans: fr[1]
      }));
    }
    if (id === "sayur") {
      const pool = (C.vegetables || []).slice();
      return pickQuestions(pool, n).map(vg => ({
        t: "sayur", vg,
        opts: answerOptions(vg[1], pool.map(x => x[1])),
        ans: vg[1]
      }));
    }
    if (id === "keluarga") {
      const pool = (C.familyWords || []).slice();
      return pickQuestions(pool, n).map(fm => ({
        t: "keluarga", fm,
        opts: answerOptions(fm[1], pool.map(x => x[1])),
        ans: fm[1]
      }));
    }
    if (id === "sekolah") {
      const pool = (C.schoolWords || []).slice();
      return pickQuestions(pool, n).map(sc => ({
        t: "sekolah", sc,
        opts: answerOptions(sc[1], pool.map(x => x[1])),
        ans: sc[1]
      }));
    }
    if (id === "pakaian") {
      const pool = (C.clothesWords || []).slice();
      return pickQuestions(pool, n).map(cl => ({
        t: "pakaian", cl,
        opts: answerOptions(cl[1], pool.map(x => x[1])),
        ans: cl[1]
      }));
    }
    if (id === "transport") {
      const pool = (C.transportWords || []).slice();
      return pickQuestions(pool, n).map(tr => ({
        t: "transport", tr,
        opts: answerOptions(tr[1], pool.map(x => x[1])),
        ans: tr[1]
      }));
    }
    if (id === "tempat") {
      const pool = (C.placeWords || []).slice();
      return pickQuestions(pool, n).map(pl => ({
        t: "tempat", pl,
        opts: answerOptions(pl[1], pool.map(x => x[1])),
        ans: pl[1]
      }));
    }
    if (id === "makanan") {
      const pool = (C.foodWords || []).slice();
      return pickQuestions(pool, n).map(fd => ({
        t: "makanan", fd,
        opts: answerOptions(fd[1], pool.map(x => x[1])),
        ans: fd[1]
      }));
    }
    if (id === "minuman") {
      const pool = (C.drinkWords || []).slice();
      return pickQuestions(pool, n).map(dr => ({
        t: "minuman", dr,
        opts: answerOptions(dr[1], pool.map(x => x[1])),
        ans: dr[1]
      }));
    }
    if (id === "rumah") {
      const pool = (C.houseWords || []).slice();
      return pickQuestions(pool, n).map(hs => ({
        t: "rumah", hs,
        opts: answerOptions(hs[1], pool.map(x => x[1])),
        ans: hs[1]
      }));
    }
    if (id === "pekerjaan") {
      const pool = (C.jobsWords || []).slice();
      return pickQuestions(pool, n).map(jb => ({
        t: "pekerjaan", jb,
        opts: answerOptions(jb[1], pool.map(x => x[1])),
        ans: jb[1]
      }));
    }
    if (id === "hobi") {
      const pool = (C.hobbyWords || []).slice();
      return pickQuestions(pool, n).map(hb => ({
        t: "hobi", hb,
        opts: answerOptions(hb[1], pool.map(x => x[1])),
        ans: hb[1]
      }));
    }
    if (id === "waktu") {
      const pool = (C.timeWords || []).slice();
      return pickQuestions(pool, n).map(tm => ({
        t: "waktu", tm,
        opts: answerOptions(tm[1], pool.map(x => x[1])),
        ans: tm[1]
      }));
    }
    if (id === "kalender") {
      const pool = (C.calendarWords || []).slice();
      return pickQuestions(pool, n).map(ca => ({
        t: "kalender", ca,
        opts: answerOptions(ca[1], pool.map(x => x[1])),
        ans: ca[1]
      }));
    }
    if (id === "mainan") {
      const pool = (C.toyWords || []).slice();
      return pickQuestions(pool, n).map(ty => ({
        t: "mainan", ty,
        opts: answerOptions(ty[1], pool.map(x => x[1])),
        ans: ty[1]
      }));
    }
    if (id === "olahraga") {
      const pool = (C.sportWords || []).slice();
      return pickQuestions(pool, n).map(sp => ({
        t: "olahraga", sp,
        opts: answerOptions(sp[1], pool.map(x => x[1])),
        ans: sp[1]
      }));
    }
    if (id === "alam") {
      const pool = (C.natureWords || []).slice();
      return pickQuestions(pool, n).map(nt => ({
        t: "alam", nt,
        opts: answerOptions(nt[1], pool.map(x => x[1])),
        ans: nt[1]
      }));
    }
    return [];
  }

  function start(id) {
    mode = id; qi = 0; score = 0; roundBonus = 0;
    qs = buildQs(id);
    if (!qs.length) {
      const emptyTitle = id === "mistakes" ? "Belum ada soal salah" : "Soalnya belum tersedia";
      const emptyText = id === "mistakes"
        ? "Nanti soal yang salah dijawab akan muncul di sini untuk dilatih ulang."
        : "Coba pilih game lain atau cek konten soal di panel admin.";
      app.innerHTML = `
        <div class="play finish">
          <h2>${emptyTitle}</h2>
          <p>${emptyText}</p>
          <div class="center-row"><button class="btn" id="home">\u{1F3AE} Kembali ke menu</button></div>
        </div>`;
      document.getElementById("home").onclick = menu;
      return;
    }
    render();
  }

  /* ================= TIMER SOAL ================= */
  function clearQTimer() {
    if (qTimer) { clearInterval(qTimer); qTimer = null; }
  }

  function answerText(q) {
    if (q.ans) return q.ans;
    if (q.t === "eja" || q.t === "dengareja") return q.w[0];
    if (q.t === "kalimat") return q.s[0];
    if (q.t === "ucap" || q.t === "ucapkalimat") return q.w;
    return "";
  }

  function listenText(q) {
    if (!q) return "";
    if (q.t === "dengar") return q.w;
    if (q.t === "dengararti") return q.v[0];
    if (q.t === "dengarkalimat") return q.s[0];
    if (q.t === "dengareja") return q.w[0];
    if (q.t === "ucap" || q.t === "ucapkalimat") return q.w;
    return "";
  }

  function recordDuration(q) {
    return q && q.t === "ucapkalimat" ? 5200 : 3200;
  }

  function recordLabel(q) {
    return q && q.t === "ucapkalimat" ? "\u{1F399} Rekam 5 detik" : "\u{1F399} Rekam 3 detik";
  }

  function updateTimerUI(remaining, total) {
    const bar = document.getElementById("qtimer-bar");
    const num = document.getElementById("qtimer-num");
    const el = document.getElementById("qtimer");
    if (num) num.textContent = Math.max(0, remaining) + "s";
    if (bar) bar.style.width = Math.max(0, (remaining / total) * 100) + "%";
    if (el) el.classList.toggle("danger", remaining <= 5);
  }

  function startQTimer() {
    clearQTimer();
    if (!(timer > 0)) { qStartedAt = 0; return; }
    const total = timer;
    const started = Date.now();
    qStartedAt = started;
    updateTimerUI(total, total);
    qTimer = setInterval(() => {
      const remaining = total - Math.floor((Date.now() - started) / 1000);
      updateTimerUI(remaining, total);
      if (remaining <= 0) {
        clearQTimer();
        onTimeout();
      }
    }, 200);
  }

  function onTimeout() {
    if (lock) return;
    lock = true;
    const q = qs[qi];
    saveMistake(q);
    const ans = answerText(q);
    // Ungkap jawaban benar untuk soal pilihan ganda.
    app.querySelectorAll("[data-opt]").forEach(b => {
      if (b.dataset.opt === q.ans) b.classList.add("ok");
      b.disabled = true;
    });
    const fb = document.getElementById("fb");
    if (fb) {
      fb.className = "feedback bad";
      fb.textContent = ans ? `\u{23F0} Waktu habis! Jawabannya: ${ans}` : "\u{23F0} Waktu habis!";
    }
    setTimeout(() => { qi++; render(); }, 1600);
  }

  /* ================= RENDER SOAL ================= */
  function render() {
    lock = false;
    clearQTimer();
    if (qi >= qs.length) return finish();
    const q = qs[qi];
    const dots = qs.map((_, i) => `<span class="${i < qi ? "done" : (i === qi ? "current" : "")}"></span>`).join("");
    let body = "";

    if (q.t === "warna") {
      const extra = q.c[0] === "White" ? "" : "border-color:transparent;";
      body = `
        <p class="prompt">What color is it?</p>
        <div class="swatch" style="background:${q.c[1]};${extra}"></div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "angka") {
      const groups = [];
      for (let i = 0; i < q.n; i++) {
        const g = Math.floor(i / 5);
        (groups[g] = groups[g] || []).push(i);
      }
      const starsHtml = groups.map(g => `<span class="star-group">${
        g.map(i => `<span class="star" style="animation-delay:${(i * 45).toFixed(0)}ms">\u{2B50}</span>`).join("")
      }</span>`).join("");
      body = `
        <p class="prompt">How many stars?<span class="hint">Hitung bintangnya (dikelompokkan per 5 biar mudah), lalu pilih angkanya!</span></p>
        <div class="stars-box" role="img" aria-label="${q.n} stars">
          <div class="stars-grid">${starsHtml}</div>
        </div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "kata") {
      body = `
        <p class="prompt">Apa arti kata ini?</p>
        <div class="big-word">${escapeHtml(q.v[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "dengar") {
      body = `
        <p class="prompt">Tekan tombol, dengarkan, lalu pilih kata yang kamu dengar!<span class="hint">Native AI aktif jika GEMINI_API_KEY sudah dipasang.</span></p>
        <button class="btn listen-btn" id="listen">\u{1F50A} Native AI</button>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "dengararti") {
      body = `
        <p class="prompt">Dengarkan kata Bahasa Inggris, lalu pilih artinya.<span class="hint">Kamu tidak melihat katanya dulu, jadi fokus ke suara.</span></p>
        <button class="btn listen-btn" id="listen">\u{1F50A} Putar suara</button>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "dengarkalimat") {
      body = `
        <p class="prompt">Dengarkan kalimat, lalu pilih artinya.<span class="hint">Latihan menangkap makna dari satu kalimat penuh.</span></p>
        <button class="btn listen-btn" id="listen">\u{1F3A7} Putar kalimat</button>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "dengareja") {
      body = `
        <p class="prompt">Dengarkan kata, lalu susun hurufnya.<span class="hint">Artinya: <b>${escapeHtml(q.w[1])}</b></span></p>
        <button class="btn listen-btn" id="listen">\u{1F50A} Putar kata</button>
        <div class="slot" id="slot">${"_".repeat(q.w[0].length)}</div>
        <div class="tiles" id="tiles"></div>
        <div class="center-row"><button class="btn ghost" id="reset">\u{1F504} Ulangi</button></div>`;
    } else if (q.t === "ucap") {
      body = `
        <p class="prompt">Dengarkan contoh, lalu ucapkan kata ini:<span class="hint">Gemini akan memberi nilai pronunciation.</span></p>
        <div class="big-word">${escapeHtml(q.w)}</div>
        <div class="ai-practice">
          <button class="btn listen-btn" id="listen">\u{1F50A} Contoh native</button>
          <button class="btn accent listen-btn" id="record">${recordLabel(q)}</button>
        </div>
        <div class="speech-result" id="speech-result">Tekan rekam, izinkan mikrofon, lalu ucapkan: <b>${escapeHtml(q.w)}</b></div>`;
    } else if (q.t === "ucapkalimat") {
      body = `
        <p class="prompt">Dengarkan contoh, lalu ucapkan kalimat ini:<span class="hint">Artinya: <b>${escapeHtml(q.s[1])}</b></span></p>
        <div class="big-word sentence-word">${escapeHtml(q.w)}</div>
        <div class="ai-practice">
          <button class="btn listen-btn" id="listen">\u{1F50A} Contoh native</button>
          <button class="btn accent listen-btn" id="record">${recordLabel(q)}</button>
        </div>
        <div class="speech-result" id="speech-result">Tekan rekam, izinkan mikrofon, lalu ucapkan kalimat di atas.</div>`;
    } else if (q.t === "eja") {
      body = `
        <p class="prompt">Susun huruf menjadi kata:<span class="hint">Artinya: <b>${escapeHtml(q.w[1])}</b></span></p>
        <div class="slot" id="slot">${"_".repeat(q.w[0].length)}</div>
        <div class="tiles" id="tiles"></div>
        <div class="center-row"><button class="btn ghost" id="reset">\u{1F504} Ulangi</button></div>`;
    } else if (q.t === "kalimat") {
      body = `
        <p class="prompt">Susun kata menjadi kalimat:<span class="hint">Artinya: <b>${escapeHtml(q.s[1])}</b></span></p>
        <div class="slot sentence" id="slot">...</div>
        <div class="tiles" id="tiles"></div>
        <div class="center-row"><button class="btn ghost" id="reset">\u{1F504} Ulangi</button></div>`;
    } else if (q.t === "antonim") {
      body = `
        <p class="prompt">What is the opposite of this word?<span class="hint">Pilih lawan katanya.</span></p>
        <div class="big-word">${escapeHtml(q.o[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "plural") {
      body = `
        <p class="prompt">Choose the plural form:<span class="hint">Bentuk jamak dari <b>${escapeHtml(q.p[2])}</b></span></p>
        <div class="big-word">${escapeHtml(q.p[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "kosong") {
      body = `
        <p class="prompt">Complete the sentence:<span class="hint">Artinya: <b>${escapeHtml(q.f[2])}</b></span></p>
        <div class="big-word sentence-word">${blankHtml(q.f[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "tubuh") {
      body = `
        <p class="prompt">Apa arti bagian tubuh ini?</p>
        <div class="big-word">${escapeHtml(q.b[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "aksi") {
      body = `
        <p class="prompt">What action is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.a[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "posisi") {
      body = `
        <p class="prompt">Choose the correct preposition:<span class="hint">Artinya: <b>${escapeHtml(q.p[2])}</b></span></p>
        <div class="big-word sentence-word">${blankHtml(q.p[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "perasaan") {
      body = `
        <p class="prompt">Apa arti perasaan ini?</p>
        <div class="big-word">${escapeHtml(q.f[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "cuaca") {
      body = `
        <p class="prompt">What weather word is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.w[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "tanya") {
      body = `
        <p class="prompt">Choose the question word:<span class="hint">Artinya: <b>${escapeHtml(q.qw[2])}</b></span></p>
        <div class="big-word sentence-word">${blankHtml(q.qw[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "tobe") {
      body = `
        <p class="prompt">Choose the correct to be:<span class="hint">Artinya: <b>${escapeHtml(q.tb[2])}</b></span></p>
        <div class="big-word sentence-word">${blankHtml(q.tb[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "pronoun") {
      body = `
        <p class="prompt">Choose the correct pronoun:<span class="hint">Artinya: <b>${escapeHtml(q.pn[2])}</b></span></p>
        <div class="big-word sentence-word">${blankHtml(q.pn[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "article") {
      body = `
        <p class="prompt">Choose the correct article:<span class="hint">Pilih a, an, atau the.</span></p>
        <div class="big-word sentence-word">${blankHtml(q.ar[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "possessive") {
      body = `
        <p class="prompt">Choose the possessive word:<span class="hint">Artinya: <b>${escapeHtml(q.po[2])}</b></span></p>
        <div class="big-word sentence-word">${blankHtml(q.po[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "present") {
      body = `
        <p class="prompt">Choose the simple present form:<span class="hint">Artinya: <b>${escapeHtml(q.prs[2])}</b></span></p>
        <div class="big-word sentence-word">${blankHtml(q.prs[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "hewan") {
      body = `
        <p class="prompt">What animal is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.h[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "buah") {
      body = `
        <p class="prompt">What fruit is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.fr[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "sayur") {
      body = `
        <p class="prompt">What vegetable is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.vg[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "keluarga") {
      body = `
        <p class="prompt">Who is in the family?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.fm[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "sekolah") {
      body = `
        <p class="prompt">What school word is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.sc[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "pakaian") {
      body = `
        <p class="prompt">What clothing item is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.cl[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "transport") {
      body = `
        <p class="prompt">What transportation word is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.tr[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "tempat") {
      body = `
        <p class="prompt">What place is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.pl[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "makanan") {
      body = `
        <p class="prompt">What food is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.fd[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "minuman") {
      body = `
        <p class="prompt">What drink is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.dr[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "rumah") {
      body = `
        <p class="prompt">What house word is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.hs[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "pekerjaan") {
      body = `
        <p class="prompt">What job is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.jb[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "hobi") {
      body = `
        <p class="prompt">What hobby is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.hb[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "waktu") {
      body = `
        <p class="prompt">What time word is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.tm[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "kalender") {
      body = `
        <p class="prompt">What calendar word is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.ca[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "mainan") {
      body = `
        <p class="prompt">What toy is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.ty[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "olahraga") {
      body = `
        <p class="prompt">What sport word is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.sp[0])}</div>
        ${optsHtml(q.opts)}`;
    } else if (q.t === "alam") {
      body = `
        <p class="prompt">What nature word is this?<span class="hint">Pilih arti Bahasa Indonesianya.</span></p>
        <div class="big-word">${escapeHtml(q.nt[0])}</div>
        ${optsHtml(q.opts)}`;
    }

    app.innerHTML = `
      <div class="play">
        <div class="play-top">
          <div class="dots">${dots}</div>
          <div class="play-meta">
            ${room ? `<span class="room-play-pill">Room ${escapeHtml(room)}</span>` : ""}
            <span class="q-count">Soal ${qi + 1} / ${qs.length}</span>
          </div>
        </div>
        ${timer > 0 ? `
        <div class="qtimer" id="qtimer">
          <span class="qtimer-ico">\u{23F1}</span>
          <div class="qtimer-track"><div class="qtimer-bar" id="qtimer-bar"></div></div>
          <span class="qtimer-num" id="qtimer-num">${timer}s</span>
        </div>` : ""}
        ${body}
        <div class="feedback" id="fb"></div>
        <div class="center-row"><button class="btn ghost" id="back">\u{1F3E0} Menu</button></div>
      </div>`;

    document.getElementById("back").onclick = menu;
    app.querySelectorAll("[data-opt]").forEach(b => b.onclick = () => pickAnswer(b));
    if (q.t === "eja" || q.t === "dengareja" || q.t === "kalimat") {
      drawTiles(q);
      document.getElementById("reset").onclick = () => { if (!lock) { q.got = (q.t === "eja" || q.t === "dengareja") ? "" : []; render(); } };
    }
    if (q.t === "dengar" || q.t === "dengararti" || q.t === "dengarkalimat" || q.t === "dengareja") {
      const text = listenText(q);
      document.getElementById("listen").onclick = () => EFQ.speakAi(text);
      setTimeout(() => EFQ.speak(text), 350);
    }
    if (q.t === "ucap" || q.t === "ucapkalimat") {
      document.getElementById("listen").onclick = () => EFQ.speakAi(listenText(q));
      document.getElementById("record").onclick = () => handleSpeaking(q);
    }
    startQTimer();
  }

  async function recordClip(ms = 3200) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      throw new Error("Browser belum mendukung rekam suara");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const type = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "");
    const rec = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
    const chunks = [];
    return new Promise((resolve, reject) => {
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onerror = () => {
        stream.getTracks().forEach(t => t.stop());
        reject(new Error("Rekaman gagal"));
      };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        resolve(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
      };
      rec.start();
      setTimeout(() => {
        if (rec.state !== "inactive") rec.stop();
      }, ms);
    });
  }

  async function handleSpeaking(q) {
    if (lock) return;
    clearQTimer();
    const btn = document.getElementById("record");
    const result = document.getElementById("speech-result");
    lock = true;
    btn.disabled = true;
    btn.textContent = "\u{23FA} Merekam...";
    result.className = "speech-result active";
    result.textContent = "Dengarkan... ucapkan dengan jelas.";
    try {
      const blob = await recordClip(recordDuration(q));
      btn.textContent = "\u{1F9E0} Menilai...";
      result.textContent = "Gemini sedang mengecek pronunciation...";
      const ai = await EFQ.analyzeSpeech(blob, q.w, level);
      if (!ai.ok) throw new Error(ai.error || "AI speaking belum aktif");
      checkSpeaking(ai.correct || ai.score >= 70, q.w, ai);
    } catch (e) {
      lock = false;
      btn.disabled = false;
      btn.textContent = recordLabel(q);
      result.className = "speech-result error";
      result.innerHTML = `${escapeHtml(e.message || "Rekaman gagal")}<br><small>Pasang GEMINI_API_KEY di server untuk penilaian AI.</small>`;
    }
  }

  function optsHtml(list) {
    return `<div class="opts">${list.map(o =>
      `<button class="opt" data-opt="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join("")}</div>`;
  }

  function blankHtml(text) {
    return escapeHtml(text).replace("____", "<span class=\"blank\">____</span>");
  }

  function bumpSlot(slot) {
    if (!slot || REDUCED) return;
    slot.classList.remove("filled");
    void slot.offsetWidth;
    slot.classList.add("filled");
  }

  function drawTiles(q) {
    const box = document.getElementById("tiles");
    const spellingMode = q.t === "eja" || q.t === "dengareja";
    const items = spellingMode ? q.letters : q.words;
    items.forEach(ch => {
      const b = document.createElement("button");
      b.className = "tile" + (q.t === "kalimat" ? " word" : "");
      b.textContent = ch;
      b.onclick = () => {
        if (lock || b.disabled) return;
        b.disabled = true;
        const slot = document.getElementById("slot");
        if (spellingMode) {
          q.got += ch;
          slot.textContent =
            q.got + "_".repeat(Math.max(0, q.w[0].length - q.got.length));
          bumpSlot(slot);
          if (q.got.length === q.w[0].length) check(q.got === q.w[0], q.w[0]);
        } else {
          q.got.push(ch);
          slot.textContent = q.got.join(" ");
          bumpSlot(slot);
          if (q.got.length === q.words.length) check(q.got.join(" ") === q.s[0], q.s[0]);
        }
      };
      box.appendChild(b);
    });
  }

  function pickAnswer(btn) {
    if (lock) return;
    lock = true;
    const q = qs[qi];
    const ok = btn.dataset.opt === q.ans;
    btn.classList.add(ok ? "ok" : "no");
    if (!ok) {
      app.querySelectorAll("[data-opt]").forEach(b => {
        if (b.dataset.opt === q.ans) b.classList.add("ok");
      });
    }
    check(ok, q.ans);
  }

  function check(ok, ans) {
    lock = true;
    const q = qs[qi];
    const bonus = ok ? speedBonus() : 0;
    clearQTimer();
    const fb = document.getElementById("fb");
    if (ok) {
      clearMistake(q);
      score++;
      const gain = 1 + bonus;
      roundBonus += bonus;
      setStars(stars + gain);
      celebrate(18 + bonus * 12);
      const p = C.praise[Math.floor(Math.random() * C.praise.length)];
      fb.className = "feedback good";
      fb.textContent = bonus > 0
        ? `\u{26A1} Cepat! +${gain} bintang — ${p}`
        : `\u{2B50} ${p}`;
      EFQ.speak(ans);
    } else {
      saveMistake(q);
      fb.className = "feedback bad";
      fb.textContent = `Hampir! Jawabannya: ${ans}`;
    }
    setTimeout(() => { qi++; render(); }, ok ? 1100 : 1700);
  }

  function checkSpeaking(ok, ans, ai) {
    lock = true;
    clearQTimer();
    const fb = document.getElementById("fb");
    const result = document.getElementById("speech-result");
    const heard = ai.heard ? `<span>Heard: <b>${escapeHtml(ai.heard)}</b></span>` : "";
    const scoreText = `<span>Pronunciation score: <b>${ai.score || 0}/100</b></span>`;
    result.className = "speech-result " + (ok ? "good" : "error");
    result.innerHTML = `${heard}${scoreText}<small>${escapeHtml(ai.feedback || "")}</small>`;
    if (ok) {
      clearMistake(qs[qi]);
      score++;
      setStars(stars + 1);
      celebrate(18);
      fb.className = "feedback good";
      fb.textContent = "\u{2B50} Pronunciation bagus!";
      EFQ.speak(ans);
    } else {
      saveMistake(qs[qi]);
      fb.className = "feedback bad";
      fb.textContent = `Coba lagi nanti. Targetnya: ${ans}`;
    }
    setTimeout(() => { qi++; render(); }, ok ? 1600 : 2300);
  }

  /* ================= FINISH ================= */
  function finish() {
    const total = qs.length;
    const earned = Math.max(1, Math.round((score / total) * 3));
    const meta = roundMeta(earned);
    const dailyResult = mode === "daily" ? completeDailyChallenge() : null;
    updateProgressAfterRound();
    if (player) EFQ.submitScore(player, stars, room, meta);
    const starsRow = Array.from({ length: 3 }, (_, i) =>
      `<span class="s">${i < earned ? "\u{2B50}" : "\u{2606}"}</span>`).join("");
    const all = score === total;
    app.innerHTML = `
      <div class="play finish">
        <div class="stars-earned">${starsRow}</div>
        <h2>${all ? "You are a superstar!" : "Great job, " + escapeHtml(player) + "!"}</h2>
        <p>Kamu menjawab benar <b>${score}</b> dari <b>${total}</b> soal.</p>
        ${dailyResult ? dailyResultHtml(dailyResult) : ""}
        ${roundBonus > 0 ? `<p class="speed-bonus-line">\u{26A1} Bonus kecepatan: <b>+${roundBonus} bintang</b></p>` : ""}
        <div class="center-row">
          <button class="btn accent" id="retry">\u{1F504} Main lagi</button>
          <button class="btn" id="home">\u{1F3AE} Pilih game lain</button>
        </div>
      </div>
      ${resultModalHtml(meta, starsRow)}`;
    document.getElementById("retry").onclick = () => start(mode);
    document.getElementById("home").onclick = menu;
    document.getElementById("close-result").onclick = () => document.getElementById("result-modal").remove();
    document.getElementById("modal-home").onclick = menu;
    // Pesta konfeti saat selesai — lebih meriah bila sempurna
    celebrate(all ? 80 : 40);
    if (all) {
      setTimeout(() => celebrate(60), 500);
      EFQ.speak("You are a superstar!");
    }
  }

  function roundMeta(badgeStars) {
    const g = gameInfo(mode);
    const f = focusInfo(g.focus);
    return {
      gameId: g.id,
      gameName: g.nama,
      focusName: f.nama,
      level,
      levelName: LEVELS[level].nama,
      roundScore: score,
      roundTotal: qs.length,
      earned: score,
      badgeStars,
      updatedAt: new Date().toISOString(),
    };
  }

  function dailyResultHtml(result) {
    return `
      <p class="daily-result-line">
        ${result.firstToday
          ? `\u{1F525} Streak harian: <b>${result.streak} hari</b>`
          : `\u{2705} Tantangan hari ini sudah dicatat. Streak: <b>${result.streak} hari</b>`}
      </p>`;
  }

  function resultModalHtml(meta, starsRow) {
    return `
      <div class="modal-backdrop" id="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <div class="result-modal">
          <button class="modal-x" id="close-result" type="button" aria-label="Tutup">×</button>
          <div class="stars-earned">${starsRow}</div>
          <h2 id="result-title">Ringkasan ronde</h2>
          <div class="result-grid">
            <div><span>Game</span><b>${escapeHtml(meta.gameName)}</b></div>
            <div><span>Fokus</span><b>${escapeHtml(meta.focusName)}</b></div>
            <div><span>Level</span><b>${escapeHtml(meta.levelName)}</b></div>
            <div><span>Room</span><b>${escapeHtml(room || "Global")}</b></div>
            <div><span>Benar</span><b>${meta.roundScore} / ${meta.roundTotal}</b></div>
            <div><span>Perolehan</span><b>+${meta.earned} bintang</b></div>
            <div><span>Total bintang</span><b>${stars}</b></div>
            <div><span>Rating</span><b>${meta.badgeStars} / 3</b></div>
          </div>
          <div class="center-row">
            <button class="btn accent" id="modal-home" type="button">Lihat papan bintang</button>
          </div>
        </div>
      </div>`;
  }

  function showBoardModal(entry) {
    if (!entry) return;
    const meta = {
      gameName: entry.gameName || "Belum ada detail game",
      focusName: entry.focusName || "-",
      levelName: entry.levelName || "-",
      roundScore: parseInt(entry.roundScore, 10) || 0,
      roundTotal: parseInt(entry.roundTotal, 10) || 0,
      earned: parseInt(entry.earned, 10) || 0,
      badgeStars: parseInt(entry.badgeStars, 10) || 0,
    };
    const starsRow = "\u{2B50}".repeat(Math.max(1, Math.min(3, meta.badgeStars || 1)));
    const old = document.getElementById("result-modal");
    if (old) old.remove();
    document.body.insertAdjacentHTML("beforeend", boardModalHtml(entry, meta, starsRow));
    document.getElementById("close-result").onclick = () => document.getElementById("result-modal").remove();
    document.getElementById("modal-home").onclick = () => document.getElementById("result-modal").remove();
  }

  function boardModalHtml(entry, meta, starsRow) {
    const result = meta.roundTotal ? `${meta.roundScore} / ${meta.roundTotal}` : "-";
    const earned = meta.earned ? `+${meta.earned} bintang` : "-";
    return `
      <div class="modal-backdrop" id="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <div class="result-modal">
          <button class="modal-x" id="close-result" type="button" aria-label="Tutup">×</button>
          <div class="stars-earned">${starsRow}</div>
          <h2 id="result-title">${escapeHtml(entry.name)}</h2>
          <div class="result-grid">
            <div><span>Total bintang</span><b>${parseInt(entry.stars, 10) || 0}</b></div>
            <div><span>Room</span><b>${escapeHtml(room || "Global")}</b></div>
            <div><span>Game terakhir</span><b>${escapeHtml(meta.gameName)}</b></div>
            <div><span>Fokus</span><b>${escapeHtml(meta.focusName)}</b></div>
            <div><span>Level</span><b>${escapeHtml(meta.levelName)}</b></div>
            <div><span>Benar</span><b>${result}</b></div>
            <div><span>Perolehan ronde</span><b>${earned}</b></div>
            <div><span>Rating</span><b>${meta.badgeStars || "-"} / 3</b></div>
          </div>
          <div class="center-row">
            <button class="btn accent" id="modal-home" type="button">Tutup</button>
          </div>
        </div>
      </div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ================= INIT ================= */
  starEl.textContent = stars;
  if (player) menu();
  else welcome();
})();
