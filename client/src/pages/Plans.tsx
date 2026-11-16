import { ArrowRight, Check, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free / শুরু",
    eyebrow: "শিখুন ও যাচাই করুন",
    description: "DSAI-এর Bengali-first Workdesk, knowledge layer এবং preview workflow দিয়ে শুরু করুন।",
    features: ["Bengali, Banglish ও English intake", "Preview-first work packet", "Evidence ও human-review boundary", "Public Learn ও capability guide"],
    action: "শুরু করুন",
    href: "/",
    tone: "border-border",
  },
  {
    name: "Pro / কাজের গতি",
    eyebrow: "উন্নত workflow-এর জন্য",
    description: "নিয়মিত কাজের জন্য প্রস্তাবিত সুবিধার স্তর।",
    features: ["বর্ধিত workflow quota", "Client-response planning ও follow-up workspace", "Quality gate ও trace visibility", "Priority onboarding ও support path"],
    action: "Pro সম্পর্কে জানুন",
    href: "mailto:eventai@banglarvoice24news.com?subject=DSAI%20Pro%20inquiry",
    tone: "border-[#c86b4a] shadow-[0_20px_60px_rgba(200,107,74,0.18)]",
    featured: true,
  },
  {
    name: "Enterprise / প্রতিষ্ঠান",
    eyebrow: "দলের জন্য পরিকল্পিত সুবিধা",
    description: "প্রতিষ্ঠানের প্রয়োজন অনুযায়ী সেবা ও ব্যবহার পরিকল্পনা।",
    features: ["Custom workflow discovery", "Read-only pilot ও approval design", "Audit, retention ও governance review", "পরিকল্পনা ও সহায়তা"],
    action: "Enterprise inquiry",
    href: "mailto:eventai@banglarvoice24news.com?subject=DSAI%20Enterprise%20inquiry",
    tone: "border-border",
  },
];

export default function Plans() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl tracking-[0.18em] text-foreground">DSAI</Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/governance" className="text-muted-foreground transition-colors hover:text-foreground">Governance</Link>
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          </div>
        </div>
      </header>

      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 border border-[#c9a34c]/50 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#9b7b2e]"><Sparkles className="h-3.5 w-3.5" /> স্পষ্ট মূল্য, সঠিক সীমা</div>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">আপনার কাজের পরবর্তী ধাপটি বেছে নিন।</h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">DSAI-এর plan ও সুবিধা আপনার প্রয়োজন অনুযায়ী সাজানো। কোনো paid plan চালু হলে মূল্য ও শর্ত আগে স্পষ্টভাবে জানানো হবে; আপনার অনুমতি ছাড়া কোনো charge নেওয়া হবে না।</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative flex h-full flex-col rounded-none bg-card/80 ${plan.tone}`}>
              {plan.featured && <div className="absolute right-4 top-4 rounded-full bg-[#c86b4a]/10 px-3 py-1 text-xs font-semibold text-[#a84e32]">প্রস্তাবিত</div>}
              <CardHeader className="space-y-4">
                <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{plan.eyebrow}</div>
                <CardTitle className="font-serif text-3xl">{plan.name}</CardTitle>
                <CardDescription className="min-h-20 text-sm leading-7">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="space-y-3 border-y border-border/70 py-5 text-sm">
                  {plan.features.map((feature) => <div key={feature} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b48732]" /> <span>{feature}</span></div>)}
                </div>
                <a href={plan.href} className="mt-auto pt-6">
                  <Button className="w-full rounded-none" variant={plan.featured ? "default" : "outline"}>{plan.action}<ArrowRight className="ml-2 h-4 w-4" /></Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
          <div className="flex gap-3 border border-border/70 p-5"><LockKeyhole className="h-5 w-5 shrink-0 text-[#b48732]" /><div><p className="font-semibold">Hosted checkout boundary</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Card number, CVV, wallet PIN বা OTP DSAI-তে রাখা হবে না।</p></div></div>
          <div className="flex gap-3 border border-border/70 p-5"><ShieldCheck className="h-5 w-5 shrink-0 text-[#b48732]" /><div><p className="font-semibold">Verified entitlement</p><p className="mt-1 text-sm leading-6 text-muted-foreground">কোনো plan চালু করার আগে মূল্য ও শর্ত দেখে আপনার সম্মতি প্রয়োজন।</p></div></div>
          <div className="flex gap-3 border border-border/70 p-5"><Mail className="h-5 w-5 shrink-0 text-[#b48732]" /><div><p className="font-semibold">মানুষের সহায়তা</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Pro ও Enterprise inquiry: eventai@banglarvoice24news.com</p></div></div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-6 text-muted-foreground">বর্তমান pageটি transparent interest/plan surface। এটি live payment confirmation নয়। মূল্য, tax/VAT, refund, renewal, quota এবং service availability merchant agreement ও final product policy অনুযায়ী প্রকাশ করতে হবে। <Link href="/governance" className="underline underline-offset-4">Governance ও ownership policy দেখুন</Link>।</p>
      </section>
    </main>
  );
}
