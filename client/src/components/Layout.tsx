import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const tools = [
  { name: "Word Counter", path: "/word-counter" },
  { name: "Case Converter", path: "/case-converter" },
  { name: "Password Generator", path: "/password-generator" },
  { name: "Lorem Ipsum Generator", path: "/lorem-ipsum" },
  { name: "Image Compressor", path: "/image-compressor" },
  { name: "Speed Test", path: "/speed-test" },
  { name: "Image Converter", path: "/image-converter" },
  { name: "Image Resizer", path: "/image-resizer" },
  { name: "QR Code Generator", path: "/qr-code-generator" },
  { name: "JSON Formatter", path: "/json-formatter" },
  { name: "Meta Tag Generator", path: "/meta-tag-generator" },
  { name: "Robots.txt Generator", path: "/robots-txt-generator" },
];

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToolSelect = (path: string) => {
    setSearchQuery("");
    setLocation(path);
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
              SEO Tools Hub
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
              <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-md shadow-lg z-50">
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

          <nav className="hidden md:flex items-center gap-1">
            {tools.slice(0, 3).map((tool) => (
              <Link key={tool.path} href={tool.path}>
                <Button variant="ghost" size="sm" data-testid={`nav-${tool.path.slice(1)}`}>
                  {tool.name}
                </Button>
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
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
            <nav className="flex flex-col gap-1">
              {tools.map((tool) => (
                <Link key={tool.path} href={tool.path}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${tool.path.slice(1)}`}
                  >
                    {tool.name}
                  </Button>
                </Link>
              ))}
            </nav>
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
              <span className="font-bold text-foreground">SEO Tools Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Free online tools to help you with SEO, content creation, and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Text Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/word-counter" className="text-muted-foreground hover:text-foreground">
                  Word Counter
                </Link>
              </li>
              <li>
                <Link href="/case-converter" className="text-muted-foreground hover:text-foreground">
                  Case Converter
                </Link>
              </li>
              <li>
                <Link href="/lorem-ipsum" className="text-muted-foreground hover:text-foreground">
                  Lorem Ipsum Generator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Image Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/image-compressor" className="text-muted-foreground hover:text-foreground">
                  Image Compressor
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold text-foreground mb-3 mt-4">Image Editing Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/image-converter" className="text-muted-foreground hover:text-foreground">
                  PNG/JPG Converter
                </Link>
              </li>
              <li>
                <Link href="/image-resizer" className="text-muted-foreground hover:text-foreground">
                  Image Resizer
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold text-foreground mb-3 mt-4">Network Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/speed-test" className="text-muted-foreground hover:text-foreground">
                  Speed Test
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold text-foreground mb-3 mt-4">Developer Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/qr-code-generator" className="text-muted-foreground hover:text-foreground">
                  QR Code Generator
                </Link>
              </li>
              <li>
                <Link href="/json-formatter" className="text-muted-foreground hover:text-foreground">
                  JSON Formatter
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold text-foreground mb-3 mt-4">SEO & Meta Tags</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/meta-tag-generator" className="text-muted-foreground hover:text-foreground">
                  Meta Tag Generator
                </Link>
              </li>
              <li>
                <Link href="/robots-txt-generator" className="text-muted-foreground hover:text-foreground">
                  Robots.txt Generator
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold text-foreground mb-3 mt-4">Security Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/password-generator" className="text-muted-foreground hover:text-foreground">
                  Password Generator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">About</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Privacy Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground">Terms of Service</span>
              </li>
              <li>
                <span className="text-muted-foreground">Contact Us</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SEO Tools Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function AdPlaceholder({ position }: { position: "top" | "sidebar" }) {
  return (
    <div
      className={`bg-muted/50 border border-dashed border-border rounded-md flex items-center justify-center text-muted-foreground text-sm ${
        position === "top" ? "h-24 w-full" : "h-64 w-full"
      }`}
      data-testid={`ad-placeholder-${position}`}
    >
      <span>Ad Space</span>
    </div>
  );
}

export function ToolPageLayout({
  title,
  description,
  children,
  howToUse,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  howToUse: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdPlaceholder position="top" />

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

          <div className="bg-card border border-border rounded-md p-6 shadow-sm">
            {children}
          </div>

          <div className="mt-8 bg-card border border-border rounded-md p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">How to Use</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {howToUse}
            </div>
          </div>
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
