import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdPlaceholder } from "@/components/Layout";
import { 
  FileText, 
  Type, 
  Key, 
  AlignLeft,
  ArrowRight,
  Image as ImageIcon,
  Wifi,
  RefreshCw,
  Maximize2,
  QrCode,
  Braces,
  Code,
  Tags,
  Bot,
  Search,
  Sparkles,
  Youtube,
  Globe,
  CalendarDays,
  Percent,
  Hash,
  ShieldCheck
} from "lucide-react";

const textTools = [
  {
    name: "Word Counter",
    description: "Count words, characters, sentences, and estimate reading time in real-time.",
    icon: FileText,
    path: "/word-counter",
    color: "bg-blue-500 dark:bg-blue-600",
  },
  {
    name: "Case Converter",
    description: "Convert text between UPPERCASE, lowercase, Sentence case, and Title Case.",
    icon: Type,
    path: "/case-converter",
    color: "bg-green-500 dark:bg-green-600",
  },
  {
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text for your designs and layouts.",
    icon: AlignLeft,
    path: "/lorem-ipsum",
    color: "bg-purple-500 dark:bg-purple-600",
  },
  {
    name: "Fancy Font Generator",
    description: "Convert text into stylish Unicode fonts for Instagram, Twitter, and social media.",
    icon: Sparkles,
    path: "/fancy-font-generator",
    color: "bg-fuchsia-500 dark:bg-fuchsia-600",
  },
];

const imageTools = [
  {
    name: "Image Compressor",
    description: "Compress images in your browser without uploading to any server. Fast and private.",
    icon: ImageIcon,
    path: "/image-compressor",
    color: "bg-pink-500 dark:bg-pink-600",
  },
  {
    name: "YouTube Thumbnail Downloader",
    description: "Download high-quality thumbnails from any YouTube video in HD, SD, and other sizes.",
    icon: Youtube,
    path: "/youtube-thumbnail-downloader",
    color: "bg-red-500 dark:bg-red-600",
  },
];

const imageEditingTools = [
  {
    name: "PNG/JPG Converter",
    description: "Convert images between PNG and JPG formats instantly in your browser.",
    icon: RefreshCw,
    path: "/image-converter",
    color: "bg-indigo-500 dark:bg-indigo-600",
  },
  {
    name: "Image Resizer",
    description: "Resize images to any dimensions with aspect ratio lock and preset sizes.",
    icon: Maximize2,
    path: "/image-resizer",
    color: "bg-teal-500 dark:bg-teal-600",
  },
];

const networkTools = [
  {
    name: "Speed Test",
    description: "Test your internet connection speed including download, upload, and latency.",
    icon: Wifi,
    path: "/speed-test",
    color: "bg-cyan-500 dark:bg-cyan-600",
  },
  {
    name: "What is My IP",
    description: "Instantly discover your public IP address with one click.",
    icon: Globe,
    path: "/what-is-my-ip",
    color: "bg-sky-500 dark:bg-sky-600",
  },
];

const developerTools = [
  {
    name: "QR Code Generator",
    description: "Generate QR codes for URLs or text with real-time preview and download as PNG.",
    icon: QrCode,
    path: "/qr-code-generator",
    color: "bg-violet-500 dark:bg-violet-600",
  },
  {
    name: "JSON Formatter",
    description: "Format, beautify, or minify JSON data with syntax validation.",
    icon: Braces,
    path: "/json-formatter",
    color: "bg-amber-500 dark:bg-amber-600",
  },
];

const seoTools = [
  {
    name: "Meta Tag Generator",
    description: "Generate essential HTML meta tags for SEO and social media sharing.",
    icon: Tags,
    path: "/meta-tag-generator",
    color: "bg-emerald-500 dark:bg-emerald-600",
  },
  {
    name: "Robots.txt Generator",
    description: "Create a robots.txt file to control how search engines crawl your site.",
    icon: Bot,
    path: "/robots-txt-generator",
    color: "bg-rose-500 dark:bg-rose-600",
  },
];

const securityTools = [
  {
    name: "Password Generator",
    description: "Create strong, secure passwords with customizable length and character types.",
    icon: Key,
    path: "/password-generator",
    color: "bg-orange-500 dark:bg-orange-600",
  },
  {
    name: "MD5 Generator",
    description: "Generate MD5 hash from any text instantly for checksums and verification.",
    icon: Hash,
    path: "/md5-generator",
    color: "bg-slate-500 dark:bg-slate-600",
  },
  {
    name: "Password Strength Checker",
    description: "Check how strong your password is with real-time analysis and tips.",
    icon: ShieldCheck,
    path: "/password-strength-checker",
    color: "bg-red-500 dark:bg-red-600",
  },
];

const calculatorTools = [
  {
    name: "Age Calculator",
    description: "Calculate your exact age in years, months, and days from your birth date.",
    icon: CalendarDays,
    path: "/age-calculator",
    color: "bg-lime-500 dark:bg-lime-600",
  },
  {
    name: "Percentage Calculator",
    description: "Calculate percentages instantly with multiple calculation modes.",
    icon: Percent,
    path: "/percentage-calculator",
    color: "bg-yellow-500 dark:bg-yellow-600",
  },
];

function ToolCard({
  name,
  description,
  icon: Icon,
  path,
  color,
}: {
  name: string;
  description: string;
  icon: typeof FileText;
  path: string;
  color: string;
}) {
  return (
    <Link href={path}>
      <Card className="h-full hover-elevate cursor-pointer group transition-all duration-200" data-testid={`card-tool-${path.slice(1)}`}>
        <CardHeader className="flex flex-row items-start gap-4">
          <div className={`${color} p-3 rounded-md shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
              {name}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" data-testid="text-hero-title">
            Free Online SEO & Utility Tools
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Boost your productivity with our collection of free, easy-to-use tools for content creation, SEO analysis, and security.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdPlaceholder position="top" />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-text-tools">
                <FileText className="w-6 h-6 text-primary" />
                Text Content Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {textTools.map((tool) => (
                  <ToolCard key={tool.path} {...tool} />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-image-tools">
                <ImageIcon className="w-6 h-6 text-primary" />
                Image Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imageTools.map((tool) => (
                  <ToolCard key={tool.path} {...tool} />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-image-editing-tools">
                <RefreshCw className="w-6 h-6 text-primary" />
                Image Editing Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imageEditingTools.map((tool) => (
                  <ToolCard key={tool.path} {...tool} />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-network-tools">
                <Wifi className="w-6 h-6 text-primary" />
                Network Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {networkTools.map((tool) => (
                  <ToolCard key={tool.path} {...tool} />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-developer-tools">
                <Code className="w-6 h-6 text-primary" />
                Developer & Web Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {developerTools.map((tool) => (
                  <ToolCard key={tool.path} {...tool} />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-seo-tools">
                <Search className="w-6 h-6 text-primary" />
                SEO & Meta Tags
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {seoTools.map((tool) => (
                  <ToolCard key={tool.path} {...tool} />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-security-tools">
                <Key className="w-6 h-6 text-primary" />
                Security & Encryption
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securityTools.map((tool) => (
                  <ToolCard key={tool.path} {...tool} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-calculator-tools">
                <CalendarDays className="w-6 h-6 text-primary" />
                Calculators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {calculatorTools.map((tool) => (
                  <ToolCard key={tool.path} {...tool} />
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AdPlaceholder position="sidebar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
