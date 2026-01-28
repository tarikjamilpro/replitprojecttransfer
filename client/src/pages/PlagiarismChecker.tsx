import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Upload,
  FileText,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  Link as LinkIcon,
  SpellCheck,
  Wand2,
  ShieldCheck,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HardDrive,
  Cloud,
  Droplet,
  DollarSign,
  Info
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { RelatedTools } from "@/components/RelatedTools";
import { getToolSEO } from "@/data/toolsData";

const MAX_WORDS = 2000;

interface AIDetectionResult {
  aiScore: number;
  humanScore: number;
  analysis: string;
  confidence: "high" | "medium" | "low";
  details: {
    patternScore: number;
    vocabularyScore: number;
    structureScore: number;
  };
}

interface GrammarIssue {
  message: string;
  offset: number;
  length: number;
  replacements: string[];
  type: string;
}

interface ParaphraseResult {
  original: string;
  paraphrased: string;
}

export default function PlagiarismChecker() {
  const toolSEO = getToolSEO("/plagiarism-checker");
  const [activeTab, setActiveTab] = useState("ai-detection");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [aiResult, setAiResult] = useState<AIDetectionResult | null>(null);
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
  const [paraphraseResult, setParaphraseResult] = useState<ParaphraseResult | null>(null);
  
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const isOverLimit = wordCount > MAX_WORDS;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setShowResults(false);
    setAiResult(null);
    setGrammarIssues([]);
    setParaphraseResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt") && !file.type.includes("text")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file. PDF and Word documents require conversion first.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      setShowResults(false);
      toast({ title: "File loaded", description: `Loaded ${file.name}` });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleGoogleDrive = () => {
    toast({
      title: "Google Drive",
      description: "Google Drive integration requires API setup. For now, please upload from device.",
    });
  };

  const handleDropbox = () => {
    toast({
      title: "Dropbox",
      description: "Dropbox integration requires API setup. For now, please upload from device.",
    });
  };

  const handleUrlCheck = async () => {
    if (!url.trim()) {
      toast({
        title: "No URL",
        description: "Please enter a URL to check",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/fetch-url-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch URL content");
      }

      const data = await response.json();
      setText(data.content);
      toast({ title: "Content loaded", description: "URL content has been loaded for analysis" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch content from URL. Please paste content directly.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const runAIDetection = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: "No content",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!captchaVerified) {
      toast({
        title: "Verification required",
        description: "Please verify you're not a robot",
        variant: "destructive",
      });
      return;
    }

    if (isOverLimit) {
      toast({
        title: "Text too long",
        description: `Maximum ${MAX_WORDS} words allowed`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowResults(false);

    try {
      const response = await fetch("/api/ai-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        throw new Error("Detection failed");
      }

      const result = await response.json();
      setAiResult(result);
      setShowResults(true);
      toast({ title: "Analysis complete", description: "AI detection results are ready" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [text, captchaVerified, isOverLimit, toast]);

  const runGrammarCheck = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: "No content",
        description: "Please enter text to check",
        variant: "destructive",
      });
      return;
    }

    if (!captchaVerified) {
      toast({
        title: "Verification required",
        description: "Please verify you're not a robot",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowResults(false);

    try {
      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text: text.trim(),
          language: "en-US",
        }),
      });

      if (!response.ok) {
        throw new Error("Grammar check failed");
      }

      const result = await response.json();
      const issues: GrammarIssue[] = result.matches.map((m: any) => ({
        message: m.message,
        offset: m.offset,
        length: m.length,
        replacements: m.replacements.slice(0, 3).map((r: any) => r.value),
        type: m.rule?.category?.name || "Grammar",
      }));
      
      setGrammarIssues(issues);
      setShowResults(true);
      toast({ 
        title: "Check complete", 
        description: `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''}` 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check grammar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [text, captchaVerified, toast]);

  const runParaphrase = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: "No content",
        description: "Please enter text to paraphrase",
        variant: "destructive",
      });
      return;
    }

    if (!captchaVerified) {
      toast({
        title: "Verification required",
        description: "Please verify you're not a robot",
        variant: "destructive",
      });
      return;
    }

    if (isOverLimit) {
      toast({
        title: "Text too long",
        description: `Maximum ${MAX_WORDS} words allowed`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowResults(false);

    try {
      const response = await fetch("/api/paraphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        throw new Error("Paraphrasing failed");
      }

      const result = await response.json();
      setParaphraseResult({
        original: text.trim(),
        paraphrased: result.paraphrased,
      });
      setShowResults(true);
      toast({ title: "Paraphrasing complete", description: "Your text has been rewritten" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to paraphrase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [text, captchaVerified, isOverLimit, toast]);

  const handleAnalyze = () => {
    switch (activeTab) {
      case "ai-detection":
        runAIDetection();
        break;
      case "grammar":
        runGrammarCheck();
        break;
      case "paraphrase":
        runParaphrase();
        break;
      default:
        runAIDetection();
    }
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Content copied to clipboard" });
  };

  const downloadResult = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setText("");
    setUrl("");
    setShowResults(false);
    setAiResult(null);
    setGrammarIssues([]);
    setParaphraseResult(null);
    setFeedbackGiven(null);
  };

  const getScoreColor = (score: number, isAI: boolean) => {
    if (isAI) {
      if (score >= 70) return "text-red-500";
      if (score >= 40) return "text-orange-500";
      return "text-green-500";
    } else {
      if (score >= 70) return "text-green-500";
      if (score >= 40) return "text-orange-500";
      return "text-red-500";
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">High Confidence</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Medium Confidence</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">Low Confidence</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Plagiarism Checker & AI Detector</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced content analysis tool to detect AI-generated text, check grammar, and paraphrase content. Ensure your writing is original and human-like.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
            <TabsTrigger value="ai-detection" className="gap-2" data-testid="tab-ai-detection">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Detection</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="grammar" className="gap-2" data-testid="tab-grammar">
              <SpellCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Grammar Check</span>
              <span className="sm:hidden">Grammar</span>
            </TabsTrigger>
            <TabsTrigger value="paraphrase" className="gap-2" data-testid="tab-paraphrase">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Paraphrase</span>
              <span className="sm:hidden">Rewrite</span>
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>Input Content</span>
                  <div className={`text-sm font-normal ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
                    {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt"
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-upload-device"
                  >
                    <HardDrive className="w-4 h-4 mr-2" />
                    Device
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGoogleDrive}
                    data-testid="button-upload-gdrive"
                  >
                    <Cloud className="w-4 h-4 mr-2" />
                    Google Drive
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDropbox}
                    data-testid="button-upload-dropbox"
                  >
                    <Droplet className="w-4 h-4 mr-2" />
                    Dropbox
                  </Button>
                </div>

                <Textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Paste or type your content here to analyze..."
                  className="min-h-[250px] resize-none"
                  data-testid="input-content"
                />

                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Or enter a URL to check..."
                    className="flex-1"
                    data-testid="input-url"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleUrlCheck}
                    disabled={isProcessing || !url.trim()}
                    data-testid="button-fetch-url"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="captcha"
                    checked={captchaVerified}
                    onCheckedChange={(checked) => setCaptchaVerified(checked as boolean)}
                    data-testid="checkbox-captcha"
                  />
                  <Label htmlFor="captcha" className="flex items-center gap-2 cursor-pointer">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    I'm not a robot
                  </Label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isProcessing || !text.trim() || !captchaVerified || isOverLimit}
                    className="flex-1"
                    data-testid="button-analyze"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        {activeTab === "ai-detection" && "Detect AI Content"}
                        {activeTab === "grammar" && "Check Grammar"}
                        {activeTab === "paraphrase" && "Paraphrase Text"}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearAll} data-testid="button-clear">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showResults ? (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border rounded-md bg-muted/30">
                    <Search className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-center">Results will appear here</p>
                    <p className="text-sm text-center mt-2">Enter content and click analyze to start</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <TabsContent value="ai-detection" className="mt-0">
                      {aiResult && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Bot className="w-5 h-5 text-red-500" />
                                <span className="font-medium">AI Written</span>
                              </div>
                              <div className={`text-3xl font-bold ${getScoreColor(aiResult.aiScore, true)}`}>
                                {aiResult.aiScore}%
                              </div>
                              <Progress value={aiResult.aiScore} className="mt-2 h-2" />
                            </Card>
                            <Card className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-5 h-5 text-green-500" />
                                <span className="font-medium">Human Written</span>
                              </div>
                              <div className={`text-3xl font-bold ${getScoreColor(aiResult.humanScore, false)}`}>
                                {aiResult.humanScore}%
                              </div>
                              <Progress value={aiResult.humanScore} className="mt-2 h-2" />
                            </Card>
                          </div>

                          <div className="flex items-center gap-2">
                            {getConfidenceBadge(aiResult.confidence)}
                          </div>

                          <Card className="p-4 bg-muted/30">
                            <h4 className="font-medium mb-2">Detailed Analysis</h4>
                            <p className="text-sm text-muted-foreground mb-3">{aiResult.analysis}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <div className="text-muted-foreground">Pattern</div>
                                <div className="font-medium">{aiResult.details.patternScore}%</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Vocabulary</div>
                                <div className="font-medium">{aiResult.details.vocabularyScore}%</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Structure</div>
                                <div className="font-medium">{aiResult.details.structureScore}%</div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="grammar" className="mt-0">
                      {grammarIssues.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="font-medium">No grammar issues found!</p>
                          <p className="text-sm text-muted-foreground">Your text looks great.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                          {grammarIssues.map((issue, index) => (
                            <Card key={index} className="p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{issue.message}</p>
                                  <Badge variant="outline" className="text-xs mt-1">{issue.type}</Badge>
                                  {issue.replacements.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {issue.replacements.map((r, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs cursor-pointer">
                                          {r}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="paraphrase" className="mt-0">
                      {paraphraseResult && (
                        <div className="space-y-4">
                          <div className="p-4 border rounded-md bg-muted/30">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Wand2 className="w-4 h-4" />
                              Paraphrased Text
                            </h4>
                            <p className="text-sm whitespace-pre-wrap">{paraphraseResult.paraphrased}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(paraphraseResult.paraphrased)}
                              data-testid="button-copy-paraphrase"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadResult(paraphraseResult.paraphrased, "paraphrased-text.txt")}
                              data-testid="button-download-paraphrase"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Was this result helpful?</p>
                      <div className="flex gap-2">
                        <Button
                          variant={feedbackGiven === "up" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setFeedbackGiven("up");
                            toast({ title: "Thank you!", description: "We appreciate your feedback" });
                          }}
                          data-testid="button-feedback-up"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={feedbackGiven === "down" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setFeedbackGiven("down");
                            toast({ title: "Thank you!", description: "We'll work to improve" });
                          }}
                          data-testid="button-feedback-down"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Tabs>

        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Premium Features</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Basic</span>
                </div>
                <div className="text-2xl font-bold mb-2">Free</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Up to 2,000 words</li>
                  <li>AI detection</li>
                  <li>Grammar check</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg border-primary bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="font-medium">Pro</span>
                  <Badge variant="secondary">Popular</Badge>
                </div>
                <div className="text-2xl font-bold mb-2">$9.80<span className="text-sm font-normal">/mo</span></div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Up to 10,000 words</li>
                  <li>Deep plagiarism scan</li>
                  <li>Unlimited paraphrasing</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Enterprise</span>
                </div>
                <div className="text-2xl font-bold mb-2">Custom</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Unlimited words</li>
                  <li>API access</li>
                  <li>Team accounts</li>
                  <li>Custom integrations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">How It Works</h3>
            <div className="grid sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Paste your content or upload a file for analysis</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Verify you're human with the captcha checkbox</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Choose your analysis type: AI detection, grammar, or paraphrase</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <p>Get instant results with detailed insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong>Privacy Notice:</strong> Your content is processed securely and not stored. We comply with GDPR and privacy regulations. 
              By using this tool, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Use</a> and <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <RelatedTools currentToolId="plagiarism-checker" category="Text Tools" />
      </div>
    </div>
  );
}
