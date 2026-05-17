import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link2, Copy, Check, Trash2, History as HistoryIcon, X } from "lucide-react";
import { ToolPageLayout } from "@/components/Layout";

type Format = "kebab" | "snake" | "camel" | "pascal" | "upper_snake";

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: "kebab", label: "kebab-case (recommended)" },
  { value: "snake", label: "snake_case" },
  { value: "camel", label: "camelCase" },
  { value: "pascal", label: "PascalCase" },
  { value: "upper_snake", label: "UPPER_SNAKE_CASE" },
];

const HISTORY_KEY = "slug-generator-pro-history";
const HISTORY_LIMIT = 20;

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function toWords(input: string, removeSpecial: boolean): string[] {
  let s = stripDiacritics(input).trim();
  s = s.replace(/['’`]/g, "");
  if (removeSpecial) {
    s = s.replace(/[^a-zA-Z0-9\s_-]/g, " ");
  } else {
    s = s.replace(/[^\p{L}\p{N}\s_-]/gu, " ");
  }
  return s.split(/[\s_-]+/).filter(Boolean);
}

function applyFormat(words: string[], format: Format, lowercase: boolean): string {
  if (words.length === 0) return "";
  const cased = lowercase ? words.map((w) => w.toLowerCase()) : words;
  switch (format) {
    case "kebab":
      return cased.join("-");
    case "snake":
      return cased.join("_");
    case "upper_snake":
      return words.map((w) => w.toUpperCase()).join("_");
    case "camel": {
      const lower = words.map((w) => w.toLowerCase());
      return lower
        .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
        .join("");
    }
    case "pascal": {
      const lower = words.map((w) => w.toLowerCase());
      return lower.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    }
  }
}

function generateSlug(input: string, opts: {
  format: Format;
  removeSpecial: boolean;
  lowercase: boolean;
  maxLength: number;
}): string {
  const words = toWords(input, opts.removeSpecial);
  let slug = applyFormat(words, opts.format, opts.lowercase);
  if (opts.maxLength > 0 && slug.length > opts.maxLength) {
    slug = slug.slice(0, opts.maxLength).replace(/[-_]+$/, "");
  }
  return slug;
}

interface HistoryEntry {
  id: string;
  input: string;
  slug: string;
  format: Format;
  at: number;
}

export default function SlugGeneratorPro() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<Format>("kebab");
  const [removeSpecial, setRemoveSpecial] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState(60);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  });

  const slug = useMemo(
    () => generateSlug(input, { format, removeSpecial, lowercase, maxLength }),
    [input, format, removeSpecial, lowercase, maxLength]
  );

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  const handleCopy = async (text: string, id: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
      toast({ title: "Copied!", description: text });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleSaveToHistory = () => {
    if (!slug || !input.trim()) return;
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      input: input.trim(),
      slug,
      format,
      at: Date.now(),
    };
    setHistory((h) => [entry, ...h.filter((e) => e.slug !== slug)].slice(0, HISTORY_LIMIT));
    toast({ title: "Saved to history" });
  };

  const removeFromHistory = (id: string) =>
    setHistory((h) => h.filter((e) => e.id !== id));

  const clearHistory = () => {
    setHistory([]);
    toast({ title: "History cleared" });
  };

  const handleReset = () => {
    setInput("");
    setCopiedId(null);
  };

  return (
    <ToolPageLayout
      title="Slug Generator Pro"
      description="Generate clean, URL-friendly slugs in 5 formats with real-time preview, advanced options, and history."
      toolPath="/slug-generator-pro"
      howToUse={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Type or paste your title — the slug updates in real time.</p>
          <p><strong className="text-foreground">2.</strong> Pick a format: kebab-case (URLs), snake_case (filenames), camelCase / PascalCase (code), or UPPER_SNAKE_CASE (constants).</p>
          <p><strong className="text-foreground">3.</strong> Use the advanced toggles to remove special characters, force lowercase, or cap the length.</p>
          <p><strong className="text-foreground">4.</strong> Click <em>Save</em> to keep useful slugs in your history. Copy any saved slug with one click.</p>
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="border-purple-100 dark:border-purple-900/30">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Link2 className="w-7 h-7 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Slug Generator <span className="text-violet-600 dark:text-violet-400">Pro</span>
              </h2>
              <p className="text-muted-foreground mt-1.5">
                Advanced URL-friendly slug creation with 5 formats
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="slug-input" className="mb-2 block">Title or Text</Label>
                <Textarea
                  id="slug-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                  placeholder="Enter your title or text..."
                  className="rounded-2xl resize-y focus-visible:ring-violet-200 focus-visible:border-violet-500"
                  data-testid="input-slug-text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug-format" className="mb-2 block">Slug Format</Label>
                  <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
                    <SelectTrigger id="slug-format" className="rounded-2xl h-12" data-testid="select-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} data-testid={`format-${opt.value}`}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max-length" className="mb-2 block">
                    Max Length <span className="text-muted-foreground text-xs">(0 = no limit)</span>
                  </Label>
                  <Input
                    id="max-length"
                    type="number"
                    min={0}
                    max={500}
                    value={maxLength}
                    onChange={(e) => setMaxLength(Math.max(0, parseInt(e.target.value) || 0))}
                    className="rounded-2xl h-12"
                    data-testid="input-max-length"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="opt-special" className="cursor-pointer text-sm">
                    Remove special characters
                  </Label>
                  <Switch
                    id="opt-special"
                    checked={removeSpecial}
                    onCheckedChange={setRemoveSpecial}
                    data-testid="switch-remove-special"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="opt-lowercase" className="cursor-pointer text-sm">
                    Force lowercase
                    <span className="text-xs text-muted-foreground ml-1">(kebab/snake)</span>
                  </Label>
                  <Switch
                    id="opt-lowercase"
                    checked={lowercase}
                    onCheckedChange={setLowercase}
                    data-testid="switch-lowercase"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Generated Slug</Label>
                <div className="flex gap-2">
                  <div
                    className="flex-1 min-h-12 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 font-mono text-base break-all flex items-center"
                    data-testid="text-slug-output"
                  >
                    {slug || (
                      <span className="text-muted-foreground italic">
                        your-slug-will-appear-here
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(slug, "current")}
                    disabled={!slug}
                    className="rounded-2xl h-auto px-4 text-violet-600 dark:text-violet-400"
                    data-testid="button-copy-current"
                  >
                    {copiedId === "current" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                {slug && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {slug.length} characters
                    {maxLength > 0 && slug.length === maxLength && (
                      <span className="ml-2 text-amber-600">(trimmed to max length)</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveToHistory}
                  disabled={!slug}
                  className="flex-1 h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                  data-testid="button-save-history"
                >
                  Save to History
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="h-12 rounded-2xl"
                  data-testid="button-clear-input"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-semibold text-lg">History</h3>
                <span className="text-xs text-muted-foreground">
                  ({history.length}/{HISTORY_LIMIT})
                </span>
              </div>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-muted-foreground gap-1.5"
                  data-testid="button-clear-history"
                >
                  <Trash2 className="w-4 h-4" /> Clear all
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground border border-dashed rounded-2xl">
                No saved slugs yet. Generate a slug and click <em>Save to History</em>.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                    data-testid={`history-item-${entry.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm break-all text-foreground" data-testid={`history-slug-${entry.id}`}>
                        {entry.slug}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {entry.input} · {FORMAT_OPTIONS.find((f) => f.value === entry.format)?.label.split(" ")[0]}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(entry.slug, entry.id)}
                        className="text-violet-600 dark:text-violet-400 h-9 w-9"
                        data-testid={`button-copy-${entry.id}`}
                      >
                        {copiedId === entry.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromHistory(entry.id)}
                        className="text-muted-foreground hover:text-red-600 h-9 w-9"
                        data-testid={`button-remove-${entry.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
