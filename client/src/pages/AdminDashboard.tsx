import { useState, useEffect } from "react";
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
  ToggleLeft, Loader2, CheckCircle2, Globe
} from "lucide-react";

const SESSION_KEY = "admin_authed";

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.status === 401) {
        setError("Incorrect password. Please try again.");
      } else {
        sessionStorage.setItem(SESSION_KEY, "1");
        onAuth();
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl">Admin Access</CardTitle>
          <CardDescription>Enter your password to manage ad settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-pw">Password</Label>
              <Input
                id="admin-pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                data-testid="input-admin-password"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center" data-testid="text-login-error">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Verifying…" : "Access Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const { config, loading: configLoading, refreshConfig } = useAdConfig();
  const { toast } = useToast();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [showPwInput, setShowPwInput] = useState(false);

  const [form, setForm] = useState<AdConfig>(config);

  useEffect(() => {
    if (!configLoading) setForm(config);
  }, [config, configLoading]);

  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} />;
  }

  const handleSave = async () => {
    const pw = password || prompt("Enter admin password to save:");
    if (!pw) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, ...form }),
      });
      if (res.status === 401) {
        toast({ title: "Wrong password", description: "The password is incorrect.", variant: "destructive" });
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

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Ad Management</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${form.interstitial.active ? "bg-green-500" : "bg-gray-300"}`} />
          <span className="text-xs text-gray-500 hidden sm:block">
            {form.interstitial.active ? "Ads Active" : "Ads Paused"}
          </span>
          <Button variant="ghost" size="sm" onClick={logout} className="ml-2 text-gray-500" data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Ad Configuration</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your ad networks and interstitial settings</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
              <p className="text-xs text-gray-500">The network whose direct link will be used for the interstitial</p>
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
            <CardDescription>Paste the direct link URL for each ad network. The active provider's link is used for the interstitial.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {(["adsterra", "monetag", "custom"] as const).map((network) => (
                <div key={network} className="space-y-1.5">
                  <Label className="text-sm font-medium capitalize flex items-center gap-2">
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
                    placeholder={`https://... or https://...js`}
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
            <CardDescription>Paste the full {"<script>"} tag for global banner ads. These are stored for reference and manual placement.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {(["adsterra", "monetag", "custom"] as const).map((network) => (
                <div key={network} className="space-y-1.5">
                  <Label className="text-sm font-medium capitalize flex items-center gap-2">
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
          <Button variant="outline" size="lg" onClick={() => setForm(config)} className="sm:w-auto" data-testid="button-reset">
            Discard Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
