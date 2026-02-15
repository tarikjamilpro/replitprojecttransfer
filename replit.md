# Digi Best Tools

## Overview
A fully functional, responsive SEO & Utility Tools website inspired by SmallSEOTools. Built with React, Tailwind CSS, and Shadcn UI components featuring a professional blue and white color scheme.

## Features
- **Word Counter**: Real-time counting of words, characters, sentences, paragraphs, reading time, and speaking time
- **Case Converter**: Convert text between UPPERCASE, lowercase, Sentence case, Title Case, and Capitalized Case
- **Password Generator**: Generate secure passwords with adjustable length (8-64 characters) and character types
- **Lorem Ipsum Generator**: Generate placeholder text by paragraphs, sentences, or words
- **Image Compressor**: Compress images directly in the browser using Canvas API - no server upload required
- **Speed Test**: Test internet connection speed including download, upload, and latency measurements
- **PNG/JPG Converter**: Convert images between PNG and JPG formats directly in the browser
- **Image Resizer**: Resize images to any dimensions with aspect ratio lock and preset sizes
- **Universal Image Processor**: Convert and resize images to JPG, PNG, WEBP, BMP, ICO with batch ZIP download
- **Image Background Remover**: AI-powered background removal using @imgly/background-removal, processed entirely in the browser with drag-and-drop upload, before/after preview, progress indicator, and transparent PNG download
- **QR Code Generator**: Generate QR codes for URLs or text with real-time preview and PNG download
- **JSON Formatter**: Format, beautify, or minify JSON data with syntax validation
- **Meta Tag Generator**: Generate HTML meta tags for SEO, Open Graph, and Twitter cards
- **Robots.txt Generator**: Create robots.txt files to control search engine crawling
- **Fancy Font Generator**: Convert text into stylish Unicode fonts (39 styles including Script, Bold, Upside Down)
- **YouTube Thumbnail Downloader**: Download high-quality thumbnails from YouTube videos (HD, SD, HQ, MQ)
- **What is My IP**: Instantly discover your public IP address using a public API
- **Age Calculator**: Calculate exact age in years, months, and days from date of birth
- **Percentage Calculator**: Calculate percentages with two modes - "X% of Y" and "A is what % of B"
- **MD5 Generator**: Generate MD5 hash from any text for checksums and verification
- **Password Strength Checker**: Analyze password complexity with real-time strength meter
- **JPG/PNG to PDF Converter**: Convert multiple images to PDF with page size and orientation options
- **Merge PDF Files**: Combine multiple PDFs into one document with reorder support
- **Resume Builder**: Create professional resumes with live preview, collapsible sections, and PDF download
  - Multi-template system: Modern (blue sidebar), Classic (traditional), Creative (purple gradient)
  - Profile photo upload with circular preview
  - Digital signature upload support
  - All images converted to Base64 for PDF compatibility
