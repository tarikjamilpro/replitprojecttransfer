import { useState, useEffect, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Wand2,
  Loader2,
  ImageIcon,
  Download,
  Copy,
  RefreshCw,
  Ban,
  AlignLeft,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

declare global {
  interface Window {
    puter?: {
      ai: {
        txt2img: (prompt: string, options?: any) => Promise<HTMLImageElement | { src: string }>;
      };
    };
  }
}

const ASPECT_RATIOS = [
  { name: "1:1", width: 1024, height: 1024, label: "1:1 Square" },
  { name: "16:9", width: 1280, height: 720, label: "16:9 Landscape" },
  { name: "9:16", width: 720, height: 1280, label: "9:16 Portrait" },
  { name: "4:3", width: 1024, height: 768, label: "4:3 Standard" },
];

const NUM_IMAGES = [1, 2, 3, 4];

const MODEL = "wan-ai/wan2.6-image";

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [numImages, setNumImages] = useState(2);
  const [aspect, setAspect] = useState(ASPECT_RATIOS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<{ src: string; prompt: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();

  const runGenerate = useCallback(async () => {
    const p = prompt.trim();
    const np = negativePrompt.trim();
    if (!p) {
      toast({ title: "Please enter a prompt", description: "Describe the image you want to generate.", variant: "destructive" });
      return;
    }
    if (typeof window === "undefined" || !window.puter?.ai?.txt2img) {
      const msg = "Puter.js is still loading. Please wait a moment and try again.";
      setError(msg);
      toast({ title: "Not ready", description: msg, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setImages([]);
    setError(null);
    try {
      const tasks = Array.from({ length: numImages }, () =>
        window.puter!.ai.txt2img(p, {
          model: MODEL,
          negative_prompt: np || undefined,
          width: aspect.width,
          height: aspect.height,
          quality: "high",
        }),
      );
      const results = await Promise.all(tasks);
      const srcs = results
        .map((r: any) => (typeof r === "string" ? r : r?.src))
        .filter(Boolean) as string[];
      if (srcs.length === 0) throw new Error("No images returned from Puter.js");
      setImages(srcs.map((src) => ({ src, prompt: p })));
      toast({ title: "Success", description: `${srcs.length} image${srcs.length > 1 ? "s" : ""} generated.` });
    } catch (err: any) {
      const msg = err?.message || "Failed to generate images. Please try again.";
      setError(msg);
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, negativePrompt, numImages, aspect, toast]);

  const handleGenerate = () => requestAction(runGenerate);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const downloadImage = async (src: string, idx: number) => {
    try {
      const a = document.createElement("a");
      a.href = src;
      a.download = `wan-ai-${Date.now()}-${idx + 1}.png`;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: "Downloaded", description: "Image saved to your device." });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Prompt copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <ToolPageLayout
      title="Wan AI Image Generator"
      description="Generate stunning AI images for free using the Wan 2.6 model via Puter.js. No API key, no signup, unlimited generations right in your browser."
      toolPath="/ai-image-generator"
      howToUse={
        <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
          <li>Type a detailed prompt describing the image you want — include subject, style, lighting, and mood for best results.</li>
          <li>Optionally add a negative prompt to specify what you do not want in the image (e.g. "blurry, watermark, deformed").</li>
          <li>Pick how many images to generate (1–4) and choose an aspect ratio.</li>
          <li>Click <em>Generate</em>, or press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> (or <kbd>⌘</kbd>+<kbd>Enter</kbd> on Mac).</li>
          <li>Download your favorite results, copy the prompt, or regenerate variations.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel */}
        <Card className="lg:col-span-5 lg:sticky lg:top-6 lg:self-start">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>Powered by Wan 2.6 via Puter.js · Free & Unlimited</span>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground mb-2">
                <AlignLeft className="w-3.5 h-3.5" /> PROMPT
              </label>
              <Textarea
                data-testid="input-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cyberpunk samurai standing on a neon rooftop at night, cinematic lighting, highly detailed"
                className="resize-y"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground mb-2">
                <Ban className="w-3.5 h-3.5" /> NEGATIVE PROMPT (optional)
              </label>
              <Textarea
                data-testid="input-negative-prompt"
                rows={2}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, low quality, deformed, ugly, watermark"
                className="resize-y"
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wide text-muted-foreground mb-2 block">
                NUMBER OF IMAGES
              </label>
              <div className="grid grid-cols-4 gap-2">
                {NUM_IMAGES.map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={numImages === n ? "default" : "outline"}
                    onClick={() => setNumImages(n)}
                    data-testid={`button-num-${n}`}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wide text-muted-foreground mb-2 block">
                ASPECT RATIO
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((a) => (
                  <Button
                    key={a.name}
                    type="button"
                    variant={aspect.name === a.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspect(a)}
                    data-testid={`button-aspect-${a.name}`}
                    className="text-xs"
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              data-testid="button-generate"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating {numImages} image{numImages > 1 ? "s" : ""}...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Generate with Wan AI</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground border">Ctrl</kbd>
              {" + "}<kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground border">Enter</kbd> to generate
            </p>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-7 min-h-[600px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground">
                <ImageIcon className="w-3.5 h-3.5" /> GENERATED IMAGES
              </label>
              {images.length > 0 && (
                <span className="text-xs text-muted-foreground" data-testid="text-result-count">
                  {images.length} image{images.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium">Wan AI is generating your images...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take 10–30 seconds.</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
                <p className="text-sm font-medium text-destructive">Generation Failed</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">{error}</p>
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground">Your generated images will appear here</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Enter a prompt and click Generate</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={`${img.src}-${idx}`}
                    className="group relative rounded-xl overflow-hidden border bg-muted"
                    data-testid={`card-image-${idx}`}
                  >
                    <img
                      src={img.src}
                      alt={`Generated image ${idx + 1}`}
                      className="w-full h-auto block"
                      crossOrigin="anonymous"
                    />
                    <div className="px-3 py-2 flex flex-wrap items-center gap-2 bg-card border-t">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => downloadImage(img.src, idx)}
                        className="flex-1 min-w-[80px]"
                        data-testid={`button-download-${idx}`}
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPrompt(img.prompt)}
                        className="flex-1 min-w-[80px]"
                        data-testid={`button-copy-prompt-${idx}`}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerate}
                        className="flex-1 min-w-[80px]"
                        data-testid={`button-regenerate-${idx}`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Regen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AdInterstitial isOpen={showInterstitial} onContinue={handleContinue} />
    </ToolPageLayout>
  );
}
