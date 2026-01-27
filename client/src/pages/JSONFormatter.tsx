import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Minimize2, Copy, AlertCircle, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

export default function JSONFormatter() {
  const toolSEO = getToolSEO("/json-formatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatJSON = () => {
    if (!input.trim()) {
      setError("Please enter some JSON to format");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Invalid JSON";
      setError(errorMessage);
      setOutput("");
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      setError("Please enter some JSON to minify");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Invalid JSON";
      setError(errorMessage);
      setOutput("");
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <ToolPageLayout
      title="JSON Formatter & Minifier"
      description="Format, beautify, or minify your JSON data. Validate JSON syntax and copy the result with one click."
      toolPath="/json-formatter"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Paste your JSON data in the left input area.</li>
          <li>Click "Format/Beautify" to make the JSON readable with proper indentation.</li>
          <li>Click "Minify" to remove all whitespace and make it compact.</li>
          <li>If there's an error, it will be displayed in red below the buttons.</li>
          <li>Click "Copy to Clipboard" to copy the formatted/minified result.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={formatJSON} data-testid="button-format">
            <Wand2 className="w-4 h-4 mr-2" />
            Format / Beautify
          </Button>
          <Button onClick={minifyJSON} variant="outline" data-testid="button-minify">
            <Minimize2 className="w-4 h-4 mr-2" />
            Minify
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            disabled={!output}
            data-testid="button-copy"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button
            onClick={clearAll}
            variant="ghost"
            data-testid="button-clear"
          >
            Clear All
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive" data-testid="error-message">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Input JSON</h3>
              <Textarea
                placeholder='{"name": "example", "value": 123}'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
                data-testid="textarea-input"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {input.length} characters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Output</h3>
              <Textarea
                placeholder="Formatted or minified JSON will appear here..."
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm resize-none bg-muted/50"
                data-testid="textarea-output"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {output.length} characters
                {input && output && input.length !== output.length && (
                  <span className="ml-2">
                    ({output.length < input.length ? "-" : "+"}
                    {Math.abs(output.length - input.length)} chars)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Sample JSON</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Try this example to test the formatter:
            </p>
            <code className="text-xs bg-background p-2 rounded block overflow-x-auto">
              {`{"users":[{"id":1,"name":"John","email":"john@example.com"},{"id":2,"name":"Jane","email":"jane@example.com"}],"total":2}`}
            </code>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
