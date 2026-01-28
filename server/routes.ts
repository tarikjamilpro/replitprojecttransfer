import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Bytez from "bytez.js";
import OpenAI from "openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

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

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
        max_completion_tokens: 500,
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

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
        max_completion_tokens: 2000,
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

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt.length < 3) {
        return res.status(400).json({ error: "Prompt is too short. Please provide a more detailed description." });
      }

      if (trimmedPrompt.length > 500) {
        return res.status(400).json({ error: "Prompt is too long. Maximum 500 characters allowed." });
      }

      const apiKey = process.env.BYTEZ_API_KEY;
      if (!apiKey) {
        console.error("BYTEZ_API_KEY not found in environment");
        return res.status(500).json({ error: "Bytez API key not configured" });
      }

      const response = await fetch("https://api.bytez.com/model/v1/black-forest-labs/FLUX.1-dev/infer", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: trimmedPrompt,
          debug: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bytez API error:", response.status, errorText);
        return res.status(500).json({ error: "Failed to generate image. The model may be unavailable." });
      }

      const contentType = response.headers.get("content-type") || "";
      console.log("Response content-type:", contentType);

      if (contentType.includes("image")) {
        const arrayBuffer = await response.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = contentType.split(";")[0] || "image/png";
        const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
        
        console.log("Image base64 length:", base64Image.length);
        
        if (base64Image.length < 100) {
          return res.status(500).json({ error: "Image generation returned invalid data. Please try again." });
        }
        
        res.json({ 
          success: true, 
          image: imageDataUrl,
          prompt: trimmedPrompt
        });
      } else {
        const result = await response.json();
        console.log("Bytez JSON result:", JSON.stringify(result).substring(0, 500));
        
        if (result.error) {
          console.error("Bytez image generation error:", result.error);
          return res.status(500).json({ error: result.error || "Failed to generate image." });
        }

        if (result.output) {
          let base64Image: string;
          
          if (Array.isArray(result.output) && result.output.length > 0) {
            const imageData = result.output[0];
            if (typeof imageData === "string") {
              base64Image = imageData.startsWith("data:") ? imageData.split(",")[1] : imageData;
            } else {
              base64Image = Buffer.from(imageData).toString("base64");
            }
          } else if (typeof result.output === "string") {
            base64Image = result.output.startsWith("data:") ? result.output.split(",")[1] : result.output;
          } else {
            console.log("Unexpected output format:", typeof result.output);
            return res.status(500).json({ error: "Unexpected image format received." });
          }

          if (base64Image.length < 100) {
            console.error("Base64 image too small:", base64Image.length);
            return res.status(500).json({ error: "Image generation returned invalid data. Please try again." });
          }

          const imageDataUrl = `data:image/png;base64,${base64Image}`;
          
          res.json({ 
            success: true, 
            image: imageDataUrl,
            prompt: trimmedPrompt
          });
        } else {
          console.log("No output in result");
          res.status(500).json({ error: "No image was generated. Please try a different prompt." });
        }
      }
    } catch (error: any) {
      console.error("Error generating image:", error?.message || error);
      res.status(500).json({ error: "Failed to generate image. Please try again later." });
    }
  });

  app.post("/api/humanize", async (req, res) => {
    try {
      const { text, language = "en" } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const apiKey = process.env.BYTEZ_API_KEY;
      if (!apiKey) {
        console.error("BYTEZ_API_KEY not found in environment");
        return res.status(500).json({ error: "Bytez API key not configured" });
      }

      const wordCount = text.trim().split(/\s+/).length;
      if (wordCount > 2000) {
        return res.status(400).json({ error: "Text exceeds 2000 word limit" });
      }

      const languageNames: Record<string, string> = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        pt: "Portuguese",
        it: "Italian",
        nl: "Dutch",
        zh: "Chinese",
        ja: "Japanese",
      };

      const targetLanguage = languageNames[language] || "English";

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const sdk = new Bytez(apiKey);
      const model = sdk.model("zai-org/GLM-4.5-Air");

      const prompt = `You are an expert writing assistant that transforms AI-generated text into natural, human-like content. Your task is to:

1. Rewrite the text to sound more natural and conversational
2. Add subtle variations in sentence structure and length
3. Include occasional colloquialisms or informal expressions where appropriate
4. Maintain the original meaning and key information
5. Make the text flow more naturally with better transitions
6. Avoid overly formal or robotic phrasing
7. Add a human touch with slight imperfections that feel natural

Output the humanized text in ${targetLanguage}. Do not include any explanations or meta-commentary - just output the humanized version of the text.

Please humanize the following text:

${text}`;

      const result = await model.run([
        {
          role: "user",
          content: prompt,
        },
      ]);

      if (result.error) {
        throw new Error(result.error);
      }

      // Extract text content from the response
      let outputText = "";
      const output = result.output;
      
      if (typeof output === "string") {
        outputText = output;
      } else if (Array.isArray(output)) {
        // If it's an array of messages, extract the assistant's content
        const assistantMessage = output.find((msg: any) => msg.role === "assistant");
        outputText = assistantMessage?.content || JSON.stringify(output);
      } else if (output && typeof output === "object") {
        // If it's an object, try to get content or message
        outputText = output.content || output.message || output.text || JSON.stringify(output);
      }
      
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

  return httpServer;
}
