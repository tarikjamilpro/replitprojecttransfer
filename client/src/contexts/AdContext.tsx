import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AdConfig {
  interstitial: {
    active: boolean;
    activeProvider: "adsterra" | "monetag" | "custom";
  };
  directLinks: {
    adsterra: string;
    monetag: string;
    custom: string;
  };
  bannerScripts: {
    adsterra: string;
    monetag: string;
    custom: string;
  };
}

const DEFAULT_CONFIG: AdConfig = {
  interstitial: { active: true, activeProvider: "adsterra" },
  directLinks: { adsterra: "", monetag: "", custom: "" },
  bannerScripts: { adsterra: "", monetag: "", custom: "" },
};

interface AdContextValue {
  config: AdConfig;
  loading: boolean;
  getActiveDirectLink: () => string;
  isInterstitialActive: () => boolean;
  refreshConfig: () => Promise<void>;
}

const AdContext = createContext<AdContextValue>({
  config: DEFAULT_CONFIG,
  loading: true,
  getActiveDirectLink: () => "",
  isInterstitialActive: () => true,
  refreshConfig: async () => {},
});

export function AdProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AdConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/ads");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const getActiveDirectLink = () => {
    const provider = config.interstitial.activeProvider;
    return config.directLinks[provider] ?? "";
  };

  const isInterstitialActive = () => config.interstitial.active;

  return (
    <AdContext.Provider value={{ config, loading, getActiveDirectLink, isInterstitialActive, refreshConfig: fetchConfig }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAdConfig() {
  return useContext(AdContext);
}
