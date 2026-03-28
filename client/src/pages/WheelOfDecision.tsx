import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shuffle, Trophy, Trash2, RotateCcw, Copy, X, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { SEO } from "@/components/SEO";
import { RelatedTools } from "@/components/RelatedTools";
import { getToolSEO } from "@/data/toolsData";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

type SpinState = "idle" | "spinning" | "finished";

const DEFAULT_OPTIONS = `Pizza
Burger
Sushi
Tacos
Pasta
Salad
Ramen
Curry`;

export default function WheelOfDecision() {
  const toolSEO = getToolSEO("/wheel-of-decision");
  const [inputText, setInputText] = useState(DEFAULT_OPTIONS);
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [options, setOptions] = useState<string[]>([]);
  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const { toast } = useToast();
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    parseOptions(inputText);
  }, [inputText]);

  const parseOptions = (text: string) => {
    const parsed = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    setOptions(parsed);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffa500"];

    (function frame() {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 500);
  };

  const spin = useCallback(() => {
    if (options.length < 2) {
      toast({
        title: "Not enough options",
        description: "Please enter at least 2 options",
        variant: "destructive",
      });
      return;
    }

    setSpinState("spinning");
    setWinner(null);
    
    const winnerIndex = Math.floor(Math.random() * options.length);
    const totalDuration = 3000;
    const startTime = Date.now();
    let currentIndex = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const delay = 50 + easeOut * 400;

      setHighlightedIndex(currentIndex % options.length);
      currentIndex++;

      if (progress < 1) {
        spinIntervalRef.current = setTimeout(animate, delay);
      } else {
        setHighlightedIndex(winnerIndex);
        setTimeout(() => {
          setSpinState("finished");
          setWinner(options[winnerIndex]);
          setHistory((prev) => [options[winnerIndex], ...prev.slice(0, 4)]);
          triggerConfetti();
        }, 300);
      }
    };

    animate();
  }, [options, toast]);

  const spinAgain = () => {
    setSpinState("idle");
    setWinner(null);
    setHighlightedIndex(null);
    setTimeout(spin, 100);
  };

  const removeWinner = () => {
    if (winner) {
      const newOptions = options.filter((opt) => opt !== winner);
      setInputText(newOptions.join("\n"));
      setWinner(null);
      setSpinState("idle");
      setHighlightedIndex(null);
    }
  };

  const resetAll = () => {
    if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    setInputText(DEFAULT_OPTIONS);
    setSpinState("idle");
    setWinner(null);
    setHighlightedIndex(null);
    setHistory([]);
  };

  const copyResult = async () => {
    if (winner) {
      await navigator.clipboard.writeText(`The wheel picked: ${winner}`);
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && spinState === "idle") {
      e.preventDefault();
      spin();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shuffle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Wheel of Decision</h1>
          </div>
          <p className="text-muted-foreground">Can't decide? Let the wheel choose for you!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Your Options</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputText("")}
                    disabled={spinState === "spinning"}
                    data-testid="button-clear"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your options here... (one per line)"
                  className="min-h-[200px] font-mono"
                  disabled={spinState === "spinning"}
                  data-testid="input-options"
                />
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>{options.length} options entered</span>
                  <span>Press Ctrl+Enter to spin</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => requestAction(spin)}
              size="lg"
              className="w-full text-lg py-6"
              disabled={spinState === "spinning" || options.length < 2}
              data-testid="button-spin"
            >
              <Shuffle className={`w-5 h-5 mr-2 ${spinState === "spinning" ? "animate-spin" : ""}`} />
              {spinState === "spinning" ? "Spinning..." : "Spin the Wheel!"}
            </Button>

            {history.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Recent Picks</h3>
                  <div className="flex flex-wrap gap-2">
                    {history.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-muted rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {winner && spinState === "finished" && (
              <Card className="border-2 border-primary bg-primary/5">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <span className="text-lg font-medium text-muted-foreground">Winner!</span>
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-4xl sm:text-5xl font-bold text-primary" data-testid="text-winner">
                      {winner}
                    </h2>
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    <Button onClick={spinAgain} data-testid="button-spin-again">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Spin Again
                    </Button>
                    <Button variant="outline" onClick={removeWinner} data-testid="button-remove-winner">
                      <X className="w-4 h-4 mr-2" />
                      Remove & Spin
                    </Button>
                    <Button variant="outline" onClick={copyResult} data-testid="button-copy-result">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Options Wheel</h3>
                {options.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shuffle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter at least 2 options to spin</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                    {options.map((option, index) => (
                      <div
                        key={index}
                        className={`
                          p-3 rounded-lg text-center font-medium transition-all duration-150
                          ${highlightedIndex === index
                            ? "bg-primary text-primary-foreground scale-105 shadow-lg"
                            : "bg-muted"
                          }
                          ${winner === option && spinState === "finished"
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                          }
                        `}
                        data-testid={`option-${index}`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetAll}
                className="flex-1"
                disabled={spinState === "spinning"}
                data-testid="button-reset"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">How to Use</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Enter your options in the text box, one per line (minimum 2 required)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Click "Spin the Wheel!" and watch as options are randomly highlighted</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Celebrate the winner! Spin again or remove the winner for elimination rounds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RelatedTools currentToolId="wheel-of-decision" category="Utility Tools" />
      </div>
      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="Wheel of Decision"
      />
    </div>
  );
}
