import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header, Footer } from "@/components/Layout";
import Home from "@/pages/Home";
import WordCounter from "@/pages/WordCounter";
import CaseConverter from "@/pages/CaseConverter";
import PasswordGenerator from "@/pages/PasswordGenerator";
import LoremIpsum from "@/pages/LoremIpsum";
import ImageCompressor from "@/pages/ImageCompressor";
import SpeedTest from "@/pages/SpeedTest";
import ImageConverter from "@/pages/ImageConverter";
import ImageResizer from "@/pages/ImageResizer";
import QRCodeGenerator from "@/pages/QRCodeGenerator";
import JSONFormatter from "@/pages/JSONFormatter";
import MetaTagGenerator from "@/pages/MetaTagGenerator";
import RobotsTxtGenerator from "@/pages/RobotsTxtGenerator";
import FancyFontGenerator from "@/pages/FancyFontGenerator";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
      <Route component={NotFound} />
    </Switch>
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
