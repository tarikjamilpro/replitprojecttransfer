import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Hash } from "lucide-react";
import MD5 from "crypto-js/md5";

export default function MD5Generator() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const hash = text ? MD5(text).toString() : "";

  const handleCopy = async () => {
    if (!hash) return;
    
    try {
      await navigator.clipboard.writeText(hash);
      toast({
        title: "Copied!",
        description: "MD5 hash copied to clipboard",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the hash manually",
        variant: "destructive",
      });
    }
  };

  return (
    <ToolPageLayout
      title="MD5 Generator"
      description="Generate MD5 hash from any text instantly. MD5 produces a 128-bit hash value commonly used for checksums."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter or paste your text in the input field.</li>
          <li>The MD5 hash is generated instantly as you type.</li>
          <li>Click the "Copy" button to copy the hash to your clipboard.</li>
          <li>MD5 is useful for checksums and data integrity verification.</li>
        </ol>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="input-text" className="text-lg font-semibold">
              Enter Text
            </Label>
            <Textarea
              id="input-text"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-2 min-h-[120px]"
              data-testid="input-text"
            />
          </CardContent>
        </Card>

        <Card className={hash ? "border-primary" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">MD5 Hash</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!hash}
                data-testid="button-copy"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            
            <div 
              className="p-4 bg-muted rounded-lg font-mono text-sm break-all min-h-[60px] flex items-center"
              data-testid="hash-output"
            >
              {hash || <span className="text-muted-foreground">Hash will appear here...</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">About MD5</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                MD5 (Message-Digest Algorithm 5) produces a 128-bit hash value, typically 
                expressed as a 32-character hexadecimal number.
              </p>
              <p>
                While MD5 is no longer considered secure for cryptographic purposes, 
                it's still widely used for checksums and data integrity verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
