import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Wifi, 
  Eye, 
  EyeOff, 
  QrCode, 
  Download, 
  Printer, 
  Copy,
  Shield,
  ShieldAlert,
  ShieldOff,
  Lock
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { RelatedTools } from "@/components/RelatedTools";
import { getToolSEO } from "@/data/toolsData";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

type EncryptionType = "WPA" | "WPA3" | "WEP" | "nopass";

const escapeWifiString = (str: string): string => {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:")
    .replace(/"/g, '\\"');
};

const generateWifiString = (
  ssid: string,
  password: string,
  encryption: EncryptionType,
  hidden: boolean
): string => {
  const escapedSSID = escapeWifiString(ssid);
  const escapedPassword = escapeWifiString(password);
  
  let wifiString = `WIFI:T:${encryption};S:${escapedSSID};`;
  
  if (encryption !== "nopass" && password) {
    wifiString += `P:${escapedPassword};`;
  }
  
  if (hidden) {
    wifiString += "H:true;";
  }
  
  wifiString += ";";
  
  return wifiString;
};

export default function WifiQRGenerator() {
  const toolSEO = getToolSEO("/wifi-qr-generator");
  const [ssid, setSsid] = useState("");
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<EncryptionType>("WPA");
  const [isHidden, setIsHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const wifiString = ssid ? generateWifiString(ssid, password, encryption, isHidden) : "";

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      
      const link = document.createElement("a");
      link.download = `wifi-${ssid.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({
        title: "QR Code Downloaded",
        description: "Your WiFi QR code has been saved.",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Pop-up blocked",
        description: "Please allow pop-ups to print the QR code.",
        variant: "destructive",
      });
      return;
    }

    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WiFi QR Code - ${ssid}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
              padding: 40px;
            }
            .container {
              text-align: center;
              border: 2px solid #000;
              padding: 40px;
              border-radius: 16px;
            }
            h1 { 
              font-size: 24px; 
              margin-bottom: 8px;
            }
            .network-name {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 24px;
              word-break: break-all;
            }
            .qr-container {
              display: flex;
              justify-content: center;
              margin-bottom: 24px;
            }
            svg {
              width: 300px;
              height: 300px;
            }
            .instructions {
              font-size: 18px;
              color: #666;
              margin-bottom: 16px;
            }
            .security {
              font-size: 14px;
              color: #888;
            }
            @media print {
              body { padding: 20px; }
              .container { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>WiFi Network</h1>
            <div class="network-name">${ssid}</div>
            <div class="qr-container">${svgData}</div>
            <p class="instructions">Scan this QR code to connect to the WiFi network</p>
            <p class="security">Security: ${encryption === "nopass" ? "Open Network" : encryption}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleCopyString = () => {
    navigator.clipboard.writeText(wifiString);
    toast({
      title: "Copied to clipboard",
      description: "WiFi connection string has been copied.",
    });
  };

  const getEncryptionIcon = () => {
    switch (encryption) {
      case "WPA":
      case "WPA3":
        return <Shield className="w-4 h-4 text-green-600" />;
      case "WEP":
        return <ShieldAlert className="w-4 h-4 text-yellow-600" />;
      case "nopass":
        return <ShieldOff className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Wifi className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">WiFi QR Code Generator</h1>
          </div>
          <p className="text-muted-foreground">Generate a QR code for easy WiFi network sharing</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="ssid" className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    WiFi Network Name (SSID)
                  </Label>
                  <Input
                    id="ssid"
                    placeholder="e.g., MyHomeWiFi"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value.slice(0, 32))}
                    maxLength={32}
                    data-testid="input-ssid"
                  />
                  <p className="text-xs text-muted-foreground text-right">{ssid.length}/32</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter WiFi password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.slice(0, 63))}
                      maxLength={63}
                      disabled={encryption === "nopass"}
                      className="pr-10"
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {encryption !== "nopass" && (
                    <p className="text-xs text-muted-foreground text-right">{password.length}/63</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {getEncryptionIcon()}
                    Security Type
                  </Label>
                  <Select value={encryption} onValueChange={(v) => setEncryption(v as EncryptionType)}>
                    <SelectTrigger data-testid="select-encryption">
                      <SelectValue placeholder="Select security type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2 (Recommended)</SelectItem>
                      <SelectItem value="WPA3">WPA3 (Latest)</SelectItem>
                      <SelectItem value="WEP">WEP (Legacy - Not Secure)</SelectItem>
                      <SelectItem value="nopass">None (Open Network)</SelectItem>
                    </SelectContent>
                  </Select>
                  {encryption === "WEP" && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      WEP is outdated and easily hacked. Consider upgrading to WPA2/WPA3.
                    </p>
                  )}
                  {encryption === "nopass" && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <ShieldOff className="w-3 h-3" />
                      Open networks have no password protection.
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="hidden"
                    checked={isHidden}
                    onCheckedChange={(checked) => setIsHidden(checked === true)}
                    data-testid="checkbox-hidden"
                  />
                  <Label htmlFor="hidden" className="text-sm cursor-pointer">
                    Hidden Network (SSID not broadcast)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {ssid && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Network Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Name:</span>
                      <span className="font-medium">{ssid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security:</span>
                      <span className="font-medium flex items-center gap-1">
                        {getEncryptionIcon()}
                        {encryption === "nopass" ? "Open" : encryption}
                      </span>
                    </div>
                    {isHidden && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hidden:</span>
                        <span className="font-medium">Yes</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-center">QR Code Preview</h3>
                <div 
                  ref={qrRef}
                  className="flex flex-col items-center justify-center bg-white p-6 rounded-lg min-h-[300px]"
                >
                  {ssid ? (
                    <>
                      <QRCodeSVG
                        value={wifiString}
                        size={220}
                        level="M"
                        includeMargin={true}
                        data-testid="qr-code"
                      />
                      <p className="mt-4 text-gray-800 font-medium text-center" data-testid="text-network-name">
                        {ssid}
                      </p>
                      <p className="text-sm text-gray-500">Scan to connect</p>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Enter a network name to generate QR code</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {ssid && (
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={() => requestAction(handleDownload)} className="flex-1" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handlePrint} variant="outline" className="flex-1" data-testid="button-print">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={handleCopyString} variant="outline" className="flex-1" data-testid="button-copy">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            )}
          </div>
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-3">How to Use WiFi QR Codes</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-medium text-foreground">Create QR Code</p>
                  <p className="text-muted-foreground">Enter your WiFi network name and password</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="font-medium text-foreground">Print or Display</p>
                  <p className="text-muted-foreground">Print the QR code or display it on screen</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</span>
                <div>
                  <p className="font-medium text-foreground">Scan & Connect</p>
                  <p className="text-muted-foreground">Guests scan with their phone camera to connect instantly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <RelatedTools currentToolId="wifi-qr-generator" category="Generator Tools" />
      </div>
      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="WiFi QR Generator"
      />
    </div>
  );
}
