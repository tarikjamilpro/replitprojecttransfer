import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Wand2,
  Download,
  Trash2,
  Loader2,
  ImageIcon,
  Sparkles,
  AlertCircle,
  Clock,
  X
} from "lucide-react";
import { ToolPageLayout } from "@/components/Layout";

const EXAMPLE_PROMPTS = [
  "A serene mountain landscape at sunset with golden light reflecting on a crystal-clear lake",
  "A cozy coffee shop interior with warm lighting and vintage decor",
  "A futuristic cityscape at night with neon lights and flying vehicles",
  "A magical forest with glowing mushrooms and fireflies",
  "A professional portrait of a confident businesswoman in modern office",
  "An astronaut floating in space with Earth in the background",
  "A beautiful garden with colorful flowers and butterflies",
  "A vintage car on a coastal highway during golden hour"
];

interface GeneratedImage {
  id: string;
  image: string;
  prompt: string;
  timestamp: Date;
}

interface GenerateResponse {
  success: boolean;
  image: string;
  prompt: string;
  error?: string;
}

const MAX_CHARS = 500;

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (promptText: string): Promise<GenerateResponse> => {
      const response = await apiRequest("POST", "/api/generate-image", { prompt: promptText });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.image) {
        setGeneratedImage(data.image);
        
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          image: data.image,
          prompt: data.prompt,
          timestamp: new Date()
        };
        setHistory(prev => [newImage, ...prev].slice(0, 10));
        
        toast({
          title: "Image generated!",
          description: "Your image has been created successfully.",
        });
      } else {
        setError("No image was returned. Please try again.");
      }
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to generate image. Please try again.";
      setError(errorMessage);
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = useCallback(() => {
    const trimmedPrompt = prompt.trim();
    
    if (!trimmedPrompt) {
      setError("Please enter a description for your image");
      return;
    }

    if (trimmedPrompt.length < 3) {
      setError("Please provide a more detailed description (at least 3 characters)");
      return;
    }

    if (trimmedPrompt.length > MAX_CHARS) {
      setError(`Prompt is too long. Maximum ${MAX_CHARS} characters allowed.`);
      return;
    }

    setError(null);
    setGeneratedImage(null);
    generateMutation.mutate(trimmedPrompt);
  }, [prompt, generateMutation]);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Image downloaded",
      description: "Your image has been saved.",
    });
  }, [generatedImage, toast]);

  const handleClear = useCallback(() => {
    setPrompt("");
    setGeneratedImage(null);
    setError(null);
  }, []);

  const handleExampleClick = useCallback((example: string) => {
    setPrompt(example);
    setError(null);
  }, []);

  const handleHistoryClick = useCallback((item: GeneratedImage) => {
    setGeneratedImage(item.image);
    setPrompt(item.prompt);
    setError(null);
  }, []);

  const removeFromHistory = useCallback((id: string, e: MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const isGenerating = generateMutation.isPending;

  return (
    <ToolPageLayout
      toolPath="/ai-image-generator"
      title="AI Image Generator"
      description="Create stunning photorealistic images from text descriptions using AI. Powered by Dreamlike Photoreal 2.0 model."
      howToUse={
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Enter a detailed description of the image you want to create in the text area</li>
          <li>Click the "Generate Image" button and wait for the AI to create your image</li>
          <li>Download your generated image using the download button</li>
          <li>Try different prompts or use the example prompts for inspiration</li>
        </ol>
      }
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Describe Your Image</h3>
                </div>
                <span className="text-sm text-muted-foreground" data-testid="text-char-count">
                  {prompt.length} / {MAX_CHARS}
                </span>
              </div>

              <Textarea
                placeholder="Enter a detailed description of the image you want to create... For example: 'A serene mountain landscape at sunset with golden light reflecting on a crystal-clear lake'"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (error) setError(null);
                }}
                className="min-h-[150px] resize-none mb-4"
                maxLength={MAX_CHARS}
                data-testid="input-prompt"
              />

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm mb-4" data-testid="text-error">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1"
                  data-testid="button-generate"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClear}
                  disabled={isGenerating}
                  data-testid="button-clear"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Example Prompts</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs text-left whitespace-normal"
                    onClick={() => handleExampleClick(example)}
                    disabled={isGenerating}
                    data-testid={`button-example-${index}`}
                  >
                    {example.length > 50 ? example.substring(0, 50) + "..." : example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Recent Generations</h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {history.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border hover-elevate"
                      onClick={() => handleHistoryClick(item)}
                      data-testid={`card-history-${index}`}
                    >
                      <img
                        src={item.image}
                        alt={item.prompt}
                        className="w-full aspect-square object-cover"
                        data-testid={`img-history-${index}`}
                      />
                      <button
                        onClick={(e) => removeFromHistory(item.id, e.nativeEvent)}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-history-${index}`}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="min-h-[400px]">
            <CardContent className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Generated Image</h3>
                </div>
                {generatedImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    data-testid="button-download"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-center min-h-[300px] border rounded-lg bg-muted/20" data-testid="container-result">
                {isGenerating ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <div>
                      <p className="font-medium">Creating your image...</p>
                      <p className="text-sm text-muted-foreground">This may take 10-30 seconds</p>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="max-w-full max-h-[500px] rounded-lg shadow-lg"
                    data-testid="img-result"
                  />
                ) : (
                  <div className="text-center text-muted-foreground space-y-2" data-testid="text-placeholder">
                    <ImageIcon className="w-16 h-16 mx-auto opacity-50" />
                    <p>Your generated image will appear here</p>
                    <p className="text-sm">Enter a description and click Generate</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Tips for Better Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Be specific about lighting, colors, and atmosphere</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Describe the style (photorealistic, cinematic, portrait, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Include details about perspective and composition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Mention quality terms like "high detail" or "professional"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Keep prompts clear and avoid contradictory descriptions</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolPageLayout>
  );
}
