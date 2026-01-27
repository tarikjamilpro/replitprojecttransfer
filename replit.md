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

## Design
- Professional blue and white color scheme
- Sticky header with search functionality
- Responsive grid layout for tool cards
- Ad space placeholders for future monetization
- Mobile-friendly with hamburger menu

## Running the Project
The application runs on port 5000 using `npm run dev`.
