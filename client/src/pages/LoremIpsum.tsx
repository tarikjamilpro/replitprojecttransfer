import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
  "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta",
  "explicabo", "nemo", "ipsam", "quia", "voluptas", "aspernatur", "aut", "odit",
  "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi",
  "nesciunt", "neque", "porro", "quisquam", "nihil", "numquam", "eius", "modi",
  "tempora", "corporis", "suscipit", "laboriosam", "magnam", "aliquam", "quaerat",
];

const FIRST_SENTENCE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

type GenerationType = "paragraphs" | "words" | "sentences";

export default function LoremIpsum() {
  const toolSEO = getToolSEO("/lorem-ipsum");
  const [output, setOutput] = useState("");
  const [count, setCount] = useState(3);
  const [type, setType] = useState<GenerationType>("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const { toast } = useToast();

  const getRandomWord = () => {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  };

  const generateSentence = (isFirst: boolean = false) => {
    if (isFirst && startWithLorem) {
      return FIRST_SENTENCE;
    }
    const wordCount = Math.floor(Math.random() * 10) + 5;
    const words = Array.from({ length: wordCount }, getRandomWord);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ") + ".";
  };

  const generateParagraph = (isFirst: boolean = false) => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    const sentences = Array.from({ length: sentenceCount }, (_, i) =>
      generateSentence(isFirst && i === 0)
    );
    return sentences.join(" ");
  };

  const generate = () => {
    if (count < 1) {
      toast({
        title: "Invalid count",
        description: "Please enter a number greater than 0.",
        variant: "destructive",
      });
      return;
    }

    let result = "";

    switch (type) {
      case "paragraphs":
        result = Array.from({ length: count }, (_, i) =>
          generateParagraph(i === 0)
        ).join("\n\n");
        break;
      case "sentences":
        result = Array.from({ length: count }, (_, i) =>
          generateSentence(i === 0)
        ).join(" ");
        break;
      case "words":
        if (startWithLorem) {
          const loremStart = "Lorem ipsum dolor sit amet";
          const loremWords = loremStart.split(" ");
          if (count <= loremWords.length) {
            result = loremWords.slice(0, count).join(" ");
          } else {
            const additionalWords = Array.from(
              { length: count - loremWords.length },
              getRandomWord
            );
            result = [...loremWords, ...additionalWords].join(" ");
          }
        } else {
          result = Array.from({ length: count }, getRandomWord).join(" ");
        }
        break;
    }

    setOutput(result);
  };

  const handleCopy = async () => {
    if (!output.trim()) {
      toast({
        title: "Nothing to copy",
        description: "Generate some text first.",
        variant: "destructive",
      });
      return;
    }
    await navigator.clipboard.writeText(output);
    toast({
      title: "Copied!",
      description: "Lorem ipsum text copied to clipboard.",
    });
  };

  const handleClear = () => {
    setOutput("");
  };

  return (
    <ToolPageLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for your designs, mockups, and layouts."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Select what you want to generate (paragraphs, sentences, or words).</li>
          <li>Enter the number of items you want to generate.</li>
          <li>Choose whether to start with the classic "Lorem ipsum" opening.</li>
          <li>Click "Generate" to create your placeholder text.</li>
          <li>Copy the generated text using the Copy button.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Generate</Label>
            <RadioGroup
              value={type}
              onValueChange={(val) => setType(val as GenerationType)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paragraphs" id="paragraphs" data-testid="radio-paragraphs" />
                <Label htmlFor="paragraphs" className="cursor-pointer">
                  Paragraphs
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sentences" id="sentences" data-testid="radio-sentences" />
                <Label htmlFor="sentences" className="cursor-pointer">
                  Sentences
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="words" id="words" data-testid="radio-words" />
                <Label htmlFor="words" className="cursor-pointer">
                  Words
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="count">Number of {type}</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              data-testid="input-count"
            />

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="startWithLorem"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded border-border"
                data-testid="checkbox-start-lorem"
              />
              <Label htmlFor="startWithLorem" className="cursor-pointer text-sm">
                Start with "Lorem ipsum..."
              </Label>
            </div>
          </div>
        </div>

        <Button onClick={generate} className="w-full" size="lg" data-testid="button-generate">
          <FileText className="w-4 h-4 mr-2" />
          Generate Lorem Ipsum
        </Button>

        <div>
          <Label className="mb-2 block">Generated Text</Label>
          <Textarea
            value={output}
            readOnly
            placeholder="Generated lorem ipsum text will appear here..."
            className="min-h-[200px] resize-y text-base bg-muted/30"
            data-testid="output-text"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} data-testid="button-copy">
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
