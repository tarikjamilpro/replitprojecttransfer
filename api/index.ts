import express, { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import { Pool } from "pg";

const app = express();

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// ── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_ADS_CONFIG = {
  interstitial: { active: true, activeProvider: "adsterra" },
  directLinks: { adsterra: "", monetag: "", custom: "" },
  bannerScripts: { adsterra: "", monetag: "", custom: "" },
};

let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return _pool;
}

async function readAdsConfig(): Promise<object> {
  try {
    const result = await getPool().query("SELECT config FROM ads_config WHERE id = 1");
    return result.rows[0]?.config ?? DEFAULT_ADS_CONFIG;
  } catch (err) {
    console.error("readAdsConfig DB error:", err);
    return DEFAULT_ADS_CONFIG;
  }
}

async function writeAdsConfig(data: object): Promise<void> {
  await getPool().query(
    `INSERT INTO ads_config (id, config, updated_at)
     VALUES (1, $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET config = $1::jsonb, updated_at = NOW()`,
    [JSON.stringify(data)]
  );
}

function getJwtSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD env var is not set");
  return secret + "_jwt";
}

function verifyAdminToken(authHeader: string | undefined): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    jwt.verify(authHeader.slice(7), getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

// ── Admin routes ──────────────────────────────────────────────────────────────

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    return res.status(401).json({ error: "Incorrect Password. Access Denied." });
  }
  try {
    const token = jwt.sign({ role: "admin" }, getJwtSecret(), { expiresIn: "8h" });
    res.json({ token });
  } catch {
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.get("/api/ads", async (_req, res) => {
  try {
    res.json(await readAdsConfig());
  } catch {
    res.status(500).json({ error: "Failed to read ad config" });
  }
});

app.post("/api/ads/update", async (req, res) => {
  if (!verifyAdminToken(req.headers.authorization)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    await writeAdsConfig(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("POST /api/ads/update error:", err);
    res.status(500).json({ error: "Failed to save ad config", message: String(err) });
  }
});

// ── AI Detection ──────────────────────────────────────────────────────────────

app.post("/api/ai-detection", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") return res.status(400).json({ error: "Text is required" });
    if (text.trim().split(/\s+/).length > 2000) return res.status(400).json({ error: "Text exceeds 2000 word limit" });

    const deepseek = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" });
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: `You are an AI content detection expert. Analyze the provided text and determine if it was written by AI or a human.\n\nRespond ONLY with a valid JSON object:\n{"aiScore":<0-100>,"humanScore":<0-100>,"analysis":"<2-3 sentences>","confidence":"<high|medium|low>","details":{"patternScore":<0-100>,"vocabularyScore":<0-100>,"structureScore":<0-100>}}` },
        { role: "user", content: `Analyze this text:\n\n${text}` },
      ],
      max_tokens: 500,
    });
    const content = response.choices[0]?.message?.content || "";
    try {
      res.json(JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim()));
    } catch {
      res.json({ aiScore: 50, humanScore: 50, analysis: "Unable to perform detailed analysis.", confidence: "low", details: { patternScore: 50, vocabularyScore: 50, structureScore: 50 } });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Failed to analyze content" });
  }
});

// ── Paraphrase ────────────────────────────────────────────────────────────────

app.post("/api/paraphrase", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") return res.status(400).json({ error: "Text is required" });
    if (text.trim().split(/\s+/).length > 2000) return res.status(400).json({ error: "Text exceeds 2000 word limit" });

    const deepseek = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" });
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a professional paraphrasing tool. Rewrite the provided text maintaining meaning but using different words and structures. Only output the paraphrased text." },
        { role: "user", content: text },
      ],
      max_tokens: 2000,
    });
    res.json({ paraphrased: response.choices[0]?.message?.content || "" });
  } catch {
    res.status(500).json({ error: "Failed to paraphrase content" });
  }
});

// ── YouTube Tags ──────────────────────────────────────────────────────────────

