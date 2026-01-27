import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Trash2, Download, Link, ListFilter, Type } from "lucide-react";

export default function TextCleaner() {
  const { toast } = useToast();
  
  const [dupInput, setDupInput] = useState("");
  const [dupOutput, setDupOutput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [ignoreEmpty, setIgnoreEmpty] = useState(true);
  const [dupStats, setDupStats] = useState({ original: 0, unique: 0, removed: 0 });
  const [dupCopied, setDupCopied] = useState(false);

  const [slugInput, setSlugInput] = useState("");
  const [slugOutput, setSlugOutput] = useState("");
  const [slugSeparator, setSlugSeparator] = useState("-");
  const [slugCopied, setSlugCopied] = useState(false);

  const removeDuplicates = () => {
    let lines = dupInput.split("\n");
    const originalCount = lines.length;

    if (trimWhitespace) {
      lines = lines.map((line) => line.trim());
    }

    if (ignoreEmpty) {
      lines = lines.filter((line) => line.length > 0);
    }

    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      }
    }

    const uniqueCount = uniqueLines.length;
    const removedCount = (ignoreEmpty ? lines.length : originalCount) - uniqueCount;

    setDupOutput(uniqueLines.join("\n"));
    setDupStats({
      original: originalCount,
      unique: uniqueCount,
      removed: removedCount,
    });

    toast({
      title: "Duplicates Removed",
      description: `${removedCount} duplicate lines removed`,
    });
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, slugSeparator)
      .replace(new RegExp(`${slugSeparator}+`, "g"), slugSeparator)
      .replace(new RegExp(`^${slugSeparator}|${slugSeparator}$`, "g"), "");
  };

  const handleSlugInput = (value: string) => {
    setSlugInput(value);
    setSlugOutput(generateSlug(value));
  };

  const handleSeparatorChange = (sep: string) => {
    setSlugSeparator(sep);
    if (slugInput) {
      const newSlug = slugInput
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-_]/g, "")
        .trim()
        .replace(/[\s-_]+/g, sep)
        .replace(new RegExp(`${sep}+`, "g"), sep)
        .replace(new RegExp(`^${sep}|${sep}$`, "g"), "");
      setSlugOutput(newSlug);
    }
  };

  const copyToClipboard = async (text: string, type: "dup" | "slug") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "dup") {
        setDupCopied(true);
        setTimeout(() => setDupCopied(false), 2000);
      } else {
        setSlugCopied(true);
        setTimeout(() => setSlugCopied(false), 2000);
      }
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: `${filename} saved`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Type className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Text Cleaner Tools</h1>
          </div>
          <p className="text-muted-foreground">Clean text and generate SEO-friendly slugs</p>
        </div>

        <Tabs defaultValue="duplicates" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="duplicates" className="gap-2" data-testid="tab-duplicates">
              <ListFilter className="w-4 h-4" />
              Remove Duplicates
            </TabsTrigger>
            <TabsTrigger value="slug" className="gap-2" data-testid="tab-slug">
              <Link className="w-4 h-4" />
              Text to Slug
            </TabsTrigger>
          </TabsList>

          <TabsContent value="duplicates">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold">Input Text</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDupInput("");
                        setDupOutput("");
                        setDupStats({ original: 0, unique: 0, removed: 0 });
                      }}
                      data-testid="button-clear-dup"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <Textarea
                    value={dupInput}
                    onChange={(e) => setDupInput(e.target.value)}
                    placeholder="Paste your list here... (one item per line)"
                    className="min-h-[200px] font-mono"
                    data-testid="input-dup-text"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {dupInput.split("\n").filter((l) => l.length > 0).length} lines
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Options</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="case-sensitive">Case Sensitive</Label>
                      <Switch
                        id="case-sensitive"
                        checked={caseSensitive}
                        onCheckedChange={setCaseSensitive}
                        data-testid="switch-case"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="trim-whitespace">Trim Whitespace</Label>
                      <Switch
                        id="trim-whitespace"
                        checked={trimWhitespace}
                        onCheckedChange={setTrimWhitespace}
                        data-testid="switch-trim"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ignore-empty">Ignore Empty Lines</Label>
                      <Switch
                        id="ignore-empty"
                        checked={ignoreEmpty}
                        onCheckedChange={setIgnoreEmpty}
                        data-testid="switch-empty"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={removeDuplicates}
                    className="w-full mt-6"
                    disabled={!dupInput.trim()}
                    data-testid="button-remove-duplicates"
                  >
                    <ListFilter className="w-4 h-4 mr-2" />
                    Remove Duplicate Lines
                  </Button>
                </CardContent>
              </Card>

              {dupOutput && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary">{dupStats.original}</p>
                        <p className="text-sm text-muted-foreground">Original Lines</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{dupStats.unique}</p>
                        <p className="text-sm text-muted-foreground">Unique Lines</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-red-500">{dupStats.removed}</p>
                        <p className="text-sm text-muted-foreground">Duplicates Removed</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-lg font-semibold">Cleaned Output</Label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(dupOutput, "dup")}
                            data-testid="button-copy-dup"
                          >
                            {dupCopied ? (
                              <Check className="w-4 h-4 mr-1" />
                            ) : (
                              <Copy className="w-4 h-4 mr-1" />
                            )}
                            {dupCopied ? "Copied!" : "Copy"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadText(dupOutput, "cleaned-text.txt")}
                            data-testid="button-download-dup"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={dupOutput}
                        readOnly
                        className="min-h-[200px] font-mono"
                        data-testid="output-dup-text"
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="slug">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold">Enter Text</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSlugInput("");
                        setSlugOutput("");
                      }}
                      data-testid="button-clear-slug"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <Input
                    value={slugInput}
                    onChange={(e) => handleSlugInput(e.target.value)}
                    placeholder="Enter text to convert... (e.g., How to Make Money Online)"
                    className="text-lg"
                    data-testid="input-slug-text"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Example: "Product Title 2024!" → "product-title-2024"
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Options</h3>
                  <div>
                    <Label className="mb-2 block">Separator Character</Label>
                    <div className="flex gap-2">
                      {[
                        { value: "-", label: "Hyphen (-)" },
                        { value: "_", label: "Underscore (_)" },
                      ].map((opt) => (
                        <Button
                          key={opt.value}
                          variant={slugSeparator === opt.value ? "default" : "outline"}
                          onClick={() => handleSeparatorChange(opt.value)}
                          data-testid={`button-sep-${opt.value}`}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {slugOutput && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-lg font-semibold">Generated Slug</Label>
                      <Button
                        onClick={() => copyToClipboard(slugOutput, "slug")}
                        data-testid="button-copy-slug"
                      >
                        {slugCopied ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {slugCopied ? "Copied!" : "Copy Slug"}
                      </Button>
                    </div>

                    <div className="bg-muted rounded-lg p-4 font-mono text-xl text-center break-all" data-testid="output-slug">
                      {slugOutput}
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      <p><strong>Character count:</strong> {slugOutput.length}</p>
                      <p className="mt-2">
                        <strong>URL Preview:</strong>
                        <span className="font-mono ml-2 text-primary">
                          https://example.com/blog/{slugOutput}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">What is a Slug?</h3>
                  <p className="text-sm text-muted-foreground">
                    A slug is the URL-friendly version of a title. It's used in website URLs to create 
                    readable, SEO-optimized links. Slugs use lowercase letters, numbers, and hyphens 
                    instead of spaces and special characters.
                  </p>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Conversion Rules:</h4>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Convert to lowercase</li>
                        <li>Replace spaces with hyphens</li>
                        <li>Remove special characters</li>
                        <li>Handle accented characters</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Examples:</h4>
                      <ul className="text-muted-foreground space-y-1 font-mono text-xs">
                        <li>"Hello World" → hello-world</li>
                        <li>"Café Menu" → cafe-menu</li>
                        <li>"10 Tips!" → 10-tips</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
