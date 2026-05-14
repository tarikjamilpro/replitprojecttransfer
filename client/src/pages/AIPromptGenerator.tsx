import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Copy, Check, Loader2, Lightbulb, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

const AI_MODELS = [
  "Nano Banana Pro",
  "ChatGPT Imagine (DALL-E 3)",
  "Flux",
  "Midjourney",
  "Stable Diffusion XL",
  "Ideogram",
  "Leonardo AI",
  "Adobe Firefly",
];

export default function AIPromptGenerator() {
  const [idea, setIdea] = useState("");
  const [model, setModel] = useState("Nano Banana Pro");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();

  const runGenerate = async () => {
    if (!idea.trim()) {
      toast({ title: "Please enter a basic idea", description: "Tell us what your image should show.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setPrompt("");

    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), model }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      if (!data.prompt) throw new Error("No prompt returned from server");

      setPrompt(data.prompt);
    } catch (err: any) {
      toast({
        title: "Failed to generate prompt",
        description: err?.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    requestAction(runGenerate);
  };

  const handleCopy = async () => {
    if (!prompt.trim()) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast({ title: "Copied!", description: "Prompt copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  return (
    <ToolPageLayout
      title="AI Professional Image Prompt Generator"
      description="Transform basic ideas into professional, model-optimized image prompts for Midjourney, DALL-E, Flux, Stable Diffusion, and more."
      currentPath="/ai-prompt-generator"
    >
      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Your Basic Idea
            </label>
            <Textarea
              data-testid="input-idea"
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Example: a cyberpunk cat sitting on a neon rooftop at night"
              className="resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target AI Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger data-testid="select-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            data-testid="button-generate"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Professional Prompt
              </>
            )}
          </Button>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4 text-emerald-500" />
                Optimized Prompt
              </label>
              {prompt && (
                <Button
                  data-testid="button-copy"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>

            <div
              data-testid="text-prompt-output"
              className="min-h-[180px] rounded-lg border bg-muted/30 p-4 text-sm font-mono whitespace-pre-wrap break-words"
            >
              {prompt ? (
                prompt
              ) : isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground py-8">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Crafting an optimized prompt...
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                  <Wand2 className="w-8 h-8 mb-2 opacity-40" />
                  <p>Your optimized prompt will appear here</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AdInterstitial isOpen={showInterstitial} onContinue={handleContinue} />
    </ToolPageLayout>
  );
}
