import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MousePointerClick, Timer, Trophy, RotateCcw, Zap, Target } from "lucide-react";

type TestState = "idle" | "running" | "finished";
type Duration = 1 | 5 | 10 | 30 | 60;

interface Rank {
  name: string;
  minCPS: number;
  color: string;
  emoji: string;
}

const RANKS: Rank[] = [
  { name: "Sloth", minCPS: 0, color: "text-gray-500", emoji: "🦥" },
  { name: "Turtle", minCPS: 2, color: "text-green-600", emoji: "🐢" },
  { name: "Koala", minCPS: 4, color: "text-blue-500", emoji: "🐨" },
  { name: "Human", minCPS: 6, color: "text-cyan-500", emoji: "👤" },
  { name: "Cheetah", minCPS: 8, color: "text-yellow-500", emoji: "🐆" },
  { name: "Pro Gamer", minCPS: 10, color: "text-orange-500", emoji: "🎮" },
  { name: "Lightning", minCPS: 12, color: "text-purple-500", emoji: "⚡" },
  { name: "God Tier", minCPS: 14, color: "text-red-500", emoji: "🔥" },
];

const DURATIONS: Duration[] = [1, 5, 10, 30, 60];

const getRank = (cps: number): Rank => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (cps >= RANKS[i].minCPS) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

export default function CPSTest() {
  const [duration, setDuration] = useState<Duration>(5);
  const [testState, setTestState] = useState<TestState>("idle");
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cps, setCps] = useState(0);
  const [bestCPS, setBestCPS] = useState<Record<Duration, number>>({
    1: 0, 5: 0, 10: 0, 30: 0, 60: 0
  });
  const [clickEffect, setClickEffect] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("cps-best-scores");
    if (saved) {
      try {
        setBestCPS(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const startTest = useCallback(() => {
    setTestState("running");
    setClicks(0);
    setTimeLeft(duration);
    setCps(0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTestState("finished");
      }
    }, 50);
  }, [duration]);

  const handleClick = useCallback(() => {
    if (testState === "idle") {
      startTest();
      setClicks(1);
    } else if (testState === "running") {
      setClicks((prev) => prev + 1);
    }
    
    setClickEffect(true);
    setTimeout(() => setClickEffect(false), 100);
  }, [testState, startTest]);

  useEffect(() => {
    if (testState === "finished") {
      const finalCPS = clicks / duration;
      setCps(finalCPS);
      
      if (finalCPS > bestCPS[duration]) {
        const newBest = { ...bestCPS, [duration]: finalCPS };
        setBestCPS(newBest);
        localStorage.setItem("cps-best-scores", JSON.stringify(newBest));
      }
    }
  }, [testState, clicks, duration, bestCPS]);

  const resetTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestState("idle");
    setClicks(0);
    setTimeLeft(0);
    setCps(0);
  };

  const currentCPS = testState === "running" && clicks > 0
    ? clicks / ((duration - timeLeft) || 0.1)
    : cps;

  const rank = getRank(testState === "finished" ? cps : currentCPS);
  const progress = testState === "running" ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <MousePointerClick className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">CPS Test</h1>
          </div>
          <p className="text-muted-foreground">Test your clicking speed - How fast can you click?</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                <span className="font-medium">Select Duration</span>
              </div>
              {testState !== "idle" && (
                <Button onClick={resetTest} variant="outline" size="sm" data-testid="button-reset">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {DURATIONS.map((d) => (
                <Button
                  key={d}
                  onClick={() => {
                    if (testState === "idle") setDuration(d);
                  }}
                  variant={duration === d ? "default" : "outline"}
                  disabled={testState !== "idle"}
                  data-testid={`button-duration-${d}`}
                >
                  {d}s
                </Button>
              ))}
            </div>

            {testState === "running" && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Time Remaining</span>
                  <span className="font-mono font-bold">{timeLeft.toFixed(1)}s</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-0">
            <div
              onClick={handleClick}
              className={`
                relative min-h-[300px] flex flex-col items-center justify-center cursor-pointer select-none
                transition-all duration-100 rounded-lg
                ${testState === "idle" 
                  ? "bg-primary/10 hover:bg-primary/20" 
                  : testState === "running"
                  ? "bg-primary/20"
                  : "bg-green-100 dark:bg-green-900/30"
                }
                ${clickEffect ? "scale-[0.98]" : "scale-100"}
              `}
              data-testid="click-area"
            >
              {testState === "idle" && (
                <>
                  <Target className="w-16 h-16 text-primary mb-4 animate-pulse" />
                  <p className="text-2xl font-bold text-primary">Click to Start!</p>
                  <p className="text-muted-foreground mt-2">Test duration: {duration} seconds</p>
                </>
              )}

              {testState === "running" && (
                <>
                  <div className="text-7xl font-bold text-primary mb-2" data-testid="text-click-count">
                    {clicks}
                  </div>
                  <p className="text-xl text-muted-foreground">clicks</p>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-lg font-medium">
                      Current CPS: <span className="text-primary">{currentCPS.toFixed(1)}</span>
                    </p>
                  </div>
                </>
              )}

              {testState === "finished" && (
                <div className="text-center p-6">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">Test Complete!</p>
                  <div className="text-6xl font-bold text-primary mb-2" data-testid="text-final-cps">
                    {cps.toFixed(2)}
                  </div>
                  <p className="text-xl mb-4">Clicks Per Second</p>
                  <p className="text-muted-foreground">
                    Total Clicks: <span className="font-bold">{clicks}</span> in {duration}s
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Your Rank</span>
              </div>
              <div className={`text-4xl mb-1`}>{rank.emoji}</div>
              <p className={`text-2xl font-bold ${rank.color}`} data-testid="text-rank">
                {rank.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {testState === "finished" ? `${cps.toFixed(1)} CPS` : "Click to test!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Best Score ({duration}s)</span>
              </div>
              <p className="text-4xl font-bold text-primary" data-testid="text-best-cps">
                {bestCPS[duration].toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">CPS</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              CPS Ranking System
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RANKS.map((r) => (
                <div
                  key={r.name}
                  className={`p-3 rounded-lg text-center border ${
                    rank.name === r.name && testState === "finished"
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <div className="text-2xl mb-1">{r.emoji}</div>
                  <p className={`font-medium ${r.color}`}>{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.minCPS}+ CPS</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">How to Improve Your CPS</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Clicking Techniques</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Jitter clicking:</strong> Tense arm muscles to vibrate finger</li>
                  <li><strong>Butterfly clicking:</strong> Alternate two fingers rapidly</li>
                  <li><strong>Drag clicking:</strong> Drag finger across mouse button</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Tips</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Use a gaming mouse with low click latency</li>
                  <li>Practice regularly to build muscle memory</li>
                  <li>Keep your hand relaxed but ready</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
