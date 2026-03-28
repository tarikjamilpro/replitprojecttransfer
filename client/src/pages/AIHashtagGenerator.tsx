import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Hash, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

const hashtagDictionary: Record<string, string[]> = {
  fitness: ["#fitness", "#gymlife", "#workout", "#gains", "#health", "#fitfam", "#exercise", "#bodybuilding", "#training", "#motivation", "#gym", "#fitnessmotivation", "#getfit", "#strong", "#personaltrainer"],
  gym: ["#gym", "#gymlife", "#workout", "#gains", "#health", "#fitfam", "#lifting", "#bodybuilding", "#training", "#musclebuilding", "#legday", "#gymrat", "#fitnessjourney", "#gymtime", "#powerlifting"],
  travel: ["#wanderlust", "#travelgram", "#adventure", "#explore", "#vacation", "#travelphotography", "#instatravel", "#traveltheworld", "#roadtrip", "#backpacking", "#travelblogger", "#bucketlist", "#globetrotter", "#tourism", "#exploremore"],
  food: ["#foodie", "#instafood", "#foodporn", "#delicious", "#homemade", "#foodphotography", "#cooking", "#recipe", "#yummy", "#healthyfood", "#foodblogger", "#cheflife", "#eatlocal", "#foodlover", "#tasty"],
  fashion: ["#fashion", "#style", "#ootd", "#fashionblogger", "#streetstyle", "#fashionista", "#outfit", "#lookoftheday", "#trendy", "#clothing", "#fashionstyle", "#instafashion", "#styleinspo", "#fashiondesign", "#wardrobe"],
  photography: ["#photography", "#photooftheday", "#photo", "#cameralove", "#portrait", "#landscape", "#streetphotography", "#naturephotography", "#photographylovers", "#goldenhour", "#shotoniphone", "#photoshoot", "#visualart", "#capture", "#composition"],
  technology: ["#technology", "#tech", "#innovation", "#programming", "#coding", "#ai", "#software", "#developer", "#startup", "#digital", "#futuretech", "#machinelearning", "#webdev", "#cybersecurity", "#gadgets"],
  marketing: ["#digitalmarketing", "#marketing", "#socialmedia", "#branding", "#contentmarketing", "#seo", "#emailmarketing", "#marketingtips", "#onlinemarketing", "#growthhacking", "#contentcreator", "#marketingstrategy", "#leadgeneration", "#analytics", "#advertising"],
  business: ["#business", "#entrepreneur", "#startup", "#success", "#hustle", "#leadership", "#ceo", "#smallbusiness", "#businesstips", "#networking", "#growthmindset", "#venturecapital", "#businessowner", "#ecommerce", "#productivity"],
  music: ["#music", "#musician", "#singer", "#rapper", "#songwriter", "#newmusic", "#hiphop", "#producer", "#beats", "#musicproducer", "#livemusic", "#musiclife", "#indie", "#soundcloud", "#spotify"],
  art: ["#art", "#artist", "#artwork", "#painting", "#drawing", "#illustration", "#contemporaryart", "#digitalart", "#sketch", "#creative", "#artoftheday", "#gallery", "#fineart", "#instaart", "#artistsoninstagram"],
  beauty: ["#beauty", "#skincare", "#makeup", "#beautytips", "#selfcare", "#glowup", "#skincareroutine", "#beautyblogger", "#naturalskincare", "#cosmetics", "#haircare", "#beautyproducts", "#makeupartist", "#cleanskincare", "#beautycare"],
  nature: ["#nature", "#naturephotography", "#outdoors", "#wildlife", "#landscape", "#mountains", "#sunset", "#hiking", "#earthfocus", "#forest", "#ocean", "#camping", "#sunrise", "#wilderness", "#nationalpark"],
  gaming: ["#gaming", "#gamer", "#videogames", "#twitch", "#esports", "#streamer", "#pcgaming", "#ps5", "#xbox", "#nintendo", "#gamingcommunity", "#gameplay", "#retrogaming", "#indiegame", "#gamingsetup"],
  motivation: ["#motivation", "#inspiration", "#mindset", "#success", "#goals", "#quotes", "#positivity", "#grind", "#believeinyourself", "#nevergiveup", "#selfimprovement", "#growthmindset", "#discipline", "#ambition", "#focused"],
  education: ["#education", "#learning", "#study", "#students", "#edtech", "#onlinelearning", "#knowledge", "#teaching", "#elearning", "#studygram", "#university", "#college", "#studymotivation", "#academiclife", "#scholarship"],
  realestate: ["#realestate", "#property", "#realtor", "#homeforsale", "#investment", "#luxuryhomes", "#househunting", "#dreamhome", "#newhome", "#realtorlife", "#openhouse", "#homebuyer", "#mortgage", "#commercialrealestate", "#homedesign"],
  crypto: ["#crypto", "#bitcoin", "#ethereum", "#blockchain", "#cryptocurrency", "#defi", "#nft", "#web3", "#altcoins", "#cryptotrading", "#hodl", "#decentralized", "#btc", "#eth", "#cryptonews"],
};

