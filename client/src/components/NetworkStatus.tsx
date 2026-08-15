import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function NetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [visible, setVisible] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setVisible(true);
      const timer = window.setTimeout(() => setVisible(false), 2600);
      return () => window.clearTimeout(timer);
    };
    const handleOffline = () => {
      setOnline(false);
      setVisible(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-20 z-[70] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur sm:inset-x-auto sm:right-5 ${
        online
          ? "border-emerald-200 bg-emerald-50/95 text-emerald-950"
          : "border-amber-200 bg-amber-50/95 text-amber-950"
      }`}
    >
      {online ? <Wifi className="h-4 w-4 shrink-0" aria-hidden="true" /> : <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />}
      <span>
        {online
          ? "সংযোগ ফিরে এসেছে। নতুন তথ্য পেতে প্রয়োজন হলে আবার চেষ্টা করুন।"
          : "আপনি offline। আগে খোলা DSAI পেজ দেখা যাবে; নতুন draft বা account action-এর জন্য সংযোগ প্রয়োজন।"}
      </span>
      {!online && (
        <button
          type="button"
          className="ml-auto shrink-0 rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
          onClick={() => window.location.reload()}
        >
          আবার চেষ্টা
        </button>
      )}
    </div>
  );
}
