import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Wrench, ChevronDown, ChevronRight, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { RelatedTools } from "@/components/RelatedTools";
import { getToolSEO, type ToolCategory } from "@/data/toolsData";

const toolCategories = {
  "Text Tools": [
    { name: "Word Counter", path: "/word-counter" },
    { name: "Case Converter", path: "/case-converter" },
    { name: "Lorem Ipsum Generator", path: "/lorem-ipsum" },
    { name: "Fancy Font Generator", path: "/fancy-font-generator" },
    { name: "Text Cleaner", path: "/text-cleaner" },
    { name: "Grammar Checker", path: "/grammar-checker" },
    { name: "AI Humanizer", path: "/ai-humanizer" },
    { name: "Plagiarism Checker", path: "/plagiarism-checker" },
    { name: "AI Post Generator", path: "/ai-post-generator" },
    { name: "AI Hashtag Generator", path: "/ai-hashtag-generator" },
    { name: "AI Content Generator", path: "/ai-content-generator" },
  ],
  "Image Tools": [
    { name: "Image Compressor", path: "/image-compressor" },
    { name: "Image Converter", path: "/image-converter" },
    { name: "Image Resizer", path: "/image-resizer" },
    { name: "Image Processor", path: "/image-processor" },
    { name: "JPG/PNG to PDF", path: "/image-to-pdf" },
    { name: "Meme Generator", path: "/meme-generator" },
  ],
  "Developer Tools": [
    { name: "QR Code Generator", path: "/qr-code-generator" },
    { name: "JSON Formatter", path: "/json-formatter" },
    { name: "Meta Tag Generator", path: "/meta-tag-generator" },
    { name: "Robots.txt Generator", path: "/robots-txt-generator" },
    { name: "MD5 Generator", path: "/md5-generator" },
    { name: "Password Generator", path: "/password-generator" },
    { name: "Password Strength Checker", path: "/password-strength-checker" },
    { name: "Color Palette", path: "/color-palette" },
    { name: "Gradient Generator", path: "/gradient-generator" },
    { name: "What is My IP", path: "/what-is-my-ip" },
    { name: "Speed Test", path: "/speed-test" },
    { name: "WiFi QR Generator", path: "/wifi-qr-generator" },
    { name: "Keyboard Tester", path: "/keyboard-tester" },
    { name: "CPS Test", path: "/cps-test" },
  ],
  "Calculators": [
    { name: "Age Calculator", path: "/age-calculator" },
    { name: "Percentage Calculator", path: "/percentage-calculator" },
    { name: "BMI Calculator", path: "/bmi-calculator" },
    { name: "EMI Calculator", path: "/emi-calculator" },
  ],
  "YouTube Tools": [
    { name: "YouTube Thumbnail Downloader", path: "/youtube-thumbnail-downloader" },
  ],
  "Other Tools": [
    { name: "Merge PDF Files", path: "/merge-pdf" },
    { name: "Resume Builder", path: "/resume-builder" },
    { name: "Wheel of Decision", path: "/wheel-of-decision" },
  ],
};

