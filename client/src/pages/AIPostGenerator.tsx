import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

const mockPosts: Record<string, string[]> = {
  Professional: [
    "We're thrilled to announce our latest venture! After months of strategic planning, we're ready to make an impact. Stay tuned for updates as we redefine the industry standard. #Business #Growth #Innovation",
    "Success isn't built overnight. It's the result of consistent effort, smart decisions, and a team that believes in the mission. Here's to the journey ahead. #Leadership #Entrepreneurship #Motivation",
    "Excited to share that we've hit a major milestone this quarter! None of this would be possible without our incredible team and loyal customers. Onwards and upwards! #Milestone #TeamWork #Results",
  ],
  Funny: [
    "Just launched a new project and my to-do list is longer than a CVS receipt. Send help... or coffee. Preferably both. #StartupLife #SendCoffee #Hustle",
    "My business plan: Step 1 - Have an idea. Step 2 - Google if someone already did it. Step 3 - Do it anyway but with better vibes. #Entrepreneur #FakeItTillYouMakeIt",
    "Asked my team for feedback. They said 'interesting.' I've never been more terrified of a single word in my life. #OfficeLife #Teamwork #Feedback",
  ],
  Inspirational: [
    "Every great achievement started with a single step of courage. Don't wait for the perfect moment - create it. Your future self will thank you. #Believe #DreamBig #YouGotThis",
    "The only limit to your success is the boundary you set in your own mind. Break free, think bigger, and watch the magic happen. #Inspiration #Mindset #Unstoppable",
    "Difficult roads often lead to beautiful destinations. Keep pushing forward, even when the path gets tough. Your breakthrough is closer than you think. #NeverGiveUp #Strength #Journey",
  ],
  Urgent: [
    "LAST CHANCE! Our exclusive offer ends TODAY. Don't miss out on this incredible opportunity - act now before it's gone! Link in bio. #LimitedTime #ActNow #DealAlert",
    "Only 24 hours left! If you've been waiting for the right time, THIS IS IT. Grab your spot before we're fully booked! #Hurry #LastChance #BookNow",
    "Breaking: We just dropped something HUGE. Be among the first to check it out - spots are filling up FAST! #NewDrop #ExclusiveAccess #DontMissOut",
  ],
  Empathetic: [
    "We hear you. Running a business isn't easy, and some days feel heavier than others. Just know - you're not alone in this journey. We're here for you. #Support #Community #WeGetIt",
    "To everyone working hard behind the scenes with no recognition yet - your time is coming. Keep going. Your effort matters more than you know. #YouMatter #KeepGoing #Appreciation",
    "It's okay to take a step back and breathe. Progress isn't always linear, and rest is part of the journey too. Take care of yourself today. #MentalHealth #SelfCare #Balance",
  ],
};

const platformHints: Record<string, string> = {
  LinkedIn: "Optimized for LinkedIn's professional audience with relevant hashtags.",
  "Twitter/X": "Concise and punchy - perfect for Twitter/X's character limit.",
  Instagram: "Engaging caption style with strategic hashtag placement.",
  Facebook: "Conversational tone ideal for Facebook's community-driven feed.",
};

export default function AIPostGenerator() {
  const [topic, setTopic] = useState("");
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [tone, setTone] = useState("");
  const [platform, setPlatform] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({ title: "Please enter a topic", description: "Tell us what your post is about.", variant: "destructive" });
      return;
    }
    if (!tone) {
      toast({ title: "Please select a tone", description: "Choose a tone for your generated posts.", variant: "destructive" });
      return;
    }
    if (!platform) {
      toast({ title: "Please select a platform", description: "Choose a target social media platform.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResults([]);

    setTimeout(() => {
      const posts = mockPosts[tone] || mockPosts["Professional"];
      setResults(posts);
      setIsLoading(false);
    }, 2000);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({ title: "Copied!", description: "Post copied to clipboard." });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <ToolPageLayout
      title="AI Post Generator"
      description="Generate engaging social media posts for any platform with AI-powered content suggestions."
      toolPath="/ai-post-generator"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter the topic or subject of your post in the text area.</li>
          <li>Select the desired tone (Professional, Funny, Inspirational, etc.).</li>
          <li>Choose the target social media platform.</li>
          <li>Click "Generate Content" to create 3 unique post variations.</li>
          <li>Click "Copy" on any result to copy it to your clipboard.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-section-create">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Create Your Post</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="topic-input" data-testid="label-topic">
              What is your post about?
            </label>
            <Textarea
              id="topic-input"
              placeholder="e.g., Launching a new coffee shop in downtown..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[120px] resize-none text-base"
              data-testid="input-topic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" data-testid="label-tone">Select Tone</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger data-testid="select-tone">
                <SelectValue placeholder="Choose a tone..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Funny">Funny</SelectItem>
                <SelectItem value="Inspirational">Inspirational</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Empathetic">Empathetic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" data-testid="label-platform">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger data-testid="select-platform">
                <SelectValue placeholder="Choose a platform..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Twitter/X">Twitter/X</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
            {platform && (
              <p className="text-xs text-muted-foreground mt-1" data-testid="text-platform-hint">{platformHints[platform]}</p>
            )}
          </div>

          <Button
            className="w-full"
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
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground" data-testid="text-results-header">Generated Posts</h3>

          {results.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-empty-state">
              <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">
                Ready to generate your viral content.
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Fill in the details and click Generate.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-loading-state">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Crafting your posts...</p>
            </div>
          )}

          {results.map((post, index) => (
            <Card
              key={index}
              className="animate-in fade-in-0 slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: "both", animationDuration: "400ms" }}
              data-testid={`card-result-${index}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap flex-1" data-testid={`text-result-${index}`}>
                    {post}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopy(post, index)}
                    data-testid={`button-copy-${index}`}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2" data-testid={`text-option-label-${index}`}>Option {index + 1}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="AI Post Generator"
      />
    </ToolPageLayout>
  );
}