import { useState, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { Upload, FileText, Trash2, ChevronUp, ChevronDown, Loader2, Download, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  pageCount: number | null;
  error: string | null;
}

export default function MergePDF() {
  const toolSEO = getToolSEO("/merge-pdf");
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const loadPDFInfo = async (file: File): Promise<PDFFile> => {
    const id = Math.random().toString(36).substr(2, 9);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      
      return {
        id,
        file,
        name: file.name,
        pageCount,
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error && error.message.includes("encrypt")
        ? "Cannot process password-protected files"
        : "Failed to read PDF file";
      
      return {
        id,
        file,
        name: file.name,
        pageCount: null,
        error: errorMessage,
      };
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = await Promise.all(acceptedFiles.map(loadPDFInfo));
    setPdfFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pdfFiles.length) return;
    
    const newFiles = [...pdfFiles];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    setPdfFiles(newFiles);
  };

  const mergePDFs = async () => {
    const validFiles = pdfFiles.filter((f) => !f.error);
    
    if (validFiles.length < 2) {
      toast({
        title: "Not enough files",
        description: "Please add at least 2 valid PDF files to merge",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of validFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDFs Merged!",
        description: `Successfully merged ${validFiles.length} PDF files`,
      });
    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "Failed to merge PDFs. Some files may be corrupted or encrypted.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const validFileCount = pdfFiles.filter((f) => !f.error).length;
  const totalPages = pdfFiles.reduce((sum, f) => sum + (f.pageCount || 0), 0);

  return (
    <ToolPageLayout
      title="Merge PDF Files"
      description="Combine multiple PDF files into one document. Arrange files in your preferred order before merging."
      toolPath="/merge-pdf"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Drag and drop PDF files or click to select them.</li>
          <li>Reorder files using the up/down arrows to set the merge order.</li>
          <li>Remove any files you don't want to include.</li>
          <li>Click "Merge Files" to combine and download the merged PDF.</li>
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
              data-testid="dropzone-pdfs"
            >
              <input {...getInputProps()} data-testid="input-pdfs" />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">
                {isDragActive ? "Drop PDF files here" : "Drag & drop PDF files here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to select files
              </p>
            </div>
          </CardContent>
        </Card>

        {pdfFiles.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-lg font-semibold">
                    PDF Files ({pdfFiles.length})
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {validFileCount} valid files, {totalPages} total pages
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPdfFiles([])}
                  data-testid="button-clear-all"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2" data-testid="pdf-list">
                {pdfFiles.map((pdf, index) => (
                  <div
                    key={pdf.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      pdf.error ? "border-destructive bg-destructive/5" : "border-border"
                    }`}
                    data-testid={`pdf-item-${index}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary font-medium text-sm shrink-0">
                      {index + 1}
                    </div>
                    
                    <FileText className={`w-5 h-5 shrink-0 ${pdf.error ? "text-destructive" : "text-muted-foreground"}`} />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pdf.name}</p>
                      {pdf.error ? (
                        <p className="text-sm text-destructive">{pdf.error}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {pdf.pageCount} page{pdf.pageCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveFile(index, "up")}
                        disabled={index === 0}
                        data-testid={`button-move-up-${index}`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveFile(index, "down")}
                        disabled={index === pdfFiles.length - 1}
                        data-testid={`button-move-down-${index}`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFile(pdf.id)}
                        data-testid={`button-remove-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <Button
              onClick={() => requestAction(mergePDFs)}
              disabled={validFileCount < 2 || processing}
              className="w-full"
              size="lg"
              data-testid="button-merge"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Merge Files
                </>
              )}
            </Button>
            
            {validFileCount < 2 && pdfFiles.length > 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Add at least 2 valid PDF files to merge
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>For best results, use files smaller than 50MB. All processing happens in your browser - no files are uploaded to any server.</p>
        </div>
      </div>

      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="PDF Merger"
      />
    </ToolPageLayout>
  );
}