- **BMI Calculator**: Calculate Body Mass Index with visual gauge and health advice
- **Meme Generator**: Create memes with custom text from templates or uploaded images
- **Loan EMI Calculator**: Calculate monthly loan EMI with interactive sliders and pie chart breakdown
- **WiFi QR Generator**: Generate QR codes for WiFi network sharing with print support
- **Keyboard & Mouse Tester**: Test keyboard keys and mouse buttons for hardware diagnostics
- **CPS Test**: Click speed test with multiple durations and ranking system
- **Color Palette Generator**: Generate harmonious color palettes with HSL algorithms, lock colors, and export options
- **CSS Gradient Generator**: Create beautiful CSS gradients with real-time preview, presets, and code generation
- **Text Cleaner**: Remove duplicate lines and convert text to SEO-friendly slugs
- **Wheel of Decision**: Random picker with spin animation and confetti celebration effects
- **Grammar Checker**: Check grammar, spelling, and style with LanguageTool API, multi-language support, file upload, and 5000-word limit
- **AI Humanizer**: Transform AI-generated text into natural, human-like content using GLM-4.5-Air via Bytez API
- **Plagiarism Checker**: Multi-tool platform with AI content detection, grammar checking, and paraphrasing with captcha verification
- **AI Post Generator**: Generate engaging social media posts with tone selection (Professional, Funny, Inspirational, Urgent, Empathetic) and platform targeting (LinkedIn, Twitter/X, Instagram, Facebook)
- **AI Hashtag Generator**: Generate optimized hashtags for Instagram, TikTok, and Twitter/X categorized by High Reach, Niche Specific, and Trending Now
- **AI Content Generator**: Generate viral content for YouTube Scripts, Instagram Captions, Facebook Posts, and Twitter Threads with 5 tone options
- **Engagement Rate Calculator**: Calculate social media engagement rate with rating system and visual progress bar
- **YouTube Tag Extractor**: Extract SEO tags from YouTube videos with tag cloud, individual copy, and copy all functionality
- **Viral Hook Generator**: Generate scroll-stopping hooks in 4 styles (Controversial, Educational, Listicle/Tips, Storytelling) with copy functionality
- **Bio Link Builder**: Create Link in Bio pages with live mobile preview, 9 themes + custom colors, 3 fonts, and HTML export
- **Social Media Holiday Calendar**: Interactive calendar with 60+ holidays across all 12 months, calendar/list views, month navigation, holiday detail modals with social media tips, custom holiday form with local storage, search, and JSON export

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── Layout.tsx       # Header, Footer, AdPlaceholder, ToolPageLayout
│   │   └── ui/              # Shadcn UI components
│   ├── pages/
│   │   ├── Home.tsx         # Homepage with tool grid
│   │   ├── WordCounter.tsx  # Word counting tool
│   │   ├── CaseConverter.tsx # Case conversion tool
│   │   ├── PasswordGenerator.tsx # Password generation tool
│   │   ├── LoremIpsum.tsx   # Lorem ipsum generator
│   │   ├── ImageCompressor.tsx # Image compression tool
│   │   ├── SpeedTest.tsx    # Internet speed test tool
│   │   ├── ImageConverter.tsx # PNG/JPG converter tool
│   │   ├── ImageResizer.tsx # Image resizing tool
│   │   ├── QRCodeGenerator.tsx # QR code generator tool
│   │   ├── JSONFormatter.tsx # JSON formatter tool
│   │   ├── MetaTagGenerator.tsx # Meta tag generator tool
│   │   ├── RobotsTxtGenerator.tsx # Robots.txt generator tool
│   │   ├── FancyFontGenerator.tsx # Fancy font generator tool
│   │   ├── YouTubeThumbnailDownloader.tsx # YouTube thumbnail downloader
│   │   └── not-found.tsx    # 404 page
│   ├── App.tsx              # Main app with routing
│   ├── index.css            # Theme colors (blue/white scheme)
│   └── main.tsx             # Entry point
server/
├── index.ts                 # Express server
├── routes.ts                # API routes (minimal for this app)
└── storage.ts               # In-memory storage
```

## Routes
- `/` - Homepage with tool categories
- `/word-counter` - Word Counter tool
- `/case-converter` - Case Converter tool
- `/password-generator` - Password Generator tool
- `/lorem-ipsum` - Lorem Ipsum Generator tool
- `/image-compressor` - Image Compressor tool
- `/speed-test` - Internet Speed Test tool
- `/image-converter` - PNG/JPG Converter tool
- `/image-resizer` - Image Resizer tool
- `/image-processor` - Universal Image Processor tool
- `/background-remover` - Image Background Remover tool
- `/qr-code-generator` - QR Code Generator tool
- `/json-formatter` - JSON Formatter tool
- `/meta-tag-generator` - Meta Tag Generator tool
- `/robots-txt-generator` - Robots.txt Generator tool
- `/fancy-font-generator` - Fancy Font Generator tool
- `/youtube-thumbnail-downloader` - YouTube Thumbnail Downloader tool
- `/what-is-my-ip` - What is My IP tool
- `/age-calculator` - Age Calculator tool
- `/percentage-calculator` - Percentage Calculator tool
- `/md5-generator` - MD5 Generator tool
- `/password-strength-checker` - Password Strength Checker tool
- `/image-to-pdf` - JPG/PNG to PDF Converter tool
- `/merge-pdf` - Merge PDF Files tool
- `/resume-builder` - Resume Builder tool
- `/bmi-calculator` - BMI Calculator tool
- `/meme-generator` - Meme Generator tool
- `/emi-calculator` - Loan EMI Calculator tool
- `/wifi-qr-generator` - WiFi QR Generator tool
- `/keyboard-tester` - Keyboard & Mouse Tester tool
- `/cps-test` - CPS Test (Click Speed Test) tool
- `/color-palette` - Color Palette Generator tool
- `/gradient-generator` - CSS Gradient Generator tool
- `/text-cleaner` - Text Cleaner (Remove Duplicates & Slug Converter) tool
- `/wheel-of-decision` - Wheel of Decision (Random Picker) tool
- `/grammar-checker` - Grammar Checker tool
- `/ai-humanizer` - AI Humanizer tool
- `/plagiarism-checker` - Plagiarism Checker & AI Detector tool
- `/ai-post-generator` - AI Post Generator tool
- `/ai-hashtag-generator` - AI Hashtag Generator tool
- `/ai-content-generator` - AI Content Generator tool
- `/engagement-calculator` - Engagement Rate Calculator tool
- `/youtube-tag-extractor` - YouTube Tag Extractor tool
- `/viral-hooks-generator` - Viral Hook Generator tool
- `/bio-link-builder` - Bio Link Builder tool
- `/holiday-calendar` - Social Media Holiday Calendar tool

### Legal Pages (AdSense/GDPR Compliance)
- `/privacy-policy` - Privacy Policy page with cookie disclosure and GDPR information
- `/disclaimer` - Disclaimer page with "as is" warranty and liability limitations
- `/terms` - Terms of Use page with acceptable use policy
- `/contact` - Contact Us page with contact form

## Design
- Professional blue and white color scheme
- Sticky header with search functionality
- Responsive grid layout for tool cards
- Ad space placeholders for future monetization
- Mobile-friendly with hamburger menu
- Footer with legal page links (Privacy Policy, Disclaimer, Terms of Use, Contact Us)
- Related Tools section on each tool page for SEO internal linking

## Constants
Site constants are stored in `client/src/lib/constants.ts`:
- `SITE_NAME`: "Digi Best Tools"
- `SITE_URL`: "https://digibesttools.site"
- `SUPPORT_EMAIL`: "support@digibesttools.site"

## Running the Project
The application runs on port 5000 using `npm run dev`.
