import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

type SimpleInfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  cards: Array<{ title: string; body: string; href: string }>;
};

export default function SimpleInfoPage({ eyebrow, title, description, cards }: SimpleInfoPageProps) {
  return <main className="min-h-screen bg-[#f4f1e9] px-4 py-6 text-[#18241f] sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl">
      <header className="flex items-center justify-between border-b border-[#18241f]/15 pb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#18241f]/65"><ArrowLeft size={16}/> মূল পৃষ্ঠা</Link>
        <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#963a28]">DSAI</span>
      </header>
      <section className="py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#963a28]">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#18241f]/70">{description}</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => <article key={card.title} className="border border-[#18241f]/15 bg-white/60 p-6">
          <Sparkles className="h-6 w-6 text-[#963a28]" />
          <h2 className="mt-5 font-display text-2xl">{card.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#18241f]/65">{card.body}</p>
          <Link href={card.href} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#963a28]">শুরু করুন <ArrowRight size={15}/></Link>
        </article>)}
      </section>
    </div>
  </main>;
}
