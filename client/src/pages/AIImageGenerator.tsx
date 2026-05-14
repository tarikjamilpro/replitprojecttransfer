import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Wand2,
  Loader2,
  ImageIcon,
  Download,
  Copy,
  RefreshCw,
  ChevronDown,
  Ban,
  AlignLeft,
  Bot,
  Maximize2,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

const HF_MODELS = [
  { value: "flux-schnell", label: "FLUX.1 Schnell (Fast)" },
  { value: "flux-dev", label: "FLUX.1 Dev (High Quality)" },
  { value: "sdxl", label: "Stable Diffusion XL (Fast)" },
];

const ASPECT_RATIOS = [
  { ratio: "1:1", width: 1024, height: 1024, label: "1:1 Square" },
  { ratio: "16:9", width: 1024, height: 576, label: "16:9 Landscape" },
  { ratio: "9:16", width: 576, height: 1024, label: "9:16 Portrait" },
  { ratio: "4:3", width: 1024, height: 768, label: "4:3 Standard" },
];

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState(HF_MODELS[0].value);
  const [aspect, setAspect] = useState(ASPECT_RATIOS[0]);
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(7.5);
  const [numImages, setNumImages] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();

  const runGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", description: "Describe the image you want to generate.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setImages([]);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim(),
          model,
          steps,
          guidance_scale: guidance,
          num_images: numImages,
          width: aspect.width,
          height: aspect.height,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }
      const data = await res.json();
      if (!data.images || data.images.length === 0) throw new Error("No images returned from server");
      setImages(data.images);
      toast({ title: "Success", description: `${data.images.length} image${data.images.length > 1 ? "s" : ""} generated.` });
    } catch (err: any) {
      const msg = err?.message || "Failed to generate images";
      setError(msg);
      toast({ title: "Generation failed", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => requestAction(runGenerate);

  const downloadImage = (base64: string, index: number) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64}`;
    link.download = `ai-image-${Date.now()}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloaded", description: "Image saved to your device." });
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({ title: "Copied", description: "Prompt copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <ToolPageLayout
      title="AI Image Generator"
      description="Generate stunning AI images from text prompts using Hugging Face models including Stable Diffusion XL, FLUX, and more. Free, fast, and easy."
      toolPath="/ai-image-generator"
      howToUse={
        <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
          <li>Type a detailed prompt describing the image you want to create — include subject, style, lighting, and mood for best results.</li>
          <li>Optionally add a negative prompt to specify what you do not want in the image (e.g. "blurry, watermark, deformed").</li>
          <li>Pick a model: FLUX.1 Schnell is fastest, FLUX.1 Dev produces the highest quality, SDXL is great for photorealism.</li>
          <li>Choose an aspect ratio that matches where you'll use the image (1:1 for social, 16:9 for banners, 9:16 for stories).</li>
          <li>Open Advanced Settings to fine-tune steps, guidance scale, or generate up to 4 images at once.</li>
          <li>Click Generate, then download your favorite results as PNG.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel */}
        <Card className="lg:col-span-5 lg:sticky lg:top-6 lg:self-start">
          <CardContent className="p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground mb-2">
                <AlignLeft className="w-3.5 h-3.5" /> PROMPT
              </label>
              <Textarea
                data-testid="input-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A majestic cyberpunk samurai standing on a neon rooftop at night, cinematic lighting, highly detailed"
                className="resize-y"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground mb-2">
                <Ban className="w-3.5 h-3.5" /> NEGATIVE PROMPT
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
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground mb-2">
                <Bot className="w-3.5 h-3.5" /> MODEL
              </label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger data-testid="select-model"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HF_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground mb-2">
                <Maximize2 className="w-3.5 h-3.5" /> ASPECT RATIO
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((a) => (
                  <Button
                    key={a.ratio}
                    type="button"
                    variant={aspect.ratio === a.ratio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspect(a)}
                    data-testid={`button-aspect-${a.ratio}`}
                    className="text-xs"
                  >
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground transition"
                data-testid="button-toggle-advanced"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> ADVANCED SETTINGS
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="space-y-5 pt-4 mt-2 border-t">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Steps</span>
                      <span className="font-mono text-primary">{steps}</span>
                    </div>
                    <Slider value={[steps]} min={10} max={60} step={1} onValueChange={(v) => setSteps(v[0])} data-testid="slider-steps" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Guidance Scale</span>
                      <span className="font-mono text-primary">{guidance.toFixed(1)}</span>
                    </div>
                    <Slider value={[guidance]} min={1} max={20} step={0.5} onValueChange={(v) => setGuidance(v[0])} data-testid="slider-guidance" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Number of Images</span>
                      <span className="font-mono text-primary">{numImages}</span>
                    </div>
                    <Slider value={[numImages]} min={1} max={4} step={1} onValueChange={(v) => setNumImages(v[0])} data-testid="slider-num-images" />
                  </div>
                </div>
              )}
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
                <><Wand2 className="w-4 h-4 mr-2" /> Generate Images</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Powered by Hugging Face Inference API
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
                <p className="text-sm font-medium">Generating your image...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  First-time model loads can take 20–60 seconds while the model warms up.
                </p>
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
                {images.map((b64, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl overflow-hidden border bg-muted"
                    data-testid={`card-image-${idx}`}
                  >
                    <img
                      src={`data:image/png;base64,${b64}`}
                      alt={`Generated image ${idx + 1}`}
                      className="w-full h-auto block"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadImage(b64, idx)}
                        className="flex-1"
                        data-testid={`button-download-${idx}`}
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={copyPrompt}
                        className="flex-1"
                        data-testid={`button-copy-prompt-${idx}`}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Prompt
                      </Button>
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between bg-card border-t">
                      <span className="text-xs text-muted-foreground">Image {idx + 1}</span>
                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="text-xs flex items-center gap-1.5 text-primary hover:underline"
                        data-testid={`button-regenerate-${idx}`}
                      >
                        <RefreshCw className="w-3 h-3" /> Regenerate
                      </button>
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
