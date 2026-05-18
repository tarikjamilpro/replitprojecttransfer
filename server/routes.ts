import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import {
  readAdsConfig,
  writeAdsConfig,
  listAiPrompts,
  getAiPrompt,
  createAiPrompt,
  updateAiPrompt,
  deleteAiPrompt,
  listDigitalProducts,
  getDigitalProduct,
  createDigitalProduct,
  updateDigitalProduct,
  deleteDigitalProduct,
} from "./db";
import {
  insertAiPromptSchema, updateAiPromptSchema,
  insertDigitalProductSchema, updateDigitalProductSchema,
} from "@shared/schema";

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

function getJwtSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not set");
  return secret + "_jwt";
}

function verifyAdminToken(authHeader: string | undefined): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  try {
    jwt.verify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const openrouter = getOpenRouter();

  app.post("/api/ai-detection", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const wordCount = text.trim().split(/\s+/).length;
      if (wordCount > 2000) {
        return res.status(400).json({ error: "Text exceeds 2000 word limit" });
      }

      const response = await openrouter.chat.completions.create({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: `You are an AI content detection expert. Analyze the provided text and determine if it was written by AI or a human. Consider:
1. Writing patterns and consistency
2. Vocabulary complexity and variation
3. Sentence structure and flow
4. Natural imperfections vs. mechanical precision
5. Topic transitions and coherence

Respond ONLY with a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "aiScore": <number 0-100>,
  "humanScore": <number 0-100>,
  "analysis": "<brief 2-3 sentence analysis>",
  "confidence": "<high|medium|low>",
  "details": {
    "patternScore": <number 0-100>,
    "vocabularyScore": <number 0-100>,
    "structureScore": <number 0-100>
  }
}

The aiScore and humanScore should add up to 100.`
          },
          {
            role: "user",
            content: `Analyze this text for AI-generated content:\n\n${text}`
          }
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || "";
      let result;
      
      try {
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
        result = JSON.parse(cleanContent);
      } catch {
        result = {
          aiScore: 50,
          humanScore: 50,
          analysis: "Unable to perform detailed analysis. The text shows mixed characteristics.",
          confidence: "low",
          details: { patternScore: 50, vocabularyScore: 50, structureScore: 50 }
        };
      }

      res.json(result);
    } catch (error: any) {
      console.error("Error in AI detection:", error?.message || error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  app.post("/api/paraphrase", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const wordCount = text.trim().split(/\s+/).length;
      if (wordCount > 2000) {
        return res.status(400).json({ error: "Text exceeds 2000 word limit" });
      }

      const response = await openrouter.chat.completions.create({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a professional paraphrasing tool. Rewrite the provided text while:
1. Maintaining the original meaning and intent
2. Using different words and sentence structures
3. Keeping the same tone and formality level
4. Preserving key information and facts
5. Making the text flow naturally

Only output the paraphrased text, nothing else.`
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 2000,
      });

      const paraphrased = response.choices[0]?.message?.content || "";
      res.json({ paraphrased });
    } catch (error: any) {
      console.error("Error in paraphrasing:", error?.message || error);
      res.status(500).json({ error: "Failed to paraphrase content" });
    }
  });

  app.post("/api/fetch-url-content", async (req, res) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL is required" });
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: "Only HTTP/HTTPS URLs are allowed" });
      }

      const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254."];
      if (blockedHosts.some(h => parsedUrl.hostname.includes(h))) {
        return res.status(400).json({ error: "This URL is not allowed" });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, { 
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; DigiTools/1.0)" }
        });
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error("Failed to fetch URL");
        }

        const html = await response.text();
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 10000);

        res.json({ content: textContent });
      } catch (fetchError: any) {
        clearTimeout(timeout);
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Error fetching URL:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch URL content" });
    }
  });

  app.post("/api/humanize", async (req, res) => {
    try {
      const { text, language = "en" } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const wordCount = text.trim().split(/\s+/).length;
      if (wordCount > 2000) {
        return res.status(400).json({ error: "Text exceeds 2000 word limit" });
      }

      const languageNames: Record<string, string> = {
        en: "English", es: "Spanish", fr: "French", de: "German",
        pt: "Portuguese", it: "Italian", nl: "Dutch", zh: "Chinese", ja: "Japanese",
      };
      const targetLanguage = languageNames[language] || "English";

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const systemPrompt = `You are an expert writing assistant that transforms AI-generated text into natural, human-like content. Rewrite the text to sound more natural and conversational, vary sentence structure, include occasional colloquialisms, maintain the original meaning, and avoid robotic phrasing. Output the humanized text in ${targetLanguage}. Output ONLY the humanized text — no explanations or meta-commentary.`;

      const response = await openrouter.chat.completions.create({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      });

      const outputText = (response.choices[0]?.message?.content || "").trim();

      if (outputText) {
        res.write(`data: ${JSON.stringify({ content: outputText })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Error humanizing text:", error?.message || error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to humanize text" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: error?.message || "Failed to humanize text" });
      }
    }
  });

  app.post("/api/youtube-tags", async (req, res) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "YouTube URL is required" });
      }

      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/;
      if (!youtubeRegex.test(url.trim())) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      let videoId = "";
      try {
        const parsed = new URL(url.includes("://") ? url : `https://${url}`);
        if (parsed.hostname === "youtu.be") {
          videoId = parsed.pathname.slice(1);
        } else if (parsed.pathname.includes("/shorts/")) {
          videoId = parsed.pathname.split("/shorts/")[1]?.split(/[/?]/)[0] || "";
        } else {
          videoId = parsed.searchParams.get("v") || "";
        }
      } catch {
        return res.status(400).json({ error: "Could not parse YouTube URL" });
      }

      if (!videoId) {
        return res.status(400).json({ error: "Could not extract video ID from URL" });
      }

      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      let videoTitle = "";

      try {
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json() as any;
          videoTitle = oembedData.title || "";
        }
      } catch {
        // oembed failed, try page scraping
      }

      if (!videoTitle) {
        try {
          const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; DigiTools/1.0)" },
          });
          if (pageRes.ok) {
            const html = await pageRes.text();
            const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
            if (titleMatch) {
              videoTitle = titleMatch[1].replace(/ - YouTube$/, "").trim();
            }
          }
        } catch {
          // page fetch also failed
        }
      }

      if (!videoTitle) {
        return res.status(400).json({ error: "Could not fetch video information. Please check the URL and try again." });
      }

      const tagPrompt = [
        {
          role: "system" as const,
          content: `You are a YouTube SEO expert. Given a YouTube video title, generate relevant SEO tags/keywords that would help the video rank better in YouTube search. 

Rules:
- Generate exactly 20 tags
- Tags should be a mix of broad and specific keywords
- Include both short-tail and long-tail keywords
- Tags should be relevant to the video topic
- Do NOT include hashtags or special characters
- Each tag should be 1-4 words

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{"tags": ["tag1", "tag2", ...]}`
        },
        {
          role: "user" as const,
          content: `Generate YouTube SEO tags for this video:\n\nTitle: "${videoTitle}"`
        }
      ];

      let content = "";

      try {
        const response = await openrouter.chat.completions.create({
          model: OPENROUTER_MODEL,
          messages: tagPrompt,
          max_tokens: 500,
        });
        content = response.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.error("OpenRouter tag generation failed:", err?.message);
        return res.status(500).json({ error: "Failed to generate tags. Please try again." });
      }

      if (!content) {
        return res.status(500).json({ error: "Failed to generate tags. Please try again." });
      }

      let tags: string[] = [];

      try {
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleanContent);
        tags = Array.isArray(parsed.tags) ? parsed.tags : [];
      } catch {
        const tagMatches = content.match(/"([^"]+)"/g);
        if (tagMatches) {
          tags = tagMatches.map(t => t.replace(/"/g, "")).filter(t => t.length > 0 && t.length < 50);
        }
      }

      if (tags.length === 0) {
        return res.status(500).json({ error: "Failed to generate tags. Please try again." });
      }

      res.json({ title: videoTitle, tags });
    } catch (error: any) {
      console.error("Error extracting YouTube tags:", error?.message || error);
      res.status(500).json({ error: "Failed to extract tags. Please try again." });
    }
  });

  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { idea, model } = req.body;
      if (!idea || typeof idea !== "string") {
        return res.status(400).json({ error: "Idea is required" });
      }
      const targetModel = (typeof model === "string" && model.trim()) || "Midjourney";

      const systemPrompt = `You are an expert AI image prompt engineer. Transform a user's basic idea into a single, professional, highly-detailed prompt optimized for "${targetModel}".

Rules:
- Output ONLY the final prompt text. No labels, no explanations, no markdown, no quotes.
- Include specifics on subject, composition, lighting, color palette, mood, camera/lens (if photographic), art style, and quality modifiers.
- Tailor the structure and modifiers to the conventions of "${targetModel}" (e.g., Midjourney uses --ar and --v flags; Stable Diffusion uses comma-separated tags with weights; DALL-E 3 prefers natural language descriptions; Flux prefers detailed natural language).
- Keep the prompt under 150 words. Do not invent unrelated subjects.`;

      const r = await openrouter.chat.completions.create({
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
    } catch (error: any) {
      console.error("Error in enhance-prompt:", error?.message || error);
      res.status(500).json({ error: "Failed to generate prompt", message: error?.message || String(error) });
    }
  });

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
- Caption must START with a strong hook (question, bold claim, or "POV:"), include 2-3 relevant emojis, and END with a clear CTA (e.g., "Save this", "Comment below", "Follow for more").
- Output ONLY the JSON object. No prose before or after.`;

      const r = await openrouter.chat.completions.create({
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

  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      return res.status(401).json({ error: "Incorrect Password. Access Denied." });
    }

    try {
      const token = jwt.sign({ role: "admin" }, getJwtSecret(), { expiresIn: "8h" });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  // ── User signup / login ───────────────────────────────────────────────────
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { signupUserSchema } = await import("@shared/schema");
      const parsed = signupUserSchema.safeParse(req.body);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        return res.status(400).json({ success: false, message: first?.message || "Invalid input" });
      }
      const { createUserAccount, findUserByUsernameOrEmail } = await import("./db");
      const existsByUsername = await findUserByUsernameOrEmail(parsed.data.username);
      if (existsByUsername) return res.status(409).json({ success: false, message: "Username already taken" });
      const existsByEmail = await findUserByUsernameOrEmail(parsed.data.email);
      if (existsByEmail) return res.status(409).json({ success: false, message: "Email already registered" });
      const user = await createUserAccount(parsed.data);
      res.status(201).json({ success: true, message: "Account created successfully!", user });
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
      const { loginUserSchema } = await import("@shared/schema");
      const parsed = loginUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid input" });
      }
      const { loginUserAccount } = await import("./db");
      const user = await loginUserAccount(parsed.data.username, parsed.data.password);
      if (!user) return res.status(401).json({ success: false, message: "Invalid username or password" });
      res.json({ success: true, user });
    } catch (err: any) {
      console.error("user login error:", err?.message || err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/ads", async (_req, res) => {
    try {
      const config = await readAdsConfig();
      res.json(config);
    } catch (err) {
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
      res.status(500).json({ error: "Failed to save ad config" });
    }
  });

  // ── Prompt Manager — public endpoints ──────────────────────────────────────

  app.get("/api/prompts", async (_req, res) => {
    try {
      const prompts = await listAiPrompts();
      res.json(prompts);
    } catch (err) {
      console.error("GET /api/prompts error:", err);
      res.status(500).json({ error: "Failed to load prompts" });
    }
  });

  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const prompt = await getAiPrompt(req.params.id);
      if (!prompt) return res.status(404).json({ error: "Prompt not found" });
      res.json(prompt);
    } catch (err) {
      console.error("GET /api/prompts/:id error:", err);
      res.status(500).json({ error: "Failed to load prompt" });
    }
  });

  // ── Prompt Manager — admin CRUD ────────────────────────────────────────────

  app.post("/api/prompts", async (req, res) => {
    if (!verifyAdminToken(req.headers.authorization)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const parsed = insertAiPromptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
    }
    try {
      const created = await createAiPrompt(parsed.data);
      res.status(201).json(created);
    } catch (err) {
      console.error("POST /api/prompts error:", err);
      res.status(500).json({ error: "Failed to create prompt" });
    }
  });

  app.patch("/api/prompts/:id", async (req, res) => {
    if (!verifyAdminToken(req.headers.authorization)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const parsed = updateAiPromptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
    }
    try {
      const updated = await updateAiPrompt(req.params.id, parsed.data);
      if (!updated) return res.status(404).json({ error: "Prompt not found" });
      res.json(updated);
    } catch (err) {
      console.error("PATCH /api/prompts/:id error:", err);
      res.status(500).json({ error: "Failed to update prompt" });
    }
  });

  app.delete("/api/prompts/:id", async (req, res) => {
    if (!verifyAdminToken(req.headers.authorization)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const ok = await deleteAiPrompt(req.params.id);
      if (!ok) return res.status(404).json({ error: "Prompt not found" });
      res.json({ success: true });
    } catch (err) {
      console.error("DELETE /api/prompts/:id error:", err);
      res.status(500).json({ error: "Failed to delete prompt" });
    }
  });

  // ── Digital Products (Store) — public ────────────────────────────────────

  app.get("/api/store/products", async (_req, res) => {
    try {
      const products = await listDigitalProducts();
      res.json(products);
    } catch (err) {
      console.error("GET /api/store/products error:", err);
      res.status(500).json({ error: "Failed to load products" });
    }
  });

  // ── Digital Products — admin CRUD ─────────────────────────────────────────

  app.get("/api/store/admin/products", async (req, res) => {
    if (!verifyAdminToken(req.headers.authorization)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const products = await listDigitalProducts();
      res.json(products);
    } catch (err) {
      console.error("GET /api/store/admin/products error:", err);
      res.status(500).json({ error: "Failed to load products" });
    }
  });

  app.post("/api/store/admin/products", async (req, res) => {
    if (!verifyAdminToken(req.headers.authorization)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const parsed = insertDigitalProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
    }
    try {
      const created = await createDigitalProduct(parsed.data);
      res.status(201).json(created);
    } catch (err) {
      console.error("POST /api/store/admin/products error:", err);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/store/admin/products/:id", async (req, res) => {
    if (!verifyAdminToken(req.headers.authorization)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid id" });
    }
    const parsed = updateDigitalProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
    }
    try {
      const updated = await updateDigitalProduct(id, parsed.data);
      if (!updated) return res.status(404).json({ error: "Product not found" });
      res.json(updated);
    } catch (err) {
      console.error("PATCH /api/store/admin/products/:id error:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/store/admin/products/:id", async (req, res) => {
    if (!verifyAdminToken(req.headers.authorization)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid id" });
    }
    try {
      const ok = await deleteDigitalProduct(id);
      if (!ok) return res.status(404).json({ error: "Product not found" });
      res.json({ success: true });
    } catch (err) {
      console.error("DELETE /api/store/admin/products/:id error:", err);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  return httpServer;
}
