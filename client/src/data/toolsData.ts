import { 
  Type, Image, Code, Calculator, Youtube, Globe, FileText, 
  Lock, Shuffle, Gauge, Palette, QrCode, Wand2, Download,
  Scale, Smile, Wallet, Wifi, Keyboard, MousePointer, Paintbrush,
  FileJson, Tags, Bot, PenTool, Clock, Percent, Hash, Shield,
  FileImage, Files, Briefcase, Dices, Languages, Sparkles, ShieldCheck
} from "lucide-react";

export type ToolCategory = 
  | "Text Tools"
  | "Image Tools"
  | "Developer Tools"
  | "Calculators"
  | "YouTube Tools"
  | "Security Tools"
  | "PDF Tools"
  | "Design Tools"
  | "Utility Tools";

export interface ToolData {
  id: string;
  path: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  category: ToolCategory;
  icon: string;
}

export const toolsData: ToolData[] = [
  {
    id: "word-counter",
    path: "/word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences and paragraphs",
    seoTitle: "Free Word Counter Tool - Count Words & Characters Online",
    seoDescription: "Use our free online Word Counter to count words, characters, sentences, and paragraphs in real-time. Calculate reading and speaking time instantly. No sign-up required.",
    category: "Text Tools",
    icon: "Type",
  },
  {
    id: "case-converter",
    path: "/case-converter",
    name: "Case Converter",
    description: "Convert text between different cases",
    seoTitle: "Free Case Converter - Transform Text Case Online",
    seoDescription: "Convert text between UPPERCASE, lowercase, Title Case, Sentence case, and more. Free online case converter tool with instant results. No registration needed.",
    category: "Text Tools",
    icon: "Type",
  },
  {
    id: "password-generator",
    path: "/password-generator",
    name: "Password Generator",
    description: "Generate secure random passwords",
    seoTitle: "Free Secure Password Generator - Create Strong Passwords",
    seoDescription: "Generate secure, random passwords with customizable length and character types. Create unbreakable passwords for your accounts instantly. 100% free and private.",
    category: "Security Tools",
    icon: "Lock",
  },
  {
    id: "lorem-ipsum",
    path: "/lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text for designs",
    seoTitle: "Free Lorem Ipsum Generator - Placeholder Text Tool",
    seoDescription: "Generate Lorem Ipsum placeholder text for your designs and mockups. Create paragraphs, sentences, or words of dummy text instantly. Free online tool.",
    category: "Text Tools",
    icon: "FileText",
  },
  {
    id: "image-compressor",
    path: "/image-compressor",
    name: "Image Compressor",
    description: "Compress images without losing quality",
    seoTitle: "Free Image Compressor - Reduce Image Size Online",
    seoDescription: "Compress JPG, PNG, and WebP images without losing quality. Reduce file size for faster website loading. 100% free, no upload to servers - works in your browser.",
    category: "Image Tools",
    icon: "Image",
  },
  {
    id: "speed-test",
    path: "/speed-test",
    name: "Speed Test",
    description: "Test your internet connection speed",
    seoTitle: "Free Internet Speed Test - Check Download & Upload Speed",
    seoDescription: "Test your internet connection speed with our free online speed test. Measure download, upload speeds, and latency in seconds. No app installation required.",
    category: "Utility Tools",
    icon: "Gauge",
  },
  {
    id: "image-converter",
    path: "/image-converter",
    name: "Image Converter",
    description: "Convert images between PNG and JPG",
    seoTitle: "Free PNG to JPG Converter - Convert Images Online",
    seoDescription: "Convert images between PNG and JPG formats instantly. Free online image converter that works in your browser. No file uploads, 100% private.",
    category: "Image Tools",
    icon: "Image",
  },
  {
    id: "image-resizer",
    path: "/image-resizer",
    name: "Image Resizer",
    description: "Resize images to any dimensions",
    seoTitle: "Free Image Resizer - Resize Photos Online",
    seoDescription: "Resize images to any dimension with our free online tool. Maintain aspect ratio or set custom sizes. Works with JPG, PNG, and WebP. No software needed.",
    category: "Image Tools",
    icon: "Image",
  },
  {
    id: "image-processor",
    path: "/image-processor",
    name: "Image Processor",
    description: "Convert and resize images in bulk",
    seoTitle: "Universal Image Processor - Convert & Resize Images",
    seoDescription: "All-in-one image processing tool. Convert to JPG, PNG, WEBP, BMP, ICO and resize images. Batch download as ZIP. Free online tool with no uploads.",
    category: "Image Tools",
    icon: "Image",
  },
  {
    id: "qr-code-generator",
    path: "/qr-code-generator",
    name: "QR Code Generator",
    description: "Generate QR codes for URLs and text",
    seoTitle: "Free QR Code Generator - Create QR Codes Online",
    seoDescription: "Generate QR codes for URLs, text, WiFi, and more. Download high-quality QR codes in PNG format. Free online QR code maker with real-time preview.",
    category: "Utility Tools",
    icon: "QrCode",
  },
  {
    id: "json-formatter",
    path: "/json-formatter",
    name: "JSON Formatter",
    description: "Format and validate JSON data",
    seoTitle: "Free JSON Formatter & Validator - Beautify JSON Online",
    seoDescription: "Format, beautify, and validate JSON data online. Minify or pretty-print JSON with syntax highlighting. Free JSON formatter tool for developers.",
    category: "Developer Tools",
    icon: "FileJson",
  },
  {
    id: "meta-tag-generator",
    path: "/meta-tag-generator",
    name: "Meta Tag Generator",
    description: "Generate SEO meta tags for websites",
    seoTitle: "Free Meta Tag Generator - Create SEO Meta Tags",
    seoDescription: "Generate HTML meta tags for better SEO. Create Open Graph and Twitter Card tags for social sharing. Free online meta tag generator for websites.",
    category: "Developer Tools",
    icon: "Tags",
  },
  {
    id: "robots-txt-generator",
    path: "/robots-txt-generator",
    name: "Robots.txt Generator",
    description: "Create robots.txt files for SEO",
    seoTitle: "Free Robots.txt Generator - Create Robots.txt File",
    seoDescription: "Generate robots.txt files to control search engine crawling. Easy-to-use interface for managing crawler access. Free SEO tool for webmasters.",
    category: "Developer Tools",
    icon: "Bot",
  },
  {
    id: "fancy-font-generator",
    path: "/fancy-font-generator",
    name: "Fancy Font Generator",
    description: "Create stylish Unicode text fonts",
    seoTitle: "Free Fancy Font Generator - Stylish Text for Social Media",
    seoDescription: "Transform your text into fancy Unicode fonts for Instagram, Twitter, and Facebook. 39+ stylish font styles including cursive, bold, and decorative. Copy and paste anywhere.",
    category: "Text Tools",
    icon: "PenTool",
  },
  {
    id: "youtube-thumbnail-downloader",
    path: "/youtube-thumbnail-downloader",
    name: "YouTube Thumbnail Downloader",
    description: "Download HD thumbnails from videos",
    seoTitle: "Free YouTube Thumbnail Downloader - Download HD Thumbnails",
    seoDescription: "Download YouTube video thumbnails in HD, SD, and MQ quality. Get high-resolution thumbnail images for any YouTube video. Free and instant download.",
    category: "YouTube Tools",
    icon: "Youtube",
  },
  {
    id: "what-is-my-ip",
    path: "/what-is-my-ip",
    name: "What is My IP",
    description: "Find your public IP address",
    seoTitle: "What is My IP Address - Free IP Lookup Tool",
    seoDescription: "Instantly discover your public IP address. Free online tool to check your IPv4 and IPv6 address. No registration required.",
    category: "Utility Tools",
    icon: "Globe",
  },
  {
    id: "age-calculator",
    path: "/age-calculator",
    name: "Age Calculator",
    description: "Calculate exact age from date of birth",
    seoTitle: "Free Age Calculator - Calculate Exact Age Online",
    seoDescription: "Calculate your exact age in years, months, and days from your date of birth. Free online age calculator with precise results. Find out how old you are today.",
    category: "Calculators",
    icon: "Clock",
  },
  {
    id: "percentage-calculator",
    path: "/percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages easily",
    seoTitle: "Free Percentage Calculator - Calculate Percentages Online",
    seoDescription: "Calculate percentages easily with our free online tool. Find X% of Y or what percentage A is of B. Quick and accurate percentage calculations.",
    category: "Calculators",
    icon: "Percent",
  },
  {
    id: "md5-generator",
    path: "/md5-generator",
    name: "MD5 Generator",
    description: "Generate MD5 hash from text",
    seoTitle: "Free MD5 Hash Generator - Create MD5 Checksums Online",
    seoDescription: "Generate MD5 hash from any text string instantly. Create checksums for file verification and password hashing. Free online MD5 generator tool.",
    category: "Security Tools",
    icon: "Hash",
  },
  {
    id: "password-strength-checker",
    path: "/password-strength-checker",
    name: "Password Strength Checker",
    description: "Test password security strength",
    seoTitle: "Free Password Strength Checker - Test Password Security",
    seoDescription: "Check how strong your password is with our free security analyzer. Get detailed feedback on password complexity and suggestions for improvement.",
    category: "Security Tools",
    icon: "Shield",
  },
  {
    id: "image-to-pdf",
    path: "/image-to-pdf",
    name: "Image to PDF",
    description: "Convert images to PDF documents",
    seoTitle: "Free JPG to PDF Converter - Convert Images to PDF Online",
    seoDescription: "Convert JPG, PNG, and other images to PDF format. Combine multiple images into one PDF document. Free online converter with page size options.",
    category: "PDF Tools",
    icon: "FileImage",
  },
  {
    id: "merge-pdf",
    path: "/merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one",
    seoTitle: "Free PDF Merger - Combine PDF Files Online",
    seoDescription: "Merge multiple PDF files into one document. Reorder pages and combine PDFs easily. Free online PDF merger tool - no software installation needed.",
    category: "PDF Tools",
    icon: "Files",
  },
  {
    id: "resume-builder",
    path: "/resume-builder",
    name: "Resume Builder",
    description: "Create professional resumes online",
    seoTitle: "Free Resume Builder - Create Professional Resumes Online",
    seoDescription: "Build professional resumes with our free online resume builder. Multiple templates, live preview, and PDF download. Create your perfect CV in minutes.",
    category: "Utility Tools",
    icon: "Briefcase",
  },
  {
    id: "bmi-calculator",
    path: "/bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate your Body Mass Index",
    seoTitle: "Free BMI Calculator - Calculate Body Mass Index Online",
    seoDescription: "Calculate your Body Mass Index (BMI) instantly with our free online calculator. Get health insights based on your height and weight. Visual gauge display.",
    category: "Calculators",
    icon: "Scale",
  },
  {
    id: "meme-generator",
    path: "/meme-generator",
    name: "Meme Generator",
    description: "Create custom memes with text",
    seoTitle: "Free Meme Generator - Create Custom Memes Online",
    seoDescription: "Create hilarious memes with custom text and images. Choose from popular templates or upload your own. Free online meme maker with instant download.",
    category: "Design Tools",
    icon: "Smile",
  },
  {
    id: "emi-calculator",
    path: "/emi-calculator",
    name: "EMI Calculator",
    description: "Calculate monthly loan EMI",
    seoTitle: "Free EMI Calculator - Calculate Loan EMI Online",
    seoDescription: "Calculate monthly loan EMI with our free calculator. Get detailed breakdown of principal and interest. Interactive sliders and pie chart visualization.",
    category: "Calculators",
    icon: "Wallet",
  },
  {
    id: "wifi-qr-generator",
    path: "/wifi-qr-generator",
    name: "WiFi QR Generator",
    description: "Share WiFi via QR code",
    seoTitle: "Free WiFi QR Code Generator - Share WiFi Easily",
    seoDescription: "Generate QR codes for WiFi network sharing. Guests can scan and connect instantly. Supports WPA/WPA2/WEP security. Free with print support.",
    category: "Utility Tools",
    icon: "Wifi",
  },
  {
    id: "keyboard-tester",
    path: "/keyboard-tester",
    name: "Keyboard Tester",
    description: "Test keyboard keys and mouse buttons",
    seoTitle: "Free Keyboard & Mouse Tester - Test Your Hardware Online",
    seoDescription: "Test your keyboard keys and mouse buttons for hardware issues. Visual feedback for every key press. Free online diagnostic tool for gamers and typists.",
    category: "Utility Tools",
    icon: "Keyboard",
  },
  {
    id: "cps-test",
    path: "/cps-test",
    name: "CPS Test",
    description: "Test your clicking speed",
    seoTitle: "Free CPS Test - Click Speed Test Online",
    seoDescription: "Test your clicking speed with our CPS (Clicks Per Second) test. Multiple time modes and ranking system. Challenge yourself and improve your clicking speed.",
    category: "Utility Tools",
    icon: "MousePointer",
  },
  {
    id: "color-palette",
    path: "/color-palette",
    name: "Color Palette Generator",
    description: "Generate harmonious color palettes",
    seoTitle: "Free Color Palette Generator - Create Beautiful Palettes",
    seoDescription: "Generate harmonious color palettes with HSL algorithms. Lock colors, randomize, and export in multiple formats. Free tool for designers and developers.",
    category: "Design Tools",
    icon: "Palette",
  },
  {
    id: "gradient-generator",
    path: "/gradient-generator",
    name: "Gradient Generator",
    description: "Create beautiful CSS gradients",
    seoTitle: "Free CSS Gradient Generator - Create Beautiful Gradients",
    seoDescription: "Create stunning CSS gradients with our free online tool. Linear and radial gradients with live preview. Copy ready-to-use CSS code instantly.",
    category: "Design Tools",
    icon: "Paintbrush",
  },
  {
    id: "text-cleaner",
    path: "/text-cleaner",
    name: "Text Cleaner",
    description: "Remove duplicates and create slugs",
    seoTitle: "Free Text Cleaner - Remove Duplicates & Create Slugs",
    seoDescription: "Clean your text by removing duplicate lines and converting to SEO-friendly slugs. Free online text cleaning and formatting tool for content creators.",
    category: "Text Tools",
    icon: "FileText",
  },
  {
    id: "wheel-of-decision",
    path: "/wheel-of-decision",
    name: "Wheel of Decision",
    description: "Random picker with spinning wheel",
    seoTitle: "Free Wheel of Decision - Random Picker Spinner",
    seoDescription: "Make decisions with our fun spinning wheel. Add custom options, spin to choose randomly with confetti celebration. Free online random picker tool.",
    category: "Utility Tools",
    icon: "Dices",
  },
  {
    id: "grammar-checker",
    path: "/grammar-checker",
    name: "Grammar Checker",
    description: "Check spelling and grammar errors",
    seoTitle: "Free Grammar Checker - Check Spelling & Grammar Online",
    seoDescription: "Check your text for grammar, spelling, and style errors. Supports 12 languages with detailed suggestions. Free online grammar checker with file upload support.",
    category: "Text Tools",
    icon: "Languages",
  },
  {
    id: "ai-humanizer",
    path: "/ai-humanizer",
    name: "AI Humanizer",
    description: "Make AI text sound human",
    seoTitle: "Free AI Humanizer - Make AI Text Sound Human",
    seoDescription: "Transform AI-generated text into natural, human-like content. Bypass AI detection with our free humanizer tool. Supports multiple languages with streaming output.",
    category: "Text Tools",
    icon: "Sparkles",
  },
  {
    id: "plagiarism-checker",
    path: "/plagiarism-checker",
    name: "Plagiarism Checker",
    description: "Detect AI content and check grammar",
    seoTitle: "Free Plagiarism Checker & AI Content Detector",
    seoDescription: "Advanced plagiarism detection and AI content analysis tool. Check for AI-generated text, grammar errors, and paraphrase content. GDPR compliant with up to 2000 words free.",
    category: "Text Tools",
    icon: "ShieldCheck",
  },
  {
    id: "ai-post-generator",
    path: "/ai-post-generator",
    name: "AI Post Generator",
    description: "Generate engaging social media posts with AI",
    seoTitle: "Free AI Post Generator - Create Social Media Content Instantly",
    seoDescription: "Generate engaging social media posts for LinkedIn, Twitter, Instagram, and Facebook. Choose from Professional, Funny, Inspirational tones. Free AI-powered content creator.",
    category: "Text Tools",
    icon: "Sparkles",
  },
  {
    id: "ai-hashtag-generator",
    path: "/ai-hashtag-generator",
    name: "AI Hashtag Generator",
    description: "Generate optimized hashtags for Instagram, TikTok, and Twitter/X",
    seoTitle: "Free AI Hashtag Generator - Get Trending Hashtags for Instagram, TikTok & Twitter",
    seoDescription: "Generate optimized hashtags categorized by High Reach, Niche Specific, and Trending. Boost your social media engagement on Instagram, TikTok, and Twitter/X. Free tool, no sign-up.",
    category: "Text Tools",
    icon: "Hash",
  },
  {
    id: "ai-content-generator",
    path: "/ai-content-generator",
    name: "AI Content Generator",
    description: "Generate viral content for YouTube, Instagram, Facebook, and Twitter",
    seoTitle: "Free AI Content Generator - Create Viral Social Media Content",
    seoDescription: "Generate platform-optimized content for YouTube Scripts, Instagram Captions, Facebook Posts, and Twitter Threads. Choose from 5 tones. Free AI-powered content creator.",
    category: "Text Tools",
    icon: "Sparkles",
  },
  {
    id: "engagement-calculator",
    path: "/engagement-calculator",
    name: "Engagement Rate Calculator",
    description: "Calculate your social media engagement rate percentage",
    seoTitle: "Free Engagement Rate Calculator - Measure Social Media Performance",
    seoDescription: "Calculate your social media engagement rate with our free tool. Enter followers, likes, and comments to get your engagement percentage with a detailed rating and breakdown.",
    category: "Calculators",
    icon: "Calculator",
  },
];

