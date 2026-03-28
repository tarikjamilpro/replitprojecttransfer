import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { useAdConfig } from "@/contexts/AdContext";

function triggerAdLink(link: string) {
  if (!link) return;
  if (link.endsWith(".js")) {
    const s = document.createElement("script");
    s.src = link;
    document.body.appendChild(s);
  } else {
    window.open(link, "_blank", "noopener");
  }
}

interface AdInterstitialProps {
  isOpen: boolean;
  onContinue: () => void;
  toolName?: string;
}

export function AdInterstitial({ isOpen, onContinue, toolName = "this tool" }: AdInterstitialProps) {
  const [loading, setLoading] = useState(false);
  const { getActiveDirectLink } = useAdConfig();

  const handleContinue = useCallback(() => {
    setLoading(true);
    const link = getActiveDirectLink();
    if (link) triggerAdLink(link);
    setTimeout(() => {
      setLoading(false);
      onContinue();
    }, 1000);
  }, [onContinue, getActiveDirectLink]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
      data-testid="ad-interstitial-overlay"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-8 flex flex-col items-center text-center gap-6"
        data-testid="ad-interstitial-modal"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
          <Zap className="w-8 h-8 text-blue-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            Free Tool — Supported by Ads
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {toolName} is completely free to use. To keep it running, we show a
            brief sponsored page when you continue. Thank you for supporting us!
          </p>
        </div>

        <div className="w-full bg-gray-50 rounded-xl p-4 text-left space-y-2 border border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
            A sponsored page will open in a new tab
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
            Your result will be ready on this page
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
            No sign-up or payment required
          </div>
        </div>

        <Button
          size="lg"
          className="w-full text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12"
          onClick={handleContinue}
          disabled={loading}
          data-testid="button-continue-to-tool"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading your result…
            </>
          ) : (
            "Continue to Tool →"
          )}
        </Button>

        <p className="text-xs text-gray-400">
          By continuing you acknowledge this site is ad-supported.
        </p>
      </div>
    </div>
  );
}

export function useAdInterstitial() {
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const { isInterstitialActive } = useAdConfig();

  const requestAction = useCallback((action: () => void) => {
    if (!isInterstitialActive()) {
      action();
      return;
    }
    setPendingAction(() => action);
    setShowInterstitial(true);
  }, [isInterstitialActive]);

  const handleContinue = useCallback(() => {
    setShowInterstitial(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  return { showInterstitial, requestAction, handleContinue };
}