const genericTrending = ["#viral", "#explorepage", "#trending", "#fyp", "#foryou", "#instagood", "#photooftheday", "#love", "#followme", "#beautiful", "#happy", "#picoftheday", "#instadaily", "#like4like", "#reels"];

function findHashtags(keyword: string): string[] {
  const lower = keyword.toLowerCase().trim();
  for (const [key, tags] of Object.entries(hashtagDictionary)) {
    if (lower.includes(key) || key.includes(lower)) {
      return tags;
    }
  }
  return genericTrending;
}

function categorizeHashtags(tags: string[]): { highReach: string[]; niche: string[]; trending: string[] } {
  const shuffled = [...tags].sort(() => Math.random() - 0.5);
  const highReach = shuffled.slice(0, 5);
  const niche = shuffled.slice(5, 10);
  const trending = shuffled.slice(10, 15);
  return { highReach, niche, trending };
}

export default function AIHashtagGenerator() {
  const [keyword, setKeyword] = useState("");
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [platform, setPlatform] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ highReach: string[]; niche: string[]; trending: string[] } | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!keyword.trim()) {
      toast({ title: "Please enter a keyword", description: "Type a topic or keyword to generate hashtags.", variant: "destructive" });
      return;
    }
    if (!platform) {
      toast({ title: "Please select a platform", description: "Choose a target social media platform.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResults(null);
    setAllCopied(false);

    setTimeout(() => {
      const tags = findHashtags(keyword);
      const categorized = categorizeHashtags(tags);
      setResults(categorized);
      setIsLoading(false);
    }, 2000);
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    toast({ title: "Copied!", description: `${tag} copied to clipboard.` });
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleCopyAll = () => {
    if (!results) return;
    const all = [...results.highReach, ...results.niche, ...results.trending].join(" ");
    navigator.clipboard.writeText(all);
    setAllCopied(true);
    toast({ title: "All hashtags copied!", description: "All hashtags have been copied to your clipboard." });
    setTimeout(() => setAllCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (!keyword.trim() || !platform) return;
    setIsLoading(true);
    setResults(null);
    setAllCopied(false);

    setTimeout(() => {
      const tags = findHashtags(keyword);
      const categorized = categorizeHashtags(tags);
      setResults(categorized);
      setIsLoading(false);
    }, 2000);
  };

  const renderGroup = (title: string, tags: string[], groupId: string) => (
    <div className="space-y-3" data-testid={`section-${groupId}`}>
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider" data-testid={`text-group-title-${groupId}`}>{title}</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleCopyTag(tag)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono text-sm border border-blue-200 dark:border-blue-800 cursor-pointer hover-elevate active-elevate-2"
            data-testid={`chip-${tag.replace('#', '')}`}
          >
            {copiedTag === tag ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                <span>Copied</span>
              </>
            ) : (
              <span>{tag}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      title="AI Hashtag Generator"
      description="Generate optimized hashtags for Instagram, TikTok, and Twitter/X to maximize your post reach and engagement."
      toolPath="/ai-hashtag-generator"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter a keyword or topic related to your content.</li>
          <li>Select your target social media platform.</li>
          <li>Click "Generate Hashtags" to get categorized hashtag suggestions.</li>
          <li>Click any individual hashtag to copy it, or use "Copy All" to grab them all at once.</li>
          <li>Use the refresh button to get a new combination for the same keyword.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-section-header">
            <Hash className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Find Your Hashtags</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="keyword-input" data-testid="label-keyword">
              Enter a keyword or topic
            </label>
            <Input
              id="keyword-input"
              placeholder="e.g., Digital Marketing, Fitness, Travel..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              data-testid="input-keyword"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" data-testid="label-platform">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger data-testid="select-platform">
                <SelectValue placeholder="Choose a platform..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Twitter/X">Twitter/X</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-600"
            onClick={() => requestAction(handleGenerate)}
            disabled={isLoading}
            data-testid="button-generate"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Hash className="w-4 h-4 mr-2" />
                Generate Hashtags
              </>
            )}
          </Button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground" data-testid="text-results-header">Results</h3>
            {results && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  data-testid="button-regenerate"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Shuffle
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleCopyAll}
                  data-testid="button-copy-all"
                >
                  {allCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied All
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy All
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {!results && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-empty-state">
              <Hash className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">
                Enter a keyword and generate hashtags.
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Get categorized hashtags for maximum reach.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-loading-state">
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Analyzing trends and generating hashtags...</p>
            </div>
          )}

          {results && (
            <Card data-testid="card-results">
              <CardContent className="p-5 space-y-6">
                {renderGroup("High Reach", results.highReach, "high-reach")}
                {renderGroup("Niche Specific", results.niche, "niche")}
                {renderGroup("Trending Now", results.trending, "trending")}

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground" data-testid="text-total-count">
                    {results.highReach.length + results.niche.length + results.trending.length} hashtags generated for {platform}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="AI Hashtag Generator"
      />
    </ToolPageLayout>
  );
}