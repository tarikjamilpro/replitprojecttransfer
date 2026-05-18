import { useState, useEffect, useCallback } from "react";
import { useAdConfig, AdConfig } from "@/contexts/AdContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Settings, Link2, Code2, Save, LogOut,
  ToggleLeft, Loader2, CheckCircle2, Globe, AlertCircle,
  ImageIcon, Plus, Pencil, Trash2, ExternalLink, Search,
  ShoppingBag, DollarSign,
} from "lucide-react";
import type { AiPrompt, InsertAiPrompt, DigitalProduct } from "@shared/schema";

type ProductFormState = {
  title: string;
  shortDescription: string;
  price: string;
  imageUrl: string;
  stockStatus: "in_stock" | "out_of_stock";
  category: string;
};

const EMPTY_PRODUCT: ProductFormState = {
  title: "", shortDescription: "", price: "", imageUrl: "", stockStatus: "in_stock", category: "",
};

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
      let data: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text.slice(0, 120)}`);
      }
      if (res.status === 401) {
        setError("Incorrect Password. Access Denied.");
        setPw("");
      } else if (!res.ok) {
        setError(data?.error || data?.message || `Server error (${res.status}). Please try again.`);
      } else {
        storeToken(data.token);
        onAuth();
      }
    } catch (err: any) {
      setError(err?.message || "Connection error. Please try again.");
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
          <p className="text-slate-400 text-sm mt-1">Authenticate to manage settings</p>
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
                  : "Access Dashboard"}
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

// ─── Ad Configuration Panel (existing logic, untouched) ───────────────────────

function AdConfigurationPanel({ onSessionExpired }: { onSessionExpired: () => void }) {
  const { config, loading: configLoading, refreshConfig } = useAdConfig();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdConfig>(config);

  useEffect(() => {
    if (!configLoading) setForm(config);
  }, [config, configLoading]);

  const handleSave = async () => {
    const token = getStoredToken();
    if (!token) { onSessionExpired(); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/ads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
        onSessionExpired();
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ad Configuration</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your networks, links, and interstitial settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0" data-testid="button-save">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
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
              onCheckedChange={(v) => setForm((f) => ({ ...f, interstitial: { ...f.interstitial, active: v } }))}
              data-testid="switch-interstitial-active"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Active Ad Provider</Label>
            <p className="text-xs text-gray-500">The network whose direct link fires on the interstitial</p>
            <Select
              value={form.interstitial.activeProvider}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, interstitial: { ...f.interstitial, activeProvider: v as AdConfig["interstitial"]["activeProvider"] } }))
              }
            >
              <SelectTrigger className="w-full sm:w-64" data-testid="select-active-provider"><SelectValue /></SelectTrigger>
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
          <div className="flex items-center gap-2"><Link2 className="w-5 h-5 text-blue-600" /><CardTitle className="text-base">Direct Links</CardTitle></div>
          <CardDescription>Paste the direct link or .js script URL for each network. The active provider's link is triggered by the interstitial.</CardDescription>
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
                  onChange={(e) => setForm((f) => ({ ...f, directLinks: { ...f.directLinks, [network]: e.target.value } }))}
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
          <div className="flex items-center gap-2"><Code2 className="w-5 h-5 text-blue-600" /><CardTitle className="text-base">Banner Scripts</CardTitle></div>
          <CardDescription>Paste the full {"<script>"} tag for each network. Stored for reference and manual placement in pages.</CardDescription>
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
                  onChange={(e) => setForm((f) => ({ ...f, bannerScripts: { ...f.bannerScripts, [network]: e.target.value } }))}
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
        <Button onClick={handleSave} disabled={saving} size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold" data-testid="button-save-bottom">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving Changes…</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Save All Changes</>}
        </Button>
        <Button variant="outline" size="lg" onClick={() => setForm(config)} className="sm:w-auto" data-testid="button-reset">
          Discard Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Prompt Manager Panel ────────────────────────────────────────────────────

const EMPTY_FORM: InsertAiPrompt = { title: "", description: "", imageUrl: "", meigenTargetLink: "" };

function PromptManagerPanel({ onSessionExpired }: { onSessionExpired: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prompts, isLoading } = useQuery<AiPrompt[]>({ queryKey: ["/api/prompts"] });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AiPrompt | null>(null);
  const [form, setForm] = useState<InsertAiPrompt>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPrompts = (prompts || []).filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p: AiPrompt) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, imageUrl: p.imageUrl, meigenTargetLink: p.meigenTargetLink });
    setDialogOpen(true);
  };

  const authedFetch = useCallback(async (url: string, init: RequestInit = {}) => {
    const token = getStoredToken();
    if (!token) { onSessionExpired(); throw new Error("No token"); }
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        "Authorization": `Bearer ${token}`,
      },
    });
    if (res.status === 401) {
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      onSessionExpired();
      throw new Error("Unauthorized");
    }
    return res;
  }, [onSessionExpired, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.imageUrl.trim() || !form.meigenTargetLink.trim()) {
      toast({ title: "Missing fields", description: "All fields are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/prompts/${editing.id}` : "/api/prompts";
      const method = editing ? "PATCH" : "POST";
      const res = await authedFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Save failed");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({ title: editing ? "Prompt updated" : "Prompt added", description: editing ? "Changes saved." : "New prompt is live." });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditing(null);
    } catch (err: any) {
      if (err.message !== "Unauthorized" && err.message !== "No token") {
        toast({ title: "Save failed", description: err.message || "Try again.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await authedFetch(`/api/prompts/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
      toast({ title: "Prompt deleted" });
      setDeleteId(null);
    } catch (err: any) {
      if (err.message !== "Unauthorized" && err.message !== "No token") {
        toast({ title: "Delete failed", description: err.message || "Try again.", variant: "destructive" });
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Prompt Manager</h2>
          <p className="text-sm text-gray-500 mt-0.5">Add, edit, or remove prompts shown in the public gallery</p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0" data-testid="button-add-prompt">
          <Plus className="w-4 h-4 mr-2" /> Add Prompt
        </Button>
      </div>

      {/* Search */}
      {prompts && prompts.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search prompts by title or description…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-prompts"
          />
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading prompts…
            </div>
          ) : !prompts || prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-700">No prompts yet</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">Add your first prompt to populate the gallery.</p>
              <Button onClick={openAdd} variant="outline" size="sm" data-testid="button-add-first-prompt">
                <Plus className="w-4 h-4 mr-1.5" /> Add First Prompt
              </Button>
            </div>
          ) : (
            <ul className="divide-y" data-testid="list-prompts">
              {prompts.map((p) => (
                <li key={p.id} className="flex items-center gap-4 p-4" data-testid={`row-prompt-${p.id}`}>
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate" data-testid={`text-admin-title-${p.id}`}>{p.title}</p>
                    <p className="text-xs text-gray-500 truncate">{p.description}</p>
                    <a
                      href={p.meigenTargetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> MeiGen link
                    </a>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} data-testid={`button-edit-prompt-${p.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(p.id)} data-testid={`button-delete-prompt-${p.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Prompt" : "Add New Prompt"}</DialogTitle>
            <DialogDescription>
              These details appear in the public gallery. The MeiGen link is the destination of the CTA button.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="prompt-title">Title</Label>
              <Input
                id="prompt-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Cyberpunk Samurai at Night"
                required
                data-testid="input-prompt-title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prompt-description">Description</Label>
              <Textarea
                id="prompt-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description of what this prompt produces…"
                rows={3}
                required
                data-testid="input-prompt-description"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prompt-image">Image URL</Label>
              <Input
                id="prompt-image"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                required
                data-testid="input-prompt-image-url"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prompt-link">MeiGen Target Link</Label>
              <Input
                id="prompt-link"
                type="url"
                value={form.meigenTargetLink}
                onChange={(e) => setForm((f) => ({ ...f, meigenTargetLink: e.target.value }))}
                placeholder="https://meigen.ai/prompt/12345"
                required
                data-testid="input-prompt-meigen-link"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-prompt">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : (editing ? "Save Changes" : "Add Prompt")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this prompt?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} data-testid="button-confirm-delete-prompt">
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Store Manager Panel ────────────────────────────────────────────────────

function StoreManagerPanel({ onSessionExpired }: { onSessionExpired: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const authedFetch = useCallback(async (url: string, init: RequestInit = {}) => {
    const token = getStoredToken();
    if (!token) { onSessionExpired(); throw new Error("No token"); }
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        "Authorization": `Bearer ${token}`,
      },
    });
    if (res.status === 401) {
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      onSessionExpired();
      throw new Error("Unauthorized");
    }
    return res;
  }, [onSessionExpired, toast]);

  const { data: products, isLoading } = useQuery<DigitalProduct[]>({
    queryKey: ["/api/store/admin/products"],
    queryFn: async () => {
      const res = await authedFetch("/api/store/admin/products");
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DigitalProduct | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const openAdd = () => { setEditing(null); setForm(EMPTY_PRODUCT); setDialogOpen(true); };
  const openEdit = (p: DigitalProduct) => {
    setEditing(p);
    setForm({
      title: p.title,
      shortDescription: p.shortDescription ?? "",
      price: p.price ?? "",
      imageUrl: p.imageUrl ?? "",
      stockStatus: p.stockStatus,
      category: p.category ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const priceNum = parseFloat(form.price);
    if (!title) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast({ title: "Valid price required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title,
        shortDescription: form.shortDescription.trim(),
        price: priceNum,
        imageUrl: form.imageUrl.trim(),
        stockStatus: form.stockStatus,
        category: form.category.trim(),
      };
      const url = editing
        ? `/api/store/admin/products/${editing.id}`
        : "/api/store/admin/products";
      const method = editing ? "PATCH" : "POST";
      const res = await authedFetch(url, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Save failed");
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/store/admin/products"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/store/products"] }),
      ]);
      toast({ title: editing ? "Product updated" : "Product added" });
      setDialogOpen(false);
      setForm(EMPTY_PRODUCT);
      setEditing(null);
    } catch (err: any) {
      if (err.message !== "Unauthorized" && err.message !== "No token") {
        toast({ title: "Save failed", description: err.message || "Try again.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      const res = await authedFetch(`/api/store/admin/products/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/store/admin/products"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/store/products"] }),
      ]);
      toast({ title: "Product deleted" });
      setDeleteId(null);
    } catch (err: any) {
      if (err.message !== "Unauthorized" && err.message !== "No token") {
        toast({ title: "Delete failed", description: err.message || "Try again.", variant: "destructive" });
      }
    } finally {
      setDeleting(false);
    }
  };

  const toggleStock = async (p: DigitalProduct) => {
    setTogglingId(p.id);
    try {
      const next = p.stockStatus === "in_stock" ? "out_of_stock" : "in_stock";
      const res = await authedFetch(`/api/store/admin/products/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ stockStatus: next }),
      });
      if (!res.ok) throw new Error("Update failed");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/store/admin/products"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/store/products"] }),
      ]);
      toast({ title: `Marked ${next === "in_stock" ? "In Stock" : "Out of Stock"}` });
    } catch (err: any) {
      if (err.message !== "Unauthorized" && err.message !== "No token") {
        toast({ title: "Update failed", description: err.message || "Try again.", variant: "destructive" });
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Store Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage digital products shown on the public store</p>
        </div>
        <Button onClick={openAdd} className="bg-purple-600 hover:bg-purple-700 text-white shrink-0" data-testid="button-add-product">
          <Plus className="w-4 h-4 mr-2" /> Add New Product
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading products…
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-700">No products yet</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">Add your first product to populate the store.</p>
              <Button onClick={openAdd} variant="outline" size="sm" data-testid="button-add-first-product">
                <Plus className="w-4 h-4 mr-1.5" /> Add First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-products">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => {
                    const out = p.stockStatus === "out_of_stock";
                    return (
                      <tr key={p.id} data-testid={`row-product-${p.id}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.imageUrl || "https://picsum.photos/seed/digibest/80/80"}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate" data-testid={`text-admin-product-title-${p.id}`}>{p.title}</p>
                              {p.category && <p className="text-xs text-gray-500 truncate">{p.category}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-gray-900 whitespace-nowrap">
                          ${parseFloat(p.price || "0").toFixed(2)}
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            disabled={togglingId === p.id}
                            onClick={() => toggleStock(p)}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                              out
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            } ${togglingId === p.id ? "opacity-60 cursor-wait" : ""}`}
                            data-testid={`button-toggle-stock-${p.id}`}
                          >
                            {togglingId === p.id ? "…" : out ? "Out of Stock" : "In Stock"}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)} data-testid={`button-edit-product-${p.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteId(p.id)}
                              data-testid={`button-delete-product-${p.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              These details appear on the public /store page. Buy Now opens the Telegram contact.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="product-title">Title *</Label>
              <Input
                id="product-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="ChatGPT Plus Account — 1 Month"
                required
                maxLength={255}
                data-testid="input-product-title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-desc">Short Description</Label>
              <Textarea
                id="product-desc"
                value={form.shortDescription}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                placeholder="Premium ChatGPT account with full GPT-4o access…"
                rows={3}
                data-testid="input-product-description"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="product-price">Price (USD) *</Label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999.99"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="9.99"
                    required
                    className="pl-9"
                    data-testid="input-product-price"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-status">Stock Status</Label>
                <Select
                  value={form.stockStatus}
                  onValueChange={(v) => setForm((f) => ({ ...f, stockStatus: v as "in_stock" | "out_of_stock" }))}
                >
                  <SelectTrigger id="product-status" data-testid="select-product-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-image">Image URL</Label>
              <Input
                id="product-image"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://example.com/product.jpg"
                data-testid="input-product-image"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-category">Category</Label>
              <Input
                id="product-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Accounts / Scripts / Courses"
                maxLength={100}
                data-testid="input-product-category"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700" data-testid="button-save-product">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : (editing ? "Save Changes" : "Add Product")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} data-testid="button-confirm-delete-product">
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Dashboard with Tabs ─────────────────────────────────────────────────

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(() => !!getStoredToken());
  const [tab, setTab] = useState<"ads" | "prompts" | "store">("ads");

  const logout = useCallback(() => {
    clearToken();
    setAuthed(false);
  }, []);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Manage ads & prompts</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-1.5" /> Logout
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "ads" | "prompts" | "store")}>
          <TabsList className="mb-6">
            <TabsTrigger value="ads" data-testid="tab-ads">
              <Settings className="w-4 h-4 mr-1.5" /> Ad Configuration
            </TabsTrigger>
            <TabsTrigger value="prompts" data-testid="tab-prompts">
              <ImageIcon className="w-4 h-4 mr-1.5" /> Prompt Manager
            </TabsTrigger>
            <TabsTrigger value="store" data-testid="tab-store">
              <ShoppingBag className="w-4 h-4 mr-1.5" /> Store
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ads">
            <AdConfigurationPanel onSessionExpired={logout} />
          </TabsContent>
          <TabsContent value="prompts">
            <PromptManagerPanel onSessionExpired={logout} />
          </TabsContent>
          <TabsContent value="store">
            <StoreManagerPanel onSessionExpired={logout} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
