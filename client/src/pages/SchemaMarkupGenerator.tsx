import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Database, Copy, Check, Plus, Trash2, ExternalLink } from "lucide-react";
import { ToolPageLayout } from "@/components/Layout";

type SchemaType = "Organization" | "WebSite" | "Article" | "Product" | "LocalBusiness" | "FAQPage";

const SCHEMA_OPTIONS: { value: SchemaType; label: string }[] = [
  { value: "Organization", label: "Organization" },
  { value: "WebSite", label: "WebSite" },
  { value: "Article", label: "Article" },
  { value: "Product", label: "Product" },
  { value: "LocalBusiness", label: "LocalBusiness" },
  { value: "FAQPage", label: "FAQ Page" },
];

interface State {
  name: string;
  url: string;
  description: string;
  image: string;
  headline: string;
  author: string;
  datePublished: string;
  price: string;
  currency: string;
  brand: string;
  sku: string;
  telephone: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  priceRange: string;
}

const EMPTY_STATE: State = {
  name: "",
  url: "",
  description: "",
  image: "",
  headline: "",
  author: "",
  datePublished: "",
  price: "",
  currency: "USD",
  brand: "",
  sku: "",
  telephone: "",
  streetAddress: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  addressCountry: "",
  priceRange: "$$",
};

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

