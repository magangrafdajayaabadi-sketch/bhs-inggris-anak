/* Bhs Inggris — shared.js
   Helper bersama: deteksi mode server, API client, config, storage,
   hash password, branding. Bekerja di 2 mode:
   - MODE SERVER : database aktif (Vercel KV / Upstash) — config & papan
                   bintang global tersimpan di server.
   - MODE LOKAL  : tanpa database — semuanya di localStorage (per perangkat). */

const EFQ = (() => {
  const CONFIG_KEY = "efq_config_v1";
  const PLAYERS_KEY = "efq_players_v1";
  const SESSION_KEY = "efq_admin_session";
  const TOKEN_KEY = "efq_admin_token";

  let _server = false;
  let _cfg = null;

  /* ---------- util ---------- */
  function deepMerge(base, extra) {
    if (Array.isArray(base)) return Array.isArray(extra) ? extra : base;
    if (typeof base === "object" && base !== null) {
      const out = { ...base };
      if (typeof extra === "object" && extra !== null) {
        for (const k of Object.keys(extra)) {
          out[k] = k in base ? deepMerge(base[k], extra[k]) : extra[k];
        }
      }
      return out;
    }
    return extra !== undefined ? extra : base;
  }

  async function api(path, options = {}, timeoutMs = 4000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(path, { ...options, signal: ctrl.signal });
      const data = await r.json().catch(() => ({}));
      return { ok: r.ok, status: r.status, data };
    } catch (e) {
      return { ok: false, status: 0, data: {} };
    } finally {
      clearTimeout(t);
    }
  }

  /* ---------- init: deteksi mode + muat config ---------- */
  async function ready() {
    if (_cfg) return { cfg: _cfg, server: _server };

    const st = await api("/api/status", {}, 2500);
    _server = !!(st.ok && st.data.server);

    if (_server) {
      const r = await api("/api/config");
      const serverCfg = r.ok ? r.data.config : null;
      _cfg = deepMerge(window.EFQ_DEFAULT_CONFIG, serverCfg || {});
    } else {
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {}; } catch (e) {}
      _cfg = deepMerge(window.EFQ_DEFAULT_CONFIG, saved);
    }
    return { cfg: _cfg, server: _server };
  }

  const isServer = () => _server;

  /* ---------- config ---------- */
  async function persistConfig(cfg) {
    _cfg = cfg;
    if (_server) {
      const r = await api("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ config: cfg }),
      });
      return r.ok ? { ok: true } : { ok: false, error: r.data.error || "Gagal menyimpan ke server" };
    }
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    return { ok: true };
  }

  function resetLocalConfig() { localStorage.removeItem(CONFIG_KEY); _cfg = null; }

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /* ---------- leaderboard ---------- */
  function sanitizeRoom(room) {
    return String(room || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 16);
  }
  function roomPlayersKey(room) {
    const clean = sanitizeRoom(room);
    return clean ? `${PLAYERS_KEY}_room_${clean}` : PLAYERS_KEY;
  }
  function getLocalPlayers(room) {
    try { return JSON.parse(localStorage.getItem(roomPlayersKey(room))) || {}; } catch (e) { return {}; }
  }
  function normalizePlayerEntry(name, value) {
    if (typeof value === "number") return { name, stars: value };
    if (value && typeof value === "object") {
      return { name, ...value, stars: parseInt(value.stars, 10) || 0 };
    }
    return { name, stars: 0 };
  }
  function saveLocalPlayer(name, stars, room, meta = {}) {
    const players = getLocalPlayers(room);
    const key = name.trim();
    if (!key) return;
    const current = normalizePlayerEntry(key, players[key]);
    players[key] = {
      ...current,
      ...meta,
      stars: Math.max(current.stars || 0, stars),
      updatedAt: meta.updatedAt || current.updatedAt || new Date().toISOString(),
    };
    localStorage.setItem(roomPlayersKey(room), JSON.stringify(players));
  }
  function resetLocalPlayers(room) { localStorage.removeItem(roomPlayersKey(room)); }

  async function fetchBoard(room) {
    const cleanRoom = sanitizeRoom(room);
    if (_server) {
      const r = await api("/api/leaderboard" + (cleanRoom ? `?room=${encodeURIComponent(cleanRoom)}` : ""));
      if (r.ok) return r.data.board || [];
      return [];
    }
    return Object.entries(getLocalPlayers(cleanRoom))
      .map(([name, value]) => normalizePlayerEntry(name, value))
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 10);
  }

  async function submitScore(name, stars, room, meta = {}) {
    const cleanRoom = sanitizeRoom(room);
    saveLocalPlayer(name, stars, cleanRoom, meta);
    if (_server) {
      api("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, stars, room: cleanRoom, meta }),
      });
    }
  }

  async function clearBoard(room) {
    const cleanRoom = sanitizeRoom(room);
    resetLocalPlayers(cleanRoom);
    if (_server) {
      const r = await api("/api/leaderboard" + (cleanRoom ? `?room=${encodeURIComponent(cleanRoom)}` : ""), {
        method: "DELETE",
        headers: { Authorization: "Bearer " + getToken() },
      });
      return r.ok;
    }
    return true;
  }

  /* ---------- admin auth ---------- */
  function getToken() { return sessionStorage.getItem(TOKEN_KEY) || ""; }

  async function adminLogin(password) {
    if (_server) {
      const r = await api("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (r.ok && r.data.token) {
        sessionStorage.setItem(TOKEN_KEY, r.data.token);
        sessionStorage.setItem(SESSION_KEY, "1");
        return { ok: true };
      }
      return { ok: false, error: r.data.error || "Login gagal" };
    }
    const hash = await sha256(password);
    if (hash === _cfg.settings.adminPasswordHash) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return { ok: true };
    }
    return { ok: false, error: "Kata sandi salah" };
  }

  async function changePassword(current, newPass) {
    if (_server) {
      const r = await api("/api/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ current, newPass }),
      });
      if (r.ok && r.data.token) {
        sessionStorage.setItem(TOKEN_KEY, r.data.token);
        return { ok: true };
      }
      return { ok: false, error: r.data.error || "Gagal mengganti kata sandi" };
    }
    const curHash = await sha256(current);
    if (curHash !== _cfg.settings.adminPasswordHash) {
      return { ok: false, error: "Kata sandi saat ini salah" };
    }
    _cfg.settings.adminPasswordHash = await sha256(newPass);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(_cfg));
    return { ok: true };
  }

  function isAdmin() { return sessionStorage.getItem(SESSION_KEY) === "1"; }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }

  /* ---------- branding ---------- */
  function applyBranding(cfg) {
    const b = cfg.brand;
    const root = document.documentElement;
    root.style.setProperty("--primary", b.primaryColor);
    root.style.setProperty("--accent", b.accentColor);
    root.style.setProperty("--star", b.starColor);
    document.querySelectorAll("[data-brand='name']").forEach(el => el.textContent = b.appName);
    document.querySelectorAll("[data-brand='tagline']").forEach(el => el.textContent = b.tagline);
    document.querySelectorAll("[data-brand='footer']").forEach(el => el.textContent = b.footerText);
    document.querySelectorAll("[data-brand='logo']").forEach(el => {
      if (b.logoUrl) { el.src = b.logoUrl; el.style.display = "block"; }
      else { el.style.display = "none"; }
    });
    document.querySelectorAll("[data-brand='credit']").forEach(el => {
      el.style.display = b.showCredit ? "" : "none";
    });
    document.title = b.appName + (document.body.dataset.pageSuffix || "");
  }

  function speak(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.8;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function playAudio(src) {
    return new Promise((resolve, reject) => {
      try {
        const a = new Audio(src);
        a.onended = resolve;
        a.onerror = reject;
        const p = a.play();
        if (p && p.catch) p.catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  async function speakAi(text) {
    const clean = String(text || "").trim();
    if (!clean) return { ok: false, error: "Teks kosong" };
    const r = await api("/api/gemini-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean }),
    }, 15000);
    if (r.ok && r.data.audioDataUrl) {
      try {
        await playAudio(r.data.audioDataUrl);
        return { ok: true, provider: r.data.provider || "gemini" };
      } catch (e) {
        speak(clean);
        return { ok: false, error: "Audio AI gagal diputar" };
      }
    }
    speak(clean);
    return { ok: false, error: r.data.error || "AI voice belum aktif" };
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || "").split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function analyzeSpeech(blob, expected, level) {
    const audioBase64 = await blobToBase64(blob);
    const r = await api("/api/gemini-speaking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioBase64,
        mimeType: blob.type || "audio/webm",
        expected,
        level,
      }),
    }, 22000);
    if (r.ok && r.data) return { ok: true, ...r.data };
    return { ok: false, error: r.data.error || "AI speaking belum aktif" };
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pick = (arr, n) => shuffle(arr).slice(0, n);

  return { ready, isServer, persistConfig, resetLocalConfig, sha256,
           fetchBoard, submitScore, clearBoard,
           adminLogin, changePassword, isAdmin, logout, getToken,
           applyBranding, speak, speakAi, analyzeSpeech, shuffle, pick, sanitizeRoom };
})();
