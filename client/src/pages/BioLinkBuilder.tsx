import { useState, useCallback, useMemo } from "react";
import { ToolPageLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus, Trash2, Download, Smartphone, Moon, Sun, Palette,
  ExternalLink, ChevronUp, ChevronDown, AlertCircle, User,
  Brush, Zap, Monitor, Sparkles, Briefcase, PenTool, Type
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BioLink {
  id: number;
  label: string;
  url: string;
}

type ThemeId =
  | "light" | "dark" | "gradient" | "pastel" | "neon" | "monochrome"
  | "creator" | "professional" | "designer" | "custom";

type FontFamily = "sans" | "serif" | "handwritten";

interface ThemeConfig {
  id: ThemeId;
  label: string;
  icon: typeof Sun;
  group: "basic" | "audience";
  bgColor: string;
  btnColor: string;
  textColor: string;
  subTextColor: string;
  btnTextColor: string;
  avatarBorder: string;
  cssBg: string;
  cssBtn: string;
  cssText: string;
  cssSub: string;
  cssBtnText: string;
  cssAvatarBorder: string;
  previewDot1: string;
  previewDot2: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: "light", label: "Light", icon: Sun, group: "basic",
    bgColor: "bg-white", btnColor: "bg-gray-100 border border-gray-200", textColor: "text-gray-900", subTextColor: "text-gray-500", btnTextColor: "text-gray-900", avatarBorder: "border-gray-300",
    cssBg: "background-color:#fff;", cssBtn: "background:#f3f4f6;border:1px solid #e5e7eb;", cssText: "color:#111;", cssSub: "color:#6b7280;", cssBtnText: "color:#111;", cssAvatarBorder: "#d1d5db",
    previewDot1: "bg-gray-200", previewDot2: "bg-gray-300",
  },
  {
    id: "dark", label: "Dark", icon: Moon, group: "basic",
    bgColor: "bg-gray-950", btnColor: "bg-gray-800 border border-gray-700", textColor: "text-white", subTextColor: "text-gray-400", btnTextColor: "text-white", avatarBorder: "border-gray-600",
    cssBg: "background-color:#030712;", cssBtn: "background:#1f2937;border:1px solid #374151;", cssText: "color:#fff;", cssSub: "color:#9ca3af;", cssBtnText: "color:#fff;", cssAvatarBorder: "#4b5563",
    previewDot1: "bg-gray-800", previewDot2: "bg-gray-700",
  },
  {
    id: "gradient", label: "Gradient", icon: Palette, group: "basic",
    bgColor: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", btnColor: "bg-white/20 backdrop-blur-sm border border-white/30", textColor: "text-white", subTextColor: "text-white/70", btnTextColor: "text-white", avatarBorder: "border-white/50",
    cssBg: "background:linear-gradient(135deg,#9333ea,#ec4899,#f97316);background-size:200% 200%;animation:gradShift 6s ease infinite;", cssBtn: "background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);", cssText: "color:#fff;", cssSub: "color:rgba(255,255,255,0.7);", cssBtnText: "color:#fff;", cssAvatarBorder: "rgba(255,255,255,0.5)",
    previewDot1: "bg-purple-400", previewDot2: "bg-orange-400",
  },
  {
    id: "pastel", label: "Pastel", icon: Brush, group: "basic",
    bgColor: "bg-pink-50", btnColor: "bg-white border border-pink-200", textColor: "text-pink-900", subTextColor: "text-pink-400", btnTextColor: "text-pink-800", avatarBorder: "border-pink-300",
    cssBg: "background-color:#fdf2f8;", cssBtn: "background:#fff;border:1px solid #fbcfe8;", cssText: "color:#500724;", cssSub: "color:#f472b6;", cssBtnText: "color:#9d174d;", cssAvatarBorder: "#f9a8d4",
    previewDot1: "bg-pink-200", previewDot2: "bg-purple-200",
  },
  {
    id: "neon", label: "Neon", icon: Zap, group: "basic",
    bgColor: "bg-gray-950", btnColor: "bg-transparent border-2 border-green-400", textColor: "text-green-400", subTextColor: "text-green-300/60", btnTextColor: "text-green-400", avatarBorder: "border-green-400",
    cssBg: "background-color:#030712;", cssBtn: "background:transparent;border:2px solid #4ade80;box-shadow:0 0 12px rgba(74,222,128,0.3);", cssText: "color:#4ade80;", cssSub: "color:rgba(74,222,128,0.6);", cssBtnText: "color:#4ade80;", cssAvatarBorder: "#4ade80",
    previewDot1: "bg-green-400", previewDot2: "bg-cyan-400",
  },
  {
    id: "monochrome", label: "Mono", icon: Monitor, group: "basic",
    bgColor: "bg-neutral-100", btnColor: "bg-neutral-900 border border-neutral-800", textColor: "text-neutral-900", subTextColor: "text-neutral-500", btnTextColor: "text-neutral-100", avatarBorder: "border-neutral-400",
    cssBg: "background-color:#f5f5f5;", cssBtn: "background:#171717;border:1px solid #262626;", cssText: "color:#171717;", cssSub: "color:#737373;", cssBtnText: "color:#f5f5f5;", cssAvatarBorder: "#a3a3a3",
    previewDot1: "bg-neutral-300", previewDot2: "bg-neutral-500",
  },
  {
    id: "creator", label: "Creator", icon: Sparkles, group: "audience",
    bgColor: "bg-gradient-to-b from-violet-600 to-indigo-900", btnColor: "bg-yellow-400 border border-yellow-300", textColor: "text-white", subTextColor: "text-violet-200", btnTextColor: "text-indigo-900", avatarBorder: "border-yellow-400",
    cssBg: "background:linear-gradient(to bottom,#7c3aed,#312e81);", cssBtn: "background:#facc15;border:1px solid #fde047;", cssText: "color:#fff;", cssSub: "color:#c4b5fd;", cssBtnText: "color:#312e81;", cssAvatarBorder: "#facc15",
    previewDot1: "bg-violet-400", previewDot2: "bg-yellow-400",
  },
  {
    id: "professional", label: "Professional", icon: Briefcase, group: "audience",
    bgColor: "bg-slate-50", btnColor: "bg-blue-600 border border-blue-500", textColor: "text-slate-900", subTextColor: "text-slate-500", btnTextColor: "text-white", avatarBorder: "border-blue-400",
    cssBg: "background-color:#f8fafc;", cssBtn: "background:#2563eb;border:1px solid #3b82f6;", cssText: "color:#0f172a;", cssSub: "color:#64748b;", cssBtnText: "color:#fff;", cssAvatarBorder: "#60a5fa",
    previewDot1: "bg-blue-200", previewDot2: "bg-slate-300",
  },
  {
    id: "designer", label: "Designer", icon: PenTool, group: "audience",
    bgColor: "bg-stone-900", btnColor: "bg-transparent border border-amber-400", textColor: "text-amber-50", subTextColor: "text-stone-400", btnTextColor: "text-amber-300", avatarBorder: "border-amber-400",
    cssBg: "background-color:#1c1917;", cssBtn: "background:transparent;border:1px solid #fbbf24;", cssText: "color:#fffbeb;", cssSub: "color:#a8a29e;", cssBtnText: "color:#fcd34d;", cssAvatarBorder: "#fbbf24",
    previewDot1: "bg-amber-400", previewDot2: "bg-stone-600",
  },
];

