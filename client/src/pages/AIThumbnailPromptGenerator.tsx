import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Image as ImageIcon, Wand2, RefreshCw, Copy, Check, Download, History, Trash2,
} from "lucide-react";
import { ToolPageLayout } from "@/components/Layout";

const PLATFORMS = [
  "YouTube", "Instagram", "TikTok", "Facebook Reels", "Threads",
  "LinkedIn", "Telegram", "Pinterest", "Reddit", "Dailymotion", "General",
];

const STYLES = [
  { value: "Cinematic and dramatic", label: "Cinematic & Dramatic" },
  { value: "Bold and vibrant", label: "Bold & Vibrant" },
  { value: "Minimal and clean", label: "Minimal & Clean" },
  { value: "Emotional and storytelling", label: "Emotional & Storytelling" },
  { value: "Luxury and premium", label: "Luxury & Premium" },
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 (YouTube, Landscape)" },
  { value: "9:16", label: "9:16 (Vertical / Stories)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:5", label: "4:5 (Instagram Portrait)" },
  { value: "2:3", label: "2:3 (Pinterest)" },
];

const PLATFORM_DEFAULT_RATIO: Record<string, string> = {
  YouTube: "16:9",
  Instagram: "9:16",
  TikTok: "9:16",
  "Facebook Reels": "9:16",
  Pinterest: "2:3",
  Threads: "9:16",
  LinkedIn: "16:9",
  Telegram: "16:9",
  Reddit: "16:9",
  Dailymotion: "16:9",
  General: "16:9",
};

const PROMPT_VARIATIONS = [
  "Dramatic lighting, strong emotion, bold composition, high contrast.",
  "Vibrant colors, powerful focal point, modern and energetic style.",
  "Minimalist, clean design, premium aesthetic, elegant lighting.",
  "Emotional storytelling, rich colors, high visual impact.",
  "Luxury feel, cinematic lighting, highly detailed and professional.",
  "Bold and scroll-stopping design, optimized for maximum engagement.",
  "Eye-catching typography overlay, vivid contrast, magnetic gaze toward subject.",
  "Mysterious atmosphere, dramatic shadows, intriguing focal subject.",
];

const HISTORY_KEY = "thumbnailPromptHistory";
const HISTORY_LIMIT = 8;

interface HistoryItem {
  title: string;
  platform: string;
  style: string;
  aspectRatio: string;
  prompts: string[];
  date: string;
}

function createPrompts(title: string, platform: string, style: string, aspectRatio: string): string[] {
  const base = `Create a highly click-worthy thumbnail for "${title}". ${style} style, optimized for ${platform}, aspect ratio ${aspectRatio}.`;
  const shuffled = [...PROMPT_VARIATIONS].sort(() => Math.random() - 0.5).slice(0, 6);
  return shuffled.map((v) => `${base} ${v}`);
}

