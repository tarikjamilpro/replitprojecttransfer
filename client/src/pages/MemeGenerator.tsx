import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Image as ImageIcon, 
  Upload, 
  Download, 
  RotateCcw, 
  Type,
  Loader2
} from "lucide-react";

const MEME_TEMPLATES = [
  { id: "drake", name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg" },
  { id: "distracted", name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { id: "buttons", name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
  { id: "brain", name: "Expanding Brain", url: "https://i.imgflip.com/1jwhww.jpg" },
  { id: "woman-cat", name: "Woman Yelling at Cat", url: "https://i.imgflip.com/345v97.jpg" },
  { id: "change-mind", name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
  { id: "fine", name: "This Is Fine", url: "https://i.imgflip.com/wxica.jpg" },
  { id: "bernie", name: "Bernie Sanders", url: "https://i.imgflip.com/4scv60.png" },
];

export default function MemeGenerator() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxWidth = 800;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const scaledFontSize = fontSize * (canvas.width / 800);
      ctx.font = `bold ${scaledFontSize}px Impact, sans-serif`;
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = scaledFontSize / 15;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.lineJoin = "round";

      const wrapText = (text: string, maxWidth: number): string[] => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      if (topText) {
        const lines = wrapText(topText.toUpperCase(), canvas.width - 40);
        lines.forEach((line, i) => {
          const y = 20 + i * (scaledFontSize + 5);
          ctx.strokeText(line, canvas.width / 2, y);
          ctx.fillText(line, canvas.width / 2, y);
        });
      }

      if (bottomText) {
        ctx.textBaseline = "bottom";
        const lines = wrapText(bottomText.toUpperCase(), canvas.width - 40);
        lines.reverse().forEach((line, i) => {
          const y = canvas.height - 20 - i * (scaledFontSize + 5);
          ctx.strokeText(line, canvas.width / 2, y);
          ctx.fillText(line, canvas.width / 2, y);
        });
      }
    };
    img.onerror = () => {
      toast({
        title: "Error loading image",
        description: "Could not load the selected image. Please try another.",
        variant: "destructive",
      });
    };
    img.src = selectedImage;
  }, [selectedImage, topText, bottomText, fontSize, toast]);

  useEffect(() => {
    if (selectedImage) {
      const timeoutId = setTimeout(drawMeme, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedImage, topText, bottomText, fontSize, drawMeme]);

  const handleTemplateSelect = (url: string) => {
    setIsLoading(true);
    setSelectedImage(url);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement("a");
      link.download = `meme-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({
        title: "Meme downloaded!",
        description: "Your meme has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the meme. Try a different image.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setTopText("");
    setBottomText("");
    setFontSize(48);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ImageIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Meme Generator</h1>
          </div>
          <p className="text-muted-foreground">Create hilarious memes with custom text in seconds</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="templates" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="templates" data-testid="tab-templates">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Templates
                    </TabsTrigger>
                    <TabsTrigger value="upload" data-testid="tab-upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="templates">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {MEME_TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover-elevate ${
                            selectedImage === template.url
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`template-${template.id}`}
                        >
                          <img
                            src={template.url}
                            alt={template.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <span className="text-white text-xs font-medium line-clamp-1">
                              {template.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload">
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      data-testid="dropzone"
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-1">Drop your image here</p>
                      <p className="text-sm text-muted-foreground">or click to browse files</p>
                      <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, GIF, WebP</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        data-testid="input-file"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Add Text
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="top-text">Top Text</Label>
                  <Input
                    id="top-text"
                    placeholder="Enter top text..."
                    value={topText}
                    onChange={(e) => setTopText(e.target.value.slice(0, 100))}
                    maxLength={100}
                    data-testid="input-top-text"
                  />
                  <p className="text-xs text-muted-foreground text-right">{topText.length}/100</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bottom-text">Bottom Text</Label>
                  <Input
                    id="bottom-text"
                    placeholder="Enter bottom text..."
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value.slice(0, 100))}
                    maxLength={100}
                    data-testid="input-bottom-text"
                  />
                  <p className="text-xs text-muted-foreground text-right">{bottomText.length}/100</p>
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    min={24}
                    max={72}
                    step={2}
                    data-testid="slider-font-size"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                disabled={!selectedImage}
                className="flex-1"
                size="lg"
                data-testid="button-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Meme
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                data-testid="button-reset"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Preview</h3>
                <div className="relative bg-muted rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
                  {isLoading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                  {selectedImage ? (
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto"
                      data-testid="canvas-preview"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Select a template or upload an image to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-3">How to Create a Meme</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-medium text-foreground">Choose an Image</p>
                  <p>Select from popular meme templates or upload your own image</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="font-medium text-foreground">Add Your Text</p>
                  <p>Enter top and bottom text to make it funny. Adjust font size as needed</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</span>
                <div>
                  <p className="font-medium text-foreground">Download & Share</p>
                  <p>Download your meme as a high-quality PNG and share it everywhere</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
