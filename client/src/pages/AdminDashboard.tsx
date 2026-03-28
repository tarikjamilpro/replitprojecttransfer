import { useState, useEffect, useCallback } from "react";
import { useAdConfig, AdConfig } from "@/contexts/AdContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Settings, Link2, Code2, Save, LogOut,
  ToggleLeft, Loader2, CheckCircle2, Globe, AlertCircle
} from "lucide-react";

const TOKEN_KEY = "admin_jwt";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setError("Incorrect Password. Access Denied.");
        setPw("");
      } else if (!res.ok) {
        setError("Server error. Please try again.");
      } else {
        storeToken(data.token);
        onAuth();
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1">Authenticate to manage ad settings</p>
        </div>

        <Card className="shadow-2xl border-slate-800 bg-slate-900/80 backdrop-blur">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-pw" className="text-slate-300 text-sm">Password</Label>
                <Input
                  id="admin-pw"
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                  data-testid="input-admin-password"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg" data-testid="text-login-error">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
                disabled={loading}
                data-testid="button-login"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying…</>
                  : "Access Dashboard"
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          Tokens expire after 8 hours for security
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { config, loading: configLoading, refreshConfig } = useAdConfig();
  const { toast } = useToast();
  const [authed, setAuthed] = useState(() => !!getStoredToken());
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdConfig>(config);

  useEffect(() => {
    if (!configLoading) setForm(config);
  }, [config, configLoading]);

  const logout = useCallback(() => {
    clearToken();
    setAuthed(false);
  }, []);

  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} />;
  }

  const handleSave = async () => {
    const token = getStoredToken();
    if (!token) {
      logout();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/ads/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
        logout();
        return;
      }
      if (!res.ok) throw new Error("Server error");

      await refreshConfig();
      toast({ title: "Changes saved!", description: "Ad configuration updated successfully." });
    } catch {
      toast({ title: "Save failed", description: "Could not save changes. Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Ad Management</h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${form.interstitial.active ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-xs text-gray-500">
              {form.interstitial.active ? "Ads Active" : "Ads Paused"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Ad Configuration</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your networks, links, and interstitial settings</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            data-testid="button-save"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              : <><Save className="w-4 h-4 mr-2" />Save Changes</>
            }
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ToggleLeft className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Global Controls</CardTitle>
            </div>
            <CardDescription>Control how the interstitial modal behaves across all tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
              <div>
                <p className="font-medium text-sm text-gray-900">Interstitial Modal</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {form.interstitial.active
                    ? "Users see the sponsored modal before accessing tools"
                    : "Modal is bypassed — users go directly to tools"}
                </p>
              </div>
              <Switch
                checked={form.interstitial.active}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, interstitial: { ...f.interstitial, active: v } }))
                }
                data-testid="switch-interstitial-active"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Active Ad Provider</Label>
              <p className="text-xs text-gray-500">The network whose direct link fires on the interstitial</p>
              <Select
                value={form.interstitial.activeProvider}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    interstitial: { ...f.interstitial, activeProvider: v as AdConfig["interstitial"]["activeProvider"] },
                  }))
                }
              >
                <SelectTrigger className="w-full sm:w-64" data-testid="select-active-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adsterra">Adsterra</SelectItem>
                  <SelectItem value="monetag">Monetag</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Direct Links</CardTitle>
            </div>
            <CardDescription>
              Paste the direct link or .js script URL for each network. The active provider's link is triggered by the interstitial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {(["adsterra", "monetag", "custom"] as const).map((network) => (
                <div key={network} className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    {network === "adsterra" ? "Adsterra" : network === "monetag" ? "Monetag" : "Custom"}
                    {form.interstitial.activeProvider === network && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                    )}
                  </Label>
                  <Input
                    value={form.directLinks[network]}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        directLinks: { ...f.directLinks, [network]: e.target.value },
                      }))
                    }
                    placeholder="https://... or https://....js"
                    data-testid={`input-direct-link-${network}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Banner Scripts</CardTitle>
            </div>
            <CardDescription>
              Paste the full {"<script>"} tag for each network. Stored for reference and manual placement in pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {(["adsterra", "monetag", "custom"] as const).map((network) => (
                <div key={network} className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-gray-400" />
                    {network === "adsterra" ? "Adsterra" : network === "monetag" ? "Monetag" : "Custom"} Script
                  </Label>
                  <Textarea
                    value={form.bannerScripts[network]}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        bannerScripts: { ...f.bannerScripts, [network]: e.target.value },
                      }))
                    }
                    placeholder={`<script src="https://..."></script>`}
                    className="font-mono text-xs resize-none"
                    rows={3}
                    data-testid={`textarea-banner-script-${network}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            data-testid="button-save-bottom"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving Changes…</>
              : <><CheckCircle2 className="w-4 h-4 mr-2" />Save All Changes</>
            }
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setForm(config)}
            className="sm:w-auto"
            data-testid="button-reset"
          >
            Discard Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