app.post("/api/youtube-tags", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") return res.status(400).json({ error: "YouTube URL is required" });

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/;
    if (!youtubeRegex.test(url.trim())) return res.status(400).json({ error: "Invalid YouTube URL" });

    let videoId = "";
    try {
      const parsed = new URL(url.includes("://") ? url : `https://${url}`);
      if (parsed.hostname === "youtu.be") videoId = parsed.pathname.slice(1);
      else if (parsed.pathname.includes("/shorts/")) videoId = parsed.pathname.split("/shorts/")[1]?.split(/[/?]/)[0] || "";
      else videoId = parsed.searchParams.get("v") || "";
    } catch { return res.status(400).json({ error: "Could not parse YouTube URL" }); }

    if (!videoId) return res.status(400).json({ error: "Could not extract video ID" });

    let videoTitle = "";
    try {
      const oEmbed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (oEmbed.ok) videoTitle = ((await oEmbed.json()) as any).title || "";
    } catch {}

    if (!videoTitle) return res.status(400).json({ error: "Could not fetch video information." });

    const deepseek = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" });
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: 'You are a YouTube SEO expert. Generate exactly 20 relevant tags for the video. Respond ONLY with JSON: {"tags":["tag1","tag2",...]}' },
        { role: "user", content: `Generate YouTube SEO tags for: "${videoTitle}"` },
      ],
      max_tokens: 500,
    });
    const content = response.choices[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
      res.json({ tags: parsed.tags || [], videoTitle });
    } catch {
      res.status(500).json({ error: "Failed to parse tags response" });
    }
  } catch {
    res.status(500).json({ error: "Failed to generate tags" });
  }
});

// ── Humanize (bytez.js — dynamic import to avoid ESM bundling issues) ─────────

app.post("/api/humanize", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;
    if (!text || typeof text !== "string") return res.status(400).json({ error: "Text is required" });
    if (text.trim().split(/\s+/).length > 2000) return res.status(400).json({ error: "Text exceeds 2000 word limit" });

    const apiKey = process.env.BYTEZ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Bytez API key not configured" });

    const languageNames: Record<string, string> = { en: "English", es: "Spanish", fr: "French", de: "German", pt: "Portuguese", it: "Italian", nl: "Dutch", zh: "Chinese", ja: "Japanese" };
    const targetLanguage = languageNames[language] || "English";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { default: Bytez } = await import("bytez.js");
    const sdk = new Bytez(apiKey);
    const model = sdk.model("zai-org/GLM-4.5-Air");

    const prompt = `You are an expert writing assistant that transforms AI-generated text into natural, human-like content. Rewrite the text naturally, maintaining meaning but sounding more human.\n\nOutput the humanized text in ${targetLanguage}. Output only the humanized text:\n\n${text}`;

    const result = await model.run([{ role: "user", content: prompt }]);
    if (result.error) throw new Error(result.error);

    let outputText = "";
    const output = result.output;
    if (typeof output === "string") outputText = output;
    else if (Array.isArray(output)) outputText = output.find((m: any) => m.role === "assistant")?.content || JSON.stringify(output);
    else if (output && typeof output === "object") outputText = (output as any).content || (output as any).message || (output as any).text || JSON.stringify(output);

    if (outputText) res.write(`data: ${JSON.stringify({ content: outputText })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    if (!res.headersSent) res.status(500).json({ error: err?.message || "Failed to humanize text" });
    else { res.write(`data: ${JSON.stringify({ error: "Failed to humanize text" })}\n\n`); res.end(); }
  }
});

// ── Fetch URL content ─────────────────────────────────────────────────────────

app.post("/api/fetch-url-content", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") return res.status(400).json({ error: "URL is required" });
    let parsedUrl: URL;
    try { parsedUrl = new URL(url); } catch { return res.status(400).json({ error: "Invalid URL format" }); }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) return res.status(400).json({ error: "Only HTTP/HTTPS URLs are allowed" });
    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
    if (blockedHosts.some(h => parsedUrl.hostname.includes(h))) return res.status(400).json({ error: "This URL is not allowed" });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    clearTimeout(timeout);
    if (!response.ok) throw new Error("Failed to fetch URL");
    const text = await response.text();
    res.json({ content: text.slice(0, 50000) });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch URL content" });
  }
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

export default app;
