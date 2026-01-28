import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header, Footer } from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Home = lazy(() => import("@/pages/Home"));
const WordCounter = lazy(() => import("@/pages/WordCounter"));
const CaseConverter = lazy(() => import("@/pages/CaseConverter"));
const PasswordGenerator = lazy(() => import("@/pages/PasswordGenerator"));
const LoremIpsum = lazy(() => import("@/pages/LoremIpsum"));
const ImageCompressor = lazy(() => import("@/pages/ImageCompressor"));
const SpeedTest = lazy(() => import("@/pages/SpeedTest"));
const ImageConverter = lazy(() => import("@/pages/ImageConverter"));
const ImageResizer = lazy(() => import("@/pages/ImageResizer"));
const QRCodeGenerator = lazy(() => import("@/pages/QRCodeGenerator"));
const JSONFormatter = lazy(() => import("@/pages/JSONFormatter"));
const MetaTagGenerator = lazy(() => import("@/pages/MetaTagGenerator"));
const RobotsTxtGenerator = lazy(() => import("@/pages/RobotsTxtGenerator"));
const FancyFontGenerator = lazy(() => import("@/pages/FancyFontGenerator"));
const YouTubeThumbnailDownloader = lazy(() => import("@/pages/YouTubeThumbnailDownloader"));
const WhatIsMyIP = lazy(() => import("@/pages/WhatIsMyIP"));
const AgeCalculator = lazy(() => import("@/pages/AgeCalculator"));
const PercentageCalculator = lazy(() => import("@/pages/PercentageCalculator"));
const MD5Generator = lazy(() => import("@/pages/MD5Generator"));
const PasswordStrengthChecker = lazy(() => import("@/pages/PasswordStrengthChecker"));
const ImageToPDF = lazy(() => import("@/pages/ImageToPDF"));
const MergePDF = lazy(() => import("@/pages/MergePDF"));
const ResumeBuilder = lazy(() => import("@/pages/ResumeBuilder"));
const UniversalImageProcessor = lazy(() => import("@/pages/UniversalImageProcessor"));
const BMICalculator = lazy(() => import("@/pages/BMICalculator"));
const MemeGenerator = lazy(() => import("@/pages/MemeGenerator"));
const EMICalculator = lazy(() => import("@/pages/EMICalculator"));
const WifiQRGenerator = lazy(() => import("@/pages/WifiQRGenerator"));
const KeyboardTester = lazy(() => import("@/pages/KeyboardTester"));
const CPSTest = lazy(() => import("@/pages/CPSTest"));
const ColorPalette = lazy(() => import("@/pages/ColorPalette"));
const GradientGenerator = lazy(() => import("@/pages/GradientGenerator"));
const TextCleaner = lazy(() => import("@/pages/TextCleaner"));
const WheelOfDecision = lazy(() => import("@/pages/WheelOfDecision"));
const GrammarChecker = lazy(() => import("@/pages/GrammarChecker"));
const AIHumanizer = lazy(() => import("@/pages/AIHumanizer"));
const PlagiarismChecker = lazy(() => import("@/pages/PlagiarismChecker"));
const AIImageGenerator = lazy(() => import("@/pages/AIImageGenerator"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Disclaimer = lazy(() => import("@/pages/Disclaimer"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const Contact = lazy(() => import("@/pages/Contact"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/word-counter" component={WordCounter} />
        <Route path="/case-converter" component={CaseConverter} />
        <Route path="/password-generator" component={PasswordGenerator} />
        <Route path="/lorem-ipsum" component={LoremIpsum} />
        <Route path="/image-compressor" component={ImageCompressor} />
        <Route path="/speed-test" component={SpeedTest} />
        <Route path="/image-converter" component={ImageConverter} />
        <Route path="/image-resizer" component={ImageResizer} />
        <Route path="/qr-code-generator" component={QRCodeGenerator} />
        <Route path="/json-formatter" component={JSONFormatter} />
        <Route path="/meta-tag-generator" component={MetaTagGenerator} />
        <Route path="/robots-txt-generator" component={RobotsTxtGenerator} />
        <Route path="/fancy-font-generator" component={FancyFontGenerator} />
        <Route path="/youtube-thumbnail-downloader" component={YouTubeThumbnailDownloader} />
        <Route path="/what-is-my-ip" component={WhatIsMyIP} />
        <Route path="/age-calculator" component={AgeCalculator} />
        <Route path="/percentage-calculator" component={PercentageCalculator} />
        <Route path="/md5-generator" component={MD5Generator} />
        <Route path="/password-strength-checker" component={PasswordStrengthChecker} />
        <Route path="/image-to-pdf" component={ImageToPDF} />
        <Route path="/merge-pdf" component={MergePDF} />
        <Route path="/resume-builder" component={ResumeBuilder} />
        <Route path="/image-processor" component={UniversalImageProcessor} />
        <Route path="/bmi-calculator" component={BMICalculator} />
        <Route path="/meme-generator" component={MemeGenerator} />
        <Route path="/emi-calculator" component={EMICalculator} />
        <Route path="/wifi-qr-generator" component={WifiQRGenerator} />
        <Route path="/keyboard-tester" component={KeyboardTester} />
        <Route path="/cps-test" component={CPSTest} />
        <Route path="/color-palette" component={ColorPalette} />
        <Route path="/gradient-generator" component={GradientGenerator} />
        <Route path="/text-cleaner" component={TextCleaner} />
        <Route path="/wheel-of-decision" component={WheelOfDecision} />
        <Route path="/grammar-checker" component={GrammarChecker} />
        <Route path="/ai-humanizer" component={AIHumanizer} />
        <Route path="/plagiarism-checker" component={PlagiarismChecker} />
        <Route path="/ai-image-generator" component={AIImageGenerator} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/disclaimer" component={Disclaimer} />
        <Route path="/terms" component={TermsOfUse} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
