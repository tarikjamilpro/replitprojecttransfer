import { useState, useRef, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, RotateCcw, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function BackgroundRemover() {
  const toolSEO = getToolSEO("/background-remover");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Unsupported format. Please upload a PNG, JPG, or WebP image.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`;
    }
    return null;
  }, []);

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(10);
    setError(null);
    setProcessedImage(null);

    try {
      setProgress(20);
      const { removeBackground } = await import("@imgly/background-removal");

      setProgress(40);
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          const ratio = total > 0 ? current / total : 0;
          setProgress(Math.min(40 + Math.round(ratio * 55), 95));
        },
      });

      setProgress(100);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);

      toast({
        title: "Background removed",
        description: "Your image has been processed. You can now download the result.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError("Unable to process image. Please try a different file.");
      toast({
        title: "Processing failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast({
        title: "Invalid file",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setProcessedImage(null);
    setProgress(0);

    const url = URL.createObjectURL(file);
    setOriginalImage(url);
    setOriginalFile(file);

    processImage(file);
  }, [validateFile, processImage, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (e.target) e.target.value = "";
  }, [handleFile]);

  const handleDownload = useCallback(() => {
    if (!processedImage || !originalFile) return;
    const a = document.createElement("a");
    a.href = processedImage;
    const baseName = originalFile.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}-no-bg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [processedImage, originalFile]);

  const handleReset = useCallback(() => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (processedImage) URL.revokeObjectURL(processedImage);
    setOriginalImage(null);
    setOriginalFile(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [originalImage, processedImage]);

  return (
    <>
      <SEO
        title={toolSEO?.seoTitle || "Free Image Background Remover - Remove BG Online"}
        description={toolSEO?.seoDescription || "Remove image backgrounds instantly with AI. No uploads to servers - 100% private browser processing. Free online tool."}
      />
      <ToolPageLayout
        title="Image Background Remover"
        description="Remove backgrounds from images instantly using AI. Processed entirely in your browser - no server uploads, 100% private."
        toolPath="/background-remover"
        toolId="background-remover"
        category="Image Tools"
        howToUse={[
          "Upload a PNG, JPG, or WebP image (max 10 MB).",
          "Wait for the AI to process and remove the background.",
          "Preview the before and after comparison.",
          "Download the transparent PNG result.",
        ]}
      >
        <div className="space-y-6">
          {!originalImage && (
            <Card>
              <CardContent className="p-6">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload image for background removal. Drag and drop or click to browse."
                  className={`border-2 border-dashed rounded-md p-12 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover-elevate"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  data-testid="dropzone-upload"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground mb-1">
                    Drag & drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or WebP - Max 10 MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileInput}
                  aria-label="Select image file"
                  data-testid="input-file"
                />
              </CardContent>
            </Card>
          )}

          {isProcessing && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary animate-pulse" />
                    <p className="text-sm font-medium text-foreground" data-testid="text-processing-status">
                      Removing background, please wait...
                    </p>
                  </div>
                  <Progress value={progress} className="h-2" data-testid="progress-bar" />
                  <p className="text-xs text-muted-foreground text-right" data-testid="text-progress-percent">{progress}%</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm" data-testid="text-error">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {originalImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3" data-testid="text-label-before">Before</p>
                  <div className="relative rounded-md overflow-hidden bg-muted/30 flex items-center justify-center min-h-[200px]">
                    <img
                      src={originalImage}
                      alt="Original uploaded image"
                      className="max-w-full max-h-[400px] object-contain"
                      data-testid="img-original"
                    />
                  </div>
                  {originalFile && (
                    <p className="text-xs text-muted-foreground mt-2" data-testid="text-file-info">
                      {originalFile.name} ({formatFileSize(originalFile.size)})
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3" data-testid="text-label-after">After</p>
                  <div
                    className="relative rounded-md overflow-hidden flex items-center justify-center min-h-[200px]"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    }}
                  >
                    {processedImage ? (
                      <img
                        src={processedImage}
                        alt="Image with background removed"
                        className="max-w-full max-h-[400px] object-contain"
                        data-testid="img-processed"
                      />
                    ) : isProcessing ? (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <ImageIcon className="w-8 h-8 text-muted-foreground animate-pulse" />
                        <p className="text-sm text-muted-foreground">Processing...</p>
                      </div>
                    ) : error ? (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                        <p className="text-sm text-destructive">Processing failed</p>
                      </div>
                    ) : null}
                  </div>
                  {processedImage && (
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <p className="text-xs text-green-600 dark:text-green-400" data-testid="text-success-status">
                        Background removed - transparent PNG
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {originalImage && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => requestAction(handleDownload)}
                disabled={!processedImage || isProcessing}
                data-testid="button-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isProcessing}
                data-testid="button-reset"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          )}

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3">About This Tool</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  This tool uses AI-powered processing to remove backgrounds from your images
                  directly in the browser. No images are uploaded to any server - everything
                  runs locally on your device.
                </p>
                <p>
                  The first time you use this tool, it downloads a small AI model (about 80 MB).
                  Subsequent uses will be faster as the model is cached by your browser.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Supports PNG, JPG, and WebP formats</li>
                  <li>Maximum file size: 10 MB</li>
                  <li>Output: transparent PNG</li>
                  <li>100% private - no server uploads</li>
                  <li>Works offline after first use</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
  
      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="Background Remover"
      />
    </ToolPageLayout>
    </>
  );
}
