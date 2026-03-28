import { useState, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Youtube, Search, Copy, Check, Loader2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

function isValidYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/).+/.test(url.trim());
}

export default function YouTubeTagExtractor() {
  const toolSEO = getToolSEO("/youtube-tag-extractor");
  const [url, setUrl] = useState("");
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; tags: string[] } | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExtract = useCallback(async () => {
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

    try {
      const response = await fetch("/api/youtube-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract tags");
      }

      if (!data.tags || data.tags.length === 0) {
        throw new Error("No tags were generated. Please try a different video.");
      }

      setResult({ title: data.title, tags: data.tags });
    } catch (err: any) {
      toast({
        title: "Extraction failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    <>
      <SEO
        title={toolSEO?.seoTitle || "YouTube Tag Extractor - Extract Video Tags for SEO"}
        description={toolSEO?.seoDescription || "Extract and generate SEO tags from any YouTube video. Discover keywords to boost your video rankings."}
      />
      <ToolPageLayout
        title="YouTube Tag Extractor"
        description="Extract SEO tags from any YouTube video to discover the keywords creators use for better search rankings."
        toolPath="/youtube-tag-extractor"
        toolId="youtube-tag-extractor"
        category="YouTube Tools"
        howToUse={[
          "Paste a YouTube video URL into the input field.",
          "Click \"Extract Tags\" to analyze the video.",
          "Browse the extracted tags displayed as clickable chips.",
          "Click any individual tag to copy it, or use \"Copy All\" to grab the full list.",
        ]}
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
                  disabled={loading}
                  data-testid="input-url"
                />
              </div>
            </div>

            <Button
              className="w-full bg-red-600 text-white"
              onClick={() => requestAction(handleExtract)}
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
                <p className="text-muted-foreground text-sm" data-testid="text-loading-message">Analyzing video and generating tags...</p>
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
                    <p className="text-xs text-muted-foreground uppercase tracking-wide" data-testid="text-title-label">Video Title</p>
                    <p className="text-base font-semibold text-foreground" data-testid="text-video-title">
                      {result.title}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide" data-testid="text-tag-count">
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
                    <p className="text-xs text-muted-foreground" data-testid="text-click-hint">Click any tag to copy it.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
  
      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="YouTube Tag Extractor"
      />
    </ToolPageLayout>
    </>
  );
}
