import { useState, useCallback } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Smartphone, Moon, Sun, Palette, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BioLink {
  id: number;
  label: string;
  url: string;
}

type Theme = "light" | "dark" | "gradient";

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "gradient", label: "Gradient", icon: Palette },
];

function getThemeStyles(theme: Theme) {
  switch (theme) {
    case "light":
      return { bg: "bg-white", text: "text-gray-900", btn: "bg-gray-100 text-gray-900 border border-gray-200", avatar: "border-gray-300" };
    case "dark":
      return { bg: "bg-gray-950", text: "text-white", btn: "bg-gray-800 text-white border border-gray-700", avatar: "border-gray-600" };
    case "gradient":
      return { bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", text: "text-white", btn: "bg-white/20 backdrop-blur-sm text-white border border-white/30", avatar: "border-white/60" };
  }
}

function generateExportHtml(name: string, bio: string, imageUrl: string, links: BioLink[], theme: Theme): string {
  const bgStyle = theme === "gradient"
    ? "background: linear-gradient(135deg, #9333ea, #ec4899, #f97316); background-size: 200% 200%; animation: gradientShift 6s ease infinite;"
    : theme === "dark" ? "background-color: #030712; color: #fff;" : "background-color: #fff; color: #111;";

  const btnStyle = theme === "gradient"
    ? "background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); color: #fff; border: 1px solid rgba(255,255,255,0.3);"
    : theme === "dark" ? "background-color: #1f2937; color: #fff; border: 1px solid #374151;" : "background-color: #f3f4f6; color: #111; border: 1px solid #e5e7eb;";

  const textColor = theme === "light" ? "color: #111;" : "color: #fff;";
  const subTextColor = theme === "light" ? "color: #6b7280;" : "color: rgba(255,255,255,0.8);";

  const avatarHtml = imageUrl.trim()
    ? `<img src="${imageUrl.trim()}" alt="${name}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ${theme === "light" ? "#d1d5db" : "rgba(255,255,255,0.4)"};" />`
    : `<div style="width:80px;height:80px;border-radius:50%;background:${theme === "light" ? "#e5e7eb" : "rgba(255,255,255,0.2)"};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;${textColor}">${(name || "?")[0].toUpperCase()}</div>`;

  const linksHtml = links.filter(l => l.label.trim() && l.url.trim()).map(l =>
    `<a href="${l.url}" target="_blank" rel="noopener noreferrer" style="display:block;width:100%;max-width:320px;padding:14px 20px;margin:6px auto;border-radius:12px;text-decoration:none;text-align:center;font-size:15px;font-weight:500;${btnStyle}">${l.label}</a>`
  ).join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name || "My Bio Link"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; justify-content: center; ${bgStyle} }
    @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  </style>
</head>
<body>
  <div style="width:100%;max-width:420px;padding:48px 20px;text-align:center;">
    <div style="margin-bottom:20px;display:flex;justify-content:center;">
      ${avatarHtml}
    </div>
    <h1 style="font-size:22px;font-weight:700;margin-bottom:6px;${textColor}">${name || "Your Name"}</h1>
    <p style="font-size:14px;margin-bottom:28px;${subTextColor}">${bio || ""}</p>
    <div>
      ${linksHtml || '<p style="font-size:14px;' + subTextColor + '">No links added yet.</p>'}
    </div>
  </div>
</body>
</html>`;
}

export default function BioLinkBuilder() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [links, setLinks] = useState<BioLink[]>([{ id: 1, label: "", url: "" }]);
  const [theme, setTheme] = useState<Theme>("light");
  const [nextId, setNextId] = useState(2);
  const { toast } = useToast();

  const addLink = useCallback(() => {
    setLinks((prev) => [...prev, { id: nextId, label: "", url: "" }]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const removeLink = useCallback((id: number) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const updateLink = useCallback((id: number, field: "label" | "url", value: string) => {
    setLinks((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  const handleExport = useCallback(() => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter a display name before exporting.", variant: "destructive" });
      return;
    }

    const html = generateExportHtml(name, bio, imageUrl, links, theme);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-bio-link.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Your bio link page has been exported as my-bio-link.html" });
  }, [name, bio, imageUrl, links, theme, toast]);

  const ts = getThemeStyles(theme);
  const validLinks = links.filter((l) => l.label.trim() && l.url.trim());

  return (
    <ToolPageLayout
      title="Bio Link Builder"
      description="Create a beautiful Link in Bio page with live preview and export as a standalone HTML file. No account needed."
      toolPath="/bio-link-builder"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Fill in your display name, bio, and optional profile image URL.</li>
          <li>Add your links with labels and URLs.</li>
          <li>Choose a theme: Light, Dark, or Gradient.</li>
          <li>See the live preview update in real-time on the right panel.</li>
          <li>Click "Export and Download HTML" to save your bio link page.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-editor-header">
            <Smartphone className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">Page Editor</h3>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Profile</p>
            <Input
              placeholder="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-name"
            />
            <Textarea
              placeholder="Short bio or tagline..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="resize-none"
              data-testid="input-bio"
            />
            <Input
              placeholder="Profile Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              data-testid="input-image-url"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Links</p>
            {links.map((link, index) => (
              <div key={link.id} className="flex items-start gap-2" data-testid={`link-row-${index}`}>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Label (e.g., My Website)"
                    value={link.label}
                    onChange={(e) => updateLink(link.id, "label", e.target.value)}
                    data-testid={`input-link-label-${index}`}
                  />
                  <Input
                    placeholder="URL (e.g., https://example.com)"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, "url", e.target.value)}
                    data-testid={`input-link-url-${index}`}
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeLink(link.id)}
                  className="mt-1 text-muted-foreground"
                  data-testid={`button-delete-link-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={addLink}
              data-testid="button-add-link"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Link
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <Button
                    key={opt.value}
                    variant={isActive ? "default" : "outline"}
                    className="flex items-center gap-2 toggle-elevate"
                    onClick={() => setTheme(opt.value)}
                    data-testid={`button-theme-${opt.value}`}
                  >
                    <Icon className="w-4 h-4" />
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleExport}
            data-testid="button-export"
          >
            <Download className="w-4 h-4 mr-2" />
            Export and Download HTML
          </Button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-1" data-testid="text-preview-header">
            <ExternalLink className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
          </div>

          <div className="flex justify-center">
            <div
              className="relative w-[320px] h-[580px] rounded-[2.5rem] border-[6px] border-gray-800 dark:border-gray-600 overflow-hidden shadow-xl"
              data-testid="phone-frame"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-800 dark:bg-gray-600 rounded-b-xl" />
              <div className={`w-full h-full overflow-y-auto ${ts.bg} flex flex-col items-center pt-12 pb-8 px-5`}>
                <div className="mb-4">
                  {imageUrl.trim() ? (
                    <img
                      src={imageUrl.trim()}
                      alt={name}
                      className={`w-20 h-20 rounded-full object-cover border-[3px] ${ts.avatar}`}
                      data-testid="preview-avatar-image"
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-[3px] ${ts.avatar} ${theme === "light" ? "bg-gray-200 text-gray-700" : "bg-white/20 text-white"}`}
                      data-testid="preview-avatar-fallback"
                    >
                      {(name || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <h2 className={`text-lg font-bold mb-1 ${ts.text}`} data-testid="preview-name">
                  {name || "Your Name"}
                </h2>
                <p className={`text-xs mb-6 text-center ${theme === "light" ? "text-gray-500" : "text-white/70"}`} data-testid="preview-bio">
                  {bio || "Your bio goes here"}
                </p>

                <div className="w-full space-y-3" data-testid="preview-links">
                  {validLinks.length === 0 && (
                    <p className={`text-xs text-center ${theme === "light" ? "text-gray-400" : "text-white/50"}`} data-testid="text-preview-empty">
                      Add links to see them here
                    </p>
                  )}
                  {validLinks.map((link) => (
                    <div
                      key={link.id}
                      className={`w-full py-3 px-4 rounded-xl text-center text-sm font-medium ${ts.btn}`}
                      data-testid={`preview-link-${link.id}`}
                    >
                      {link.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}