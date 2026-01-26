import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CaseType = "uppercase" | "lowercase" | "sentence" | "title" | "capitalize";

export default function CaseConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const { toast } = useToast();

  const convertCase = (type: CaseType) => {
    if (!inputText.trim()) {
      toast({
        title: "No text to convert",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    let result = "";

    switch (type) {
      case "uppercase":
        result = inputText.toUpperCase();
        break;
      case "lowercase":
        result = inputText.toLowerCase();
        break;
      case "sentence":
        result = inputText
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case "title":
        result = inputText
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
        break;
      case "capitalize":
        result = inputText
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        break;
    }

    setOutputText(result);
  };

  const handleCopy = async () => {
    if (!outputText.trim()) {
      toast({
        title: "Nothing to copy",
        description: "Convert some text first.",
        variant: "destructive",
      });
      return;
    }
    await navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied!",
      description: "Converted text copied to clipboard.",
    });
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  const caseButtons: { type: CaseType; label: string; example: string }[] = [
    { type: "uppercase", label: "UPPERCASE", example: "HELLO WORLD" },
    { type: "lowercase", label: "lowercase", example: "hello world" },
    { type: "sentence", label: "Sentence case", example: "Hello world. This is a test." },
    { type: "title", label: "Title Case", example: "Hello World This Is A Test" },
    { type: "capitalize", label: "Capitalized Case", example: "Hello World" },
  ];

  return (
    <ToolPageLayout
      title="Case Converter"
      description="Convert your text to UPPERCASE, lowercase, Sentence case, Title Case, or Capitalized Case instantly."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter or paste your text in the input area.</li>
          <li>Click one of the case conversion buttons (UPPERCASE, lowercase, etc.).</li>
          <li>The converted text will appear in the output area below.</li>
          <li>Click the Copy button to copy the result to your clipboard.</li>
        </ol>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Input Text
          </label>
          <Textarea
            placeholder="Enter your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[150px] resize-y text-base"
            data-testid="input-text"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {caseButtons.map((btn) => (
            <Button
              key={btn.type}
              onClick={() => convertCase(btn.type)}
              variant="outline"
              className="min-w-[120px]"
              data-testid={`button-${btn.type}`}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Output Text
          </label>
          <Textarea
            placeholder="Converted text will appear here..."
            value={outputText}
            readOnly
            className="min-h-[150px] resize-y text-base bg-muted/30"
            data-testid="output-text"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} data-testid="button-copy">
            <Copy className="w-4 h-4 mr-2" />
            Copy Result
          </Button>
          <Button onClick={handleClear} variant="outline" data-testid="button-clear">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </ToolPageLayout>
  );
}
