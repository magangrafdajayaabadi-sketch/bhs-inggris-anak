/* POST /api/gemini-tts
   Body: { text }
   Requires env: GEMINI_API_KEY
   Returns: { audioDataUrl, provider } */

const { send, readBody } = require("./_lib");

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview";
const TTS_VOICE = process.env.GEMINI_TTS_VOICE || "Kore";

function findAudio(obj) {
  if (!obj || typeof obj !== "object") return null;
  if (obj.audioDataUrl) return { data: obj.audioDataUrl, mimeType: "data-url" };
  if (typeof obj.data === "string" && (obj.mimeType || obj.mime_type || obj.mediaType)) {
    return { data: obj.data, mimeType: obj.mimeType || obj.mime_type || obj.mediaType };
  }
  if (obj.inlineData && typeof obj.inlineData.data === "string") {
    return { data: obj.inlineData.data, mimeType: obj.inlineData.mimeType || "audio/wav" };
  }
  if (obj.inline_data && typeof obj.inline_data.data === "string") {
    return { data: obj.inline_data.data, mimeType: obj.inline_data.mime_type || "audio/wav" };
  }
  for (const value of Object.values(obj)) {
    const hit = Array.isArray(value)
      ? value.map(findAudio).find(Boolean)
      : findAudio(value);
    if (hit) return hit;
  }
  return null;
}

function wavBase64FromPcm(base64, mimeType) {
  const pcm = Buffer.from(base64, "base64");
  const rateMatch = String(mimeType || "").match(/rate=(\d+)/i);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]).toString("base64");
}

function audioDataUrl(audio) {
  if (audio.mimeType === "data-url") return audio.data;
  const mimeType = audio.mimeType || "audio/wav";
  if (/pcm|l16/i.test(mimeType)) {
    return `data:audio/wav;base64,${wavBase64FromPcm(audio.data, mimeType)}`;
  }
  return `data:${mimeType};base64,${audio.data}`;
}

async function requestGenerateContent(apiKey, text) {
  const r = await fetch(`${GEMINI_BASE}/models/${TTS_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `Say clearly in a friendly native English accent: ${text}` }],
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: TTS_VOICE },
          },
        },
      },
    }),
  });
  return r.json().catch(() => ({}));
}

async function requestInteractions(apiKey, text) {
  const r = await fetch(`${GEMINI_BASE}/interactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model: TTS_MODEL,
      input: `Say clearly in a friendly native English accent: ${text}`,
      response_format: { type: "audio" },
      generation_config: {
        speech_config: [{ voice: TTS_VOICE }],
      },
    }),
  });
  return r.json().catch(() => ({}));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return send(res, 503, { error: "GEMINI_API_KEY belum diset di environment server" });

  const body = await readBody(req);
  const text = String(body.text || "").trim().slice(0, 180);
  if (!text) return send(res, 400, { error: "Teks kosong" });

  try {
    let data = await requestGenerateContent(apiKey, text);
    let audio = findAudio(data);
    if (!audio) {
      data = await requestInteractions(apiKey, text);
      audio = findAudio(data);
    }
    if (!audio) return send(res, 502, { error: "Gemini belum mengembalikan audio" });
    return send(res, 200, {
      audioDataUrl: audioDataUrl(audio),
      provider: "gemini",
    });
  } catch (e) {
    return send(res, 502, { error: "Gagal menghubungi Gemini TTS" });
  }
};
