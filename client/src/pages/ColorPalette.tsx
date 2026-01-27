import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, Shuffle, Copy, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

interface ColorBar {
  hex: string;
  hsl: { h: number; s: number; l: number };
  locked: boolean;
  copied: boolean;
}

type ColorScheme = "analogous" | "complementary" | "triadic" | "monochromatic" | "random";

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

const getLuminance = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

const generateHarmonicPalette = (lockedBars: ColorBar[]): ColorBar[] => {
  const schemes: ColorScheme[] = ["analogous", "complementary", "triadic", "monochromatic", "random"];
  const scheme = schemes[Math.floor(Math.random() * schemes.length)];
  
  const baseHue = Math.floor(Math.random() * 360);
  const baseSat = 50 + Math.floor(Math.random() * 40);
  const baseLit = 40 + Math.floor(Math.random() * 30);

  const generateColor = (index: number): { h: number; s: number; l: number } => {
    let h: number, s: number, l: number;

    switch (scheme) {
      case "analogous":
        h = (baseHue + (index - 2) * 25 + 360) % 360;
        s = baseSat + (index * 5 - 10);
        l = baseLit + (index * 5 - 10);
        break;
      case "complementary":
        h = index % 2 === 0 ? baseHue : (baseHue + 180) % 360;
        h = (h + (index * 10 - 20) + 360) % 360;
        s = baseSat + (Math.random() * 20 - 10);
        l = baseLit + (index * 8 - 16);
        break;
      case "triadic":
        h = (baseHue + (index % 3) * 120 + (index > 2 ? 30 : 0)) % 360;
        s = baseSat + (Math.random() * 20 - 10);
        l = baseLit + (index * 6 - 12);
        break;
      case "monochromatic":
        h = baseHue;
        s = baseSat + (index * 8 - 16);
        l = 25 + (index * 12);
        break;
      default:
        h = Math.floor(Math.random() * 360);
        s = 40 + Math.floor(Math.random() * 50);
        l = 35 + Math.floor(Math.random() * 40);
    }

    s = Math.max(30, Math.min(90, s));
    l = Math.max(25, Math.min(75, l));

    return { h, s, l };
  };

  return lockedBars.map((bar, index) => {
    if (bar.locked) return bar;
    
    const hsl = generateColor(index);
    return {
      hex: hslToHex(hsl.h, hsl.s, hsl.l),
      hsl,
      locked: false,
      copied: false,
    };
  });
};

const initialPalette = (): ColorBar[] => {
  const empty: ColorBar[] = Array(5).fill(null).map(() => ({
    hex: "#888888",
    hsl: { h: 0, s: 0, l: 50 },
    locked: false,
    copied: false,
  }));
  return generateHarmonicPalette(empty);
};

export default function ColorPalette() {
  const toolSEO = getToolSEO("/color-palette");
  const [palette, setPalette] = useState<ColorBar[]>(initialPalette);
  const { toast } = useToast();

  const generatePalette = useCallback(() => {
    setPalette((prev) => generateHarmonicPalette(prev));
  }, []);

  const toggleLock = (index: number) => {
    setPalette((prev) =>
      prev.map((bar, i) =>
        i === index ? { ...bar, locked: !bar.locked } : bar
      )
    );
  };

  const copyToClipboard = async (hex: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hex);
      setPalette((prev) =>
        prev.map((bar, i) =>
          i === index ? { ...bar, copied: true } : bar
        )
      );
      toast({
        title: "Copied!",
        description: `${hex} copied to clipboard`,
      });
      setTimeout(() => {
        setPalette((prev) =>
          prev.map((bar, i) =>
            i === index ? { ...bar, copied: false } : bar
          )
        );
      }, 1500);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const copyAllHex = async () => {
    const hexCodes = palette.map((bar) => bar.hex).join(", ");
    try {
      await navigator.clipboard.writeText(hexCodes);
      toast({
        title: "All colors copied!",
        description: hexCodes,
      });
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const exportCSS = async () => {
    const css = palette
      .map((bar, i) => `  --color-${i + 1}: ${bar.hex};`)
      .join("\n");
    const fullCSS = `:root {\n${css}\n}`;
    try {
      await navigator.clipboard.writeText(fullCSS);
      toast({
        title: "CSS Variables copied!",
        description: "Paste into your stylesheet",
      });
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        generatePalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generatePalette]);

  return (
    <div className="min-h-screen flex flex-col">
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="flex flex-1 flex-col sm:flex-row" style={{ minHeight: "60vh" }}>
        {palette.map((bar, index) => {
          const isLight = getLuminance(bar.hex) > 0.5;
          const textColor = isLight ? "text-gray-900" : "text-white";
          const iconBg = isLight ? "bg-black/10 hover:bg-black/20" : "bg-white/10 hover:bg-white/20";

          return (
            <div
              key={index}
              className="flex-1 relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group min-h-[120px] sm:min-h-0"
              style={{ backgroundColor: bar.hex }}
              onClick={() => copyToClipboard(bar.hex, index)}
              data-testid={`color-bar-${index}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(index);
                }}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${iconBg} ${textColor}`}
                data-testid={`lock-${index}`}
              >
                {bar.locked ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Unlock className="w-5 h-5" />
                )}
              </button>

              <div className={`text-center transition-transform ${bar.copied ? "scale-110" : ""}`}>
                <p className={`text-2xl sm:text-4xl font-mono font-bold ${textColor}`} data-testid={`hex-${index}`}>
                  {bar.copied ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-6 h-6" />
                      Copied!
                    </span>
                  ) : (
                    bar.hex
                  )}
                </p>
                {!bar.copied && (
                  <p className={`text-sm mt-2 ${textColor} opacity-0 group-hover:opacity-70 transition-opacity flex items-center justify-center gap-1`}>
                    <Copy className="w-3 h-3" />
                    Click to copy
                  </p>
                )}
              </div>

              {bar.locked && (
                <div className="absolute inset-0 border-4 border-white/30 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-background border-t p-4 sm:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={generatePalette}
              size="lg"
              className="w-full sm:w-auto"
              data-testid="button-generate"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Generate Palette
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={copyAllHex}
                variant="outline"
                size="lg"
                data-testid="button-copy-all"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
              <Button
                onClick={exportCSS}
                variant="outline"
                size="lg"
                data-testid="button-export-css"
              >
                Export CSS
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">SPACE</kbd> to generate new colors
          </p>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Click any color bar to copy its hex code. Click the lock icon to preserve colors during generation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