const allTools = Object.values(toolCategories).flat();

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const filteredTools = allTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToolSelect = (path: string) => {
    setSearchQuery("");
    setLocation(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileCategory = (category: string) => {
    setExpandedMobileCategory(expandedMobileCategory === category ? null : category);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block" data-testid="text-logo">
              Digi Best Tools
            </span>
          </Link>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
              data-testid="input-search"
            />
            {searchQuery && filteredTools.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.path}
                    onClick={() => handleToolSelect(tool.path)}
                    className="w-full text-left px-4 py-2 hover-elevate text-foreground"
                    data-testid={`search-result-${tool.path.slice(1)}`}
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {Object.entries(toolCategories).slice(0, 5).map(([category, tools]) => (
              <div
                key={category}
                className="relative"
                onMouseEnter={() => setOpenDropdown(category)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  data-testid={`nav-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {category}
                  <ChevronDown className="w-3 h-3" />
                </Button>
                {openDropdown === category && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[200px] py-1">
                    {tools.map((tool) => (
                      <Link key={tool.path} href={tool.path}>
                        <button
                          className="w-full text-left px-4 py-2 text-sm hover-elevate text-foreground"
                          onClick={() => setOpenDropdown(null)}
                          data-testid={`dropdown-${tool.path.slice(1)}`}
                        >
                          {tool.name}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
                data-testid="input-search-mobile"
              />
            </div>
            
            {searchQuery ? (
              <nav className="flex flex-col gap-1">
                {filteredTools.map((tool) => (
                  <Link key={tool.path} href={tool.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleToolSelect(tool.path)}
                      data-testid={`mobile-search-${tool.path.slice(1)}`}
                    >
                      {tool.name}
                    </Button>
                  </Link>
                ))}
              </nav>
            ) : (
              <nav className="flex flex-col gap-1">
                {Object.entries(toolCategories).map(([category, tools]) => (
                  <div key={category}>
                    <Button
                      variant="ghost"
                      className="w-full justify-between font-semibold"
                      onClick={() => toggleMobileCategory(category)}
                      data-testid={`mobile-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {category}
                      {expandedMobileCategory === category ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    {expandedMobileCategory === category && (
                      <div className="ml-4 flex flex-col gap-1">
                        {tools.map((tool) => (
                          <Link key={tool.path} href={tool.path}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-muted-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                              data-testid={`mobile-nav-${tool.path.slice(1)}`}
                            >
                              {tool.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Wrench className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Digi Best Tools</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Free online tools to help you with SEO, content creation, and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Text Tools</h3>
            <ul className="space-y-2 text-sm">
              {toolCategories["Text Tools"].slice(0, 4).map((tool) => (
                <li key={tool.path}>
                  <Link href={tool.path} className="text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Image Tools</h3>
            <ul className="space-y-2 text-sm">
              {toolCategories["Image Tools"].slice(0, 4).map((tool) => (
                <li key={tool.path}>
                  <Link href={tool.path} className="text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-semibold text-foreground mb-3 mt-4">Developer Tools</h3>
            <ul className="space-y-2 text-sm">
              {toolCategories["Developer Tools"].slice(0, 3).map((tool) => (
                <li key={tool.path}>
                  <Link href={tool.path} className="text-muted-foreground hover:text-foreground">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground" data-testid="link-privacy-policy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-muted-foreground hover:text-foreground" data-testid="link-disclaimer">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground" data-testid="link-terms">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground" data-testid="link-contact">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Digi Best Tools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

const topCTAs = [
  "Download Now",
  "Watch Video",
  "Click to Continue",
  "Get Started Free",
  "Claim Your Offer",
];

const sidebarCTAs = [
  "Download Now",
  "Start Free Trial",
  "Watch Video",
  "Click to Continue",
  "Get Your Gift",
];

function getRandomCTA(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

function handleAdClick() {
  if (typeof (window as any).openRandomAd === "function") {
    (window as any).openRandomAd();
  }
}

export function AdPlaceholder({ position }: { position: "top" | "sidebar" }) {
  if (position === "top") {
    return (
      <div
        className="ad-spot w-full rounded-md bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center py-4 px-6 gap-4"
        data-testid={`ad-placeholder-${position}`}
      >
        <button
          onClick={handleAdClick}
          className="ad-cta-btn inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-6 py-2.5 rounded-md shadow-md hover:bg-blue-50 hover:shadow-lg transition-all duration-200 cursor-pointer"
          data-testid="ad-button-top"
        >
          {getRandomCTA(topCTAs)}
        </button>
      </div>
    );
  }

  return (
    <div
      className="ad-spot w-full rounded-md bg-gradient-to-b from-blue-600 to-blue-700 flex flex-col items-center justify-center gap-4 p-6"
      data-testid={`ad-placeholder-${position}`}
    >
      <p className="text-white/90 text-xs font-medium uppercase tracking-wider">Sponsored</p>
      <button
        onClick={handleAdClick}
        className="ad-cta-btn w-full bg-white text-blue-700 font-bold text-sm px-6 py-3 rounded-md shadow-md hover:bg-blue-50 hover:shadow-lg transition-all duration-200 cursor-pointer text-center"
        data-testid="ad-button-sidebar-1"
      >
        {getRandomCTA(sidebarCTAs)}
      </button>
      <button
        onClick={handleAdClick}
        className="ad-cta-btn w-full bg-yellow-400 text-gray-900 font-bold text-sm px-6 py-3 rounded-md shadow-md hover:bg-yellow-300 hover:shadow-lg transition-all duration-200 cursor-pointer text-center"
        data-testid="ad-button-sidebar-2"
      >
        {getRandomCTA(sidebarCTAs)}
      </button>
    </div>
  );
}

function SponsoredInterstitial({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" data-testid="sponsored-interstitial">
      <div className="bg-white dark:bg-gray-900 rounded-md shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-5">
          <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Free Tool Access
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
          This free tool is supported by ads. Click the button below to continue to the tool.
        </p>
        <button
          onClick={() => {
            if (typeof (window as any).openRandomAd === "function") {
              (window as any).openRandomAd();
            }
            onContinue();
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-base py-3.5 px-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          data-testid="button-continue-to-tool"
        >
          Continue to Tool
        </button>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">
          A sponsor page will open in a new tab
        </p>
      </div>
    </div>
  );
}

export function ToolPageLayout({
  title,
  description,
  children,
  howToUse,
  toolPath,
  toolId,
  category,
  seoTitle,
  seoDescription,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  howToUse: React.ReactNode;
  toolPath?: string;
  toolId?: string;
  category?: ToolCategory;
  seoTitle?: string;
  seoDescription?: string;
}) {
  const toolSEO = toolPath ? getToolSEO(toolPath) : undefined;
  const finalSeoTitle = seoTitle || toolSEO?.seoTitle || title;
  const finalSeoDescription = seoDescription || toolSEO?.seoDescription || description;
  const finalToolId = toolId || toolSEO?.id;
  const finalCategory = category || toolSEO?.category;

  const [showInterstitial, setShowInterstitial] = useState(false);
  const [toolUnlocked, setToolUnlocked] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("interstitial_dismissed");
    if (dismissed) {
      setToolUnlocked(true);
    } else {
      setShowInterstitial(true);
    }
  }, []);

  const handleContinue = () => {
    sessionStorage.setItem("interstitial_dismissed", "1");
    setShowInterstitial(false);
    setToolUnlocked(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title={finalSeoTitle} description={finalSeoDescription} />
      <AdPlaceholder position="top" />

      {showInterstitial && <SponsoredInterstitial onContinue={handleContinue} />}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-tool-title">
              {title}
            </h1>
            <p className="text-muted-foreground" data-testid="text-tool-description">
              {description}
            </p>
          </div>

          {toolUnlocked ? (
            <div className="bg-card border border-border rounded-md p-6 shadow-sm">
              {children}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-md p-6 shadow-sm opacity-50 pointer-events-none select-none" aria-hidden="true">
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Click "Continue to Tool" above to access this tool
              </div>
            </div>
          )}

          <div className="mt-8 bg-card border border-border rounded-md p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">How to Use</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {howToUse}
            </div>
          </div>

          {finalToolId && finalCategory && (
            <RelatedTools currentToolId={finalToolId} category={finalCategory} />
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <AdPlaceholder position="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
}
