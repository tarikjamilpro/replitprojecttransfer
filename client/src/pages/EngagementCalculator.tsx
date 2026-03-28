import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, ThumbsUp, MessageCircle, Users, BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

interface EngagementResult {
  rate: number;
  label: string;
  color: string;
  bgColor: string;
  icon: typeof TrendingUp;
}

function getRating(rate: number): EngagementResult {
  if (rate > 5) {
    return {
      rate,
      label: "Excellent Engagement",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500",
      icon: TrendingUp,
    };
  } else if (rate >= 3) {
    return {
      rate,
      label: "Good Engagement",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500",
      icon: Minus,
    };
  } else {
    return {
      rate,
      label: "Needs Improvement",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500",
      icon: TrendingDown,
    };
  }
}

export default function EngagementCalculator() {
  const [followers, setFollowers] = useState("");
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [result, setResult] = useState<EngagementResult | null>(null);
  const { toast } = useToast();

  const handleCalculate = () => {
    const f = parseFloat(followers);
    const l = parseFloat(likes);
    const c = parseFloat(comments);

    if (!followers.trim() || isNaN(f)) {
      toast({ title: "Please enter total followers", description: "A valid number of followers is required.", variant: "destructive" });
      return;
    }
    if (f <= 0) {
      toast({ title: "Followers must be greater than zero", description: "Cannot calculate engagement rate with zero followers.", variant: "destructive" });
      return;
    }
    if (!likes.trim() || isNaN(l) || l < 0) {
      toast({ title: "Please enter average likes", description: "A valid number of average likes per post is required.", variant: "destructive" });
      return;
    }
    if (!comments.trim() || isNaN(c) || c < 0) {
      toast({ title: "Please enter average comments", description: "A valid number of average comments per post is required.", variant: "destructive" });
      return;
    }

    const rate = ((l + c) / f) * 100;
    const rounded = parseFloat(rate.toFixed(2));
    setResult(getRating(rounded));
  };

  const handleReset = () => {
    setFollowers("");
    setLikes("");
    setComments("");
    setResult(null);
  };

  const progressPercent = result ? Math.min((result.rate / 10) * 100, 100) : 0;

  return (
    <ToolPageLayout
      title="Engagement Rate Calculator"
      description="Calculate your social media engagement rate to measure how actively your audience interacts with your content."
      toolPath="/engagement-calculator"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your total number of followers.</li>
          <li>Enter the average number of likes you receive per post.</li>
          <li>Enter the average number of comments you receive per post.</li>
          <li>Click "Calculate Rate" to see your engagement percentage and rating.</li>
          <li>Use the rating and progress bar to understand where you stand.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-section-header">
            <Calculator className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Enter Your Stats</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="followers-input" data-testid="label-followers">
              Total Followers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="followers-input"
                type="number"
                placeholder="e.g., 10000"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                className="pl-10"
                min="0"
                data-testid="input-followers"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="likes-input" data-testid="label-likes">
              Average Likes per Post
            </label>
            <div className="relative">
              <ThumbsUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="likes-input"
                type="number"
                placeholder="e.g., 500"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="pl-10"
                min="0"
                data-testid="input-likes"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="comments-input" data-testid="label-comments">
              Average Comments per Post
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="comments-input"
                type="number"
                placeholder="e.g., 50"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="pl-10"
                min="0"
                data-testid="input-comments"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => requestAction(handleCalculate)}
              data-testid="button-calculate"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Rate
            </Button>
            {result && (
              <Button
                variant="outline"
                onClick={handleReset}
                data-testid="button-reset"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-results-header">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Your Results</h3>
          </div>

          {!result && (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="text-empty-state">
              <BarChart3 className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">
                Enter your stats and calculate your engagement rate.
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Find out how well your audience is engaging with your content.
              </p>
            </div>
          )}

          {result && (
            <Card data-testid="card-result">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {(() => {
                      const Icon = result.icon;
                      return <Icon className={`w-6 h-6 ${result.color}`} />;
                    })()}
                    <span className="text-5xl font-bold text-foreground" data-testid="text-rate-value">
                      {result.rate}%
                    </span>
                  </div>
                  <p className={`text-lg font-semibold ${result.color}`} data-testid="text-rate-label">
                    {result.label}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>Engagement Scale</span>
                    <span>10%+</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden" data-testid="progress-bar">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${result.bgColor}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground" data-testid="text-breakdown-title">Breakdown</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Followers</p>
                      <p className="text-sm font-semibold text-foreground" data-testid="text-stat-followers">
                        {parseInt(followers).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <ThumbsUp className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Avg Likes</p>
                      <p className="text-sm font-semibold text-foreground" data-testid="text-stat-likes">
                        {parseInt(likes).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-md">
                      <MessageCircle className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Avg Comments</p>
                      <p className="text-sm font-semibold text-foreground" data-testid="text-stat-comments">
                        {parseInt(comments).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground" data-testid="text-formula">
                    Formula: ((Avg Likes + Avg Comments) / Total Followers) x 100
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({parseInt(likes).toLocaleString()} + {parseInt(comments).toLocaleString()}) / {parseInt(followers).toLocaleString()} x 100 = {result.rate}%
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
        toolName="Engagement Calculator"
      />
    </ToolPageLayout>
  );
}