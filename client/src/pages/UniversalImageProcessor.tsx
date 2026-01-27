import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Loader2, CheckCircle, XCircle, Image as ImageIcon, Lock, Unlock, FileArchive, Trash2, Settings } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  status: "pending" | "processing" | "done" | "error";
  processedBlob: Blob | null;
  processedSize: number;
  processedUrl: string | null;
  error: string | null;
}

type OutputFormat = "jpeg" | "png" | "webp" | "bmp" | "ico";

const formatExtensions: Record<OutputFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  bmp: "bmp",
  ico: "ico",
};

const formatMimeTypes: Record<OutputFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  bmp: "image/bmp",
  ico: "image/x-icon",
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function UniversalImageProcessor() {
  const toolSEO = getToolSEO("/image-processor");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const img = new Image();
      const preview = URL.createObjectURL(file);
      
      img.onload = () => {
        const newImage: ImageFile = {
          id: generateId(),
          file,
          preview,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          originalSize: file.size,
          status: "pending",
          processedBlob: null,
          processedSize: 0,
          processedUrl: null,
          error: null,
        };
        setImages((prev) => [...prev, newImage]);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(preview);
        toast({ title: "Invalid image", description: `${file.name} could not be loaded`, variant: "destructive" });
      };
      
      img.src = preview;
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".ico"] },
  });

  const handleWidthChange = (value: number) => {
    setTargetWidth(value);
    if (lockAspectRatio && images.length > 0) {
      const firstImage = images[0];
      const ratio = firstImage.originalHeight / firstImage.originalWidth;
      setTargetHeight(Math.round(value * ratio));
    }
  };

  const handleHeightChange = (value: number) => {
    setTargetHeight(value);
    if (lockAspectRatio && images.length > 0) {
      const firstImage = images[0];
      const ratio = firstImage.originalWidth / firstImage.originalHeight;
      setTargetWidth(Math.round(value * ratio));
    }
  };

  const processImage = async (imageFile: ImageFile): Promise<{ blob: Blob; size: number } | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          let finalWidth = img.naturalWidth;
          let finalHeight = img.naturalHeight;

          if (resizeEnabled) {
            if (lockAspectRatio) {
              const widthRatio = targetWidth / img.naturalWidth;
              const heightRatio = targetHeight / img.naturalHeight;
              const ratio = Math.min(widthRatio, heightRatio);
              finalWidth = Math.round(img.naturalWidth * ratio);
              finalHeight = Math.round(img.naturalHeight * ratio);
            } else {
              finalWidth = targetWidth;
              finalHeight = targetHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            resolve(null);
            return;
          }

          if (outputFormat === "jpeg" || outputFormat === "bmp") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, finalWidth, finalHeight);
          }

          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

          const mimeType = formatMimeTypes[outputFormat];
          const qualityValue = (outputFormat === "jpeg" || outputFormat === "webp") ? quality / 100 : undefined;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, size: blob.size });
              } else {
                resolve(null);
              }
            },
            mimeType,
            qualityValue
          );
        } catch {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);
      img.src = imageFile.preview;
    });
  };

  const handleProcessAll = async () => {
    if (images.length === 0) {
      toast({ title: "No images", description: "Please add images to process", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    setImages((prev) => prev.map((img) => ({ ...img, status: "processing" as const, error: null })));

    for (let i = 0; i < images.length; i++) {
      const imageFile = images[i];
      
      setImages((prev) =>
        prev.map((img) => (img.id === imageFile.id ? { ...img, status: "processing" as const } : img))
      );

      const result = await processImage(imageFile);

      if (result) {
        const processedUrl = URL.createObjectURL(result.blob);
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? {
                  ...img,
                  status: "done" as const,
                  processedBlob: result.blob,
                  processedSize: result.size,
                  processedUrl,
                }
              : img
          )
        );
      } else {
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? { ...img, status: "error" as const, error: "Failed to process image" }
              : img
          )
        );
      }
    }

    setIsProcessing(false);
    toast({ title: "Processing complete", description: `Processed ${images.length} image(s)` });
  };

  const downloadSingle = (image: ImageFile) => {
    if (!image.processedBlob) return;
    const baseName = image.file.name.replace(/\.[^/.]+$/, "");
    const newName = `${baseName}_converted.${formatExtensions[outputFormat]}`;
    saveAs(image.processedBlob, newName);
  };

  const downloadAllAsZip = async () => {
    const processedImages = images.filter((img) => img.status === "done" && img.processedBlob);
    if (processedImages.length === 0) return;

    const zip = new JSZip();
    
    processedImages.forEach((image) => {
      const baseName = image.file.name.replace(/\.[^/.]+$/, "");
      const newName = `${baseName}_converted.${formatExtensions[outputFormat]}`;
      if (image.processedBlob) {
        zip.file(newName, image.processedBlob);
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "converted_images.zip");
    toast({ title: "ZIP Downloaded", description: `${processedImages.length} images saved` });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.processedUrl) URL.revokeObjectURL(image.processedUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
    });
    setImages([]);
  };

  const processedCount = images.filter((img) => img.status === "done").length;

  return (
    <div className="min-h-screen bg-background">
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Universal Image Processor</h1>
            <p className="text-muted-foreground text-sm">Convert and resize images - all processing happens in your browser</p>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          data-testid="dropzone-upload"
        >
          <input {...getInputProps()} data-testid="input-file-upload" />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-1">
            {isDragActive ? "Drop images here" : "Drag & Drop images or Click to Browse"}
          </p>
          <p className="text-sm text-muted-foreground">Supports JPG, PNG, GIF, WEBP, BMP, ICO</p>
        </div>

        <Card className="mb-6 sticky top-0 z-10 bg-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={resizeEnabled}
                    onCheckedChange={setResizeEnabled}
                    data-testid="switch-resize"
                  />
                  <Label className="font-medium">Resize</Label>
                </div>
                
                {resizeEnabled && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">W:</Label>
                      <Input
                        type="number"
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-20 h-8"
                        data-testid="input-width"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">H:</Label>
                      <Input
                        type="number"
                        value={targetHeight}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-20 h-8"
                        data-testid="input-height"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={lockAspectRatio}
                        onCheckedChange={(checked) => setLockAspectRatio(checked === true)}
                        data-testid="checkbox-lock-ratio"
                      />
                      {lockAspectRatio ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Unlock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">Lock Ratio</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Format:</Label>
                  <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                    <SelectTrigger className="w-24 h-8" data-testid="select-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpeg">JPG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WEBP</SelectItem>
                      <SelectItem value="bmp">BMP</SelectItem>
                      <SelectItem value="ico">ICO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(outputFormat === "jpeg" || outputFormat === "webp") && (
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <Label className="text-sm">Quality:</Label>
                    <Slider
                      value={[quality]}
                      onValueChange={([v]) => setQuality(v)}
                      min={10}
                      max={100}
                      step={5}
                      className="flex-1"
                      data-testid="slider-quality"
                    />
                    <span className="text-sm w-10 text-right">{quality}%</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {images.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll} data-testid="button-clear-all">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
                <Button
                  onClick={handleProcessAll}
                  disabled={images.length === 0 || isProcessing}
                  className="min-w-[140px]"
                  data-testid="button-process-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Process All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {processedCount > 1 && (
          <div className="mb-4 flex justify-end">
            <Button onClick={downloadAllAsZip} variant="outline" data-testid="button-download-zip">
              <FileArchive className="w-4 h-4 mr-2" />
              Download All as ZIP ({processedCount} images)
            </Button>
          </div>
        )}

        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={image.processedUrl || image.preview}
                    alt={image.file.name}
                    className="w-full h-full object-contain"
                  />
                  {image.status === "processing" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {image.status === "done" && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-green-500 drop-shadow-md" />
                    </div>
                  )}
                  {image.status === "error" && (
                    <div className="absolute top-2 right-2">
                      <XCircle className="w-6 h-6 text-red-500 drop-shadow-md" />
                    </div>
                  )}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 left-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                    data-testid={`button-remove-${image.id}`}
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate mb-1">{image.file.name}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{image.originalWidth} x {image.originalHeight}</span>
                    <span>
                      {formatBytes(image.originalSize)}
                      {image.status === "done" && (
                        <span className="text-green-600 ml-1">
                          → {formatBytes(image.processedSize)}
                        </span>
                      )}
                    </span>
                  </div>
                  {image.status === "error" && (
                    <p className="text-xs text-red-500 mb-2">{image.error}</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={image.status !== "done"}
                    onClick={() => downloadSingle(image)}
                    data-testid={`button-download-${image.id}`}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No images added yet</p>
            <p className="text-sm">Drop some images above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