export default function AIThumbnailPromptGenerator() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [style, setStyle] = useState(STYLES[0].value);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | "all" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const def = PLATFORM_DEFAULT_RATIO[platform];
    if (def) setAspectRatio(def);
  }, [platform]);

  const platformLabel = useMemo(() => platform, [platform]);

  const saveHistory = (newItem: HistoryItem) => {
    const next = [newItem, ...history].slice(0, HISTORY_LIMIT);
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const handleGenerate = (saveToHistory = true) => {
    const t = title.trim();
    if (!t) {
      toast({ title: "Title required", description: "Please enter a title or topic.", variant: "destructive" });
      return;
    }
    const next = createPrompts(t, platform, style, aspectRatio);
    setPrompts(next);
    if (saveToHistory) {
      saveHistory({
        title: t, platform, style, aspectRatio, prompts: next,
        date: new Date().toLocaleString(),
      });
    }
  };

  const handleRegenerate = () => {
    if (prompts.length === 0) {
      handleGenerate(true);
      return;
    }
    handleGenerate(false);
  };

  const handleCopy = async (text: string, key: number | "all") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(key);
      setTimeout(() => setCopiedIdx((k) => (k === key ? null : k)), 1500);
      toast({ title: "Copied!" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (prompts.length === 0) return;
    const text = prompts.join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thumbnail-prompts-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setTitle(item.title);
    setPlatform(item.platform);
    setStyle(item.style);
    setAspectRatio(item.aspectRatio);
    setPrompts(item.prompts);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({ title: "History cleared" });
  };

  return (
    <ToolPageLayout
      title="AI Thumbnail Prompt Generator"
      description="Create 6 high-converting AI thumbnail prompts for YouTube, Instagram, TikTok and 8+ platforms. Choose platform, style and aspect ratio, then paste into Midjourney, DALL·E or any AI image tool."
      toolPath="/ai-thumbnail-prompt-generator"
      howToUse={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Enter your video, post, or article title.</p>
          <p><strong className="text-foreground">2.</strong> Pick a platform — aspect ratio auto-updates.</p>
          <p><strong className="text-foreground">3.</strong> Choose a visual style, then click <em>Generate Prompts</em>.</p>
          <p><strong className="text-foreground">4.</strong> Copy any prompt and paste into Midjourney, DALL·E, Flux, or any AI image tool.</p>
        </div>
      }
    >
      <Card className="border-violet-100 dark:border-violet-900/30 mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
              <ImageIcon className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              AI Thumbnail <span className="text-violet-600 dark:text-violet-400">Prompt Generator</span>
            </h2>
            <p className="text-muted-foreground mt-1.5">Create high-converting prompts for any platform</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 mb-6">
        <CardContent className="p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowHistory(true)}
              className="rounded-2xl gap-2 self-end sm:self-auto"
              data-testid="button-history"
            >
              <History className="w-4 h-4" /> History
              {history.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                  {history.length}
                </span>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2">Title / Topic</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder='e.g. How I made $10k/month with faceless YouTube'
                maxLength={200}
                className="h-12 rounded-2xl text-base px-5"
                data-testid="input-title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-12 rounded-2xl" data-testid="select-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Aspect Ratio</label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="h-12 rounded-2xl" data-testid="select-aspect-ratio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="h-12 rounded-2xl" data-testid="select-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={() => handleGenerate(true)}
              className="flex-1 h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-2"
              data-testid="button-generate"
            >
              <Wand2 className="w-5 h-5" /> Generate Prompts
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRegenerate}
              className="h-14 rounded-2xl gap-2 px-6"
              data-testid="button-regenerate"
            >
              <RefreshCw className="w-5 h-5" /> Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      {prompts.length > 0 && (
        <div data-testid="output-section">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-xl sm:text-2xl font-semibold">Generated Thumbnail Prompts</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                className="rounded-2xl gap-2"
                data-testid="button-export"
              >
                <Download className="w-4 h-4" /> Export .txt
              </Button>
              <Button
                type="button"
                onClick={() => handleCopy(prompts.join("\n\n---\n\n"), "all")}
                className="rounded-2xl gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                data-testid="button-copy-all"
              >
                {copiedIdx === "all" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedIdx === "all" ? "Copied!" : "Copy All"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {prompts.map((prompt, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800" data-testid={`prompt-card-${i}`}>
                <CardContent className="p-5 flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-violet-600 dark:text-violet-400 font-semibold mb-1.5 tracking-wide">
                      PROMPT {i + 1} · {platformLabel} · {aspectRatio}
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 break-words" data-testid={`text-prompt-${i}`}>
                      {prompt}
                    </p>
                  </div>
                  <div className="lg:flex-shrink-0">
                    <Button
                      type="button"
                      onClick={() => handleCopy(prompt, i)}
                      className="rounded-2xl gap-2 bg-violet-600 hover:bg-violet-700 text-white w-full lg:w-auto"
                      data-testid={`button-copy-prompt-${i}`}
                    >
                      {copiedIdx === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedIdx === i ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>Prompt History</span>
              {history.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 mr-6"
                  data-testid="button-clear-history"
                >
                  <Trash2 className="w-4 h-4" /> Clear
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-auto">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="text-no-history">
                No history yet. Generate prompts to save them here.
              </p>
            ) : (
              history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  data-testid={`history-item-${i}`}
                >
                  <div className="font-medium text-sm sm:text-base truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.platform} · {item.aspectRatio} · {item.date}
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ToolPageLayout>
  );
}
