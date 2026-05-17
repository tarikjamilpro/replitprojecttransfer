import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Check, Facebook, Twitter, Linkedin } from "lucide-react";
import { ToolPageLayout } from "@/components/Layout";

type OgType = "website" | "article" | "product" | "video.movie" | "music.song";
type TwitterCard = "summary" | "summary_large_image";

function escapeAttr(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function OpenGraphGenerator() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState<OgType>("website");
  const [siteName, setSiteName] = useState("");
  const [twitterCard, setTwitterCard] = useState<TwitterCard>("summary_large_image");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [copied, setCopied] = useState(false);

  const displayTitle = title || "Your Page Title";
  const displayDesc = description || "Your page description goes here.";
  const displayUrl = url || "https://yoursite.com";
  const displayDomain = (() => {
    try {
      return new URL(displayUrl).hostname.replace(/^www\./, "");
    } catch {
      return "yoursite.com";
    }
  })();

  const output = useMemo(() => {
    let code = `<!-- Open Graph / Facebook -->\n`;
    code += `<meta property="og:type" content="${escapeAttr(type)}">\n`;
    code += `<meta property="og:title" content="${escapeAttr(displayTitle)}">\n`;
    code += `<meta property="og:description" content="${escapeAttr(displayDesc)}">\n`;
    code += `<meta property="og:url" content="${escapeAttr(displayUrl)}">\n`;
    if (image) {
      code += `<meta property="og:image" content="${escapeAttr(image)}">\n`;
      code += `<meta property="og:image:width" content="1200">\n`;
      code += `<meta property="og:image:height" content="630">\n`;
    }
    if (siteName) code += `<meta property="og:site_name" content="${escapeAttr(siteName)}">\n`;

    code += `\n<!-- Twitter -->\n`;
    code += `<meta name="twitter:card" content="${escapeAttr(twitterCard)}">\n`;
    code += `<meta name="twitter:title" content="${escapeAttr(displayTitle)}">\n`;
    code += `<meta name="twitter:description" content="${escapeAttr(displayDesc)}">\n`;
    if (image) code += `<meta name="twitter:image" content="${escapeAttr(image)}">\n`;
    if (url) code += `<meta name="twitter:url" content="${escapeAttr(url)}">\n`;
    if (twitterHandle) {
      const handle = twitterHandle.startsWith("@") ? twitterHandle : `@${twitterHandle}`;
      code += `<meta name="twitter:site" content="${escapeAttr(handle)}">\n`;
      code += `<meta name="twitter:creator" content="${escapeAttr(handle)}">\n`;
    }
    return code;
  }, [type, displayTitle, displayDesc, displayUrl, url, image, siteName, twitterCard, twitterHandle]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Copied!", description: "OG meta tags copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const isLargeCard = twitterCard === "summary_large_image";

  return (
    <ToolPageLayout
      title="Open Graph Generator Pro"
      description="Generate Open Graph & Twitter Card meta tags with real-time output and live Facebook, Twitter, and LinkedIn previews."
      toolPath="/open-graph-generator"
      howToUse={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Fill in your page title, description, URL, and image (1200×630 works best).</p>
          <p><strong className="text-foreground">2.</strong> Pick a content type (website, article, product) and Twitter card style.</p>
          <p><strong className="text-foreground">3.</strong> Preview how your link will appear on Facebook, Twitter, and LinkedIn — in real time.</p>
          <p><strong className="text-foreground">4.</strong> Click <em>Copy</em> and paste the tags inside your <code>&lt;head&gt;</code>.</p>
        </div>
      }
    >
      <Card className="border-purple-100 dark:border-purple-900/30 mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Share2 className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Open Graph Generator <span className="text-violet-600 dark:text-violet-400">Pro</span>
            </h2>
            <p className="text-muted-foreground mt-1.5">Generate OG & Twitter tags for beautiful link previews</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 sm:p-7">
            <h3 className="font-semibold mb-5">Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="og-title" className="mb-1.5 block">Title</Label>
                <Input
                  id="og-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your page title"
                  className="rounded-2xl h-12"
                  data-testid="input-og-title"
                />
              </div>
              <div>
                <Label htmlFor="og-desc" className="mb-1.5 block">Description</Label>
                <Textarea
                  id="og-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="A short, catchy description for social sharing"
                  className="rounded-2xl resize-y"
                  data-testid="input-og-description"
                />
              </div>
              <div>
                <Label htmlFor="og-url" className="mb-1.5 block">URL</Label>
                <Input
                  id="og-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yoursite.com/page"
                  className="rounded-2xl h-12"
                  data-testid="input-og-url"
                />
              </div>
              <div>
                <Label htmlFor="og-image" className="mb-1.5 block">
                  Image URL <span className="text-xs text-muted-foreground">(1200×630)</span>
                </Label>
                <Input
                  id="og-image"
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://yoursite.com/og-image.jpg"
                  className="rounded-2xl h-12"
                  data-testid="input-og-image"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="og-type" className="mb-1.5 block">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as OgType)}>
                    <SelectTrigger id="og-type" className="rounded-2xl h-12" data-testid="select-og-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">website</SelectItem>
                      <SelectItem value="article">article</SelectItem>
                      <SelectItem value="product">product</SelectItem>
                      <SelectItem value="video.movie">video.movie</SelectItem>
                      <SelectItem value="music.song">music.song</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="og-site" className="mb-1.5 block">Site Name</Label>
                  <Input
                    id="og-site"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Your Site"
                    className="rounded-2xl h-12"
                    data-testid="input-og-sitename"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tw-card" className="mb-1.5 block">Twitter Card</Label>
                  <Select value={twitterCard} onValueChange={(v) => setTwitterCard(v as TwitterCard)}>
                    <SelectTrigger id="tw-card" className="rounded-2xl h-12" data-testid="select-twitter-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">summary</SelectItem>
                      <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tw-handle" className="mb-1.5 block">Twitter Handle</Label>
                  <Input
                    id="tw-handle"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="rounded-2xl h-12"
                    data-testid="input-twitter-handle"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 sm:p-7">
              <h3 className="font-semibold mb-4">Live Preview</h3>
              <Tabs defaultValue="facebook">
                <TabsList className="grid grid-cols-3 w-full rounded-2xl">
                  <TabsTrigger value="facebook" className="rounded-xl gap-1.5" data-testid="tab-fb">
                    <Facebook className="w-3.5 h-3.5" /> Facebook
                  </TabsTrigger>
                  <TabsTrigger value="twitter" className="rounded-xl gap-1.5" data-testid="tab-tw">
                    <Twitter className="w-3.5 h-3.5" /> Twitter
                  </TabsTrigger>
                  <TabsTrigger value="linkedin" className="rounded-xl gap-1.5" data-testid="tab-li">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="facebook" className="mt-4">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    {image ? (
                      <img src={image} alt="" className="w-full aspect-[1.91/1] object-cover bg-slate-100" />
                    ) : (
                      <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 text-sm">
                        Image preview (1200×630)
                      </div>
                    )}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800">
                      <div className="text-xs uppercase text-slate-500 truncate" data-testid="preview-fb-domain">{displayDomain}</div>
                      <div className="font-semibold mt-1 line-clamp-2" data-testid="preview-fb-title">{displayTitle}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2" data-testid="preview-fb-desc">{displayDesc}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="twitter" className="mt-4">
                  {isLargeCard ? (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                      {image ? (
                        <img src={image} alt="" className="w-full aspect-[2/1] object-cover bg-slate-100" />
                      ) : (
                        <div className="w-full aspect-[2/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 text-sm">
                          Image preview
                        </div>
                      )}
                      <div className="p-4">
                        <div className="font-semibold line-clamp-1" data-testid="preview-tw-title">{displayTitle}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{displayDesc}</div>
                        <div className="text-xs text-slate-500 mt-2 truncate">🔗 {displayDomain}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 flex">
                      {image ? (
                        <img src={image} alt="" className="w-32 h-32 object-cover bg-slate-100 shrink-0" />
                      ) : (
                        <div className="w-32 h-32 shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 text-xs">
                          No img
                        </div>
                      )}
                      <div className="p-4 min-w-0 flex-1">
                        <div className="font-semibold line-clamp-1">{displayTitle}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{displayDesc}</div>
                        <div className="text-xs text-slate-500 mt-2 truncate">🔗 {displayDomain}</div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="linkedin" className="mt-4">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    {image ? (
                      <img src={image} alt="" className="w-full aspect-[1.91/1] object-cover bg-slate-100" />
                    ) : (
                      <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 text-sm">
                        Image preview
                      </div>
                    )}
                    <div className="p-4 border-t dark:border-slate-800">
                      <div className="font-semibold line-clamp-2" data-testid="preview-li-title">{displayTitle}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate">{displayDomain}{siteName ? ` · ${siteName}` : ""}</div>
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
                  data-testid="button-copy-og"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <pre
                className="bg-slate-900 text-emerald-300 p-5 rounded-2xl text-xs overflow-auto max-h-[400px] whitespace-pre-wrap break-all"
                data-testid="text-og-output"
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
