/* Bhs Inggris — admin.js (sisi admin / white-label)
   Mendukung MODE SERVER (database) dan MODE LOKAL (localStorage). */

(async () => {
  const { cfg: initialCfg, server } = await EFQ.ready();
  let cfg = initialCfg;
  EFQ.applyBranding(cfg);

  const $ = id => document.getElementById(id);
  const loginView = $("login-view");
  const panelView = $("panel-view");

  /* Badge mode di header */
  const badge = $("mode-badge");
  if (badge) {
    badge.textContent = server ? "\u{1F310} Mode server aktif" : "\u{1F4BB} Mode lokal";
    badge.title = server
      ? "Database terhubung — pengaturan & papan bintang tersimpan di server untuk semua pengunjung."
      : "Tanpa database — pengaturan tersimpan di browser ini saja. Lihat README untuk mengaktifkan mode server.";
  }
  const localNote = $("local-mode-note");
  if (localNote) localNote.style.display = server ? "none" : "block";

  const GAME_INFO = {
    warna:   ["Tebak warna", "What color is it?"],
    angka:   ["Hitung bintang", "How many stars?"],
    kata:    ["Cocokkan kata", "Kata dan artinya"],
    eja:     ["Susun huruf", "Spell the word!"],
    dengar:  ["Dengar & pilih", "Listening"],
    dengararti: ["Dengar arti", "Listen & meaning"],
    dengarkalimat: ["Dengar kalimat", "Listen to sentence"],
    dengareja: ["Dengar & susun", "Listen and spell"],
    ucap:    ["Ucapkan kata", "AI speaking"],
    ucapkalimat: ["Ucapkan kalimat", "AI sentence speaking"],
    kalimat: ["Susun kalimat", "Make a sentence!"],
    antonim: ["Lawan kata", "Find the opposite"],
    plural:  ["Bentuk jamak", "One or many?"],
    kosong:  ["Isi kata kosong", "Complete it!"],
    tubuh:   ["Bagian tubuh", "Body parts"],
    aksi:    ["Kata kerja", "Action words"],
    posisi:  ["Di mana?", "Prepositions"],
    perasaan: ["Perasaan", "Feelings"],
    cuaca:   ["Cuaca", "Weather words"],
    tanya:   ["Kata tanya", "Question words"],
    tobe:    ["To be", "am, is, are"],
    pronoun: ["Pronoun", "I, you, he, she"],
    article: ["Article", "a, an, the"],
    possessive: ["Possessive", "my, your, his"],
    present: ["Simple Present", "do, does, -s"],
    hewan:   ["Nama hewan", "Animal names"],
    buah:    ["Buah-buahan", "Fruits"],
    sayur:   ["Sayuran", "Vegetables"],
    keluarga: ["Keluarga", "Family members"],
    sekolah: ["Sekolah", "School things"],
    pakaian: ["Pakaian", "Clothes"],
    transport: ["Transportasi", "Transportation"],
    tempat:  ["Tempat umum", "Places"],
    makanan: ["Makanan", "Food"],
    minuman: ["Minuman", "Drinks"],
    rumah:   ["Rumah", "House things"],
    pekerjaan: ["Pekerjaan", "Jobs"],
    hobi:    ["Hobi", "Hobbies"],
    waktu:   ["Waktu", "Time words"],
    kalender: ["Kalender", "Days & months"],
    mainan:  ["Mainan", "Toys"],
    olahraga: ["Olahraga", "Sports"],
    alam:    ["Alam", "Nature"]
  };

  /* Bank soal yang bisa diedit dari tab "Konten soal".
     cols = jumlah kolom per baris (dipisah "="), sesuai bentuk data di config.
     upper = kolom pertama dipaksa huruf besar tanpa spasi (khusus game susun huruf).
     hex   = kolom kedua wajib kode warna (khusus game tebak warna). */
  const MIN_ROWS = 5; // level Advanced butuh 5 pilihan jawaban
  const CONTENT_BANKS = [
    { key: "vocab", cols: 2, judul: "Kosakata", game: "Cocokkan kata",
      format: "English = Arti" },
    { key: "spellWords", cols: 2, upper: true, judul: "Kata ejaan", game: "Susun huruf",
      format: "KATA = Arti", catatan: "Kolom kiri otomatis jadi huruf besar tanpa spasi." },
    { key: "listenWords", cols: 1, judul: "Kata listening", game: "Dengar & pilih",
      format: "Satu kata Bahasa Inggris per baris" },
    { key: "sentences", cols: 2, judul: "Kalimat", game: "Susun kalimat",
      format: "English sentence = Arti kalimat" },
    { key: "opposites", cols: 3, judul: "Lawan kata", game: "Lawan kata",
      format: "Kata = Lawannya = Keterangan" },
    { key: "plurals", cols: 3, judul: "Bentuk jamak", game: "Bentuk jamak",
      format: "Tunggal = Jamak = Arti" },
    { key: "fillBlanks", cols: 3, judul: "Isi kata kosong", game: "Isi kata kosong",
      format: "Kalimat dengan ____ = Jawaban = Arti",
      catatan: "Tulis bagian yang dikosongkan sebagai ____ (garis bawah)." },
    { key: "prepositions", cols: 3, judul: "Preposition", game: "Di mana?",
      format: "Kalimat dengan ____ = Jawaban = Arti",
      catatan: "Tulis bagian yang dikosongkan sebagai ____ (garis bawah)." },
    { key: "questionWords", cols: 3, judul: "Kata tanya", game: "Kata tanya",
      format: "Kalimat dengan ____ = Jawaban = Arti",
      catatan: "Tulis bagian yang dikosongkan sebagai ____ (garis bawah)." },
    { key: "toBe", cols: 3, judul: "To be", game: "To be",
      format: "Kalimat dengan ____ = Jawaban = Arti",
      catatan: "Jawaban biasanya am, is, atau are." },
    { key: "pronouns", cols: 3, judul: "Pronoun", game: "Pronoun",
      format: "Kalimat dengan ____ = Jawaban = Arti",
      catatan: "Contoh jawaban: I, you, he, she, it, we, they, me, him, her." },
    { key: "articles", cols: 3, judul: "Article", game: "Article",
      format: "Kalimat dengan ____ = Jawaban = Arti",
      catatan: "Jawaban biasanya a, an, atau the." },
    { key: "possessives", cols: 3, judul: "Possessive", game: "Possessive",
      format: "Kalimat dengan ____ = Jawaban = Arti",
      catatan: "Contoh jawaban: my, your, his, her, its, our, their." },
    { key: "simplePresent", cols: 3, judul: "Simple Present", game: "Simple Present",
      format: "Kalimat dengan ____ = Jawaban = Arti",
      catatan: "Latihan verb simple present, termasuk do/does dan akhiran -s/-es." },
    { key: "bodyParts", cols: 2, judul: "Bagian tubuh", game: "Bagian tubuh",
      format: "English = Arti" },
    { key: "actions", cols: 2, judul: "Kata kerja", game: "Kata kerja",
      format: "English = Arti" },
    { key: "feelings", cols: 2, judul: "Perasaan", game: "Perasaan",
      format: "English = Arti" },
    { key: "weatherWords", cols: 2, judul: "Cuaca", game: "Cuaca",
      format: "English = Arti" },
    { key: "animals", cols: 2, judul: "Nama hewan", game: "Nama hewan",
      format: "English = Arti" },
    { key: "fruits", cols: 2, judul: "Buah-buahan", game: "Buah-buahan",
      format: "English = Arti" },
    { key: "vegetables", cols: 2, judul: "Sayuran", game: "Sayuran",
      format: "English = Arti" },
    { key: "familyWords", cols: 2, judul: "Keluarga", game: "Keluarga",
      format: "English = Arti" },
    { key: "schoolWords", cols: 2, judul: "Sekolah", game: "Sekolah",
      format: "English = Arti" },
    { key: "clothesWords", cols: 2, judul: "Pakaian", game: "Pakaian",
      format: "English = Arti" },
    { key: "transportWords", cols: 2, judul: "Transportasi", game: "Transportasi",
      format: "English = Arti" },
    { key: "placeWords", cols: 2, judul: "Tempat umum", game: "Tempat umum",
      format: "English = Arti" },
    { key: "foodWords", cols: 2, judul: "Makanan", game: "Makanan",
      format: "English = Arti" },
    { key: "drinkWords", cols: 2, judul: "Minuman", game: "Minuman",
      format: "English = Arti" },
    { key: "houseWords", cols: 2, judul: "Rumah", game: "Rumah",
      format: "English = Arti" },
    { key: "jobsWords", cols: 2, judul: "Pekerjaan", game: "Pekerjaan",
      format: "English = Arti" },
    { key: "hobbyWords", cols: 2, judul: "Hobi", game: "Hobi",
      format: "English = Arti" },
    { key: "timeWords", cols: 2, judul: "Waktu", game: "Waktu",
      format: "English = Arti" },
    { key: "calendarWords", cols: 2, judul: "Kalender", game: "Kalender",
      format: "English = Arti" },
    { key: "toyWords", cols: 2, judul: "Mainan", game: "Mainan",
      format: "English = Arti" },
    { key: "sportWords", cols: 2, judul: "Olahraga", game: "Olahraga",
      format: "English = Arti" },
    { key: "natureWords", cols: 2, judul: "Alam", game: "Alam",
      format: "English = Arti" },
    { key: "colors", cols: 2, hex: true, judul: "Warna", game: "Tebak warna",
      format: "English = #KodeWarna",
      catatan: "Kolom kanan wajib kode heksadesimal, mis. #E5484D." },
    { key: "praise", cols: 1, judul: "Kalimat pujian", game: "semua game",
      format: "Satu pujian per baris", min: 1,
      catatan: "Ditampilkan acak setiap anak menjawab benar." }
  ];

  const bankId = key => "c-bank-" + key;
  const bankMin = bank => bank.min || MIN_ROWS;

  /* Baris config -> teks textarea */
  function rowsToText(rows, cols) {
    if (!Array.isArray(rows)) return "";
    if (cols === 1) return rows.join("\n");
    return rows.map(r => r.slice(0, cols).join(" = ")).join("\n");
  }

  /* Teks textarea -> baris config. Mengembalikan { rows, bad } —
     bad = nomor baris yang formatnya salah, supaya bisa dilaporkan ke admin. */
  function textToRows(text, bank) {
    const rows = [];
    const bad = [];
    text.split("\n").forEach((raw, i) => {
      const line = raw.trim();
      if (!line) return;
      const lineNo = i + 1;

      if (bank.cols === 1) { rows.push(line); return; }

      const parts = line.split("=");
      if (parts.length < bank.cols) { bad.push(lineNo); return; }
      /* Kolom berlebih digabung ke kolom terakhir, jadi tanda "=" di dalam
         teks tidak memecah baris jadi kolom baru. */
      const cells = parts.slice(0, bank.cols - 1).map(p => p.trim());
      cells.push(parts.slice(bank.cols - 1).join("=").trim());
      if (cells.some(c => !c)) { bad.push(lineNo); return; }

      if (bank.upper) cells[0] = cells[0].toUpperCase().replace(/\s+/g, "");
      if (bank.hex && !/^#[0-9a-f]{3,8}$/i.test(cells[1])) { bad.push(lineNo); return; }
      rows.push(cells);
    });
    return { rows, bad };
  }

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2400);
  }

  /* ================= AUTH ================= */
  function showLogin() {
    loginView.style.display = "block";
    panelView.style.display = "none";
    $("logout").style.display = "none";
  }
  function showPanel() {
    loginView.style.display = "none";
    panelView.style.display = "block";
    $("logout").style.display = "inline-block";
    fillForm();
  }

  $("login-form").onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    const r = await EFQ.adminLogin($("login-pass").value);
    btn.disabled = false;
    if (r.ok) {
      $("login-err").textContent = "";
      $("login-pass").value = "";
      showPanel();
    } else {
      $("login-err").textContent = r.error || "Kata sandi salah. Coba lagi.";
    }
  };

  $("logout").onclick = () => { EFQ.logout(); showLogin(); };

  /* ================= TABS ================= */
  document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      $("tab-" + tab.dataset.tab).classList.add("active");
    };
  });

  /* ================= FORM <-> CONFIG ================= */
  function renderBankCards() {
    const box = $("content-banks");
    box.innerHTML = "";
    CONTENT_BANKS.forEach(bank => {
      const card = document.createElement("div");
      card.className = "admin-card";
      card.dataset.bankCard = bank.key;
      card.innerHTML = `
        <h2>${bank.judul} <span class="sub">— game "${bank.game}"</span></h2>
        <p class="desc">
          Format: <b>${bank.format}</b>${bank.catatan ? " — " + bank.catatan : ""}
        </p>
        <div class="field"><textarea id="${bankId(bank.key)}" spellcheck="false"></textarea></div>
        <p class="note" data-bank-count="${bank.key}"></p>`;
      box.appendChild(card);
    });
  }

  function updateBankCount(bank) {
    const el = document.querySelector(`[data-bank-count="${bank.key}"]`);
    const card = document.querySelector(`[data-bank-card="${bank.key}"]`);
    if (!el || !card) return;
    const { rows, bad } = textToRows($(bankId(bank.key)).value, bank);
    const min = bankMin(bank);
    const kurang = rows.length < min;
    el.textContent = bad.length
      ? `${rows.length} baris valid — baris bermasalah: ${bad.join(", ")}`
      : kurang
        ? `${rows.length} baris — minimal ${min} baris.`
        : `${rows.length} baris.`;
    const bermasalah = bad.length > 0 || kurang;
    el.style.color = bermasalah ? "#B3372F" : "";
    card.toggleAttribute("data-bank-bad", bermasalah);
  }

  function fillForm() {
    const b = cfg.brand, s = cfg.settings, c = cfg.content;
    $("f-appName").value = b.appName;
    $("f-tagline").value = b.tagline;
    $("f-logoUrl").value = b.logoUrl.startsWith("data:") ? "" : b.logoUrl;
    $("f-footer").value = b.footerText;
    $("f-credit").checked = !!b.showCredit;
    $("f-primary").value = b.primaryColor;
    $("f-primary-hex").value = b.primaryColor;
    $("f-accent").value = b.accentColor;
    $("f-accent-hex").value = b.accentColor;
    renderLogoPreview(b.logoUrl);

    renderBankCards();
    const bawaan = (window.EFQ_DEFAULT_CONFIG || {}).content || {};
    CONTENT_BANKS.forEach(bank => {
      const ta = $(bankId(bank.key));
      /* Config lama hasil impor bisa saja belum punya bank ini — pakai isi bawaan
         supaya admin tidak menghadapi textarea kosong yang menolak disimpan. */
      const rows = c[bank.key] && c[bank.key].length ? c[bank.key] : (bawaan[bank.key] || []);
      ta.value = rowsToText(rows, bank.cols);
      ta.oninput = () => updateBankCount(bank);
      updateBankCount(bank);
    });

    $("f-perRound").value = s.questionsPerRound;

    const box = $("game-switches");
    box.innerHTML = "";
    Object.keys(GAME_INFO).forEach(id => {
      const row = document.createElement("div");
      row.className = "switch-row";
      row.innerHTML = `
        <div>
          <div class="name">${GAME_INFO[id][0]}</div>
          <div class="sub">${GAME_INFO[id][1]}</div>
        </div>
        <label class="switch">
          <input type="checkbox" data-game-toggle="${id}" ${s.games[id] !== false ? "checked" : ""} />
          <span class="knob"></span>
        </label>`;
      box.appendChild(row);
    });
  }

  function readForm() {
    cfg.brand.appName = $("f-appName").value.trim() || "Bhs Inggris";
    cfg.brand.tagline = $("f-tagline").value.trim();
    const url = $("f-logoUrl").value.trim();
    if (url) cfg.brand.logoUrl = url;
    else if (!cfg.brand.logoUrl.startsWith("data:")) cfg.brand.logoUrl = "";
    cfg.brand.footerText = $("f-footer").value.trim();
    cfg.brand.showCredit = $("f-credit").checked;
    cfg.brand.primaryColor = $("f-primary").value;
    cfg.brand.accentColor = $("f-accent").value;

    /* Bank soal hanya ditulis kalau semuanya valid — supaya penyimpanan tidak
       setengah jalan (sebagian bank tersimpan, sebagian ditolak diam-diam). */
    const errors = [];
    const parsed = {};
    CONTENT_BANKS.forEach(bank => {
      const { rows, bad } = textToRows($(bankId(bank.key)).value, bank);
      const min = bankMin(bank);
      if (bad.length) {
        errors.push(`${bank.judul}: format salah di baris ${bad.slice(0, 3).join(", ")}${bad.length > 3 ? ", …" : ""}`);
      } else if (rows.length < min) {
        errors.push(`${bank.judul}: minimal ${min} baris (sekarang ${rows.length})`);
      } else {
        parsed[bank.key] = rows;
      }
      updateBankCount(bank);
    });
    if (errors.length) return errors;
    Object.assign(cfg.content, parsed);

    cfg.settings.questionsPerRound =
      Math.max(3, Math.min(20, parseInt($("f-perRound").value, 10) || 8));
    document.querySelectorAll("[data-game-toggle]").forEach(el => {
      cfg.settings.games[el.dataset.gameToggle] = el.checked;
    });
    return [];
  }

  /* Baca form; kalau ada bank soal tidak valid, buka tab Konten soal,
     tunjukkan masalahnya, dan batalkan (config lama tidak ikut berubah). */
  function applyForm() {
    const errors = readForm();
    if (!errors.length) return true;
    document.querySelector(".tab[data-tab='konten']").click();
    const first = document.querySelector("[data-bank-bad]");
    if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    toast(errors.length === 1 ? errors[0] : `${errors[0]} (+${errors.length - 1} bank lain bermasalah)`);
    return false;
  }

  /* Cari bank soal berdasarkan nama bank atau nama game. */
  $("bank-filter").oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    CONTENT_BANKS.forEach(bank => {
      const card = document.querySelector(`[data-bank-card="${bank.key}"]`);
      if (!card) return;
      const cocok = !q ||
        bank.judul.toLowerCase().includes(q) ||
        bank.game.toLowerCase().includes(q) ||
        bank.key.toLowerCase().includes(q);
      card.style.display = cocok ? "" : "none";
    });
  };

  $("save-all").onclick = async () => {
    if (!applyForm()) return;
    $("save-all").disabled = true;
    const r = await EFQ.persistConfig(cfg);
    $("save-all").disabled = false;
    if (r.ok) {
      EFQ.applyBranding(cfg);
      toast(server ? "Tersimpan di server — berlaku untuk semua pengunjung" : "Tersimpan di browser ini");
    } else {
      toast(r.error || "Gagal menyimpan");
    }
  };

  /* ---- color pickers sync ---- */
  function bindColor(pickerId, hexId) {
    $(pickerId).oninput = () => { $(hexId).value = $(pickerId).value; };
    $(hexId).onchange = () => {
      const v = $(hexId).value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) $(pickerId).value = v;
      else $(hexId).value = $(pickerId).value;
    };
  }
  bindColor("f-primary", "f-primary-hex");
  bindColor("f-accent", "f-accent-hex");

  /* ---- logo upload ---- */
  function renderLogoPreview(src) {
    $("logo-preview").innerHTML = src
      ? `<img src="${src}" alt="Pratinjau logo" style="width:64px;height:64px;border-radius:14px;object-fit:cover;border:1.5px solid var(--line)" />
         <button class="btn ghost" id="remove-logo" style="margin-left:10px;vertical-align:top">Hapus logo</button>`
      : `<span class="note">Belum ada logo.</span>`;
    const rm = $("remove-logo");
    if (rm) rm.onclick = () => {
      cfg.brand.logoUrl = "";
      $("f-logoUrl").value = "";
      renderLogoPreview("");
    };
  }

  $("f-logoFile").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxKb = server ? 150 : 300;
    if (file.size > maxKb * 1024) { toast(`Logo terlalu besar (maks ${maxKb} KB)`); return; }
    const reader = new FileReader();
    reader.onload = () => {
      cfg.brand.logoUrl = reader.result;
      $("f-logoUrl").value = "";
      renderLogoPreview(reader.result);
      toast("Logo diunggah — jangan lupa klik Simpan");
    };
    reader.readAsDataURL(file);
  };

  /* ================= KEAMANAN ================= */
  $("change-pass").onclick = async () => {
    const cur = $("p-current").value, a = $("p-new").value, b = $("p-confirm").value;
    if (!cur) { toast("Isi kata sandi saat ini"); return; }
    if (a.length < 5) { toast("Kata sandi baru minimal 5 karakter"); return; }
    if (a !== b) { toast("Kata sandi baru tidak sama"); return; }
    $("change-pass").disabled = true;
    const r = await EFQ.changePassword(cur, a);
    $("change-pass").disabled = false;
    if (r.ok) {
      $("p-current").value = ""; $("p-new").value = ""; $("p-confirm").value = "";
      toast("Kata sandi admin diganti");
    } else {
      toast(r.error || "Gagal mengganti kata sandi");
    }
  };

  /* ================= DATA ================= */
  /* null = ada bank soal yang tidak valid; pesannya sudah ditampilkan. */
  function configForExport() {
    if (!applyForm()) return null;
    const clone = JSON.parse(JSON.stringify(cfg));
    return JSON.stringify(clone, null, 2);
  }

  $("copy-config").onclick = async () => {
    const cfgText = configForExport();
    if (!cfgText) return;
    const js =
      "/* Hasil ekspor dari panel admin — tempel (replace) seluruh isi js/config.default.js */\n" +
      "window.EFQ_DEFAULT_CONFIG = " + cfgText + ";\n";
    try {
      await navigator.clipboard.writeText(js);
      toast("Disalin! Tempel ke js/config.default.js");
    } catch (e) {
      downloadText("config.default.js", js);
    }
  };

  $("export-json").onclick = () => {
    const cfgText = configForExport();
    if (cfgText) downloadText("efq-config.json", cfgText);
  };

  $("import-json").onclick = () => $("import-file").click();
  $("import-file").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.brand || !data.content) throw new Error("format");
        data.settings = data.settings || {};
        cfg = data;
        const r = await EFQ.persistConfig(cfg);
        if (!r.ok) throw new Error(r.error);
        EFQ.applyBranding(cfg);
        fillForm();
        toast("Konfigurasi diimpor");
      } catch (err) {
        toast("File tidak valid / gagal disimpan");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  function downloadText(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  $("reset-board").onclick = async () => {
    const scope = server ? "GLOBAL (semua pengunjung)" : "di perangkat ini";
    if (confirm(`Hapus papan bintang ${scope}?`)) {
      const ok = await EFQ.clearBoard();
      toast(ok ? "Papan bintang dihapus" : "Gagal menghapus papan bintang");
    }
  };

  $("reset-room-board").onclick = async () => {
    const code = EFQ.sanitizeRoom($("reset-room-code").value);
    if (!code) { toast("Isi kode room dulu"); return; }
    const scope = server ? `room ${code} (semua pengunjung)` : `room ${code} di perangkat ini`;
    if (confirm(`Hapus papan bintang ${scope}?`)) {
      const ok = await EFQ.clearBoard(code);
      toast(ok ? `Papan room ${code} dihapus` : "Gagal menghapus papan room");
    }
  };

  $("reset-config").onclick = async () => {
    if (!confirm("Kembalikan SEMUA pengaturan ke bawaan (config.default.js)?")) return;
    EFQ.resetLocalConfig();
    cfg = JSON.parse(JSON.stringify(window.EFQ_DEFAULT_CONFIG));
    if (server) {
      const r = await EFQ.persistConfig(cfg);
      if (!r.ok) { toast(r.error || "Gagal reset di server"); return; }
    }
    EFQ.applyBranding(cfg);
    fillForm();
    toast("Pengaturan dikembalikan ke bawaan");
  };

  /* ================= INIT ================= */
  if (EFQ.isAdmin()) showPanel();
  else showLogin();
})();
