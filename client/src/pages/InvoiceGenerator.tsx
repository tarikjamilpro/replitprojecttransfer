import { useState, useRef, useCallback, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Download, Send, Upload, FileText } from "lucide-react";
import { AdInterstitial, useAdInterstitial } from "@/components/AdInterstitial";

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD – US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR – Euro" },
  { code: "GBP", symbol: "£", label: "GBP – British Pound" },
  { code: "INR", symbol: "₹", label: "INR – Indian Rupee" },
  { code: "CAD", symbol: "CA$", label: "CAD – Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "AUD – Australian Dollar" },
  { code: "JPY", symbol: "¥", label: "JPY – Japanese Yen" },
  { code: "CNY", symbol: "¥", label: "CNY – Chinese Yuan" },
  { code: "CHF", symbol: "CHF", label: "CHF – Swiss Franc" },
  { code: "SGD", symbol: "S$", label: "SGD – Singapore Dollar" },
];

interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

function newItem(id: string): LineItem {
  return { id, description: "", qty: 1, rate: 0 };
}

function fmt(symbol: string, value: number) {
  return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvoiceGenerator() {
  const uid = useId();
  const { toast } = useToast();
  const { showInterstitial, requestAction, handleContinue } = useAdInterstitial();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("INVOICE");
  const [from, setFrom] = useState("");
  const [billTo, setBillTo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState<LineItem[]>([newItem(`${uid}-0`)]);
  const [taxPct, setTaxPct] = useState<number>(0);
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const taxAmt = subtotal * (taxPct / 100);
  const discountAmt = subtotal * (discountPct / 100);
  const total = subtotal + taxAmt - discountAmt + shipping;

  const addItem = () =>
    setItems((prev) => [...prev, newItem(`${uid}-${Date.now()}`)]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const doDownload = useCallback(async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: "DigiBestTools-Invoice.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(invoiceRef.current)
        .save();
    } catch {
      toast({ title: "Download failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  }, [toast]);

  const handleDownload = () => requestAction(doDownload);

  const handleSend = () => {
    const subject = encodeURIComponent(`Invoice #${invoiceNo}`);
    const body = encodeURIComponent(`Please find attached Invoice #${invoiceNo} for ${fmt(currency.symbol, total)}.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const fieldClass =
    "border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus-visible:ring-0 rounded-none bg-transparent px-0 text-sm placeholder:text-gray-300 transition-colors";

  const numClass =
    "border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus-visible:ring-0 rounded-none bg-transparent px-0 text-sm placeholder:text-gray-300 text-right transition-colors";

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <title>DigiBestTools – Invoice Generator</title>

      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-6 items-start">

        <div
          ref={invoiceRef}
          className="w-full lg:flex-1 bg-white shadow-xl rounded-sm p-8 lg:p-12 print:shadow-none"
          style={{ minHeight: "297mm" }}
        >
          <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
            <div>
              <div
                className="w-36 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                onClick={() => logoInputRef.current?.click()}
                data-testid="button-upload-logo"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain rounded" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-300 group-hover:text-blue-400 mb-1" />
                    <span className="text-xs text-gray-300 group-hover:text-blue-400">+ Add Logo</span>
                  </>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </div>
            <div className="flex-1 text-right">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-4xl font-bold text-gray-800 border-0 bg-transparent text-right w-full focus:outline-none focus:border-b-2 focus:border-blue-300"
                data-testid="input-title"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <Textarea
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Who is this from? (Name, address, email…)"
                className={`${fieldClass} resize-none min-h-[80px]`}
                data-testid="textarea-from"
              />
              <Textarea
                value={billTo}
                onChange={(e) => setBillTo(e.target.value)}
                placeholder="Bill To (Client name, address…)"
                className={`${fieldClass} resize-none min-h-[80px]`}
                data-testid="textarea-bill-to"
              />
              <Textarea
                value={shipTo}
                onChange={(e) => setShipTo(e.target.value)}
                placeholder="Ship To (optional)"
                className={`${fieldClass} resize-none min-h-[60px]`}
                data-testid="textarea-ship-to"
              />
            </div>

            <div className="space-y-2">
              {[
                { label: "Invoice #", value: invoiceNo, setter: setInvoiceNo, type: "text", testId: "input-invoice-no" },
                { label: "Date", value: date, setter: setDate, type: "date", testId: "input-date" },
                { label: "Payment Terms", value: paymentTerms, setter: setPaymentTerms, type: "text", testId: "input-payment-terms" },
                { label: "Due Date", value: dueDate, setter: setDueDate, type: "date", testId: "input-due-date" },
              ].map(({ label, value, setter, type, testId }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-28 shrink-0 text-right">{label}</span>
                  <Input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className={numClass}
                    data-testid={testId}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left text-xs font-semibold text-gray-600 pb-2 w-1/2">Item</th>
                  <th className="text-right text-xs font-semibold text-gray-600 pb-2 w-16">Qty</th>
                  <th className="text-right text-xs font-semibold text-gray-600 pb-2 w-28">Rate</th>
                  <th className="text-right text-xs font-semibold text-gray-600 pb-2 w-28">Amount</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 group">
                    <td className="py-2 pr-4">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        placeholder="Description of service or product"
                        className={fieldClass}
                        data-testid={`input-item-description-${item.id}`}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min={0}
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, "qty", parseFloat(e.target.value) || 0)}
                        className={numClass}
                        data-testid={`input-item-qty-${item.id}`}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min={0}
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                        className={numClass}
                        data-testid={`input-item-rate-${item.id}`}
                      />
                    </td>
                    <td className="py-2 pl-2 text-right text-sm text-gray-700 font-medium whitespace-nowrap">
                      {fmt(currency.symbol, item.qty * item.rate)}
                    </td>
                    <td className="py-2 pl-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                        data-testid={`button-remove-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
              data-testid="button-add-item"
            >
              <Plus className="w-4 h-4" />
              Line Item
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mt-8">
            <div className="flex-1 space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes – any relevant information not already covered"
                className={`${fieldClass} resize-none min-h-[60px]`}
                data-testid="textarea-notes"
              />
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Terms and conditions"
                className={`${fieldClass} resize-none min-h-[60px]`}
                data-testid="textarea-terms"
              />
            </div>

            <div className="md:w-64 shrink-0 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600 py-1">
                <span>Subtotal</span>
                <span data-testid="text-subtotal">{fmt(currency.symbol, subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 py-1 border-t border-gray-100">
                <span>Tax (%)</span>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={taxPct}
                    onChange={(e) => setTaxPct(parseFloat(e.target.value) || 0)}
                    className="w-16 text-right border-b border-gray-200 focus:border-blue-400 focus-visible:ring-0 rounded-none bg-transparent px-0 text-sm h-6"
                    data-testid="input-tax"
                  />
                  <span className="text-gray-400 text-xs">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 py-1 border-t border-gray-100">
                <span>Tax Amount</span>
                <span data-testid="text-tax-amount">{fmt(currency.symbol, taxAmt)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 py-1 border-t border-gray-100">
                <span>Discount (%)</span>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPct}
                    onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                    className="w-16 text-right border-b border-gray-200 focus:border-blue-400 focus-visible:ring-0 rounded-none bg-transparent px-0 text-sm h-6"
                    data-testid="input-discount"
                  />
                  <span className="text-gray-400 text-xs">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 py-1 border-t border-gray-100">
                <span>Discount Amount</span>
                <span className="text-red-500" data-testid="text-discount-amount">-{fmt(currency.symbol, discountAmt)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 py-1 border-t border-gray-100">
                <span>Shipping</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-xs">{currency.symbol}</span>
                  <Input
                    type="number"
                    min={0}
                    value={shipping}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-20 text-right border-b border-gray-200 focus:border-blue-400 focus-visible:ring-0 rounded-none bg-transparent px-0 text-sm h-6"
                    data-testid="input-shipping"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-800 text-white rounded-lg px-3 py-2.5 mt-2">
                <span className="font-semibold text-sm">Balance Due</span>
                <span className="font-bold text-base" data-testid="text-total">
                  {fmt(currency.symbol, total)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-300">
              Invoice generated by{" "}
              <span className="font-semibold text-gray-400">DigiBestTools</span>
            </p>
          </div>
        </div>

        <div className="lg:w-52 shrink-0 flex flex-col gap-3 lg:sticky lg:top-6">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 shadow-md"
            data-testid="button-download-pdf"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Generating…" : "Download PDF"}
          </Button>

          <Button
            onClick={handleSend}
            variant="outline"
            size="lg"
            className="w-full h-11 font-medium"
            data-testid="button-send-invoice"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Invoice
          </Button>

          <div className="mt-1">
            <p className="text-xs text-gray-500 mb-1.5 font-medium">Currency</p>
            <Select
              value={currency.code}
              onValueChange={(code) => setCurrency(CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0])}
            >
              <SelectTrigger className="w-full text-sm" data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-gray-700">Summary</span>
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Items</span>
                <span className="font-medium text-gray-700">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-700">{fmt(currency.symbol, subtotal)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-green-600">{fmt(currency.symbol, total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdInterstitial isOpen={showInterstitial} onContinue={handleContinue} toolName="Invoice Generator" />
    </div>
  );
}
