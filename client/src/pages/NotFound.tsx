import { ArrowLeft, Compass, Home } from "lucide-react";
import { useLocation } from "wouter";

const emblem = "/manus-storage/genesis-emblem_10c5431a.png";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="min-h-screen bg-[#f2eee4] text-[#18241f] px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-[#18241f]/15 pb-5">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="group flex items-center gap-3 text-left"
            aria-label="DSAI home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c85a3f]/40 bg-[#18241f] p-2 shadow-[0_8px_22px_rgba(24,36,31,0.12)]">
              <img src={emblem} alt="DSAI emblem" className="h-full w-full object-contain" />
            </span>
            <span className="font-display text-xl tracking-[0.18em] text-[#18241f]">DSAI</span>
          </button>
          <span className="hidden text-[10px] uppercase tracking-[0.28em] text-[#18241f]/55 sm:block">
            Civic Signal / Orientation
          </span>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="relative mx-auto flex aspect-square w-full max-w-[360px] items-center justify-center rounded-full border border-[#c85a3f]/45 bg-[#18241f] shadow-[0_24px_70px_rgba(24,36,31,0.18)]">
            <div className="absolute inset-8 rounded-full border border-[#d7a34b]/45" />
            <div className="absolute inset-16 rounded-full border border-[#f2eee4]/20" />
            <span className="absolute left-[14%] top-[28%] h-3 w-3 rounded-full bg-[#d7a34b] shadow-[0_0_0_7px_rgba(215,163,75,0.12)]" />
            <span className="absolute right-[19%] top-[47%] h-3 w-3 rounded-full bg-[#963a28] shadow-[0_0_0_7px_rgba(200,90,63,0.14)]" />
            <span className="absolute bottom-[22%] left-[31%] h-3 w-3 rounded-full bg-[#f2eee4] shadow-[0_0_0_7px_rgba(242,238,228,0.12)]" />
            <div className="absolute left-[18%] top-[30%] h-px w-[58%] rotate-[18deg] bg-[#963a28]" />
            <div className="absolute left-[30%] top-[50%] h-px w-[40%] -rotate-[28deg] bg-[#d7a34b]" />
            <div className="relative text-center text-[#f2eee4]">
              <p className="mb-2 text-[11px] uppercase tracking-[0.32em] text-[#d7a34b]">Signal 404</p>
              <p className="font-display text-7xl leading-none">৪০৪</p>
              <p className="mt-3 text-xs tracking-[0.16em] text-[#f2eee4]/70">পথটি এখনো মানচিত্রে নেই</p>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-[#c85a3f]/35 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#963a28]">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Re-route / পথ ঠিক করুন</span>
            </div>
            <h1 className="font-display text-5xl leading-[0.98] sm:text-7xl">
              এই পাতাটি
              <br />
              <em className="text-[#963a28]">পাওয়া যায়নি।</em>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#18241f]/72 sm:text-lg">
              আপনি যে পথটি খুঁজছেন সেটি হয় সরানো হয়েছে, নয়তো এখনো প্রকাশিত হয়নি। DSAI-এর মূল মানচিত্রে ফিরে গিয়ে পরবর্তী দায়িত্বশীল ধাপটি বেছে নিন।
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="inline-flex items-center justify-center gap-3 bg-[#963a28] px-6 py-3.5 text-sm font-semibold text-[#f2eee4] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                মূল পথে ফিরুন
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-3 border border-[#18241f]/25 px-6 py-3.5 text-sm font-semibold text-[#18241f] transition-colors hover:border-[#c85a3f] hover:text-[#963a28]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                আগের ধাপে ফিরুন
              </button>
            </div>
            <p className="mt-12 border-l-2 border-[#d7a34b] pl-4 text-xs leading-6 text-[#18241f]/55">
              মানুষের প্রয়োজনের পাশে, প্রতিটি অনিশ্চিত ধাপে মানব যাচাই গুরুত্বপূর্ণ।
            </p>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-[#18241f]/15 pt-5 text-[10px] uppercase tracking-[0.18em] text-[#18241f]/55 sm:flex-row sm:items-center sm:justify-between">
          <span>DSAI / Human-gated AI access</span>
          <span>Open · Bengali-first · Fair-use</span>
        </footer>
      </div>
    </main>
  );
}
