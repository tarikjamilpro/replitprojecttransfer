import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Upload, 
  Loader2, 
  SpellCheck, 
  X,
  ChevronRight,
  Lightbulb,
  RefreshCw
} from "lucide-react";

interface GrammarError {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule: {
    id: string;
    description: string;
    category: { id: string; name: string };
  };
  context: {
    text: string;
    offset: number;
    length: number;
  };
}

interface CheckResult {
  matches: GrammarError[];
}

const LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
];

const MAX_WORDS = 5000;

export default function GrammarChecker() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [deepCheck, setDeepCheck] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [selectedError, setSelectedError] = useState<GrammarError | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const isOverLimit = wordCount > MAX_WORDS;

  const checkGrammar = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to check.",
        variant: "destructive",
      });
      return;
    }

    if (isOverLimit) {
      toast({
        title: "Text too long",
        description: `Please limit your text to ${MAX_WORDS} words.`,
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setErrors([]);
    setSelectedError(null);

    try {
      const params = new URLSearchParams({
        text: text,
        language: language,
        enabledOnly: "false",
      });

      if (deepCheck) {
        params.append("level", "picky");
      }

      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to check grammar");
      }

      const result: CheckResult = await response.json();
      setErrors(result.matches);
      setHasChecked(true);

      if (result.matches.length === 0) {
        toast({
          title: "No errors found!",
          description: "Your text looks great.",
        });
      } else {
        toast({
          title: `Found ${result.matches.length} issue${result.matches.length > 1 ? "s" : ""}`,
          description: "Click on highlighted text or side panel items to see suggestions.",
        });
      }
    } catch (error) {
      toast({
        title: "Error checking grammar",
        description: "Could not connect to grammar service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  }, [text, language, deepCheck, isOverLimit, toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      setErrors([]);
      setHasChecked(false);
      toast({
        title: "File loaded",
        description: `Loaded ${file.name}`,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the file. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const applySuggestion = (error: GrammarError, replacement: string) => {
    const before = text.substring(0, error.offset);
    const after = text.substring(error.offset + error.length);
    const newText = before + replacement + after;
    
    const offsetDiff = replacement.length - error.length;
    const updatedErrors = errors
      .filter((e) => e !== error)
      .map((e) => {
        if (e.offset > error.offset) {
          return { ...e, offset: e.offset + offsetDiff };
        }
        return e;
      });
    
    setText(newText);
    setErrors(updatedErrors);
    setSelectedError(null);
    
    toast({
      title: "Correction applied",
      description: `Replaced with "${replacement}"`,
    });
  };

  const ignoreError = (error: GrammarError) => {
    setErrors(errors.filter((e) => e !== error));
    setSelectedError(null);
  };

  const clearAll = () => {
    setText("");
    setErrors([]);
    setSelectedError(null);
    setHasChecked(false);
  };

  const getHighlightedText = () => {
    if (errors.length === 0) return text;

    const sortedErrors = [...errors].sort((a, b) => a.offset - b.offset);
    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    sortedErrors.forEach((error, index) => {
      if (error.offset > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, error.offset)}
          </span>
        );
      }

      const errorText = text.substring(error.offset, error.offset + error.length);
      const isSelected = selectedError === error;
      const categoryColor = getCategoryColor(error.rule.category.id);

      parts.push(
        <span
          key={`error-${index}`}
          className={`
            cursor-pointer underline decoration-wavy decoration-2 transition-all
            ${categoryColor}
            ${isSelected ? "bg-primary/20 ring-2 ring-primary rounded" : ""}
          `}
          onClick={() => setSelectedError(error)}
          title={error.message}
          data-testid={`error-highlight-${index}`}
        >
          {errorText}
        </span>
      );

      lastIndex = error.offset + error.length;
    });

    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return parts;
  };

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case "TYPOS":
      case "SPELLING":
        return "decoration-red-500";
      case "GRAMMAR":
        return "decoration-yellow-500";
      case "PUNCTUATION":
        return "decoration-blue-500";
      case "STYLE":
        return "decoration-purple-500";
      default:
        return "decoration-orange-500";
    }
  };

  const getCategoryBadgeColor = (categoryId: string) => {
    switch (categoryId) {
      case "TYPOS":
      case "SPELLING":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "GRAMMAR":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "PUNCTUATION":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "STYLE":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SpellCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Grammar Checker</h1>
          </div>
          <p className="text-muted-foreground">
            Check your text for grammar, spelling, and style issues
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[180px]" data-testid="select-language">
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
                    <div className="flex items-center gap-2">
                      <Switch
                        id="deep-check"
                        checked={deepCheck}
                        onCheckedChange={setDeepCheck}
                        data-testid="switch-deep-check"
                      />
                      <Label htmlFor="deep-check" className="cursor-pointer">
                        Deep Check
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".txt"
                      className="hidden"
                      data-testid="input-file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload .txt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      data-testid="button-clear"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {errors.length > 0 && hasChecked ? (
                    <div
                      className="min-h-[300px] p-4 border rounded-md bg-muted/30 whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[500px]"
                      data-testid="highlighted-text-area"
                    >
                      {getHighlightedText()}
                    </div>
                  ) : (
                    <Textarea
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        setErrors([]);
                        setHasChecked(false);
                      }}
                      placeholder="Type or paste your text here to check for grammar and spelling errors..."
                      className="min-h-[300px] font-mono text-sm resize-none"
                      data-testid="input-text"
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className={isOverLimit ? "text-destructive font-medium" : ""}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
                    </span>
                    <span>
                      {charCount.toLocaleString()} characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasChecked && errors.length === 0 && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        No issues found
                      </Badge>
                    )}
                    {errors.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setErrors([]);
                          setHasChecked(false);
                        }}
                        data-testid="button-edit"
                      >
                        Edit Text
                      </Button>
                    )}
                    <Button
                      onClick={checkGrammar}
                      disabled={isChecking || !text.trim() || isOverLimit}
                      data-testid="button-check"
                    >
                      {isChecking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <SpellCheck className="w-4 h-4 mr-2" />
                          Check Grammar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {hasChecked && errors.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="font-medium">Legend:</span>
                    <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Spelling
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Grammar
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Punctuation
                    </Badge>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      Style
                    </Badge>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      Other
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Suggestions
                  {errors.length > 0 && (
                    <Badge variant="secondary">{errors.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasChecked && (
                  <div className="text-center py-8 text-muted-foreground">
                    <SpellCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Check Grammar" to analyze your text</p>
                  </div>
                )}

                {hasChecked && errors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="font-medium text-foreground">Great job!</p>
                    <p className="text-sm">No grammar or spelling issues found.</p>
                  </div>
                )}

                {errors.length > 0 && (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {errors.map((error, index) => (
                      <div
                        key={index}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          ${selectedError === error ? "border-primary bg-primary/5" : "hover-elevate"}
                        `}
                        onClick={() => setSelectedError(error)}
                        data-testid={`suggestion-${index}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={getCategoryBadgeColor(error.rule.category.id)}
                          >
                            {error.rule.category.name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              ignoreError(error);
                            }}
                            data-testid={`button-ignore-${index}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>

                        <p className="text-sm mb-2">{error.message}</p>

                        <div className="text-xs text-muted-foreground mb-2 bg-muted p-2 rounded">
                          <span className="line-through text-destructive">
                            {text.substring(error.offset, error.offset + error.length)}
                          </span>
                        </div>

                        {error.replacements.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {error.replacements.slice(0, 5).map((rep, repIndex) => (
                              <Button
                                key={repIndex}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applySuggestion(error, rep.value);
                                }}
                                data-testid={`button-replace-${index}-${repIndex}`}
                              >
                                <ChevronRight className="w-3 h-3 mr-1" />
                                {rep.value || "(remove)"}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-sm">How to Use</h3>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">1</span>
                    Type or paste your text in the editor
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">2</span>
                    Select language and enable Deep Check for more thorough analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">3</span>
                    Click "Check Grammar" to analyze
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">4</span>
                    Click on highlighted errors or suggestions to apply fixes
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