export const getToolSEO = (path: string): ToolData | undefined => {
  return toolsData.find((tool) => tool.path === path);
};

export const getToolById = (id: string): ToolData | undefined => {
  return toolsData.find((tool) => tool.id === id);
};

export const getToolsByCategory = (category: ToolCategory): ToolData[] => {
  return toolsData.filter((tool) => tool.category === category);
};

export const getRelatedTools = (currentToolId: string, category: ToolCategory, limit: number = 4): ToolData[] => {
  const sameCategory = toolsData.filter(
    (tool) => tool.category === category && tool.id !== currentToolId
  );
  
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  
  const otherTools = toolsData.filter(
    (tool) => tool.category !== category && tool.id !== currentToolId
  );
  
  const shuffled = otherTools.sort(() => Math.random() - 0.5);
  const needed = limit - sameCategory.length;
  
  return [...sameCategory, ...shuffled.slice(0, needed)];
};

export const iconMap: Record<string, any> = {
  Type,
  Image,
  Code,
  Calculator,
  Youtube,
  Globe,
  FileText,
  Lock,
  Shuffle,
  Gauge,
  Palette,
  QrCode,
  Wand2,
  Download,
  Scale,
  Smile,
  Wallet,
  Wifi,
  Keyboard,
  MousePointer,
  Paintbrush,
  FileJson,
  Tags,
  Bot,
  PenTool,
  Clock,
  Percent,
  Hash,
  Shield,
  FileImage,
  Files,
  Briefcase,
  Dices,
  Languages,
  Sparkles,
  ShieldCheck,
};
