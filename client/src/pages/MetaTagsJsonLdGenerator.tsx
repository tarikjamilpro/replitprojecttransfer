import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Tags, Copy, Check, Globe, Facebook, Twitter } from "lucide-react";
import { ToolPageLayout } from "@/components/Layout";

type SchemaType = "" | "Article" | "Product" | "WebSite";

const TITLE_MAX = 60;
const DESC_MAX = 160;

function escapeAttr(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function counterColor(len: number, max: number): string {
  if (len === 0) return "text-muted-foreground";
  if (len > max) return "text-red-600";
  if (len > max * 0.9) return "text-amber-600";
  return "text-emerald-600";
}

export default function MetaTagsJsonLdGenerator() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [canonical, setCanonical] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [schemaType, setSchemaType] = useState<SchemaType>("");

  const [datePublished, setDatePublished] = useState("");
  const [articleImage, setArticleImage] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [brand, setBrand] = useState("");

  const [copied, setCopied] = useState(false);

  const displayTitle = title || "Page Title";
  const displayDesc = description || "Page description";
  const displayUrl = canonical || "https://example.com/page";
  const displayDomain = (() => {
    try {
      return new URL(displayUrl).hostname.replace(/^www\./, "");
    } catch {
      return "example.com";
    }
  })();
  const displayImage = imageUrl || (schemaType === "Article" ? articleImage : "");

  const output = useMemo(() => {
    let out = `<!-- Primary Meta Tags -->\n`;
    out += `<title>${escapeAttr(displayTitle)}</title>\n`;
    out += `<meta name="title" content="${escapeAttr(displayTitle)}">\n`;
    out += `<meta name="description" content="${escapeAttr(displayDesc)}">\n`;
    if (keywords) out += `<meta name="keywords" content="${escapeAttr(keywords)}">\n`;
    if (author) out += `<meta name="author" content="${escapeAttr(author)}">\n`;
    if (canonical) out += `<link rel="canonical" href="${escapeAttr(canonical)}">\n`;

    out += `\n<!-- Open Graph / Facebook -->\n`;
    out += `<meta property="og:type" content="${schemaType === "Article" ? "article" : "website"}">\n`;
    if (canonical) out += `<meta property="og:url" content="${escapeAttr(canonical)}">\n`;
    out += `<meta property="og:title" content="${escapeAttr(displayTitle)}">\n`;
    out += `<meta property="og:description" content="${escapeAttr(displayDesc)}">\n`;
    if (imageUrl) out += `<meta property="og:image" content="${escapeAttr(imageUrl)}">\n`;

    out += `\n<!-- Twitter -->\n`;
    out += `<meta name="twitter:card" content="summary_large_image">\n`;
    if (canonical) out += `<meta name="twitter:url" content="${escapeAttr(canonical)}">\n`;
    out += `<meta name="twitter:title" content="${escapeAttr(displayTitle)}">\n`;
    out += `<meta name="twitter:description" content="${escapeAttr(displayDesc)}">\n`;
    if (imageUrl) out += `<meta name="twitter:image" content="${escapeAttr(imageUrl)}">\n`;

    if (schemaType) {
      const base: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": schemaType,
        name: displayTitle,
        description: displayDesc,
      };
      if (canonical) base.url = canonical;

      let jsonLd: Record<string, any> = base;
      if (schemaType === "Article") {
        jsonLd = {
          ...base,
          headline: displayTitle,
          author: { "@type": "Person", name: author || "Author Name" },
          datePublished: datePublished || new Date().toISOString().slice(0, 10),
          ...(articleImage ? { image: articleImage } : {}),
        };
      } else if (schemaType === "Product") {
        jsonLd = {
          ...base,
          brand: { "@type": "Brand", name: brand || "Brand" },
          offers: {
            "@type": "Offer",
            priceCurrency: currency || "USD",
            price: price || "0",
          },
        };
      }

      const safeJson = JSON.stringify(jsonLd, null, 2)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026");
      out += `\n<!-- JSON-LD Structured Data -->\n`;
      out += `<script type="application/ld+json">\n${safeJson}\n</` + `script>`;
    }

    return out;
  }, [displayTitle, displayDesc, keywords, author, canonical, imageUrl, schemaType, datePublished, articleImage, price, currency, brand]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Copied to clipboard!", description: "All meta tags copied." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <ToolPageLayout
      title="Meta Tags + JSON-LD Generator"
      description="Generate complete SEO meta tags (Primary, Open Graph, Twitter) plus structured data with live Google, Facebook, and Twitter previews."
      toolPath="/meta-tags-json-ld-generator"
      howToUse={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Fill in the title, description, and other page details.</p>
          <p><strong className="text-foreground">2.</strong> Watch the character counters — keep title ≤ 60 and description ≤ 160 for best SEO.</p>
          <p><strong className="text-foreground">3.</strong> Switch between Google, Facebook, and Twitter tabs to see live previews.</p>
          <p><strong className="text-foreground">4.</strong> Optionally pick a JSON-LD schema type (Article, Product, WebSite) for structured data.</p>
          <p><strong className="text-foreground">5.</strong> Click <em>Copy All</em> and paste the tags inside your <code>&lt;head&gt;</code>.</p>
        </div>
      }
    >
      <Card className="border-purple-100 dark:border-purple-900/30 mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Tags className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Meta Tags + <span className="text-violet-600 dark:text-violet-400">JSON-LD</span> Generator
            </h2>
            <p className="text-muted-foreground mt-1.5">Complete SEO meta tags with structured data</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 sm:p-7">
            <h3 className="font-semibold mb-5">Page Details</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label htmlFor="mt-title">Title</Label>
                  <span className={`text-xs font-mono tabular-nums ${counterColor(title.length, TITLE_MAX)}`} data-testid="counter-title">
                    {title.length} / {TITLE_MAX}
                  </span>
                </div>
                <Input
                  id="mt-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page Title"
                  className="rounded-2xl h-12"
                  data-testid="input-title"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label htmlFor="mt-description">Description</Label>
                  <span className={`text-xs font-mono tabular-nums ${counterColor(description.length, DESC_MAX)}`} data-testid="counter-description">
                    {description.length} / {DESC_MAX}
                  </span>
                </div>
                <Textarea
                  id="mt-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Page description"
                  className="rounded-2xl resize-y"
                  data-testid="input-description"
                />
              </div>

              <div>
                <Label htmlFor="mt-keywords" className="mb-1.5 block">Keywords</Label>
                <Input
                  id="mt-keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="seo, meta tags, generator"
                  className="rounded-2xl h-12"
                  data-testid="input-keywords"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mt-author" className="mb-1.5 block">Author</Label>
                  <Input
                    id="mt-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your Name"
                    className="rounded-2xl h-12"
                    data-testid="input-author"
                  />
                </div>
                <div>
                  <Label htmlFor="mt-canonical" className="mb-1.5 block">Canonical URL</Label>
                  <Input
                    id="mt-canonical"
                    type="url"
                    value={canonical}
                    onChange={(e) => setCanonical(e.target.value)}
                    placeholder="https://example.com/page"
                    className="rounded-2xl h-12"
                    data-testid="input-canonical"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mt-image" className="mb-1.5 block">
                  Social Image URL <span className="text-xs text-muted-foreground">(1200×630 recommended)</span>
                </Label>
                <Input
                  id="mt-image"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                  className="rounded-2xl h-12"
                  data-testid="input-image"
                />
              </div>

              <div>
                <Label htmlFor="mt-schema" className="mb-1.5 block">Page Type / JSON-LD Schema</Label>
                <Select value={schemaType || "none"} onValueChange={(v) => setSchemaType(v === "none" ? "" : (v as SchemaType))}>
                  <SelectTrigger id="mt-schema" className="rounded-2xl h-12" data-testid="select-schema">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (basic meta only)</SelectItem>
                    <SelectItem value="Article">Article</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="WebSite">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {schemaType === "Article" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <Label htmlFor="mt-date" className="mb-1.5 block text-xs">Date Published</Label>
                    <Input
                      id="mt-date"
                      type="date"
                      value={datePublished}
                      onChange={(e) => setDatePublished(e.target.value)}
                      className="rounded-xl"
                      data-testid="input-date-published"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mt-article-img" className="mb-1.5 block text-xs">Article Image URL</Label>
                    <Input
                      id="mt-article-img"
                      type="url"
                      value={articleImage}
                      onChange={(e) => setArticleImage(e.target.value)}
                      placeholder="https://..."
                      className="rounded-xl"
                      data-testid="input-article-image"
                    />
                  </div>
                </div>
              )}

              {schemaType === "Product" && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="mt-price" className="mb-1.5 block text-xs">Price</Label>
                      <Input
                        id="mt-price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="29.99"
                        className="rounded-xl"
                        data-testid="input-price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mt-currency" className="mb-1.5 block text-xs">Currency</Label>
                      <Input
                        id="mt-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        placeholder="USD"
                        className="rounded-xl"
                        data-testid="input-currency"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="mt-brand" className="mb-1.5 block text-xs">Brand</Label>
                    <Input
                      id="mt-brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Brand Name"
                      className="rounded-xl"
                      data-testid="input-brand"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 sm:p-7">
              <h3 className="font-semibold mb-4">Live Preview</h3>
              <Tabs defaultValue="google">
                <TabsList className="grid grid-cols-3 w-full rounded-2xl">
                  <TabsTrigger value="google" className="rounded-xl gap-1.5" data-testid="tab-google">
                    <Globe className="w-3.5 h-3.5" /> Google
                  </TabsTrigger>
                  <TabsTrigger value="facebook" className="rounded-xl gap-1.5" data-testid="tab-facebook">
                    <Facebook className="w-3.5 h-3.5" /> Facebook
                  </TabsTrigger>
                  <TabsTrigger value="twitter" className="rounded-xl gap-1.5" data-testid="tab-twitter">
                    <Twitter className="w-3.5 h-3.5" /> Twitter
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="google" className="mt-4">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-950">
                    <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{displayUrl}</div>
                    <div className="text-xl text-blue-700 dark:text-blue-400 font-medium mt-1 truncate hover:underline cursor-pointer" data-testid="preview-google-title">
                      {displayTitle}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2" data-testid="preview-google-desc">
                      {displayDesc}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="facebook" className="mt-4">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    {displayImage ? (
                      <img src={displayImage} alt="" className="w-full aspect-[1.91/1] object-cover bg-slate-100" />
                    ) : (
                      <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 text-sm">
                        No image
                      </div>
                    )}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800">
                      <div className="text-xs uppercase text-slate-500 truncate">{displayDomain}</div>
                      <div className="font-semibold mt-1 line-clamp-2" data-testid="preview-fb-title">{displayTitle}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2" data-testid="preview-fb-desc">
                        {displayDesc}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="twitter" className="mt-4">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    {displayImage ? (
                      <img src={displayImage} alt="" className="w-full aspect-[2/1] object-cover bg-slate-100" />
                    ) : (
                      <div className="w-full aspect-[2/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 text-sm">
                        No image
                      </div>
                    )}
                    <div className="p-4">
                      <div className="font-semibold line-clamp-1" data-testid="preview-tw-title">{displayTitle}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2" data-testid="preview-tw-desc">
                        {displayDesc}
                      </div>
                      <div className="text-xs text-slate-500 mt-2 truncate">🔗 {displayDomain}</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 sm:p-7">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Generated Code</h3>
                <Button
                  onClick={handleCopy}
                  className="rounded-2xl bg-violet-600 hover:bg-violet-700 text-white gap-2"
                  data-testid="button-copy-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy All"}
                </Button>
              </div>
              <pre
                className="bg-slate-900 text-emerald-300 p-5 rounded-2xl text-xs overflow-auto max-h-[500px] whitespace-pre-wrap break-all"
                data-testid="text-output"
              >
                {output}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolPageLayout>
  );
}
