import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Wand2,
  Upload,
  Clipboard,
  FileText,
  Copy,
  Download,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Bot,
  SpellCheck,
  RefreshCw
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { RelatedTools } from "@/components/RelatedTools";
import { getToolSEO } from "@/data/toolsData";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
];

const SAMPLE_TEXT = `Artificial intelligence has emerged as a transformative technology that is reshaping industries across the globe. Machine learning algorithms are capable of analyzing vast datasets and identifying patterns that would be impossible for humans to detect. Natural language processing enables computers to understand and generate human language with remarkable accuracy. The implementation of AI solutions is driving efficiency gains and innovation in sectors ranging from healthcare to finance. As these technologies continue to evolve, they promise to fundamentally alter the way we work, communicate, and solve complex problems.`;

const MAX_WORDS = 2000;

export default function AIHumanizer() {
  const toolSEO = getToolSEO("/ai-humanizer");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [language, setLanguage] = useState("en");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const isOverLimit = wordCount > MAX_WORDS;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      setOutputText("");
      setHasGenerated(false);
      toast({ title: "Text pasted", description: "Content pasted from clipboard" });
    } catch {
      toast({ title: "Paste failed", description: "Could not access clipboard", variant: "destructive" });
    }
  };

  const handleSampleText = () => {
    setInputText(SAMPLE_TEXT);
    setOutputText("");
    setHasGenerated(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      toast({ title: "Invalid file", description: "Please upload a .txt file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      setOutputText("");
      setHasGenerated(false);
      toast({ title: "File loaded", description: `Loaded ${file.name}` });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast({ title: "Empty input", description: "Please enter text to humanize", variant: "destructive" });
      return;
    }

    if (isOverLimit) {
      toast({ title: "Text too long", description: `Limit is ${MAX_WORDS} words`, variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setOutputText("");

    try {
      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, language }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to humanize text");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.content) {
              result += event.content;
              setOutputText(result);
            }
          } catch {}
        }
      }

      setHasGenerated(true);
      toast({ title: "Humanization complete", description: "Your text has been transformed" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to humanize text",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputText);
    toast({ title: "Copied!", description: "Text copied to clipboard" });
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "humanized-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setHasGenerated(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Wand2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Humanizer</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform your AI-generated text into human-like content with ease. Simply paste your content and let our AI work its magic.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Link href="/grammar-checker">
            <Button variant="outline" className="gap-2" data-testid="link-grammar-checker">
              <SpellCheck className="w-4 h-4" />
              Grammar Checker
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Input Text</Label>
                <div className="flex items-center gap-2">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[140px]" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setHasGenerated(false);
                }}
                placeholder="Please enter your content here and click 'Humanize' below..."
                className="min-h-[300px] resize-none"
                data-testid="input-text"
              />

              <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                <div className={`text-sm ${isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  Words Count: {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleSampleText} data-testid="button-sample">
                    <FileText className="w-4 h-4 mr-2" />
                    Sample Text
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePaste} data-testid="button-paste">
                    <Clipboard className="w-4 h-4 mr-2" />
                    Paste Text
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt"
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} data-testid="button-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Humanized Output</Label>
                {hasGenerated && (
                  <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                )}
              </div>

              {!outputText && !isProcessing ? (
                <div className="min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border rounded-md bg-muted/30">
                  <Bot className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center">Humanized Content Would Appear Here</p>
                  <p className="text-sm text-center mt-2">Enter text and click "Humanize" to start</p>
                </div>
              ) : (
                <div
                  className="min-h-[300px] p-4 border rounded-md bg-muted/30 whitespace-pre-wrap overflow-auto max-h-[400px]"
                  data-testid="output-text"
                >
                  {isProcessing && !outputText && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Humanizing your text...
                    </div>
                  )}
                  {outputText}
                </div>
              )}

              {outputText && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} data-testid="button-download">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Link href="/grammar-checker">
                    <Button variant="outline" size="sm">
                      <SpellCheck className="w-4 h-4 mr-2" />
                      Check Grammar
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" onClick={handleClear} disabled={isProcessing} data-testid="button-clear">
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            size="lg"
            onClick={handleHumanize}
            disabled={isProcessing || !inputText.trim() || isOverLimit}
            className="min-w-[200px]"
            data-testid="button-humanize"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Humanizing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Humanize
              </>
            )}
          </Button>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">How to Use</h3>
            <div className="grid sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Paste or type your AI-generated text in the input area</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Select your target language from the dropdown</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Click "Humanize" to transform your content</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <p>Copy or download your humanized text</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RelatedTools currentToolId="ai-humanizer" category="Text Tools" />
      </div>
    </div>
  );
}
