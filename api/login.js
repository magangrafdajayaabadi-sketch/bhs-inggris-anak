/* POST /api/login  { password }  ->  { token } */
const { currentHash, makeToken, sha256, send, readBody, serverMode } = require("./_lib.js");

module.exports = async (req, res) => {
  if (!serverMode()) return send(res, 503, { error: "Mode server tidak aktif" });
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  try {
    const { password } = await readBody(req);
    if (typeof password !== "string" || !password) {
      return send(res, 400, { error: "Kata sandi wajib diisi" });
    }
    const hash = await currentHash();
    if (sha256(password) !== hash) {
      return send(res, 401, { error: "Kata sandi salah" });
    }
    send(res, 200, { token: makeToken(hash) });
  } catch (e) {
    send(res, 500, { error: "Terjadi kesalahan server" });
  }
};
