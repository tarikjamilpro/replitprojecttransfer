import { useState, useRef } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";

export default function QRCodeGenerator() {
  const toolSEO = getToolSEO("/qr-code-generator");
  const [inputText, setInputText] = useState("");
  const [qrSize, setQrSize] = useState(256);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (!qrRef.current || !inputText.trim()) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx?.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "qrcode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <ToolPageLayout
      title="QR Code Generator"
      description="Generate QR codes for URLs, text, or any data instantly. Download as a high-quality PNG image."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your URL or text in the input field.</li>
          <li>Watch the QR code generate in real-time as you type.</li>
          <li>Adjust the size if needed using the size selector.</li>
          <li>Click "Download PNG" to save your QR code as an image.</li>
          <li>Scan the QR code with any smartphone camera to test it.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="qr-input">URL or Text</Label>
                <Input
                  id="qr-input"
                  type="text"
                  placeholder="Enter URL or text to generate QR code..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="mt-1"
                  data-testid="input-qr-text"
                />
              </div>

              <div>
                <Label htmlFor="qr-size">QR Code Size</Label>
                <select
                  id="qr-size"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  data-testid="select-qr-size"
                >
                  <option value={128}>128 x 128 px</option>
                  <option value={256}>256 x 256 px</option>
                  <option value={512}>512 x 512 px</option>
                  <option value={1024}>1024 x 1024 px</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-foreground mb-4">QR Code Preview</h3>
              
              <div
                ref={qrRef}
                className="bg-white p-4 rounded-lg border"
                data-testid="qr-preview"
              >
                {inputText.trim() ? (
                  <QRCodeSVG
                    value={inputText}
                    size={Math.min(qrSize, 300)}
                    level="H"
                    includeMargin={true}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center text-muted-foreground"
                    style={{ width: Math.min(qrSize, 300), height: Math.min(qrSize, 300) }}
                  >
                    <div className="text-center">
                      <QrCode className="w-16 h-16 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Enter text to generate QR code</p>
                    </div>
                  </div>
                )}
              </div>

              {inputText.trim() && (
                <Button
                  onClick={downloadQRCode}
                  className="mt-4"
                  data-testid="button-download-qr"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG ({qrSize}x{qrSize})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {inputText.trim() && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Content:</strong> {inputText.length > 100 ? inputText.slice(0, 100) + "..." : inputText}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Characters:</strong> {inputText.length}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
