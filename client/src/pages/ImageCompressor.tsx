import { useState, useRef, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download, Trash2, Image as ImageIcon, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

interface ImageFile {
  original: File;
  compressed: Blob | null;
  originalUrl: string;
  compressedUrl: string | null;
  originalSize: number;
  compressedSize: number | null;
}

export default function ImageCompressor() {
  const toolSEO = getToolSEO("/image-compressor");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const calculateSavings = (original: number, compressed: number): string => {
    const savings = ((original - compressed) / original) * 100;
    return savings.toFixed(1);
  };

  const compressImage = useCallback(
    async (file: File): Promise<{ blob: Blob; url: string }> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
          const qualityValue = mimeType === "image/png" ? undefined : quality / 100;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve({ blob, url });
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            mimeType,
            qualityValue
          );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
      });
    },
    [quality]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      toast({
        title: "No valid images",
        description: "Please select valid image files (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    const newImages: ImageFile[] = validFiles.map((file) => ({
      original: file,
      compressed: null,
      originalUrl: URL.createObjectURL(file),
      compressedUrl: null,
      originalSize: file.size,
      compressedSize: null,
    }));

    setImages((prev) => [...prev, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCompress = async () => {
    if (images.length === 0) {
      toast({
        title: "No images to compress",
        description: "Please upload images first.",
        variant: "destructive",
      });
      return;
    }

    setIsCompressing(true);

    try {
      const compressedImages = await Promise.all(
        images.map(async (img) => {
          try {
            const { blob, url } = await compressImage(img.original);
            return {
              ...img,
              compressed: blob,
              compressedUrl: url,
              compressedSize: blob.size,
            };
          } catch {
            return img;
          }
        })
      );

      setImages(compressedImages);
      toast({
        title: "Compression complete",
        description: `${compressedImages.filter((img) => img.compressed).length} images compressed successfully.`,
      });
    } catch {
      toast({
        title: "Compression failed",
        description: "An error occurred while compressing images.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = (img: ImageFile, index: number) => {
    if (!img.compressedUrl || !img.compressed) {
      toast({
        title: "Image not compressed",
        description: "Please compress the image first.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement("a");
    link.href = img.compressedUrl;
    const extension = img.original.type === "image/png" ? ".png" : ".jpg";
    const baseName = img.original.name.replace(/\.[^/.]+$/, "");
    link.download = `${baseName}_compressed${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    const compressedImages = images.filter((img) => img.compressed);
    if (compressedImages.length === 0) {
      toast({
        title: "No compressed images",
        description: "Please compress images first.",
        variant: "destructive",
      });
      return;
    }

    compressedImages.forEach((img, index) => {
      setTimeout(() => handleDownload(img, index), index * 200);
    });
  };

  const handleRemove = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      if (newImages[index].originalUrl) {
        URL.revokeObjectURL(newImages[index].originalUrl);
      }
      if (newImages[index].compressedUrl) {
        URL.revokeObjectURL(newImages[index].compressedUrl);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleClearAll = () => {
    images.forEach((img) => {
      if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
  };

  const totalOriginalSize = images.reduce((acc, img) => acc + img.originalSize, 0);
  const totalCompressedSize = images.reduce(
    (acc, img) => acc + (img.compressedSize || img.originalSize),
    0
  );
  const hasCompressedImages = images.some((img) => img.compressed);

  return (
    <ToolPageLayout
      title="Image Compressor"
      description="Compress images in your browser without uploading to any server. Your images stay private on your device."
      toolPath="/image-compressor"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Click "Select Images" or drag and drop images to upload.</li>
          <li>Adjust the quality slider (lower = smaller file size, higher = better quality).</li>
          <li>Click "Compress Images" to compress all uploaded images.</li>
          <li>Download individual images or all at once.</li>
          <li>Note: PNG images maintain their format. JPEG/WebP images are converted to JPEG.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="space-y-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="hidden"
          data-testid="input-file"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover-elevate transition-colors"
          data-testid="dropzone"
        >
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-1">Click to select images</p>
          <p className="text-sm text-muted-foreground">
            Supports JPG, PNG, WebP, and other image formats
          </p>
        </div>

        {images.length > 0 && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Quality: {quality}%</Label>
                <span className="text-sm text-muted-foreground">
                  Lower = smaller file size
                </span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={([val]) => setQuality(val)}
                min={10}
                max={100}
                step={5}
                className="w-full"
                data-testid="slider-quality"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10% (Smallest)</span>
                <span>100% (Best Quality)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCompress}
                disabled={isCompressing}
                data-testid="button-compress"
              >
                <FileImage className="w-4 h-4 mr-2" />
                {isCompressing ? "Compressing..." : "Compress Images"}
              </Button>
              {hasCompressedImages && (
                <Button onClick={handleDownloadAll} variant="outline" data-testid="button-download-all">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
              <Button onClick={handleClearAll} variant="outline" data-testid="button-clear">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {hasCompressedImages && (
              <Card className="bg-primary/10">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Original</div>
                      <div className="font-semibold" data-testid="text-total-original">
                        {formatFileSize(totalOriginalSize)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Compressed</div>
                      <div className="font-semibold text-primary" data-testid="text-total-compressed">
                        {formatFileSize(totalCompressedSize)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Saved</div>
                      <div className="font-semibold text-green-600" data-testid="text-total-saved">
                        {calculateSavings(totalOriginalSize, totalCompressedSize)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((img, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={img.compressedUrl || img.originalUrl}
                      alt={img.original.name}
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => handleRemove(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-md hover-elevate"
                      data-testid={`button-remove-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate mb-2" title={img.original.name}>
                      {img.original.name}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Original: {formatFileSize(img.originalSize)}</span>
                      {img.compressedSize && (
                        <span className="text-primary">
                          Compressed: {formatFileSize(img.compressedSize)}
                        </span>
                      )}
                    </div>
                    {img.compressedSize && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600 font-medium">
                          Saved {calculateSavings(img.originalSize, img.compressedSize)}%
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(img, index)}
                          data-testid={`button-download-${index}`}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {images.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No images uploaded yet</p>
            <p className="text-sm">Select images to get started</p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
