import { useState, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Youtube, Search, Copy, Check, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MOCK_RESULTS: Record<string, { title: string; tags: string[] }> = {
  default: {
    title: "How to Build a React App in 2026 (Full Course)",
    tags: [
      "ReactJS", "Web Development", "Coding Tutorial", "JavaScript",
      "Frontend", "React Hooks", "Vite", "Full Stack", "Programming",
      "React 2026", "TypeScript", "CSS", "Node.js", "Tutorial", "Beginner"
    ],
  },
  shorts: {
    title: "60 Second Coding Tips You Need to Know",
    tags: [
      "Shorts", "Coding Tips", "Quick Tutorial", "Dev Hacks",
      "Programming", "JavaScript", "Python", "Tech Tips", "Productivity",
      "Developer Life", "Code Review", "One Minute", "Software"
    ],
  },
  music: {
    title: "Chill Lo-Fi Beats to Study and Relax",
    tags: [
      "Lo-Fi", "Study Music", "Chill Beats", "Relaxation",
      "Focus Music", "Background Music", "Lo-Fi Hip Hop", "Ambient",
      "Concentration", "Calm", "Instrumental", "Stream", "Playlist"
    ],
  },
  gaming: {
    title: "Top 10 Upcoming Games of 2026 - Complete Breakdown",
    tags: [
      "Gaming", "Upcoming Games", "2026 Games", "Game Reviews",
      "PS5", "Xbox", "PC Gaming", "Gameplay", "Top 10", "E3",
      "Indie Games", "AAA Games", "Trailer Reaction", "Release Dates"
    ],
  },
};

function pickMockResult(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes("short")) return MOCK_RESULTS.shorts;
  if (lower.includes("music") || lower.includes("lofi") || lower.includes("beats")) return MOCK_RESULTS.music;
  if (lower.includes("game") || lower.includes("gaming")) return MOCK_RESULTS.gaming;
  return MOCK_RESULTS.default;
}

function isValidYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/.test(url.trim());
}

export default function YouTubeTagExtractor() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; tags: string[] } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExtract = useCallback(() => {
    if (!url.trim()) {
      toast({ title: "URL required", description: "Please paste a YouTube video link.", variant: "destructive" });
      return;
    }
    if (!isValidYouTubeUrl(url)) {
      toast({ title: "Invalid YouTube URL", description: "Please enter a valid YouTube video link.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    setCopiedAll(false);
    setCopiedTag(null);

    setTimeout(() => {
      const data = pickMockResult(url);
      setResult(data);
      setLoading(false);
    }, 1500);
  }, [url, toast]);

  const copyTag = useCallback(async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 1500);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  }, [toast]);

  const copyAll = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.tags.join(", "));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  }, [result, toast]);

  return (
    <ToolPageLayout
      title="YouTube Tag Extractor"
      description="Extract SEO tags from any YouTube video to discover the keywords creators use for better search rankings."
      toolPath="/youtube-tag-extractor"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Paste a YouTube video URL into the input field.</li>
          <li>Click "Extract Tags" to analyze the video.</li>
          <li>Browse the extracted tags displayed as clickable chips.</li>
          <li>Click any individual tag to copy it, or use "Copy All" to grab the full list.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-input-header">
            <Youtube className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">Video URL</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="url-input" data-testid="label-url">
              YouTube Video Link
            </label>
            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="url-input"
                type="url"
                placeholder="Paste YouTube Video Link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                data-testid="input-url"
              />
            </div>
          </div>

          <Button
            className="w-full bg-red-600 text-white"
            onClick={handleExtract}
            disabled={loading}
            data-testid="button-extract"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Extract Tags
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium text-foreground" data-testid="label-all-tags">
                All Tags (comma separated)
              </label>
              <Textarea
                readOnly
                value={result.tags.join(", ")}
                className="resize-none text-sm"
                rows={4}
                data-testid="textarea-all-tags"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={copyAll}
                data-testid="button-copy-all"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Tags
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-results-header">
            <Tag className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">Extracted Tags</h3>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-loading-state">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Analyzing video tags...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-empty-state">
              <Youtube className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">
                Paste a YouTube URL and click Extract Tags to discover the keywords used.
              </p>
            </div>
          )}

          {!loading && result && (
            <Card data-testid="card-result">
              <CardContent className="p-6 space-y-5">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Video Title</p>
                  <p className="text-base font-semibold text-foreground" data-testid="text-video-title">
                    {result.title}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Tags ({result.tags.length})
                  </p>
                  <div className="flex flex-wrap gap-2" data-testid="tag-cloud">
                    {result.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer select-none text-sm"
                        onClick={() => copyTag(tag)}
                        data-testid={`badge-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {copiedTag === tag ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Copied
                          </span>
                        ) : (
                          tag
                        )}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Click any tag to copy it.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}