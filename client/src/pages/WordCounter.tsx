import { useState, useMemo } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Trash2, FileText, Type, AlignLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

export default function WordCounter() {
  const toolSEO = getToolSEO("/word-counter");
  const [text, setText] = useState("");
  const { toast } = useToast();

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    
    const words = trimmedText ? trimmedText.split(/\s+/).filter(word => word.length > 0).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmedText ? (trimmedText.match(/[.!?]+/g) || []).length || (trimmedText.length > 0 ? 1 : 0) : 0;
    const paragraphs = trimmedText ? trimmedText.split(/\n\n+/).filter(p => p.trim().length > 0).length : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 150);

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
    };
  }, [text]);

  const handleCopy = async () => {
    if (!text.trim()) {
      toast({
        title: "Nothing to copy",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <ToolPageLayout
      title="Word Counter"
      description="Count words, characters, sentences, paragraphs, and estimate reading time instantly."
      toolPath="/word-counter"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Paste or type your text in the input area above.</li>
          <li>The statistics will update automatically in real-time.</li>
          <li>Use the copy button to copy your text to clipboard.</li>
          <li>Use the clear button to reset and start fresh.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<FileText className="w-4 h-4" />}
            label="Words"
            value={stats.words}
            testId="stat-words"
          />
          <StatCard
            icon={<Type className="w-4 h-4" />}
            label="Characters"
            value={stats.characters}
            testId="stat-characters"
          />
          <StatCard
            icon={<AlignLeft className="w-4 h-4" />}
            label="Sentences"
            value={stats.sentences}
            testId="stat-sentences"
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Reading Time"
            value={`${stats.readingTime} min`}
            testId="stat-reading-time"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Characters (no spaces)"
            value={stats.charactersNoSpaces}
            testId="stat-chars-no-spaces"
            small
          />
          <StatCard
            label="Paragraphs"
            value={stats.paragraphs}
            testId="stat-paragraphs"
            small
          />
          <StatCard
            label="Speaking Time"
            value={`${stats.speakingTime} min`}
            testId="stat-speaking-time"
            small
          />
        </div>

        <Textarea
          placeholder="Paste or type your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[300px] resize-y text-base"
          data-testid="input-text"
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} variant="outline" data-testid="button-copy">
            <Copy className="w-4 h-4 mr-2" />
            Copy Text
          </Button>
          <Button onClick={handleClear} variant="outline" data-testid="button-clear">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  testId,
  small,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  testId: string;
  small?: boolean;
}) {
  return (
    <Card className={small ? "bg-muted/50" : ""}>
      <CardContent className={`${small ? "p-3" : "p-4"} text-center`}>
        {icon && <div className="flex justify-center mb-1 text-primary">{icon}</div>}
        <div className={`font-bold text-foreground ${small ? "text-lg" : "text-2xl"}`} data-testid={testId}>
          {value}
        </div>
        <div className={`text-muted-foreground ${small ? "text-xs" : "text-sm"}`}>{label}</div>
      </CardContent>
    </Card>
  );
}
