/* GET    /api/leaderboard?room=ABC          -> top 10 global / room
   POST   /api/leaderboard                  -> { name, stars, room } kirim skor
   DELETE /api/leaderboard?room=ABC (Bearer) -> kosongkan papan global / room  */
const { kv, BOARD_KEY, isAuthorized, send, readBody, serverMode } = require("./_lib.js");

function sanitizeRoom(room) {
  return String(room || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 16);
}

function roomFromUrl(req) {
  try {
    const url = new URL(req.url, "http://localhost");
    return sanitizeRoom(url.searchParams.get("room"));
  } catch (e) {
    return "";
  }
}

function boardKey(room) {
  return room ? `${BOARD_KEY}:room:${room}` : BOARD_KEY;
}

function metaKey(room) {
  return `${boardKey(room)}:meta`;
}

function cleanMeta(meta) {
  const m = meta && typeof meta === "object" ? meta : {};
  return {
    gameId: String(m.gameId || "").slice(0, 30),
    gameName: String(m.gameName || "").slice(0, 60),
    focusName: String(m.focusName || "").slice(0, 60),
    level: String(m.level || "").slice(0, 20),
    levelName: String(m.levelName || "").slice(0, 30),
    roundScore: Math.max(0, Math.min(999, parseInt(m.roundScore, 10) || 0)),
    roundTotal: Math.max(0, Math.min(999, parseInt(m.roundTotal, 10) || 0)),
    earned: Math.max(0, Math.min(999, parseInt(m.earned, 10) || 0)),
    badgeStars: Math.max(0, Math.min(3, parseInt(m.badgeStars, 10) || 0)),
    updatedAt: String(m.updatedAt || new Date().toISOString()).slice(0, 40),
  };
}

module.exports = async (req, res) => {
  if (!serverMode()) return send(res, 503, { error: "Mode server tidak aktif" });
  try {
    if (req.method === "GET") {
      const room = roomFromUrl(req);
      const raw = await kv("ZRANGE", boardKey(room), "0", "9", "REV", "WITHSCORES");
      const board = [];
      for (let i = 0; i < raw.length; i += 2) {
        let meta = {};
        try {
          const saved = await kv("HGET", metaKey(room), raw[i]);
          if (saved) meta = JSON.parse(saved);
        } catch (e) {}
        board.push({ name: raw[i], stars: parseInt(raw[i + 1], 10) || 0, ...meta });
      }
      return send(res, 200, { board, room });
    }
    if (req.method === "POST") {
      const { name, stars, room: rawRoom, meta } = await readBody(req);
      const room = sanitizeRoom(rawRoom);
      const clean = String(name || "").trim().slice(0, 20);
      const n = parseInt(stars, 10);
      if (!clean || clean.length < 2) return send(res, 400, { error: "Nama tidak valid" });
      if (!Number.isFinite(n) || n < 0 || n > 100000) {
        return send(res, 400, { error: "Skor tidak valid" });
      }
      /* GT: hanya perbarui bila skor baru lebih tinggi. */
      await kv("ZADD", boardKey(room), "GT", n, clean);
      await kv("HSET", metaKey(room), clean, JSON.stringify(cleanMeta(meta)));
      return send(res, 200, { ok: true, room });
    }
    if (req.method === "DELETE") {
      if (!(await isAuthorized(req))) return send(res, 401, { error: "Tidak berwenang" });
      const room = roomFromUrl(req);
      await kv("DEL", boardKey(room), metaKey(room));
      return send(res, 200, { ok: true });
    }
    send(res, 405, { error: "Method not allowed" });
  } catch (e) {
    send(res, 500, { error: "Terjadi kesalahan server" });
  }
};
