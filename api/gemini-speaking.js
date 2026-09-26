/* POST /api/gemini-speaking
   Body: { audioBase64, mimeType, expected, level }
   Requires env: GEMINI_API_KEY
   Returns: { heard, score, correct, feedback } */

const { send, readBody } = require("./_lib");

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const SPEAKING_MODEL = process.env.GEMINI_SPEAKING_MODEL || "gemini-3.1-flash-lite";

function parseJsonText(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch (e) { return null; }
}

function outputText(data) {
  if (!data || typeof data !== "object") return "";
  if (typeof data.output_text === "string") return data.output_text;
  if (typeof data.text === "string") return data.text;
  const parts = data.candidates && data.candidates[0] &&
    data.candidates[0].content && data.candidates[0].content.parts;
  if (Array.isArray(parts)) return parts.map(p => p.text || "").join("\n");
  return "";
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return send(res, 503, { error: "GEMINI_API_KEY belum diset di environment server" });

  const body = await readBody(req);
  const audioBase64 = String(body.audioBase64 || "");
  const mimeType = String(body.mimeType || "audio/webm").slice(0, 80);
  const expected = String(body.expected || "").trim().slice(0, 80);
  const level = String(body.level || "beginner").trim().slice(0, 40);

  if (!audioBase64 || !expected) return send(res, 400, { error: "Audio atau target kata kosong" });

  const prompt = [
    "You are a friendly English pronunciation teacher for Indonesian children.",
    `Target word or phrase: "${expected}". Level: ${level}.`,
    "Listen to the audio. Grade only pronunciation similarity to the target.",
    "Return strict JSON only with keys:",
    '{"heard":"what you heard","score":0-100,"correct":true/false,"feedback":"short Indonesian feedback, max 18 words"}',
    "Use correct=true when score is 70 or higher.",
  ].join("\n");

  try {
    const r = await fetch(`${GEMINI_BASE}/models/${SPEAKING_MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: audioBase64 } },
          ],
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return send(res, 502, { error: "Gemini speaking gagal memproses audio" });

    const parsed = parseJsonText(outputText(data));
    if (!parsed) return send(res, 502, { error: "Respons Gemini tidak valid" });

    const score = clampScore(parsed.score);
    return send(res, 200, {
      heard: String(parsed.heard || "").slice(0, 120),
      score,
      correct: Boolean(parsed.correct) || score >= 70,
      feedback: String(parsed.feedback || "Coba ucapkan lebih jelas.").slice(0, 160),
    });
  } catch (e) {
    return send(res, 502, { error: "Gagal menghubungi Gemini speaking" });
  }
};
