import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdPlaceholder } from "@/components/Layout";
import { 
  FileText, 
  Type, 
  Key, 
  AlignLeft,
  ArrowRight,
  Image as ImageIcon
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
];

const imageTools = [
  {
    name: "Image Compressor",
    description: "Compress images in your browser without uploading to any server. Fast and private.",
    icon: ImageIcon,
    path: "/image-compressor",
    color: "bg-pink-500 dark:bg-pink-600",
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

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" data-testid="text-section-security-tools">
                <Key className="w-6 h-6 text-primary" />
                Security Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securityTools.map((tool) => (
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
