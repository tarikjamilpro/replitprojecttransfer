import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/humanize", async (req, res) => {
    try {
      const { text, language = "en" } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const apiKey = process.env.DEEPSEEK;
      if (!apiKey) {
        console.error("DEEPSEEK not found in environment");
        return res.status(500).json({ error: "DeepSeek API key not configured" });
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

      const client = new OpenAI({
        apiKey,
        baseURL: "https://api.deepseek.com",
      });

      const stream = await client.chat.completions.create({
        model: "deepseek-reasoner",
        messages: [
          {
            role: "user",
            content: `You are an expert writing assistant that transforms AI-generated text into natural, human-like content. Your task is to:

1. Rewrite the text to sound more natural and conversational
2. Add subtle variations in sentence structure and length
3. Include occasional colloquialisms or informal expressions where appropriate
4. Maintain the original meaning and key information
5. Make the text flow more naturally with better transitions
6. Avoid overly formal or robotic phrasing
7. Add a human touch with slight imperfections that feel natural

Output the humanized text in ${targetLanguage}. Do not include any explanations or meta-commentary - just output the humanized version of the text.

Please humanize the following text:

${text}`,
          },
        ],
        stream: true,
        max_tokens: 4096,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
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
