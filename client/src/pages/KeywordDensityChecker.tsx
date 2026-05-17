import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart3, Wand2, RotateCcw } from "lucide-react";
import { ToolPageLayout } from "@/components/Layout";

const STOP_WORDS = new Set([
  "the","and","for","are","but","not","you","all","can","had","her","was","one",
  "our","out","day","get","has","him","his","how","man","new","now","old","see",
  "two","way","who","boy","did","its","let","put","say","she","too","use","that",
  "with","this","have","from","they","will","would","there","their","what","about",
  "which","when","make","like","time","just","know","take","into","year","your",
  "good","some","could","them","than","only","want","look","come","also","back",
  "after","first","well","even","because","these","most","people","other","many",
  "been","were","said","each","more","very","much","such","over","then","also",
]);

interface Stats {
  words: number;
  characters: number;
  sentences: number;
  keywords: Array<{ word: string; count: number; density: number }>;
}

const EMPTY_STATS: Stats = { words: 0, characters: 0, sentences: 0, keywords: [] };

function analyze(text: string, ignoreStopWords: boolean): Stats {
  const trimmed = text.trim();
  if (!trimmed) return EMPTY_STATS;
  const wordsArr = trimmed.toLowerCase().match(/\b[a-zA-Z']+\b/g) || [];
  const characters = trimmed.replace(/\s/g, "").length;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  const map = new Map<string, number>();
  for (const word of wordsArr) {
    if (word.length < 3) continue;
    if (ignoreStopWords && STOP_WORDS.has(word)) continue;
    map.set(word, (map.get(word) || 0) + 1);
  }
  const total = wordsArr.length || 1;
  const keywords = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count, density: (count / total) * 100 }));

  return { words: wordsArr.length, characters, sentences, keywords };
}

export default function KeywordDensityChecker() {
  const [text, setText] = useState("");
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [analyzed, setAnalyzed] = useState(false);

  const stats = useMemo(
    () => (analyzed ? analyze(text, ignoreStopWords) : EMPTY_STATS),
    [text, ignoreStopWords, analyzed]
  );

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setAnalyzed(true);
  };

  const handleReset = () => {
    setText("");
    setAnalyzed(false);
  };

  const densityColor = (d: number) =>
    d >= 5 ? "text-red-600" : d >= 2 ? "text-amber-600" : "text-emerald-600";

  return (
    <ToolPageLayout
      title="Keyword Density Checker"
      description="Analyze how often each word appears in your content. Get word counts, density percentages, and SEO insights."
      toolPath="/keyword-density-checker"
      howToUse={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Paste your article, blog post, or any content into the text area.</p>
          <p><strong className="text-foreground">2.</strong> Toggle <em>Ignore common words</em> to filter out filler words like "the", "and", "for".</p>
          <p><strong className="text-foreground">3.</strong> Click <em>Analyze Keyword Density</em> to see your top 15 keywords ranked by frequency and density %.</p>
          <p><strong className="text-foreground">4.</strong> Aim for a keyword density of 1–3% for your target keywords. Above 5% may look like keyword stuffing.</p>
        </div>
      }
    >
      <Card className="border-purple-100 dark:border-purple-900/30">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" data-testid="text-tool-title">
              Keyword Density Checker
            </h2>
            <p className="text-muted-foreground mt-1.5">Analyze keyword frequency in your content</p>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your content here to analyze keyword density..."
            rows={9}
            className="text-base rounded-2xl resize-y focus-visible:ring-violet-200 focus-visible:border-violet-500"
            data-testid="input-content"
          />

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={!text.trim()}
              className="flex-1 h-14 text-base font-semibold rounded-2xl bg-violet-600 hover:bg-violet-700 text-white gap-2"
              data-testid="button-analyze"
            >
              <Wand2 className="w-5 h-5" />
              Analyze Keyword Density
            </Button>
            {analyzed && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-14 rounded-2xl gap-2"
                data-testid="button-reset"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "WORDS", value: stats.words, testId: "stat-words" },
              { label: "CHARACTERS", value: stats.characters, testId: "stat-characters" },
              { label: "SENTENCES", value: stats.sentences, testId: "stat-sentences" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 text-center"
              >
                <div
                  className="text-2xl sm:text-3xl font-semibold text-violet-600 dark:text-violet-400 tabular-nums"
                  data-testid={s.testId}
                >
                  {s.value.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-xs tracking-wider text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {analyzed && stats.keywords.length > 0 && (
            <div className="mt-8" data-testid="section-analysis">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Top Keywords</h3>
                  <p className="text-sm text-muted-foreground">Most frequent words in your content</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="ignore-stopwords"
                    checked={ignoreStopWords}
                    onCheckedChange={setIgnoreStopWords}
                    data-testid="switch-ignore-stopwords"
                  />
                  <Label htmlFor="ignore-stopwords" className="text-sm cursor-pointer">
                    Ignore common words
                  </Label>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/40">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-4 sm:px-6 py-3 font-medium">Keyword</th>
                      <th className="px-4 sm:px-6 py-3 font-medium text-center">Count</th>
                      <th className="px-4 sm:px-6 py-3 font-medium text-right">Density</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.keywords.map((k, i) => (
                      <tr
                        key={k.word}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                        data-testid={`row-keyword-${i}`}
                      >
                        <td className="px-4 sm:px-6 py-3 font-medium capitalize">{k.word}</td>
                        <td className="px-4 sm:px-6 py-3 text-center font-mono tabular-nums">{k.count}</td>
                        <td className="px-4 sm:px-6 py-3 text-right">
                          <span className={`font-semibold tabular-nums ${densityColor(k.density)}`}>
                            {k.density.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {analyzed && stats.keywords.length === 0 && (
            <div className="mt-8 text-center text-sm text-muted-foreground py-8 border border-dashed rounded-2xl">
              No keywords found. Try adding more content or unchecking "Ignore common words".
            </div>
          )}
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
}
