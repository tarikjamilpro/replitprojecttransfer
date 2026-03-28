import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";

const STORAGE_KEY = "tg_modal_closed_at";
const SUPPRESS_HOURS = 24;
const TELEGRAM_URL = "https://t.me/digibestresource";

function shouldShow(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const closedAt = parseInt(raw, 10);
    const hoursSince = (Date.now() - closedAt) / (1000 * 60 * 60);
    return hoursSince >= SUPPRESS_HOURS;
  } catch {
    return true;
  }
}

function markClosed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {}
}

export function TelegramPopupModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldShow()) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setVisible(false);
    markClosed();
  };

  const joinTelegram = () => {
    window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
    close();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      data-testid="overlay-telegram-modal"
    >
      <div className="max-w-md w-[90%] mx-auto rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">

        <div className="bg-gradient-to-br from-[#8a2be2] to-[#6a0dad] p-8 text-center relative">
          <button
            onClick={close}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            data-testid="button-close-telegram-modal"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-5xl mb-4 select-none">🚀</div>

          <h2 className="text-white font-bold text-xl mb-3">
            Join Our Telegram Channel
          </h2>

          <p className="text-gray-200 text-sm leading-relaxed">
            Get the latest{" "}
            <strong className="text-white font-semibold">Update Methods</strong>,{" "}
            <strong className="text-white font-semibold">Earning Opportunities</strong>, and{" "}
            <strong className="text-white font-semibold">Free Courses</strong>{" "}
            directly on our Telegram channel. Stay connected and never miss any update.
          </p>
        </div>

        <div className="bg-white p-6">
          <button
            onClick={joinTelegram}
            className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-[#9d4edd] to-[#5a189a] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            data-testid="button-join-telegram"
          >
            <Send className="w-4 h-4" />
            Join Telegram Now
          </button>

          <button
            onClick={close}
            className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="button-dismiss-telegram-modal"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
