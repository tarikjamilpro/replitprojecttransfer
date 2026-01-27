import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Shuffle, Palette } from "lucide-react";

type GradientType = "linear" | "radial";

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

const generateRandomGradient = (): { start: string; end: string; angle: number } => {
  const schemes = ["complementary", "analogous", "triadic"];
  const scheme = schemes[Math.floor(Math.random() * schemes.length)];
  
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 30);
  const lightness = 45 + Math.floor(Math.random() * 20);

  let endHue: number;
  switch (scheme) {
    case "complementary":
      endHue = (baseHue + 180) % 360;
      break;
    case "analogous":
      endHue = (baseHue + 30 + Math.floor(Math.random() * 30)) % 360;
      break;
    case "triadic":
      endHue = (baseHue + 120) % 360;
      break;
    default:
      endHue = Math.floor(Math.random() * 360);
  }

  return {
    start: hslToHex(baseHue, saturation, lightness),
    end: hslToHex(endHue, saturation - 10 + Math.floor(Math.random() * 20), lightness),
    angle: Math.floor(Math.random() * 360),
  };
};

const PRESETS = [
  { name: "Sunset", start: "#FF6B6B", end: "#FEC89A", angle: 135 },
  { name: "Ocean", start: "#0077B6", end: "#00B4D8", angle: 90 },
  { name: "Forest", start: "#2D6A4F", end: "#95D5B2", angle: 180 },
  { name: "Purple Dream", start: "#7209B7", end: "#F72585", angle: 135 },
  { name: "Golden Hour", start: "#F77F00", end: "#FCBF49", angle: 45 },
  { name: "Midnight", start: "#1A1A2E", end: "#4A4E69", angle: 180 },
];

export default function GradientGenerator() {
  const [startColor, setStartColor] = useState("#FF6B6B");
  const [endColor, setEndColor] = useState("#4ECDC4");
  const [angle, setAngle] = useState(90);
  const [opacity, setOpacity] = useState(100);
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getGradientCSS = useCallback(() => {
    const alphaValue = opacity / 100;
    const startRgba = opacity < 100 ? hexToRgba(startColor, alphaValue) : startColor;
    const endRgba = opacity < 100 ? hexToRgba(endColor, alphaValue) : endColor;

    if (gradientType === "radial") {
      return `radial-gradient(circle, ${startRgba}, ${endRgba})`;
    }
    return `linear-gradient(${angle}deg, ${startRgba}, ${endRgba})`;
  }, [startColor, endColor, angle, opacity, gradientType]);

  const getFullCSS = useCallback(() => {
    return `background: ${getGradientCSS()};`;
  }, [getGradientCSS]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getFullCSS());
      setCopied(true);
      toast({
        title: "Copied!",
        description: "CSS copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const randomize = () => {
    const { start, end, angle: newAngle } = generateRandomGradient();
    setStartColor(start);
    setEndColor(end);
    setAngle(newAngle);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setStartColor(preset.start);
    setEndColor(preset.end);
    setAngle(preset.angle);
  };

  const getAngleLabel = (deg: number): string => {
    if (deg === 0 || deg === 360) return "Top → Bottom";
    if (deg === 90) return "Left → Right";
    if (deg === 180) return "Bottom → Top";
    if (deg === 270) return "Right → Left";
    if (deg === 45) return "Top-Left → Bottom-Right";
    if (deg === 135) return "Top-Right → Bottom-Left";
    return `${deg}°`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">CSS Gradient Generator</h1>
          </div>
          <p className="text-muted-foreground">Create beautiful CSS gradients with real-time preview</p>
        </div>

        <div
          className="w-full h-64 sm:h-80 rounded-lg mb-6 transition-all duration-300 shadow-lg"
          style={{ background: getGradientCSS() }}
          data-testid="gradient-preview"
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Colors</h3>
                <Button onClick={randomize} variant="outline" size="sm" data-testid="button-randomize">
                  <Shuffle className="w-4 h-4 mr-1" />
                  Random
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-color" className="mb-2 block">Start Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="start-color"
                      value={startColor}
                      onChange={(e) => setStartColor(e.target.value.toUpperCase())}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                      data-testid="input-start-color"
                    />
                    <Input
                      value={startColor}
                      onChange={(e) => setStartColor(e.target.value.toUpperCase())}
                      className="font-mono"
                      maxLength={7}
                      data-testid="input-start-hex"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="end-color" className="mb-2 block">End Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="end-color"
                      value={endColor}
                      onChange={(e) => setEndColor(e.target.value.toUpperCase())}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                      data-testid="input-end-color"
                    />
                    <Input
                      value={endColor}
                      onChange={(e) => setEndColor(e.target.value.toUpperCase())}
                      className="font-mono"
                      maxLength={7}
                      data-testid="input-end-hex"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Gradient Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={gradientType === "linear" ? "default" : "outline"}
                    onClick={() => setGradientType("linear")}
                    className="flex-1"
                    data-testid="button-linear"
                  >
                    Linear
                  </Button>
                  <Button
                    variant={gradientType === "radial" ? "default" : "outline"}
                    onClick={() => setGradientType("radial")}
                    className="flex-1"
                    data-testid="button-radial"
                  >
                    Radial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="font-semibold">Settings</h3>

              {gradientType === "linear" && (
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Angle</Label>
                    <span className="text-sm text-muted-foreground">{angle}° ({getAngleLabel(angle)})</span>
                  </div>
                  <Slider
                    value={[angle]}
                    onValueChange={(v) => setAngle(v[0])}
                    min={0}
                    max={360}
                    step={1}
                    data-testid="slider-angle"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0°</span>
                    <span>90°</span>
                    <span>180°</span>
                    <span>270°</span>
                    <span>360°</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Opacity</Label>
                  <span className="text-sm text-muted-foreground">{opacity}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={(v) => setOpacity(v[0])}
                  min={0}
                  max={100}
                  step={1}
                  data-testid="slider-opacity"
                />
              </div>

              <div>
                <Label className="mb-2 block">Quick Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="h-8 rounded text-xs font-medium transition-transform hover:scale-105"
                      style={{
                        background: `linear-gradient(${preset.angle}deg, ${preset.start}, ${preset.end})`,
                        color: "white",
                        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      }}
                      data-testid={`preset-${preset.name.toLowerCase().replace(" ", "-")}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated CSS</h3>
              <Button onClick={copyToClipboard} data-testid="button-copy">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy CSS
                  </>
                )}
              </Button>
            </div>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto" data-testid="css-output">
              <code>{getFullCSS()}</code>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">How to Use</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Pick your start and end colors using the color pickers or enter hex codes directly</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Adjust the angle and opacity using the sliders, or try a preset for quick results</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Copy the generated CSS code and paste it into your stylesheet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
