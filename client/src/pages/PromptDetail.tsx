import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAdConfig } from "@/contexts/AdContext";
import { AdPlaceholder } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Wand2, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import type { AiPrompt } from "@shared/schema";

function BannerSlot({ label }: { label: string }) {
  const { config } = useAdConfig();
  const provider = config.interstitial.activeProvider;
  const html = config.bannerScripts?.[provider]?.trim();

  if (!html) {
    return (
      <div
        className="ad-spot w-full rounded-md border border-dashed border-border bg-muted/30 flex items-center justify-center py-6 text-xs uppercase tracking-wider text-muted-foreground"
        data-testid={`ad-banner-${label}`}
      >
        Sponsored
      </div>
    );
  }

  return (
    <div
      className="ad-spot w-full flex items-center justify-center overflow-hidden"
      data-testid={`ad-banner-${label}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function PromptDetail() {
  const [, params] = useRoute("/prompt/:id");
  const id = params?.id;

  const { data: prompt, isLoading, error } = useQuery<AiPrompt>({
    queryKey: ["/api/prompts", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (prompt?.title) {
      document.title = `${prompt.title} | Prompt Gallery`;
    } else {
      document.title = "Prompt Detail | Digi Best Tools";
    }
  }, [prompt?.title]);

  return (
    <div className="bg-background min-h-screen">
      {/* Top Header Ad Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <AdPlaceholder position="top" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/prompts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          data-testid="link-back-gallery"
        >
          <ArrowLeft className="w-4 h-4" /> Back to gallery
        </Link>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Loading prompt…</p>
          </div>
        ) : error || !prompt ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
            <h2 className="text-xl font-semibold mb-1">Prompt not found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This prompt may have been removed or the link is incorrect.
            </p>
            <Link
              href="/prompts"
              className="text-sm text-primary hover:underline"
              data-testid="link-back-error"
            >
              ← Browse the gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main column */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  data-testid="text-prompt-title"
                >
                  {prompt.title}
                </h1>
              </div>

              <div className="rounded-2xl overflow-hidden border border-border bg-black/5 dark:bg-black/40">
                <img
                  src={prompt.imageUrl}
                  alt={prompt.title}
                  className="w-full max-h-[600px] object-contain mx-auto"
                  data-testid="img-prompt"
                />
              </div>

              {/* Below-image Ad Slot */}
              <BannerSlot label="below-image" />

              <div>
                <h2 className="text-xs font-semibold tracking-widest text-muted-foreground mb-2">
                  DESCRIPTION
                </h2>
                <p
                  className="text-base leading-relaxed text-foreground/90"
                  data-testid="text-prompt-description"
                >
                  {prompt.description}
                </p>
              </div>

              <a
                href={prompt.meigenTargetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-x-3 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold py-4 rounded-2xl text-lg transition-all shadow-md hover:shadow-xl"
                data-testid="link-meigen-cta"
              >
                <Wand2 className="w-5 h-5" />
                <span>Copy Exact Prompt from MeiGen</span>
              </a>
              <p className="text-center text-xs text-muted-foreground">
                Opens MeiGen in a new tab
              </p>
            </div>

            {/* Sidebar Ad Slot */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-6">
                <AdPlaceholder position="sidebar" />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
