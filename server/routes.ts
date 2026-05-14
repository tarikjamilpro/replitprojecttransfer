import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import { readAdsConfig, writeAdsConfig } from "./db";

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

// ── HF Inference Providers — curated working text-to-image models ────────────
const HF_IMAGE_MODELS: Record<string, { url: string }> = {
  "flux-schnell": { url: "https://router.huggingface.co/fal-ai/fal-ai/flux/schnell" },
  "flux-dev":     { url: "https://router.huggingface.co/fal-ai/fal-ai/flux/dev" },
  "sdxl":         { url: "https://router.huggingface.co/fal-ai/fal-ai/fast-sdxl" },
};

const ALLOWED_IMAGE_HOSTS = new Set([
  "fal.media",
  "v2.fal.media",
  "v3.fal.media",
  "v3b.fal.media",
  "cdn.fal.ai",
]);

function isAllowedImageHost(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== "https:") return false;
    if (ALLOWED_IMAGE_HOSTS.has(u.hostname)) return true;
    return u.hostname.endsWith(".fal.media") || u.hostname.endsWith(".fal.ai");
  } catch {
    return false;
  }
}

function pickFalImageSize(width: number, height: number): string {
  if (width === height) return "square_hd";
  if (width > height) return width / height >= 1.7 ? "landscape_16_9" : "landscape_4_3";
  return height / width >= 1.7 ? "portrait_16_9" : "portrait_4_3";
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

async function fetchAsBase64(url: string): Promise<string> {
  if (!isAllowedImageHost(url)) throw new Error("Provider returned an image URL from an untrusted host.");
  const r = await fetchWithTimeout(url, {}, 30_000);
  if (!r.ok) throw new Error(`Failed to download generated image (${r.status})`);
  const buf = Buffer.from(await r.arrayBuffer());
  return buf.toString("base64");
}

async function generateImageHandler(req: any, res: any) {
  try {
    const apiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Hugging Face API key not configured (set HF_API_KEY)" });

    const {
      prompt,
      negative_prompt = "",
      model = "flux-schnell",
      steps = 30,
      guidance_scale = 7.5,
      num_images = 1,
      width = 1024,
      height = 1024,
    } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const entry = HF_IMAGE_MODELS[model];
    if (!entry) return res.status(400).json({ error: `Unknown model "${model}".` });

    const n = Math.max(1, Math.min(4, Number(num_images) || 1));
    const w = Number(width) || 1024;
    const h = Number(height) || 1024;

    const r = await fetchWithTimeout(entry.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: negative_prompt || undefined,
        image_size: pickFalImageSize(w, h),
        num_inference_steps: Number(steps) || 30,
        guidance_scale: Number(guidance_scale) || 7.5,
        num_images: n,
      }),
    }, 90_000);

    if (!r.ok) {
      const j: any = await r.json().catch(() => ({}));
      const detail = j.error || j.detail || JSON.stringify(j).slice(0, 300);
      if (r.status === 401 || r.status === 403) return res.status(502).json({ error: "Hugging Face API key is invalid or lacks access to Inference Providers." });
      if (r.status === 402) return res.status(402).json({ error: "Your Hugging Face Inference Providers credits are depleted. Add credits or upgrade to PRO at https://huggingface.co/settings/billing." });
      if (r.status === 429) return res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again." });
      return res.status(502).json({ error: `Hugging Face error (${r.status}): ${detail}` });
    }

    const data: any = await r.json();
    const urls: string[] = (data.images || []).map((img: any) => img.url).filter(Boolean);
    if (urls.length === 0) return res.status(502).json({ error: "No images returned from provider" });

    const images = await Promise.all(urls.map(fetchAsBase64));
    res.json({ images });
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "Image generation timed out. Please try again." : (err?.message || "Failed to generate images");
    console.error("/api/generate error:", msg);
    res.status(500).json({ error: msg });
  }
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

  app.post("/api/generate", generateImageHandler);

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

  return httpServer;
}
