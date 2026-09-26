/* POST /api/password (Bearer)  { current, newPass } -> { token } baru */
const { loadConfig, saveConfigKV, currentHash, isAuthorized, makeToken,
        sha256, send, readBody, serverMode } = require("./_lib.js");

module.exports = async (req, res) => {
  if (!serverMode()) return send(res, 503, { error: "Mode server tidak aktif" });
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    if (!(await isAuthorized(req))) return send(res, 401, { error: "Tidak berwenang" });
    const { current, newPass } = await readBody(req);
    const hash = await currentHash();
    if (typeof current !== "string" || sha256(current) !== hash) {
      return send(res, 401, { error: "Kata sandi saat ini salah" });
    }
    if (typeof newPass !== "string" || newPass.length < 5) {
      return send(res, 400, { error: "Kata sandi baru minimal 5 karakter" });
    }
    const cfg = (await loadConfig()) || { brand: {}, settings: {}, content: {} };
    cfg.settings = cfg.settings || {};
    cfg.settings.adminPasswordHash = sha256(newPass);
    await saveConfigKV(cfg);
    send(res, 200, { token: makeToken(cfg.settings.adminPasswordHash) });
  } catch (e) {
    send(res, 500, { error: "Terjadi kesalahan server" });
  }
};
