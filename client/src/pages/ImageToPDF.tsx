import { useState, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { Upload, FileImage, Trash2, ChevronUp, ChevronDown, Loader2, Download, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

type PageSize = "a4" | "letter" | "fit";
type Orientation = "portrait" | "landscape";

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

export default function ImageToPDF() {
  const toolSEO = getToolSEO("/image-to-pdf");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const convertToPDF = async () => {
    if (images.length === 0) {
      toast({
        title: "No images selected",
        description: "Please add at least one image to convert",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        const imageBytes = await img.file.arrayBuffer();
        
        let embeddedImage;
        if (img.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        }

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === "fit") {
          pageWidth = embeddedImage.width;
          pageHeight = embeddedImage.height;
        } else {
          const size = PAGE_SIZES[pageSize];
          if (orientation === "landscape") {
            pageWidth = size.height;
            pageHeight = size.width;
          } else {
            pageWidth = size.width;
            pageHeight = size.height;
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const imgAspect = embeddedImage.width / embeddedImage.height;
        const pageAspect = pageWidth / pageHeight;

        let drawWidth: number;
        let drawHeight: number;

        if (pageSize === "fit") {
          drawWidth = pageWidth;
          drawHeight = pageHeight;
        } else if (imgAspect > pageAspect) {
          drawWidth = pageWidth;
          drawHeight = pageWidth / imgAspect;
        } else {
          drawHeight = pageHeight;
          drawWidth = pageHeight * imgAspect;
        }

        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "images-to-pdf.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Created!",
        description: `Successfully converted ${images.length} image(s) to PDF`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Failed to create PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      title="JPG/PNG to PDF Converter"
      description="Convert multiple images to a single PDF file. Arrange images in your preferred order and choose page size."
      toolPath="/image-to-pdf"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Drag and drop images or click to select JPG/PNG files.</li>
          <li>Reorder images using the up/down arrows to set page order.</li>
          <li>Choose your preferred page size and orientation.</li>
          <li>Click "Convert to PDF" to generate and download your PDF.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              data-testid="dropzone-images"
            >
              <input {...getInputProps()} data-testid="input-images" />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">
                {isDragActive ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to select JPG/PNG files
              </p>
            </div>
          </CardContent>
        </Card>

        {images.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">
                  Selected Images ({images.length})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    images.forEach((img) => URL.revokeObjectURL(img.preview));
                    setImages([]);
                  }}
                  data-testid="button-clear-all"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" data-testid="images-list">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="relative group border rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                        data-testid={`button-move-up-${index}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => moveImage(index, "down")}
                        disabled={index === images.length - 1}
                        data-testid={`button-move-down-${index}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => removeImage(img.id)}
                        data-testid={`button-remove-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="page-size">Page Size</Label>
                <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
                  <SelectTrigger id="page-size" data-testid="select-page-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                    <SelectItem value="fit">Fit to Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">Orientation</Label>
                <Select
                  value={orientation}
                  onValueChange={(v) => setOrientation(v as Orientation)}
                  disabled={pageSize === "fit"}
                >
                  <SelectTrigger id="orientation" data-testid="select-orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={convertToPDF}
              disabled={images.length === 0 || processing}
              className="w-full mt-6"
              size="lg"
              data-testid="button-convert"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Convert to PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>For best results, use files smaller than 50MB. All processing happens in your browser - no files are uploaded to any server.</p>
        </div>
      </div>
    </ToolPageLayout>
  );
}