const FONT_OPTIONS: { value: FontFamily; label: string; css: string; tailwind: string }[] = [
  { value: "sans", label: "Sans-serif", css: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", tailwind: "font-sans" },
  { value: "serif", label: "Serif", css: "Georgia,'Times New Roman',serif", tailwind: "font-serif" },
  { value: "handwritten", label: "Handwritten", css: "'Segoe Script','Comic Sans MS',cursive", tailwind: "font-serif italic" },
];

const BIO_MAX = 160;

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return !!u.hostname.includes(".");
  } catch {
    return false;
  }
}

function getResolvedTheme(themeId: ThemeId, customBg: string, customBtn: string, customText: string): ThemeConfig {
  if (themeId === "custom") {
    return {
      id: "custom", label: "Custom", icon: Palette, group: "basic",
      bgColor: "", btnColor: "", textColor: "", subTextColor: "", btnTextColor: "", avatarBorder: "",
      cssBg: `background-color:${customBg};`,
      cssBtn: `background:${customBtn};border:1px solid ${customBtn};`,
      cssText: `color:${customText};`,
      cssSub: `color:${customText};opacity:0.6;`,
      cssBtnText: `color:${isLightColor(customBtn) ? "#111" : "#fff"};`,
      cssAvatarBorder: customText,
      previewDot1: "bg-gray-300", previewDot2: "bg-gray-400",
    };
  }
  return THEMES.find(t => t.id === themeId) || THEMES[0];
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function generateExportHtml(
  profileName: string, bio: string, imageUrl: string, links: BioLink[],
  themeId: ThemeId, customBg: string, customBtn: string, customText: string, font: FontFamily
): string {
  const t = getResolvedTheme(themeId, customBg, customBtn, customText);
  const fontCss = FONT_OPTIONS.find(f => f.value === font)?.css || FONT_OPTIONS[0].css;

  const avatarBorder = t.cssAvatarBorder;
  const avatarHtml = imageUrl.trim()
    ? `<img src="${imageUrl.trim()}" alt="${profileName}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid ${avatarBorder};" />`
    : `<div style="width:88px;height:88px;border-radius:50%;background:rgba(128,128,128,0.2);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;${t.cssText}border:3px solid ${avatarBorder};">${(profileName || "?")[0].toUpperCase()}</div>`;

  const linksHtml = links.filter(l => l.label.trim() && l.url.trim()).map(l =>
    `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="link-btn" style="${t.cssBtn}${t.cssBtnText}">${l.label}</a>`
  ).join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${profileName || "My Bio Link"}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:${fontCss};min-height:100vh;display:flex;justify-content:center;${t.cssBg}}
    @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    .link-btn{display:block;width:100%;max-width:320px;padding:14px 20px;margin:8px auto;border-radius:12px;text-decoration:none;text-align:center;font-size:15px;font-weight:500;transition:transform 0.2s ease,opacity 0.2s ease}
    .link-btn:hover{transform:translateY(-2px);opacity:0.9}
    .link-btn:active{transform:translateY(0);opacity:1}
  </style>
</head>
<body>
  <main style="width:100%;max-width:420px;padding:48px 20px;text-align:center;" role="main">
    <div style="margin-bottom:20px;display:flex;justify-content:center;">
      ${avatarHtml}
    </div>
    <h1 style="font-size:24px;font-weight:700;margin-bottom:6px;${t.cssText}">${profileName || "Your Name"}</h1>
    <p style="font-size:14px;margin-bottom:28px;${t.cssSub}">${bio || ""}</p>
    <nav aria-label="Links">
      ${linksHtml || `<p style="font-size:14px;${t.cssSub}">No links added yet.</p>`}
    </nav>
  </main>
</body>
</html>`;
}

export default function BioLinkBuilder() {
  const [profileName, setProfileName] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [links, setLinks] = useState<BioLink[]>([{ id: 1, label: "", url: "" }]);
  const [themeId, setThemeId] = useState<ThemeId>("light");
  const [font, setFont] = useState<FontFamily>("sans");
  const [customBg, setCustomBg] = useState("#ffffff");
  const [customBtn, setCustomBtn] = useState("#3b82f6");
  const [customText, setCustomText] = useState("#111111");
  const [nextId, setNextId] = useState(2);
  const { toast } = useToast();

  const addLink = useCallback(() => {
    setLinks(prev => [...prev, { id: nextId, label: "", url: "" }]);
    setNextId(n => n + 1);
  }, [nextId]);

  const removeLink = useCallback((id: number) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateLink = useCallback((id: number, field: "label" | "url", value: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  const moveLink = useCallback((index: number, direction: "up" | "down") => {
    setLinks(prev => {
      const arr = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return prev;
      [arr[index], arr[targetIdx]] = [arr[targetIdx], arr[index]];
      return arr;
    });
  }, []);

  const handleExport = useCallback(() => {
    if (!profileName.trim()) {
      toast({ title: "Name required", description: "Please enter a display name before exporting.", variant: "destructive" });
      return;
    }
    const html = generateExportHtml(profileName, bio, imageUrl, links, themeId, customBg, customBtn, customText, font);
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
  }, [profileName, bio, imageUrl, links, themeId, customBg, customBtn, customText, font, toast]);

  const validLinks = useMemo(() => links.filter(l => l.label.trim() && l.url.trim() && isValidUrl(l.url)), [links]);
  const activeTheme = THEMES.find(t => t.id === themeId);
  const fontConfig = FONT_OPTIONS.find(f => f.value === font) || FONT_OPTIONS[0];
  const isCustom = themeId === "custom";

  const previewBg = isCustom ? "" : activeTheme?.bgColor || "bg-white";
  const previewBgStyle = isCustom ? { backgroundColor: customBg } : {};
  const previewTextColor = isCustom ? { color: customText } : {};
  const previewSubStyle = isCustom ? { color: customText, opacity: 0.6 } : {};
  const previewBtnStyle = isCustom ? { backgroundColor: customBtn, border: `1px solid ${customBtn}`, color: isLightColor(customBtn) ? "#111" : "#fff" } : {};
  const previewAvatarStyle = isCustom ? { borderColor: customText } : {};

  const basicThemes = THEMES.filter(t => t.group === "basic");
  const audienceThemes = THEMES.filter(t => t.group === "audience");

  return (
    <ToolPageLayout
      title="Bio Link Builder"
      description="Create a beautiful Link in Bio page with live preview and export as a standalone HTML file. No account needed."
      toolPath="/bio-link-builder"
      howToUse={
        <ol className="list-decimal list-inside space-y-2">
          <li>Fill in your display name, bio, and optional profile image URL.</li>
          <li>Add your links with labels and URLs - reorder them with the arrow buttons.</li>
          <li>Choose a preset theme or use custom colors for full control.</li>
          <li>Select a font family to match your personal brand.</li>
          <li>See the live preview update in real-time on the right panel.</li>
          <li>Click "Export and Download HTML" to save your bio link page.</li>
        </ol>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6" role="form" aria-label="Bio link editor">
          <div className="flex items-center gap-2" data-testid="text-editor-header">
            <Smartphone className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">Page Editor</h3>
          </div>

          <section className="space-y-3" aria-label="Profile information">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground" data-testid="label-profile-section">Profile</p>
            </div>
            <Input
              placeholder="Your display name (e.g., Sarah Digital)"
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              aria-label="Display name"
              data-testid="input-name"
            />
            <div className="space-y-1">
              <Textarea
                placeholder="Short bio or tagline (e.g., Helping you grow online)"
                value={bio}
                onChange={e => { if (e.target.value.length <= BIO_MAX) setBio(e.target.value); }}
                rows={2}
                className="resize-none"
                aria-label="Bio"
                data-testid="input-bio"
              />
              <p className={`text-xs text-right ${bio.length >= BIO_MAX ? "text-red-500" : "text-muted-foreground"}`} data-testid="text-bio-counter">
                {bio.length}/{BIO_MAX}
              </p>
            </div>
            <div className="space-y-1">
              <Input
                placeholder="Profile image URL (e.g., https://example.com/photo.jpg)"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                aria-label="Profile image URL"
                data-testid="input-image-url"
              />
              {imageUrl.trim() && !isValidUrl(imageUrl) && (
                <p className="text-xs text-red-500 flex items-center gap-1" data-testid="text-image-url-error">
                  <AlertCircle className="w-3 h-3" />
                  Please enter a valid URL
                </p>
              )}
            </div>
          </section>

          <div className="border-t border-border" />

          <section className="space-y-3" aria-label="Links management">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground" data-testid="label-links-section">Links</p>
              </div>
              <Badge variant="secondary" className="text-xs" data-testid="badge-link-count">{links.length} link{links.length !== 1 ? "s" : ""}</Badge>
            </div>
            {links.map((link, index) => (
              <div
                key={link.id}
                className="rounded-md border border-border p-3 space-y-2"
                data-testid={`link-row-${index}`}
                role="group"
                aria-label={`Link ${index + 1}`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium" data-testid={`text-link-number-${index}`}>Link {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveLink(index, "up")}
                      disabled={index === 0}
                      aria-label={`Move link ${index + 1} up`}
                      data-testid={`button-move-up-${index}`}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveLink(index, "down")}
                      disabled={index === links.length - 1}
                      aria-label={`Move link ${index + 1} down`}
                      data-testid={`button-move-down-${index}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeLink(link.id)}
                      className="text-muted-foreground"
                      aria-label={`Delete link ${index + 1}`}
                      data-testid={`button-delete-link-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  placeholder="Label (e.g., My Website)"
                  value={link.label}
                  onChange={e => updateLink(link.id, "label", e.target.value)}
                  aria-label={`Link ${index + 1} label`}
                  data-testid={`input-link-label-${index}`}
                />
                <div className="space-y-1">
                  <Input
                    placeholder="URL (e.g., https://example.com)"
                    value={link.url}
                    onChange={e => updateLink(link.id, "url", e.target.value)}
                    aria-label={`Link ${index + 1} URL`}
                    data-testid={`input-link-url-${index}`}
                  />
                  {link.url.trim() && !isValidUrl(link.url) && (
                    <p className="text-xs text-red-500 flex items-center gap-1" data-testid={`text-link-url-error-${index}`}>
                      <AlertCircle className="w-3 h-3" />
                      Please enter a valid URL
                    </p>
                  )}
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={addLink}
              aria-label="Add new link"
              data-testid="button-add-link"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Link
            </Button>
          </section>

          <div className="border-t border-border" />

          <section className="space-y-4" aria-label="Theme selection">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground" data-testid="label-theme-section">Theme</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Styles</p>
              <div className="grid grid-cols-3 gap-2">
                {basicThemes.map(t => (
                  <Button
                    key={t.id}
                    variant={themeId === t.id ? "default" : "outline"}
                    className="flex items-center gap-1.5 text-xs toggle-elevate"
                    onClick={() => setThemeId(t.id)}
                    aria-pressed={themeId === t.id}
                    data-testid={`button-theme-${t.id}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${t.previewDot1} shrink-0`} />
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Audience Presets</p>
              <div className="grid grid-cols-3 gap-2">
                {audienceThemes.map(t => {
                  const Icon = t.icon;
                  return (
                    <Button
                      key={t.id}
                      variant={themeId === t.id ? "default" : "outline"}
                      className="flex items-center gap-1.5 text-xs toggle-elevate"
                      onClick={() => setThemeId(t.id)}
                      aria-pressed={themeId === t.id}
                      data-testid={`button-theme-${t.id}`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {t.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Custom Colors</p>
              <Button
                variant={isCustom ? "default" : "outline"}
                className="w-full text-xs toggle-elevate"
                onClick={() => setThemeId("custom")}
                aria-pressed={isCustom}
                data-testid="button-theme-custom"
              >
                <Brush className="w-3.5 h-3.5 mr-1.5" />
                Use Custom Colors
              </Button>
              {isCustom && (
                <div className="grid grid-cols-3 gap-3 pt-1" data-testid="custom-color-pickers">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor="picker-bg">Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="picker-bg"
                        type="color"
                        value={customBg}
                        onChange={e => setCustomBg(e.target.value)}
                        className="w-8 h-8 rounded-md border border-border cursor-pointer"
                        aria-label="Background color"
                        data-testid="input-custom-bg"
                      />
                      <span className="text-xs text-muted-foreground font-mono">{customBg}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor="picker-btn">Button</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="picker-btn"
                        type="color"
                        value={customBtn}
                        onChange={e => setCustomBtn(e.target.value)}
                        className="w-8 h-8 rounded-md border border-border cursor-pointer"
                        aria-label="Button color"
                        data-testid="input-custom-btn"
                      />
                      <span className="text-xs text-muted-foreground font-mono">{customBtn}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground" htmlFor="picker-text">Text</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="picker-text"
                        type="color"
                        value={customText}
                        onChange={e => setCustomText(e.target.value)}
                        className="w-8 h-8 rounded-md border border-border cursor-pointer"
                        aria-label="Text color"
                        data-testid="input-custom-text"
                      />
                      <span className="text-xs text-muted-foreground font-mono">{customText}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="border-t border-border" />

          <section className="space-y-3" aria-label="Font selection">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground" data-testid="label-font-section">Font</p>
            </div>
            <Select value={font} onValueChange={(v: FontFamily) => setFont(v)}>
              <SelectTrigger aria-label="Font family" data-testid="select-font">
                <SelectValue placeholder="Select font..." />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map(f => (
                  <SelectItem key={f.value} value={f.value} data-testid={`option-font-${f.value}`}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

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
          <div className="flex items-center gap-2" data-testid="text-preview-header">
            <ExternalLink className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
          </div>

          <div className="flex justify-center lg:sticky lg:top-24">
            <div
              className="relative w-[320px] h-[600px] rounded-[2.5rem] border-[6px] border-gray-800 dark:border-gray-600 overflow-hidden shadow-xl"
              data-testid="phone-frame"
              role="img"
              aria-label="Live preview of your bio link page"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 dark:bg-gray-600 rounded-b-2xl z-10" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-600 dark:bg-gray-500 rounded-full z-10" />

              <div
                className={`w-full h-full overflow-y-auto flex flex-col items-center pt-14 pb-10 px-5 ${fontConfig.tailwind} ${previewBg}`}
                style={previewBgStyle}
              >
                <div className="mb-4">
                  {imageUrl.trim() && isValidUrl(imageUrl) ? (
                    <img
                      src={imageUrl.trim()}
                      alt={profileName || "Profile"}
                      className={`w-20 h-20 rounded-full object-cover border-[3px] ${!isCustom ? (activeTheme?.avatarBorder || "") : ""}`}
                      style={isCustom ? { ...previewAvatarStyle, borderWidth: "3px", borderStyle: "solid" } : {}}
                      data-testid="preview-avatar-image"
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-[3px] ${
                        !isCustom
                          ? `${activeTheme?.avatarBorder || ""} ${activeTheme?.id === "light" || activeTheme?.id === "pastel" || activeTheme?.id === "monochrome" || activeTheme?.id === "professional" ? "bg-gray-200 text-gray-700" : "bg-white/20 text-white"}`
                          : ""
                      }`}
                      style={isCustom ? { ...previewAvatarStyle, borderWidth: "3px", borderStyle: "solid", backgroundColor: `${customText}20`, color: customText } : {}}
                      data-testid="preview-avatar-fallback"
                    >
                      {(profileName || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <h2
                  className={`text-lg font-bold mb-1 text-center ${!isCustom ? (activeTheme?.textColor || "") : ""}`}
                  style={isCustom ? previewTextColor : {}}
                  data-testid="preview-name"
                >
                  {profileName || "Your Name"}
                </h2>
                <p
                  className={`text-xs mb-6 text-center ${!isCustom ? (activeTheme?.subTextColor || "") : ""}`}
                  style={isCustom ? previewSubStyle : {}}
                  data-testid="preview-bio"
                >
                  {bio || "Your bio goes here"}
                </p>

                <div className="w-full space-y-3" data-testid="preview-links">
                  {validLinks.length === 0 && (
                    <p
                      className={`text-xs text-center ${!isCustom ? (activeTheme?.subTextColor || "") : ""}`}
                      style={isCustom ? previewSubStyle : {}}
                      data-testid="text-preview-empty"
                    >
                      Add links to see them here
                    </p>
                  )}
                  {validLinks.map(link => (
                    <a
                      key={link.id}
                      href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full py-3 px-4 rounded-xl text-center text-sm font-medium no-underline transition-opacity duration-200 ${
                        !isCustom ? `${activeTheme?.btnColor || ""} ${activeTheme?.btnTextColor || ""}` : ""
                      }`}
                      style={isCustom ? previewBtnStyle : {}}
                      aria-label={`Link to ${link.label}`}
                      data-testid={`preview-link-${link.id}`}
                    >
                      {link.label}
                    </a>
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