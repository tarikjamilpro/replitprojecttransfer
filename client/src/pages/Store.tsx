import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, ExternalLink, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import type { DigitalProduct } from "@shared/schema";
import { SEO } from "@/components/SEO";

const TELEGRAM_URL = "https://t.me/digibesttools";
const FALLBACK_IMG = "https://picsum.photos/seed/digibest/600/360";

function formatPrice(price: string | number): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export default function Store() {
  const { data: products, isLoading, isError } = useQuery<DigitalProduct[]>({
    queryKey: ["/api/store/products"],
  });

  const buyNow = () => {
    window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <SEO
        title="Digital Products Store | Digi Best Tools"
        description="Premium digital tools, accounts, scripts and subscriptions at affordable prices. Buy securely via Telegram — instant delivery."
        canonicalUrl="https://digibesttools.site/store"
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-semibold mb-2">
                <ShoppingBag className="w-4 h-4" /> Store
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Digital Products
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1.5">
                Premium digital tools, accounts & scripts — instant delivery on Telegram.
              </p>
            </div>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-sm font-medium self-start sm:self-auto"
              data-testid="link-telegram-contact"
            >
              <ExternalLink className="w-4 h-4" /> Contact on Telegram
            </a>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20" data-testid="loading-products">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
          )}

          {isError && (
            <Card className="border-red-200 dark:border-red-900/30">
              <CardContent className="p-8 flex flex-col items-center text-center" data-testid="error-products">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <p className="font-medium text-slate-900 dark:text-white">Couldn't load products</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please try again in a moment.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && (!products || products.length === 0) && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-12 flex flex-col items-center text-center" data-testid="empty-products">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-lg font-semibold text-slate-900 dark:text-white">No products yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Check back soon — new digital products are added regularly.
                </p>
                <Link
                  to="/"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium"
                >
                  Browse Free Tools
                </Link>
              </CardContent>
            </Card>
          )}

          {!isLoading && !isError && products && products.length > 0 && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
              data-testid="product-grid"
            >
              {products.map((p) => {
                const out = p.stockStatus === "out_of_stock";
                return (
                  <Card
                    key={p.id}
                    className="overflow-hidden flex flex-col border-slate-200 dark:border-slate-800 hover-elevate transition-shadow"
                    data-testid={`product-card-${p.id}`}
                  >
                    <div className="aspect-[5/3] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      <img
                        src={p.imageUrl || FALLBACK_IMG}
                        alt={p.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          if (el.src !== FALLBACK_IMG) el.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-2" data-testid={`text-product-title-${p.id}`}>
                          {p.title}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                            out
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          }`}
                          data-testid={`badge-stock-${p.id}`}
                        >
                          {out ? "Out of Stock" : "In Stock"}
                        </span>
                      </div>

                      {p.category && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-2 uppercase tracking-wide">
                          {p.category}
                        </p>
                      )}

                      <p
                        className="text-sm text-slate-600 dark:text-slate-400 flex-1 mb-4 line-clamp-3"
                        data-testid={`text-product-desc-${p.id}`}
                      >
                        {p.shortDescription || "Premium digital product — fast delivery."}
                      </p>

                      <div className="flex items-center justify-between mt-auto gap-2">
                        <span
                          className="text-2xl font-bold text-slate-900 dark:text-white"
                          data-testid={`text-product-price-${p.id}`}
                        >
                          {formatPrice(p.price)}
                        </span>
                        <Button
                          onClick={buyNow}
                          disabled={out}
                          className={`rounded-2xl px-5 ${
                            out
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-not-allowed"
                              : "bg-violet-600 hover:bg-violet-700 text-white"
                          }`}
                          data-testid={`button-buy-${p.id}`}
                        >
                          {out ? "Unavailable" : "Buy Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
