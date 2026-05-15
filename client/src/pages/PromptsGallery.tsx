import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import type { AiPrompt } from "@shared/schema";
import { useEffect } from "react";

export default function PromptsGallery() {
  const { data: prompts, isLoading, error } = useQuery<AiPrompt[]>({
    queryKey: ["/api/prompts"],
  });

  useEffect(() => {
    document.title = "Prompt Preview Gallery | Digi Best Tools";
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Prompt Gallery</h1>
          </div>
          <div className="hidden sm:flex text-sm text-emerald-500 items-center gap-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Free • High Quality Prompts</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter">
            Prompt Preview Gallery
          </h2>
          <p className="text-muted-foreground mt-2 text-base sm:text-lg">
            Discover high-converting prompts used with MeiGen
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Loading prompts…</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 text-destructive">
            Failed to load prompts. Please refresh the page.
          </div>
        ) : !prompts || prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mb-4 opacity-40" />
            <p className="text-lg font-medium mb-1">No prompts yet</p>
            <p className="text-sm">Check back soon for new prompt inspiration.</p>
          </div>
        ) : (
          <div
            className="columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]"
            data-testid="grid-prompts"
          >
            {prompts.map((p) => (
              <Link
                key={p.id}
                href={`/prompt/${p.id}`}
                className="block mb-6 break-inside-avoid bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                data-testid={`card-prompt-${p.id}`}
              >
                <div className="relative">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    loading="lazy"
                    className="w-full block"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-base mb-2 line-clamp-2" data-testid={`text-prompt-title-${p.id}`}>
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {p.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