function escapeForScript(json: string): string {
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function buildSchema(type: SchemaType, s: State, faqs: FaqItem[]): Record<string, any> {
  const base: Record<string, any> = { "@context": "https://schema.org", "@type": type };

  switch (type) {
    case "Organization":
      if (s.name) base.name = s.name;
      if (s.url) base.url = s.url;
      if (s.description) base.description = s.description;
      if (s.image) base.logo = s.image;
      if (s.telephone) base.telephone = s.telephone;
      break;

    case "WebSite":
      if (s.name) base.name = s.name;
      if (s.url) {
        base.url = s.url;
        base.potentialAction = {
          "@type": "SearchAction",
          target: `${s.url.replace(/\/$/, "")}/?s={search_term_string}`,
          "query-input": "required name=search_term_string",
        };
      }
      if (s.description) base.description = s.description;
      break;

    case "Article":
      if (s.headline) base.headline = s.headline;
      if (s.description) base.description = s.description;
      if (s.image) base.image = s.image;
      if (s.author) base.author = { "@type": "Person", name: s.author };
      if (s.datePublished) base.datePublished = s.datePublished;
      break;

    case "Product":
      if (s.name) base.name = s.name;
      if (s.description) base.description = s.description;
      if (s.image) base.image = s.image;
      if (s.sku) base.sku = s.sku;
      if (s.brand) base.brand = { "@type": "Brand", name: s.brand };
      if (s.price) {
        base.offers = {
          "@type": "Offer",
          priceCurrency: s.currency || "USD",
          price: s.price,
          availability: "https://schema.org/InStock",
        };
      }
      break;

    case "LocalBusiness": {
      if (s.name) base.name = s.name;
      if (s.url) base.url = s.url;
      if (s.description) base.description = s.description;
      if (s.image) base.image = s.image;
      if (s.telephone) base.telephone = s.telephone;
      if (s.priceRange) base.priceRange = s.priceRange;
      const addr: Record<string, string> = {};
      if (s.streetAddress) addr.streetAddress = s.streetAddress;
      if (s.addressLocality) addr.addressLocality = s.addressLocality;
      if (s.addressRegion) addr.addressRegion = s.addressRegion;
      if (s.postalCode) addr.postalCode = s.postalCode;
      if (s.addressCountry) addr.addressCountry = s.addressCountry;
      if (Object.keys(addr).length > 0) {
        base.address = { "@type": "PostalAddress", ...addr };
      }
      break;
    }

    case "FAQPage": {
      const valid = faqs.filter((f) => f.question.trim() && f.answer.trim());
      base.mainEntity = valid.map((f) => ({
        "@type": "Question",
        name: f.question.trim(),
        acceptedAnswer: { "@type": "Answer", text: f.answer.trim() },
      }));
      break;
    }
  }

  return base;
}

export default function SchemaMarkupGenerator() {
  const { toast } = useToast();
  const [type, setType] = useState<SchemaType>("Organization");
  const [state, setState] = useState<State>(EMPTY_STATE);
  const [faqs, setFaqs] = useState<FaqItem[]>([
    { id: "1", question: "", answer: "" },
  ]);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const addFaq = () =>
    setFaqs((f) => [...f, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, question: "", answer: "" }]);
  const removeFaq = (id: string) => setFaqs((f) => (f.length > 1 ? f.filter((x) => x.id !== id) : f));
  const updateFaq = (id: string, field: "question" | "answer", value: string) =>
    setFaqs((f) => f.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const schema = useMemo(() => buildSchema(type, state, faqs), [type, state, faqs]);
  const jsonString = useMemo(() => JSON.stringify(schema, null, 2), [schema]);
  const output = useMemo(
    () => `<script type="application/ld+json">\n${escapeForScript(jsonString)}\n</` + `script>`,
    [jsonString]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Copied!", description: "JSON-LD copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setState(EMPTY_STATE);
    setFaqs([{ id: "1", question: "", answer: "" }]);
    toast({ title: "Fields reset" });
  };

  const validatorUrl = `https://validator.schema.org/`;

  return (
    <ToolPageLayout
      title="Schema Markup Generator Pro"
      description="Generate valid JSON-LD structured data for Organization, Article, Product, LocalBusiness, FAQPage, and Website schemas."
      toolPath="/schema-markup-generator"
      howToUse={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Pick the schema type that best describes your page.</p>
          <p><strong className="text-foreground">2.</strong> Fill in the fields — only the ones you complete will appear in the output.</p>
          <p><strong className="text-foreground">3.</strong> For FAQ pages, add as many Q&A pairs as you need.</p>
          <p><strong className="text-foreground">4.</strong> Click <em>Copy</em> and paste the <code>&lt;script&gt;</code> block into your <code>&lt;head&gt;</code> or before <code>&lt;/body&gt;</code>.</p>
          <p><strong className="text-foreground">5.</strong> Validate with the Schema.org Validator (link below the output).</p>
        </div>
      }
    >
      <Card className="border-purple-100 dark:border-purple-900/30 mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Database className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Schema Markup Generator <span className="text-violet-600 dark:text-violet-400">Pro</span>
            </h2>
            <p className="text-muted-foreground mt-1.5">Generate valid JSON-LD structured data for SEO</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 sm:p-7">
            <h3 className="font-semibold mb-5">Schema Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sch-type" className="mb-1.5 block">Schema Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as SchemaType)}>
                  <SelectTrigger id="sch-type" className="rounded-2xl h-12" data-testid="select-schema-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEMA_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} data-testid={`schema-opt-${o.value}`}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(type === "Organization" || type === "LocalBusiness" || type === "WebSite") && (
                <>
                  <FieldText id="name" label="Name" value={state.name} onChange={(v) => set("name", v)} />
                  <FieldText id="url" label="URL" value={state.url} onChange={(v) => set("url", v)} type="url" placeholder="https://example.com" />
                  <FieldArea id="description" label="Description" value={state.description} onChange={(v) => set("description", v)} />
                  <FieldText id="image" label={type === "Organization" ? "Logo URL" : "Image URL"} value={state.image} onChange={(v) => set("image", v)} type="url" />
                </>
              )}

              {type === "Organization" && (
                <FieldText id="telephone" label="Telephone" value={state.telephone} onChange={(v) => set("telephone", v)} placeholder="+1-555-555-5555" />
              )}

              {type === "Article" && (
                <>
                  <FieldText id="headline" label="Headline" value={state.headline} onChange={(v) => set("headline", v)} />
                  <FieldArea id="description-a" label="Description" value={state.description} onChange={(v) => set("description", v)} />
                  <FieldText id="author" label="Author Name" value={state.author} onChange={(v) => set("author", v)} />
                  <div>
                    <Label htmlFor="datePublished" className="mb-1.5 block">Date Published</Label>
                    <Input
                      id="datePublished"
                      type="date"
                      value={state.datePublished}
                      onChange={(e) => set("datePublished", e.target.value)}
                      className="rounded-2xl h-12"
                      data-testid="input-date-published"
                    />
                  </div>
                  <FieldText id="image-a" label="Image URL" value={state.image} onChange={(v) => set("image", v)} type="url" />
                </>
              )}

              {type === "Product" && (
                <>
                  <FieldText id="name-p" label="Product Name" value={state.name} onChange={(v) => set("name", v)} />
                  <FieldArea id="description-p" label="Description" value={state.description} onChange={(v) => set("description", v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <FieldText id="price" label="Price" value={state.price} onChange={(v) => set("price", v)} type="number" placeholder="29.99" />
                    <FieldText id="currency" label="Currency" value={state.currency} onChange={(v) => set("currency", v)} placeholder="USD" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldText id="brand" label="Brand" value={state.brand} onChange={(v) => set("brand", v)} />
                    <FieldText id="sku" label="SKU" value={state.sku} onChange={(v) => set("sku", v)} />
                  </div>
                  <FieldText id="image-p" label="Image URL" value={state.image} onChange={(v) => set("image", v)} type="url" />
                </>
              )}

              {type === "LocalBusiness" && (
                <>
                  <FieldText id="tel-lb" label="Telephone" value={state.telephone} onChange={(v) => set("telephone", v)} placeholder="+1-555-555-5555" />
                  <FieldText id="priceRange" label="Price Range" value={state.priceRange} onChange={(v) => set("priceRange", v)} placeholder="$$" />
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</div>
                    <FieldText id="streetAddress" label="Street Address" value={state.streetAddress} onChange={(v) => set("streetAddress", v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <FieldText id="addressLocality" label="City" value={state.addressLocality} onChange={(v) => set("addressLocality", v)} />
                      <FieldText id="addressRegion" label="State / Region" value={state.addressRegion} onChange={(v) => set("addressRegion", v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FieldText id="postalCode" label="Postal Code" value={state.postalCode} onChange={(v) => set("postalCode", v)} />
                      <FieldText id="addressCountry" label="Country" value={state.addressCountry} onChange={(v) => set("addressCountry", v)} placeholder="US" />
                    </div>
                  </div>
                </>
              )}

              {type === "FAQPage" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Questions & Answers</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFaq}
                      className="rounded-xl gap-1.5"
                      data-testid="button-add-faq"
                    >
                      <Plus className="w-4 h-4" /> Add Q&A
                    </Button>
                  </div>
                  {faqs.map((faq, i) => (
                    <div
                      key={faq.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                      data-testid={`faq-item-${i}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Q&A #{i + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFaq(faq.id)}
                          disabled={faqs.length === 1}
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          data-testid={`button-remove-faq-${i}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                        placeholder="What is your return policy?"
                        className="rounded-xl"
                        data-testid={`input-question-${i}`}
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                        placeholder="We offer a 30-day return policy..."
                        rows={2}
                        className="rounded-xl resize-y"
                        data-testid={`input-answer-${i}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-2xl"
                data-testid="button-reset-schema"
              >
                Reset Fields
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 sm:p-7">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">JSON-LD Output</h3>
              <Button
                onClick={handleCopy}
                className="rounded-2xl bg-violet-600 hover:bg-violet-700 text-white gap-2"
                data-testid="button-copy-schema"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre
              className="bg-slate-900 text-emerald-300 p-5 rounded-2xl text-xs overflow-auto max-h-[500px] whitespace-pre-wrap break-all"
              data-testid="text-schema-output"
            >
              {output}
            </pre>
            <a
              href={validatorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:underline mt-3"
              data-testid="link-validator"
            >
              Validate with Schema.org Validator <ExternalLink className="w-3 h-3" />
            </a>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}

function FieldText({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-2xl h-12"
        data-testid={`input-${id}`}
      />
    </div>
  );
}

function FieldArea({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="rounded-2xl resize-y"
        data-testid={`input-${id}`}
      />
    </div>
  );
}
