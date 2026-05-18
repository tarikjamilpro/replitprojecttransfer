import express, { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import { Pool } from "pg";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { signupUserSchema, loginUserSchema } from "../shared/schema";

const scrypt = promisify(scryptCb) as (password: string, salt: string, keylen: number) => Promise<Buffer>;

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

// ── ai_prompts table helpers ─────────────────────────────────────────────────

let _promptsTableReady: Promise<void> | null = null;
function ensureAiPromptsTable(): Promise<void> {
  if (!_promptsTableReady) {
    _promptsTableReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS ai_prompts (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           title TEXT NOT NULL,
           description TEXT NOT NULL,
           image_url TEXT NOT NULL,
           meigen_target_link TEXT NOT NULL,
           created_at TIMESTAMP NOT NULL DEFAULT NOW(),
           updated_at TIMESTAMP NOT NULL DEFAULT NOW()
         )`
      )
      .then(() => undefined)
      .catch((err) => { _promptsTableReady = null; throw err; });
  }
  return _promptsTableReady;
}

function rowToPrompt(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    meigenTargetLink: row.meigen_target_link,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const promptInputSchema = {
  validate(body: any, partial: boolean) {
    const errors: string[] = [];
    const fields = ["title", "description", "imageUrl", "meigenTargetLink"];
    const out: any = {};
    for (const f of fields) {
      const v = body?.[f];
      if (v === undefined) {
        if (!partial) errors.push(`${f} is required`);
        continue;
      }
      if (typeof v !== "string" || !v.trim()) { errors.push(`${f} must be a non-empty string`); continue; }
      const trimmed = v.trim();
      if ((f === "imageUrl" || f === "meigenTargetLink")) {
        try { new URL(trimmed); } catch { errors.push(`${f} must be a valid URL`); continue; }
      }
      if (f === "title" && trimmed.length > 200) errors.push("title too long");
      if (f === "description" && trimmed.length > 2000) errors.push("description too long");
      out[f] = trimmed;
    }
    return errors.length ? { ok: false as const, errors } : { ok: true as const, data: out };
  },
};

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

// ── User signup / login ───────────────────────────────────────────────────────

let _usersTableReady: Promise<void> | null = null;
function ensureUsersTable(): Promise<void> {
  if (!_usersTableReady) {
    _usersTableReady = (async () => {
      const db = getPool();
      await db.query(
        `CREATE TABLE IF NOT EXISTS users (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           username TEXT NOT NULL UNIQUE,
           password TEXT NOT NULL
         )`
      );
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`);
      await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW()`);
      await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique ON users (LOWER(username))`).catch(() => {});
      await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email)) WHERE email IS NOT NULL`).catch(() => {});
    })().catch((err) => { _usersTableReady = null; throw err; });
  }
  return _usersTableReady;
}

async function hashPasswordApi(plain: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = await scrypt(plain, salt, 64);
  return `${salt}:${buf.toString("hex")}`;
}
async function verifyPasswordApi(plain: string, stored: string): Promise<boolean> {
  try {
    const [salt, hashHex] = stored.split(":");
    if (!salt || !hashHex) return false;
    const hashBuf = Buffer.from(hashHex, "hex");
    const testBuf = await scrypt(plain, salt, hashBuf.length);
    return hashBuf.length === testBuf.length && timingSafeEqual(hashBuf, testBuf);
  } catch { return false; }
}
function rowToPublicUser(row: any) {
  return { id: row.id, username: row.username, firstName: row.first_name ?? null, lastName: row.last_name ?? null, email: row.email ?? "" };
}

app.post("/api/auth/signup", async (req, res) => {
  try {
    const parsed = signupUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || "Invalid input" });
    }
    await ensureUsersTable();
    const db = getPool();
    const id = parsed.data.username.toLowerCase();
    const existing = await db.query(
      `SELECT 1 FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $2 LIMIT 1`,
      [id, parsed.data.email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Username or email already exists" });
    }
    const hashed = await hashPasswordApi(parsed.data.password);
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, username, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, username, email`,
      [parsed.data.firstName, parsed.data.lastName, parsed.data.username, parsed.data.email, hashed]
    );
    res.status(201).json({ success: true, message: "Account created successfully!", user: rowToPublicUser(result.rows[0]) });
  } catch (err: any) {
    console.error("signup error:", err?.message || err);
    const msg = String(err?.message || "");
    const code = err?.code;
    if (code === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
      return res.status(409).json({ success: false, message: "Username or email already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const parsed = loginUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid input" });
    await ensureUsersTable();
    const id = parsed.data.username.trim().toLowerCase();
    const result = await getPool().query(
      `SELECT id, first_name, last_name, username, email, password FROM users
       WHERE LOWER(username) = $1 OR LOWER(email) = $1 LIMIT 1`,
      [id]
    );
    const row = result.rows[0];
    if (!row || !(await verifyPasswordApi(parsed.data.password, row.password))) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }
    res.json({ success: true, user: rowToPublicUser(row) });
  } catch (err: any) {
    console.error("user login error:", err?.message || err);
    res.status(500).json({ success: false, message: "Server error" });
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

// ── Prompt Manager ────────────────────────────────────────────────────────────

app.get("/api/prompts", async (_req, res) => {
  try {
    await ensureAiPromptsTable();
    const result = await getPool().query(
      `SELECT id, title, description, image_url, meigen_target_link, created_at, updated_at
       FROM ai_prompts ORDER BY created_at DESC`
    );
    res.json(result.rows.map(rowToPrompt));
  } catch (err) {
    console.error("GET /api/prompts error:", err);
    res.status(500).json({ error: "Failed to load prompts" });
  }
});

app.get("/api/prompts/:id", async (req, res) => {
  try {
    await ensureAiPromptsTable();
    const result = await getPool().query(
      `SELECT id, title, description, image_url, meigen_target_link, created_at, updated_at
       FROM ai_prompts WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Prompt not found" });
    res.json(rowToPrompt(result.rows[0]));
  } catch (err) {
    console.error("GET /api/prompts/:id error:", err);
    res.status(500).json({ error: "Failed to load prompt" });
  }
});

app.post("/api/prompts", async (req, res) => {
  if (!verifyAdminToken(req.headers.authorization)) return res.status(401).json({ error: "Unauthorized" });
  const v = promptInputSchema.validate(req.body, false);
  if (!v.ok) return res.status(400).json({ error: "Invalid data", details: v.errors });
  try {
    await ensureAiPromptsTable();
    const r = await getPool().query(
      `INSERT INTO ai_prompts (title, description, image_url, meigen_target_link)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, image_url, meigen_target_link, created_at, updated_at`,
      [v.data.title, v.data.description, v.data.imageUrl, v.data.meigenTargetLink]
    );
    res.status(201).json(rowToPrompt(r.rows[0]));
  } catch (err) {
    console.error("POST /api/prompts error:", err);
    res.status(500).json({ error: "Failed to create prompt" });
  }
});

app.patch("/api/prompts/:id", async (req, res) => {
  if (!verifyAdminToken(req.headers.authorization)) return res.status(401).json({ error: "Unauthorized" });
  const v = promptInputSchema.validate(req.body, true);
  if (!v.ok) return res.status(400).json({ error: "Invalid data", details: v.errors });
  try {
    await ensureAiPromptsTable();
    const map: Record<string, string> = {
      title: "title", description: "description", imageUrl: "image_url", meigenTargetLink: "meigen_target_link",
    };
    const setClauses: string[] = []; const values: any[] = []; let i = 1;
    for (const [k, col] of Object.entries(map)) {
      if (v.data[k] !== undefined) { setClauses.push(`${col} = $${i++}`); values.push(v.data[k]); }
    }
    if (setClauses.length === 0) {
      const cur = await getPool().query(
        `SELECT id, title, description, image_url, meigen_target_link, created_at, updated_at FROM ai_prompts WHERE id = $1`,
        [req.params.id]
      );
      if (!cur.rows[0]) return res.status(404).json({ error: "Prompt not found" });
      return res.json(rowToPrompt(cur.rows[0]));
    }
    setClauses.push(`updated_at = NOW()`);
    values.push(req.params.id);
    const r = await getPool().query(
      `UPDATE ai_prompts SET ${setClauses.join(", ")} WHERE id = $${i}
       RETURNING id, title, description, image_url, meigen_target_link, created_at, updated_at`,
      values
    );
    if (!r.rows[0]) return res.status(404).json({ error: "Prompt not found" });
    res.json(rowToPrompt(r.rows[0]));
  } catch (err) {
    console.error("PATCH /api/prompts/:id error:", err);
    res.status(500).json({ error: "Failed to update prompt" });
  }
});

app.delete("/api/prompts/:id", async (req, res) => {
  if (!verifyAdminToken(req.headers.authorization)) return res.status(401).json({ error: "Unauthorized" });
  try {
    await ensureAiPromptsTable();
    const r = await getPool().query(`DELETE FROM ai_prompts WHERE id = $1`, [req.params.id]);
    if ((r.rowCount ?? 0) === 0) return res.status(404).json({ error: "Prompt not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/prompts/:id error:", err);
    res.status(500).json({ error: "Failed to delete prompt" });
  }
});

// ── OpenRouter (single LLM provider for ALL AI calls) ────────────────────────

const OPENROUTER_MODEL = "openrouter/auto";

function getOpenRouter(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://digibesttools.site",
      "X-Title": "Digi Best Tools",
    },
  });
}

// ── AI Detection ──────────────────────────────────────────────────────────────

app.post("/api/ai-detection", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") return res.status(400).json({ error: "Text is required" });
    if (text.trim().split(/\s+/).length > 2000) return res.status(400).json({ error: "Text exceeds 2000 word limit" });

    const response = await getOpenRouter().chat.completions.create({
      model: OPENROUTER_MODEL,
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
    console.error("ai-detection error:", err?.message || err);
    res.status(500).json({ error: "Failed to analyze content" });
  }
});

// ── Content Optimizer (Titles + Tags + Hashtags + Caption) ───────────────────

app.post("/api/content-optimizer", async (req, res) => {
  try {
    const { topic } = req.body || {};
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required" });
    }
    if (topic.length > 500) {
      return res.status(400).json({ error: "Topic too long (max 500 chars)" });
    }

    const systemPrompt = `You are an expert SEO & Viral Content Strategist for YouTube, Instagram, TikTok, and blogs.

Return ONLY valid JSON. No markdown, no code fences, no commentary.

Use this EXACT structure:
{
  "titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
  "seo_tags": "tag1, tag2, tag3, ... (15-20 comma separated tags, lowercase, no #)",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 ... (10-15 hashtags separated by spaces, each prefixed with #)",
  "caption": "Start with a powerful hook. Write a short, engaging caption max 80 words. Use 2-3 emojis. End with a clear CTA."
}

Rules:
- Exactly 5 titles, each 40-70 characters, click-worthy and SEO-optimized.
- 15-20 SEO tags relevant to the topic, comma separated, lowercase.
- 10-15 hashtags, mix of broad + niche, each starting with #.
- Caption must START with a strong hook (question, bold claim, or "POV:"), include 2-3 relevant emojis, and END with a clear CTA.
- Output ONLY the JSON object. No prose before or after.`;

    const r = await getOpenRouter().chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Topic: ${topic.trim()}` },
      ],
      temperature: 0.8,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    let content = (r.choices[0]?.message?.content || "").trim();
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(502).json({ error: "AI returned invalid JSON. Please try again." });
    }

    const titles = Array.isArray(parsed.titles)
      ? parsed.titles.filter((t: any) => typeof t === "string" && t.trim().length > 0).slice(0, 5)
      : [];
    const result = {
      titles,
      seo_tags: typeof parsed.seo_tags === "string" ? parsed.seo_tags.trim() : "",
      hashtags: typeof parsed.hashtags === "string" ? parsed.hashtags.trim() : "",
      caption: typeof parsed.caption === "string" ? parsed.caption.trim() : "",
    };

    if (titles.length < 5 || !result.seo_tags || !result.hashtags || !result.caption) {
      return res.status(502).json({ error: "AI response was incomplete. Please try again." });
    }

    res.json(result);
  } catch (err: any) {
    console.error("content-optimizer error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate content. Please try again." });
  }
});

