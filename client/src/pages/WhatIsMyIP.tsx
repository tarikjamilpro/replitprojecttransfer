import { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Globe, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { getToolSEO } from "@/data/toolsData";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

interface IPData {
  ip: string;
}

export default function WhatIsMyIP() {
  const toolSEO = getToolSEO("/what-is-my-ip");
  const [ipData, setIpData] = useState<IPData | null>(null);
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIP = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) {
        throw new Error("Failed to fetch IP address");
      }
      const data = await response.json();
      setIpData(data);
    } catch {
      setError("Unable to retrieve your IP address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIP();
  }, []);

  return (
    <ToolPageLayout
      title="What is My IP"
      description="Instantly discover your public IP address. Your IP is fetched securely from a trusted API."
      toolPath="/what-is-my-ip"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Your public IP address is automatically detected when you load this page.</li>
          <li>The IP address displayed is your public-facing IP as seen by websites and servers.</li>
          <li>Click "Refresh" to fetch your IP address again.</li>
          <li>Your IP may change if you're using a VPN or if your ISP assigns dynamic IPs.</li>
        </ol>
      }
    >
      {toolSEO && <SEO title={toolSEO.seoTitle} description={toolSEO.seoDescription} />}
      <div className="flex flex-col items-center justify-center space-y-6">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Globe className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <h2 className="text-lg font-medium text-muted-foreground mb-2">
              Your Public IP Address
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-4" data-testid="loading-state">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="py-4" data-testid="error-state">
                <p className="text-destructive font-medium">{error}</p>
              </div>
            ) : (
              <div className="py-4" data-testid="ip-display">
                <p className="text-4xl md:text-5xl font-bold text-foreground tracking-wide font-mono" data-testid="ip-address">
                  {ipData?.ip}
                </p>
              </div>
            )}
            
            <Button
              onClick={() => requestAction(fetchIP)}
              disabled={loading}
              className="mt-6"
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full max-w-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">About Your IP Address</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                An IP (Internet Protocol) address is a unique identifier assigned to your device 
                when connected to the internet. It allows websites and services to communicate 
                with your device.
              </p>
              <p>
                Your public IP address can reveal your approximate geographic location and 
                internet service provider. For privacy, consider using a VPN service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AdInterstitial
        isOpen={showInterstitial}
        onContinue={handleContinue}
        toolName="What Is My IP"
      />
    </ToolPageLayout>
  );
}
