import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Sparkles, Wand2, Copy, Check, Heading, Tags, Hash, MessageSquareQuote, Loader2,
} from "lucide-react";
import { ToolPageLayout } from "@/components/Layout";

interface OptimizerResult {
  titles: string[];
  seo_tags: string;
  hashtags: string;
  caption: string;
}

interface ErrorResponse {
  error?: string;
}

export default function AIContentOptimizer() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<OptimizerResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mutation = useMutation<OptimizerResult, Error, string>({
    mutationFn: async (t: string) => {
      const res = await apiRequest("POST", "/api/content-optimizer", { topic: t });
      const data: OptimizerResult & ErrorResponse = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate");
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({ title: "Content generated!", description: "Your optimized content package is ready." });
    },
    onError: (err) => {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  const handleGenerate = () => {
    const t = topic.trim();
    if (!t) {
      toast({ title: "Topic required", description: "Please enter a topic or title.", variant: "destructive" });
      return;
    }
    mutation.mutate(t);
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
      toast({ title: "Copied!" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <ToolPageLayout
      title="AI Content Optimizer"
      description="Generate SEO-friendly viral content packages — 5 optimized titles, 15-20 SEO tags, 10-15 hashtags, and a viral caption — instantly from a single topic."
      toolPath="/ai-content-optimizer"
      howToUse={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Enter your video, post, or article topic.</p>
          <p><strong className="text-foreground">2.</strong> Click <em>Generate</em> — AI returns 5 titles, SEO tags, hashtags, and a viral caption.</p>
          <p><strong className="text-foreground">3.</strong> Copy each section individually or copy all titles at once.</p>
          <p><strong className="text-foreground">4.</strong> Paste into YouTube, Instagram, TikTok, or your blog and publish.</p>
        </div>
      }
    >
      <Card className="border-purple-100 dark:border-purple-900/30 mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              AI Content <span className="text-violet-600 dark:text-violet-400">Optimizer</span>
            </h2>
            <p className="text-muted-foreground mt-1.5">SEO titles, tags, hashtags & viral captions in one click</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 mb-8">
        <CardContent className="p-6 sm:p-7">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !mutation.isPending) handleGenerate();
              }}
              placeholder="Enter your title or topic (e.g., Best faceless YouTube niches 2026)"
              maxLength={500}
              className="flex-1 h-14 rounded-2xl text-base px-5"
              data-testid="input-topic"
              disabled={mutation.isPending}
            />
            <Button
              onClick={handleGenerate}
              disabled={mutation.isPending || !topic.trim()}
              className="h-14 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-2"
              data-testid="button-generate"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {mutation.isPending && (
        <Card className="border-slate-200 dark:border-slate-800" data-testid="loading-state">
          <CardContent className="p-10 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
            <p className="text-muted-foreground">Crafting your viral content package...</p>
          </CardContent>
        </Card>
      )}

      {result && !mutation.isPending && (
        <div className="space-y-6" data-testid="output-section">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 sm:p-7">
              <SectionHeader
                icon={<Heading className="w-5 h-5 text-violet-600" />}
                title="Optimized Titles"
                action={
                  <CopyButton
                    onClick={() => handleCopy(result.titles.join("\n"), "all-titles")}
                    copied={copiedKey === "all-titles"}
                    label="Copy All"
                  />
                }
              />
              <div className="space-y-2.5 mt-4">
                {result.titles.map((title, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/70 rounded-2xl transition-colors"
                    data-testid={`title-row-${i}`}
                  >
                    <span className="flex-1 text-sm sm:text-base" data-testid={`text-title-${i}`}>{title}</span>
                    <CopyButton
                      onClick={() => handleCopy(title, `title-${i}`)}
                      copied={copiedKey === `title-${i}`}
                      label="Copy"
                      variant="ghost"
                      testId={`button-copy-title-${i}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 sm:p-7">
              <SectionHeader
                icon={<Tags className="w-5 h-5 text-blue-600" />}
                title="SEO Tags"
                action={
                  <CopyButton
                    onClick={() => handleCopy(result.seo_tags, "tags")}
                    copied={copiedKey === "tags"}
                    label="Copy"
                  />
                }
              />
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 break-words"
                data-testid="text-seo-tags"
              >
                {result.seo_tags}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 sm:p-7">
              <SectionHeader
                icon={<Hash className="w-5 h-5 text-pink-600" />}
                title="Hashtags"
                action={
                  <CopyButton
                    onClick={() => handleCopy(result.hashtags, "hashtags")}
                    copied={copiedKey === "hashtags"}
                    label="Copy"
                  />
                }
              />
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 break-words"
                data-testid="text-hashtags"
              >
                {result.hashtags}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 sm:p-7">
              <SectionHeader
                icon={<MessageSquareQuote className="w-5 h-5 text-emerald-600" />}
                title="Viral Caption"
                action={
                  <CopyButton
                    onClick={() => handleCopy(result.caption, "caption")}
                    copied={copiedKey === "caption"}
                    label="Copy"
                  />
                }
              />
              <p
                className="mt-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line"
                data-testid="text-caption"
              >
                {result.caption}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolPageLayout>
  );
}

function SectionHeader({
  icon, title, action,
}: { icon: React.ReactNode; title: string; action: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {icon} {title}
      </h3>
      {action}
    </div>
  );
}

function CopyButton({
  onClick, copied, label, variant = "secondary", testId,
}: {
  onClick: () => void;
  copied: boolean;
  label: string;
  variant?: "secondary" | "ghost";
  testId?: string;
}) {
  const base = variant === "ghost"
    ? "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200";
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      className={`rounded-xl gap-1.5 ${base}`}
      variant="ghost"
      data-testid={testId || `button-copy-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}
