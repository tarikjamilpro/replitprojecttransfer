import { useState, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Copy, Check, Info, List, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

const hookTemplates: Record<string, string[]> = {
  Controversial: [
    "Stop doing [Topic] immediately!",
    "Why [Topic] is a scam nobody talks about...",
    "Unpopular opinion: [Topic] is completely overrated.",
    "I quit [Topic] and here is why you should too.",
    "The dark truth about [Topic] that experts hide from you.",
    "Everyone is wrong about [Topic]. Here is the proof.",
    "[Topic] is dead. Here is what is replacing it.",
    "The biggest lie you have been told about [Topic].",
    "Warning: [Topic] is ruining your results.",
    "Hot take: [Topic] does not work the way you think.",
    "Nobody wants to admit this about [Topic].",
    "Why most people fail at [Topic] and always will.",
  ],
  Educational: [
    "The comprehensive guide to [Topic] you wish you had earlier.",
    "3 secrets about [Topic] nobody tells you.",
    "How to master [Topic] in 5 simple steps.",
    "Everything you need to know about [Topic] in 60 seconds.",
    "The science behind [Topic] explained simply.",
    "A beginner's roadmap to [Topic] that actually works.",
    "[Topic] 101: What I wish I knew from the start.",
    "The #1 mistake people make with [Topic] and how to fix it.",
    "How [Topic] actually works behind the scenes.",
    "5 things about [Topic] that will change your perspective.",
    "The step-by-step breakdown of [Topic] for beginners.",
    "Here is why [Topic] matters more than you think.",
  ],
  "Listicle/Tips": [
    "Top 5 tools for [Topic] you need right now.",
    "7 mistakes you are making with [Topic].",
    "Best resources for [Topic] in 2026.",
    "10 [Topic] tips that will save you hours.",
    "3 [Topic] hacks that actually work.",
    "The only 5 [Topic] strategies you will ever need.",
    "8 signs you are doing [Topic] wrong.",
    "4 underrated [Topic] techniques nobody uses.",
    "6 [Topic] trends you cannot afford to ignore.",
    "Top 3 [Topic] tools that cost zero dollars.",
    "9 ways to level up your [Topic] game today.",
    "5 [Topic] rules every creator should follow.",
  ],
  Storytelling: [
    "I tried [Topic] for 30 days and here is what happened...",
    "How [Topic] changed my life completely.",
    "The day I learned the truth about [Topic].",
    "I spent $10,000 on [Topic]. Was it worth it?",
    "My honest journey with [Topic] from zero to hero.",
    "The moment [Topic] finally clicked for me.",
    "I failed at [Topic] 5 times before this worked.",
    "What nobody told me before I started [Topic].",
    "From zero experience to [Topic] expert in 90 days.",
    "I almost gave up on [Topic] until I discovered this.",
    "The turning point in my [Topic] journey.",
    "How I went from hating [Topic] to loving it.",
  ],
};

const styles = Object.keys(hookTemplates);

function shuffleAndPick(arr: string[], count: number): string[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function ViralHooksGenerator() {
  const [topic, setTopic] = useState("");
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [style, setStyle] = useState("");
  const [hooks, setHooks] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Please enter a topic to generate hooks for.", variant: "destructive" });
      return;
    }
    if (!style) {
      toast({ title: "Style required", description: "Please select a hook style.", variant: "destructive" });
      return;
    }

    const templates = hookTemplates[style];
    const count = 5 + Math.floor(Math.random() * 3);
    const selected = shuffleAndPick(templates, count);
    const generated = selected.map((t) => t.replace(/\[Topic\]/g, topic.trim()));
    setHooks(generated);
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [topic, style, toast]);

  const copyHook = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  }, [toast]);

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(hooks.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  }, [hooks, toast]);

  return (
    <ToolPageLayout
      title="Viral Hook Generator"
      description="Generate attention-grabbing hooks for your videos and social media content that stop the scroll and boost engagement."
      toolPath="/viral-hooks-generator"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your content topic or niche in the input field.</li>
          <li>Select a hook style: Controversial, Educational, Listicle/Tips, or Storytelling.</li>
          <li>Click "Generate Hooks" to create 5-7 unique hook ideas.</li>
          <li>Click any hook to copy it, or use "Copy All" to grab the full list.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-input-header">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">Create Your Hooks</h3>
          </div>

          <button
            type="button"
            className="w-full flex items-center gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-left text-sm cursor-pointer"
            onClick={() => setInfoOpen(!infoOpen)}
            data-testid="button-what-is-hook"
          >
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-medium text-blue-700 dark:text-blue-300">What is a Hook?</span>
          </button>
          {infoOpen && (
            <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300" data-testid="text-hook-info">
              A hook is the first 3 seconds of your video or the opening line of your post that grabs attention and makes people stop scrolling. A strong hook dramatically increases views and engagement.
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="topic-input" data-testid="label-topic">
              Topic
            </label>
            <Input
              id="topic-input"
              type="text"
              placeholder="e.g., Digital Marketing, Weight Loss"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              data-testid="input-topic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" data-testid="label-style">
              Hook Style
            </label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger data-testid="select-style">
                <SelectValue placeholder="Select a style..." />
              </SelectTrigger>
              <SelectContent>
                {styles.map((s) => (
                  <SelectItem key={s} value={s} data-testid={`option-style-${s.toLowerCase().replace(/\//g, "-")}`}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            onClick={() => requestAction(handleGenerate)}
            data-testid="button-generate"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Hooks
          </Button>

          {hooks.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium text-foreground" data-testid="label-all-hooks">
                All Hooks
              </label>
              <Textarea
                readOnly
                value={hooks.join("\n")}
                className="resize-none text-sm"
                rows={6}
                data-testid="textarea-all-hooks"
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
                    Copy All Hooks
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-results-header">
            <List className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">Generated Hooks</h3>
          </div>

          {hooks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-empty-state">
              <Sparkles className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">
                Enter a topic and style, then generate hooks to see them here.
              </p>
            </div>
          )}

          {hooks.length > 0 && (
            <div className="space-y-3" data-testid="hooks-list">
              {hooks.map((hook, index) => (
                <Card key={index} data-testid={`card-hook-${index}`}>
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground flex-1 leading-relaxed" data-testid={`text-hook-${index}`}>
                      {hook}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyHook(hook, index)}
                      data-testid={`button-copy-hook-${index}`}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="Viral Hooks Generator"
      />
    </ToolPageLayout>
  );
}