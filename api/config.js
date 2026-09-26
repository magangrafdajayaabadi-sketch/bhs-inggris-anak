/* GET  /api/config           -> config publik (tanpa hash sandi)
   POST /api/config (Bearer)  -> simpan config dari panel admin  */
const { loadConfig, saveConfigKV, currentHash, isAuthorized,
        send, readBody, publicConfig, serverMode } = require("./_lib.js");

module.exports = async (req, res) => {
  if (!serverMode()) return send(res, 503, { error: "Mode server tidak aktif" });
  try {
    if (req.method === "GET") {
      const cfg = await loadConfig();
      return send(res, 200, { config: cfg ? publicConfig(cfg) : null });
    }
    if (req.method === "POST") {
      if (!(await isAuthorized(req))) return send(res, 401, { error: "Tidak berwenang" });
      const body = await readBody(req);
      const cfg = body.config;
      if (!cfg || !cfg.brand || !cfg.content || !cfg.settings) {
        return send(res, 400, { error: "Format konfigurasi tidak valid" });
      }
      /* Hash sandi tidak boleh diubah lewat endpoint ini. */
      cfg.settings.adminPasswordHash = await currentHash();
      await saveConfigKV(cfg);
      return send(res, 200, { ok: true });
    }
    send(res, 405, { error: "Method not allowed" });
  } catch (e) {
    send(res, 500, { error: "Terjadi kesalahan server" });
  }
};
