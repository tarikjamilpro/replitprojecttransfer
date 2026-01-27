import { useState, useRef } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Download, Image as ImageIcon, X } from "lucide-react";

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpg">("png");
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setConvertedUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setConvertedUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const convertImage = () => {
    if (!previewUrl) return;

    setIsConverting(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsConverting(false);
        return;
      }

      if (outputFormat === "jpg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const mimeType = outputFormat === "png" ? "image/png" : "image/jpeg";
      const quality = outputFormat === "jpg" ? 0.92 : undefined;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setConvertedUrl(url);
          }
          setIsConverting(false);
        },
        mimeType,
        quality
      );
    };

    img.src = previewUrl;
  };

  const downloadImage = () => {
    if (!convertedUrl || !selectedFile) return;

    const link = document.createElement("a");
    link.href = convertedUrl;
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    link.download = `${baseName}.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setConvertedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ToolPageLayout
      title="Image to PNG/JPG Converter"
      description="Convert your images between PNG and JPG formats directly in your browser. No upload to server required - your images stay private."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Upload an image by clicking the upload area or dragging and dropping.</li>
          <li>Select your desired output format (PNG or JPG).</li>
          <li>Click "Convert Image" to process the conversion.</li>
          <li>Preview the result and click "Download" to save your converted image.</li>
          <li>PNG preserves transparency, while JPG uses a white background for transparent areas.</li>
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
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3">Original Image</h3>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="max-w-full max-h-full object-contain"
                        data-testid="img-original-preview"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3">Converted Image</h3>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    {convertedUrl ? (
                      <img
                        src={convertedUrl}
                        alt="Converted"
                        className="max-w-full max-h-full object-contain"
                        data-testid="img-converted-preview"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Converted image will appear here
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-4">Output Format</h3>
                <RadioGroup
                  value={outputFormat}
                  onValueChange={(value) => setOutputFormat(value as "png" | "jpg")}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="png" id="png" data-testid="radio-png" />
                    <Label htmlFor="png" className="cursor-pointer">
                      PNG (lossless, supports transparency)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="jpg" id="jpg" data-testid="radio-jpg" />
                    <Label htmlFor="jpg" className="cursor-pointer">
                      JPG (smaller file size)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={convertImage}
                disabled={isConverting}
                data-testid="button-convert"
              >
                {isConverting ? "Converting..." : "Convert Image"}
              </Button>

              {convertedUrl && (
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  data-testid="button-download"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {outputFormat.toUpperCase()}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
