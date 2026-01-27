import { useState } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, AlertCircle } from "lucide-react";

interface ThumbnailQuality {
  name: string;
  resolution: string;
  suffix: string;
  featured?: boolean;
}

const thumbnailQualities: ThumbnailQuality[] = [
  { name: "HD Quality", resolution: "1280x720", suffix: "maxresdefault", featured: true },
  { name: "SD Quality", resolution: "640x480", suffix: "sddefault" },
  { name: "High Quality", resolution: "480x360", suffix: "hqdefault" },
  { name: "Medium Quality", resolution: "320x180", suffix: "mqdefault" },
];

const extractVideoId = (url: string): string | false => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : false;
};

export default function YouTubeThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetThumbnails = () => {
    setError(null);
    setVideoId(null);

    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    const extractedId = extractVideoId(url.trim());
    
    if (!extractedId) {
      setError("Invalid YouTube URL");
      return;
    }

    setVideoId(extractedId);
  };

  const handleDownload = async (quality: ThumbnailQuality) => {
    if (!videoId) return;

    const imageUrl = `https://img.youtube.com/vi/${videoId}/${quality.suffix}.jpg`;
    setDownloading(quality.suffix);

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `youtube-thumbnail-${videoId}-${quality.suffix}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(objectUrl);
      
      toast({
        title: "Downloaded!",
        description: `${quality.name} thumbnail saved successfully`,
      });
    } catch {
      toast({
        title: "Download Failed",
        description: "Could not download the thumbnail. Try a different quality.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const getThumbnailUrl = (suffix: string) => {
    return `https://img.youtube.com/vi/${videoId}/${suffix}.jpg`;
  };

  return (
    <ToolPageLayout
      title="YouTube Thumbnail Downloader"
      description="Download high-quality thumbnails from any YouTube video. Supports HD, SD, and various resolutions."
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Copy the URL of any YouTube video (supports youtube.com, youtu.be, shorts, and mobile links).</li>
          <li>Paste the URL in the input field above.</li>
          <li>Click "Get Thumbnails" to extract available thumbnail images.</li>
          <li>Click "Download Image" on any quality to save the thumbnail to your device.</li>
          <li>HD (1280x720) provides the best quality for most uses.</li>
        </ol>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="youtube-url" className="text-lg font-semibold">
              YouTube Video URL
            </Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="youtube-url"
                type="text"
                placeholder="Paste YouTube Video URL here..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleGetThumbnails()}
                className="flex-1"
                data-testid="input-youtube-url"
              />
              <Button 
                onClick={handleGetThumbnails}
                data-testid="button-get-thumbnails"
              >
                <Search className="w-4 h-4 mr-2" />
                Get Thumbnails
              </Button>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 mt-3 text-destructive" data-testid="error-message">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {videoId && (
          <div className="space-y-4" data-testid="thumbnails-container">
            {thumbnailQualities.map((quality) => (
              <Card 
                key={quality.suffix} 
                className={quality.featured ? "border-primary" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {quality.name}
                        {quality.featured && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Best Quality
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{quality.resolution}</p>
                    </div>
                    <Button
                      onClick={() => handleDownload(quality)}
                      variant="outline"
                      disabled={downloading === quality.suffix}
                      data-testid={`button-download-${quality.suffix}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloading === quality.suffix ? "Downloading..." : "Download Image"}
                    </Button>
                  </div>
                  <div className={`overflow-hidden rounded-lg bg-muted ${quality.featured ? "max-w-full" : "max-w-md"}`}>
                    <img
                      src={getThumbnailUrl(quality.suffix)}
                      alt={`${quality.name} thumbnail`}
                      className="w-full h-auto"
                      loading="lazy"
                      data-testid={`image-${quality.suffix}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
