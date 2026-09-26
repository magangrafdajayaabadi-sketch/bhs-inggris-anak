/* Bhs Inggris — pwa.js
   Dua tugas:
   1. Daftarkan service worker (offline + cache app shell).
   2. Tawarkan "Pasang aplikasi" lewat popup sendiri, bukan banner bawaan
      browser — supaya bahasanya ramah anak & bisa diatur kapan munculnya.

   Perilaku popup:
   - Muncul hanya di halaman anak (bukan admin) dan hanya kalau app
     belum terpasang.
   - Chrome/Edge/Android : pakai event `beforeinstallprompt`.
   - iOS Safari          : event itu tidak ada, jadi tampilkan panduan
                           "Bagikan -> Tambah ke Layar Utama".
   - "Nanti saja" menunda 5 hari; setelah 3 kali ditolak, berhenti menawarkan.
   Tombol manual: elemen apa pun dengan atribut [data-pwa-install]. */

(() => {
  "use strict";

  const SNOOZE_KEY = "efq_pwa_snooze_until";
  const DISMISS_KEY = "efq_pwa_dismiss_count";
  const SNOOZE_DAYS = 5;
  const MAX_DISMISS = 3;
  const SHOW_DELAY_MS = 12000;      // beri waktu main dulu sebelum ditawari
  const IOS_DELAY_MS = 25000;       // panduan manual lebih sabar lagi

  const isAdminPage = /admin\.html?$/i.test(location.pathname);

  /* ---------- storage aman (mode privat bisa melempar error) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  /* ---------- deteksi lingkungan ---------- */
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  // WebView / browser dalam aplikasi lain tidak punya menu "Tambah ke Layar Utama".
  const isIOSSafari = isIOS && !/crios|fxios|edgios|opt\/|fbav|instagram|line\//i.test(ua);

  function isInstalled() {
    const modes = ["standalone", "minimal-ui", "window-controls-overlay", "fullscreen"];
    if (modes.some(m => window.matchMedia(`(display-mode: ${m})`).matches)) return true;
    if (navigator.standalone === true) return true;
    return document.referrer.startsWith("android-app://");
  }

  function isSnoozed() {
    const until = parseInt(store.get(SNOOZE_KEY), 10);
    return Number.isFinite(until) && Date.now() < until;
  }

  function snooze(days) {
    store.set(SNOOZE_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000));
  }

  function countDismiss() {
    const n = (parseInt(store.get(DISMISS_KEY), 10) || 0) + 1;
    store.set(DISMISS_KEY, String(n));
    // Sudah ditolak berkali-kali: jangan ganggu lagi (±10 tahun).
    snooze(n >= MAX_DISMISS ? 3650 : SNOOZE_DAYS);
  }

  function clearNudges() {
    store.del(SNOOZE_KEY);
    store.del(DISMISS_KEY);
  }

  function appName() {
    const el = document.querySelector("[data-brand='name']");
    const name = (el && el.textContent || "").trim();
    return name || "Bhs Inggris";
  }

  /* ---------- toast ringan (index.html tidak punya elemen toast) ---------- */
  let toastTimer = 0;
  function toast(msg, action) {
    let box = document.getElementById("pwa-toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "pwa-toast";
      box.className = "toast pwa-toast";
      box.setAttribute("role", "status");
      document.body.appendChild(box);
    }
    box.textContent = "";
    const text = document.createElement("span");
    text.textContent = msg;
    box.appendChild(text);
    if (action) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "toast-action";
      btn.textContent = action.label;
      btn.addEventListener("click", action.onClick);
      box.appendChild(btn);
    }
    requestAnimationFrame(() => box.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove("show"), action ? 12000 : 4000);
  }

  /* ---------- popup install ---------- */
  let deferredPrompt = null;
  let popup = null;
  let popupShown = false;

  function buildPopup(mode) {
    const el = document.createElement("div");
    el.className = "pwa-install" + (mode === "ios" ? " pwa-install-ios" : "");
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-labelledby", "pwa-install-title");

    const name = appName();
    const steps = mode === "ios"
      ? `<ol class="pwa-install-steps">
           <li>Ketuk tombol <b>Bagikan</b> <span class="pwa-share" aria-hidden="true">&#9757;</span> di bawah layar.</li>
           <li>Pilih <b>Add to Home Screen</b> / <b>Tambah ke Layar Utama</b>.</li>
           <li>Ketuk <b>Add</b> — selesai!</li>
         </ol>`
      : "";
    const actions = mode === "ios"
      ? `<button type="button" class="btn ghost compact" data-pwa-act="later">Oke, mengerti</button>`
      : `<button type="button" class="btn" data-pwa-act="install">Pasang Sekarang</button>
         <button type="button" class="btn ghost" data-pwa-act="later">Nanti saja</button>`;

    el.innerHTML = `
      <button type="button" class="pwa-install-x" data-pwa-act="later" aria-label="Tutup ajakan pasang">&times;</button>
      <div class="pwa-install-head">
        <img class="pwa-install-icon" src="/icons/icon-192.png" alt="" />
        <div>
          <h3 id="pwa-install-title">Pasang ${name}</h3>
          <p>Main langsung dari layar utama, tanpa buka browser — dan tetap jalan waktu internet mati!</p>
        </div>
      </div>
      ${steps}
      <div class="pwa-install-actions">${actions}</div>
    `;

    el.addEventListener("click", e => {
      const act = e.target.closest("[data-pwa-act]");
      if (!act) return;
      if (act.dataset.pwaAct === "install") acceptInstall();
      else dismissPopup(true);
    });
    return el;
  }

  function onKeydown(e) {
    if (e.key === "Escape" && popup) dismissPopup(true);
  }

  function showPopup(mode, manual) {
    if (popup || isInstalled()) return;
    if (!manual && (popupShown || isSnoozed())) return;
    popupShown = true;
    popup = buildPopup(mode);
    document.body.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add("show"));
    document.addEventListener("keydown", onKeydown);
    // Sengaja tidak merebut fokus: popup ini non-modal dan bisa muncul
    // saat anak sedang mengetik namanya.
  }

  function hidePopup() {
    if (!popup) return;
    const el = popup;
    popup = null;
    document.removeEventListener("keydown", onKeydown);
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }

  function dismissPopup(byUser) {
    if (byUser) countDismiss();
    hidePopup();
  }

  async function acceptInstall() {
    if (!deferredPrompt) { hidePopup(); return; }
    const promptEvent = deferredPrompt;
    deferredPrompt = null;              // event hanya boleh dipakai sekali
    hidePopup();
    try {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === "accepted") clearNudges();
      else snooze(SNOOZE_DAYS);
    } catch (e) {
      snooze(SNOOZE_DAYS);
    }
    syncTriggers();
  }

  /* Tombol manual di halaman ([data-pwa-install]) disembunyikan
     selama belum ada cara memasang. */
  function syncTriggers() {
    const usable = !isInstalled() && (!!deferredPrompt || isIOSSafari);
    document.querySelectorAll("[data-pwa-install]").forEach(el => {
      el.hidden = !usable;
    });
  }

  document.addEventListener("click", e => {
    const target = e.target;
    const trigger = target && target.closest && target.closest("[data-pwa-install]");
    if (!trigger) return;
    e.preventDefault();
    if (deferredPrompt) acceptInstall();
    else if (isIOSSafari) showPopup("ios", true);
    else toast("Aplikasi sudah terpasang atau browser ini belum mendukungnya");
  });

  /* ---------- pemicu ---------- */
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();               // tahan banner bawaan, pakai popup sendiri
    deferredPrompt = e;
    syncTriggers();
    if (isAdminPage) return;
    setTimeout(() => showPopup("prompt", false), SHOW_DELAY_MS);
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    clearNudges();
    hidePopup();
    syncTriggers();
    toast("Aplikasi terpasang! Cek layar utama ya 🎉");
  });

  if (isIOSSafari && !isAdminPage) {
    setTimeout(() => showPopup("ios", false), IOS_DELAY_MS);
  }

  document.addEventListener("DOMContentLoaded", syncTriggers);

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA tetap bisa dibuka normal walau browser menolak service worker.
      });
    });

    // sw.js memakai skipWaiting(), jadi versi baru langsung aktif.
    // Halaman yang sedang terbuka masih memakai aset lama sampai dimuat ulang.
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      toast("Versi baru sudah siap", {
        label: "Muat ulang",
        onClick: () => location.reload(),
      });
    });
  }

  window.EFQ_PWA = {
    isInstalled,
    canInstall: () => !!deferredPrompt || isIOSSafari,
    promptInstall: () => {
      if (deferredPrompt) return acceptInstall();
      if (isIOSSafari) showPopup("ios", true);
    },
    resetNudges: clearNudges,
  };
})();
