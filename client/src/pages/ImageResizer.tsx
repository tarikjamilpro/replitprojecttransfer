import { useState, useRef, useEffect } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Download, Image as ImageIcon, X, Lock, Unlock } from "lucide-react";

export default function ImageResizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      loadImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      loadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const loadImage = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
    };
    img.src = url;
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockAspectRatio && aspectRatio > 0) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockAspectRatio && aspectRatio > 0) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const resizeAndDownload = () => {
    if (!previewUrl || width <= 0 || height <= 0) return;

    setIsResizing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsResizing(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const isPng = selectedFile?.type === "image/png";
      const mimeType = isPng ? "image/png" : "image/jpeg";
      const ext = isPng ? "png" : "jpg";

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const baseName = selectedFile?.name.replace(/\.[^/.]+$/, "") || "resized";
            link.download = `${baseName}_${width}x${height}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
          setIsResizing(false);
        },
        mimeType,
        0.92
      );
    };

    img.src = previewUrl;
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(0);
    setHeight(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const setPresetSize = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setLockAspectRatio(false);
  };

  return (
    <ToolPageLayout
      title="Image Resizer"
      description="Resize your images to any dimension directly in your browser. No upload to server required - your images stay private."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Upload an image by clicking the upload area or dragging and dropping.</li>
          <li>Enter your desired width and height in pixels.</li>
          <li>Use "Lock Aspect Ratio" to maintain proportions when resizing.</li>
          <li>Or use preset sizes for common dimensions.</li>
          <li>Click "Resize & Download" to save your resized image.</li>
        </ol>
      }
    >
      <div className="space-y-6">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-file-upload"
        />

        {!selectedFile ? (
          <Card
            className="border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            data-testid="dropzone-upload"
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                Drop your image here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PNG, JPG, and WebP
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground" data-testid="text-filename">
                  {selectedFile.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({originalWidth} x {originalHeight})
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearImage}
                data-testid="button-clear"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3">Preview</h3>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        data-testid="img-preview"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-4">Dimensions</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="width">Width (px)</Label>
                        <Input
                          id="width"
                          type="number"
                          min={1}
                          max={10000}
                          value={width}
                          onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                          className="mt-1"
                          data-testid="input-width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height (px)</Label>
                        <Input
                          id="height"
                          type="number"
                          min={1}
                          max={10000}
                          value={height}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                          className="mt-1"
                          data-testid="input-height"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="lock-ratio"
                        checked={lockAspectRatio}
                        onCheckedChange={(checked) => setLockAspectRatio(checked as boolean)}
                        data-testid="checkbox-lock-ratio"
                      />
                      <Label htmlFor="lock-ratio" className="cursor-pointer flex items-center gap-2">
                        {lockAspectRatio ? (
                          <Lock className="w-4 h-4 text-primary" />
                        ) : (
                          <Unlock className="w-4 h-4 text-muted-foreground" />
                        )}
                        Lock Aspect Ratio
                      </Label>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      New size: {width} x {height} px
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-3">Preset Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetSize(1920, 1080)}
                        data-testid="button-preset-1920x1080"
                      >
                        1920x1080
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetSize(1280, 720)}
                        data-testid="button-preset-1280x720"
                      >
                        1280x720
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetSize(800, 600)}
                        data-testid="button-preset-800x600"
                      >
                        800x600
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetSize(640, 480)}
                        data-testid="button-preset-640x480"
                      >
                        640x480
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetSize(128, 128)}
                        data-testid="button-preset-128x128"
                      >
                        128x128
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={resizeAndDownload}
                  disabled={isResizing || width <= 0 || height <= 0}
                  className="w-full"
                  data-testid="button-resize-download"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isResizing ? "Resizing..." : "Resize & Download"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
