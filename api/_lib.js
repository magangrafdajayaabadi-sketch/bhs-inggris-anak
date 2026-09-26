/* Bhs Inggris — api/_lib.js
   Helper bersama untuk serverless functions (Vercel).
   File berawalan "_" tidak menjadi endpoint. */

const crypto = require("crypto");

/* Hash SHA-256 dari "admin123" — sandi bawaan bila belum diganti. */
const DEFAULT_HASH =
  "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";

const CONFIG_KEY = "efq:config";
const BOARD_KEY = "efq:board";

/* ---------- Upstash Redis / Vercel KV (REST) ---------- */
function kvCreds() {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  return url && token ? { url, token } : null;
}

async function kv(...command) {
  const creds = kvCreds();
  if (!creds) throw new Error("KV belum dikonfigurasi");
  const r = await fetch(creds.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command.map(String)),
  });
  if (!r.ok) throw new Error(`KV error ${r.status}`);
  const data = await r.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

const serverMode = () => kvCreds() !== null;

/* ---------- Config tersimpan ---------- */
async function loadConfig() {
  const raw = await kv("GET", CONFIG_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
async function saveConfigKV(cfg) {
  await kv("SET", CONFIG_KEY, JSON.stringify(cfg));
}
async function currentHash() {
  const cfg = await loadConfig();
  return (cfg && cfg.settings && cfg.settings.adminPasswordHash) || DEFAULT_HASH;
}

/* ---------- Auth token (stateless) ---------- */
function secret(hash) {
  return process.env.ADMIN_SECRET || "efq-secret-" + hash;
}
function makeToken(hash) {
  return crypto.createHmac("sha256", secret(hash)).update("efq-admin").digest("hex");
}
async function isAuthorized(req) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return false;
  const hash = await currentHash();
  const expected = makeToken(hash);
  return (
    token.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  );
}
const sha256 = (t) => crypto.createHash("sha256").update(t).digest("hex");

/* ---------- HTTP util ---------- */
function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > 2000000) req.destroy(); });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch (e) { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

/* Buang hash sandi sebelum config dikirim ke publik. */
function publicConfig(cfg) {
  const clone = JSON.parse(JSON.stringify(cfg));
  if (clone.settings) delete clone.settings.adminPasswordHash;
  return clone;
}

module.exports = {
  DEFAULT_HASH, CONFIG_KEY, BOARD_KEY,
  kv, serverMode, loadConfig, saveConfigKV, currentHash,
  makeToken, isAuthorized, sha256, send, readBody, publicConfig,
};
