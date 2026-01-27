# SEO Tools Hub

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

## Design
- Professional blue and white color scheme
- Sticky header with search functionality
- Responsive grid layout for tool cards
- Ad space placeholders for future monetization
- Mobile-friendly with hamburger menu

## Running the Project
The application runs on port 5000 using `npm run dev`.