// ── Enhance Prompt (AI Image Prompt Generator) ────────────────────────────────

app.post("/api/enhance-prompt", async (req, res) => {
  try {
    const { idea, model } = req.body;
    if (!idea || typeof idea !== "string") return res.status(400).json({ error: "Idea is required" });
    const targetModel = (typeof model === "string" && model.trim()) || "Midjourney";

    const systemPrompt = `You are an expert AI image prompt engineer. Transform a user's basic idea into a single, professional, highly-detailed prompt optimized for "${targetModel}".\n\nRules:\n- Output ONLY the final prompt text. No labels, no explanations, no markdown, no quotes.\n- Include specifics on subject, composition, lighting, color palette, mood, camera/lens (if photographic), art style, and quality modifiers.\n- Tailor the structure and modifiers to the conventions of "${targetModel}" (e.g., Midjourney uses --ar and --v flags; Stable Diffusion uses comma-separated tags with weights; DALL-E 3 prefers natural language descriptions; Flux prefers detailed natural language).\n- Keep the prompt under 150 words. Do not invent unrelated subjects.`;

    const r = await getOpenRouter().chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Basic idea: ${idea}` },
      ],
      max_tokens: 600,
      temperature: 0.8,
    });
    const prompt = (r.choices[0]?.message?.content || "").trim();
    if (!prompt) return res.status(502).json({ error: "AI service unavailable" });
    res.json({ prompt });
  } catch (err: any) {
    console.error("enhance-prompt error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate prompt", message: err?.message || String(err) });
  }
});

// ── Paraphrase ────────────────────────────────────────────────────────────────

app.post("/api/paraphrase", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") return res.status(400).json({ error: "Text is required" });
    if (text.trim().split(/\s+/).length > 2000) return res.status(400).json({ error: "Text exceeds 2000 word limit" });

    const response = await getOpenRouter().chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: "You are a professional paraphrasing tool. Rewrite the provided text maintaining meaning but using different words and structures. Only output the paraphrased text." },
        { role: "user", content: text },
      ],
      max_tokens: 2000,
    });
    res.json({ paraphrased: response.choices[0]?.message?.content || "" });
  } catch (err: any) {
    console.error("paraphrase error:", err?.message || err);
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

    const response = await getOpenRouter().chat.completions.create({
      model: OPENROUTER_MODEL,
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
  } catch (err: any) {
    console.error("youtube-tags error:", err?.message || err);
    res.status(500).json({ error: "Failed to generate tags" });
  }
});

// ── Humanize ──────────────────────────────────────────────────────────────────

app.post("/api/humanize", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;
    if (!text || typeof text !== "string") return res.status(400).json({ error: "Text is required" });
    if (text.trim().split(/\s+/).length > 2000) return res.status(400).json({ error: "Text exceeds 2000 word limit" });

    const languageNames: Record<string, string> = { en: "English", es: "Spanish", fr: "French", de: "German", pt: "Portuguese", it: "Italian", nl: "Dutch", zh: "Chinese", ja: "Japanese" };
    const targetLanguage = languageNames[language] || "English";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemPrompt = `You are an expert writing assistant that transforms AI-generated text into natural, human-like content. Rewrite naturally, vary sentence structure, maintain the original meaning, and avoid robotic phrasing. Output the humanized text in ${targetLanguage}. Output ONLY the humanized text — no explanations or meta-commentary.`;

    const response = await getOpenRouter().chat.completions.create({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    });
    const outputText = (response.choices[0]?.message?.content || "").trim();

    if (outputText) res.write(`data: ${JSON.stringify({ content: outputText })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("humanize error:", err?.message || err);
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
