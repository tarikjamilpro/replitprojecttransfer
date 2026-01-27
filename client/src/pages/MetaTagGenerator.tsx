import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

export default function MetaTagGenerator() {
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateMetaTags = () => {
    const tags: string[] = [];

    if (siteTitle.trim()) {
      tags.push(`<title>${siteTitle}</title>`);
      tags.push(`<meta name="title" content="${siteTitle}">`);
      tags.push(`<meta property="og:title" content="${siteTitle}">`);
      tags.push(`<meta name="twitter:title" content="${siteTitle}">`);
    }

    if (siteDescription.trim()) {
      tags.push(`<meta name="description" content="${siteDescription}">`);
      tags.push(`<meta property="og:description" content="${siteDescription}">`);
      tags.push(`<meta name="twitter:description" content="${siteDescription}">`);
    }

    if (keywords.trim()) {
      tags.push(`<meta name="keywords" content="${keywords}">`);
    }

    if (author.trim()) {
      tags.push(`<meta name="author" content="${author}">`);
    }

    tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    tags.push(`<meta charset="UTF-8">`);
    tags.push(`<meta property="og:type" content="website">`);
    tags.push(`<meta name="twitter:card" content="summary_large_image">`);

    return tags.join("\n");
  };

  const output = generateMetaTags();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Meta tags copied to clipboard",
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

  return (
    <ToolPageLayout
      title="Meta Tag Generator"
      description="Generate essential HTML meta tags for SEO, social media sharing, and better search engine visibility."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your site title (appears in browser tabs and search results).</li>
          <li>Add a description (150-160 characters recommended for SEO).</li>
          <li>Include relevant keywords separated by commas.</li>
          <li>Add the author name (optional).</li>
          <li>Copy the generated HTML and paste it in your website's &lt;head&gt; section.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground mb-4">Site Information</h3>

            <div>
              <Label htmlFor="site-title">Site Title</Label>
              <Input
                id="site-title"
                type="text"
                placeholder="My Awesome Website"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="mt-1"
                data-testid="input-site-title"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {siteTitle.length}/60 characters (recommended max)
              </p>
            </div>

            <div>
              <Label htmlFor="site-description">Site Description</Label>
              <Textarea
                id="site-description"
                placeholder="A brief description of your website for search engines..."
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="mt-1 min-h-[80px]"
                data-testid="input-site-description"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {siteDescription.length}/160 characters (recommended max)
              </p>
            </div>

            <div>
              <Label htmlFor="keywords">Keywords (comma separated)</Label>
              <Input
                id="keywords"
                type="text"
                placeholder="seo, web tools, online utilities"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="mt-1"
                data-testid="input-keywords"
              />
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                type="text"
                placeholder="John Doe"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1"
                data-testid="input-author"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Generated Meta Tags</h3>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                data-testid="button-copy-html"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy HTML"}
              </Button>
            </div>

            <Textarea
              value={output}
              readOnly
              className="min-h-[300px] font-mono text-sm bg-muted/50"
              data-testid="textarea-output"
            />

            <p className="text-xs text-muted-foreground mt-2">
              Paste this code inside the &lt;head&gt; section of your HTML document.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
