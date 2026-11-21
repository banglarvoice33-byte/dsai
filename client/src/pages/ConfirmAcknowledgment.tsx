import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock3, Loader2, ShieldCheck } from "lucide-react";

type OpenResult = {
  status: string;
  message?: string;
  snapshot?: { version: 1; title: string; body: string };
  documentSha256?: string;
  recipientName?: string;
  firstViewedAt?: string | null;
  expiresAt?: string;
  acknowledgedAt?: string | null;
  acknowledgmentName?: string | null;
};
type ConfirmResult = { status: string; acknowledgedAt?: string; documentSha256?: string; confirmAt?: string };

export default function ConfirmAcknowledgment() {
  const [, params] = useRoute("/confirm/:token");
  const token = params?.token ?? "";
  const [record, setRecord] = useState<OpenResult | null>(null);
  const [name, setName] = useState("");
  const [now, setNow] = useState(Date.now());
  const [confirmation, setConfirmation] = useState<ConfirmResult | null>(null);
  const open = trpc.contractAcknowledgment.open.useMutation({
    onSuccess: result => {
      setRecord(result as OpenResult);
      if ("recipientName" in result && result.recipientName) setName(result.recipientName);
    },
  });
  const confirm = trpc.contractAcknowledgment.confirm.useMutation({
    onSuccess: result => {
      setConfirmation(result as ConfirmResult);
      if (result.status === "acknowledged" || result.status === "already_acknowledged") {
        setRecord(current => current ? { ...current, status: "acknowledged", acknowledgedAt: result.acknowledgedAt, acknowledgmentName: name } : current);
      }
    },
  });

  useEffect(() => {
    if (token) open.mutate({ token });
  }, [token]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const firstViewedAt = record?.firstViewedAt ? new Date(record.firstViewedAt).getTime() : null;
  const confirmAt = firstViewedAt === null ? null : firstViewedAt + 3000;
  const remainingSeconds = confirmAt === null ? 3 : Math.max(0, Math.ceil((confirmAt - now) / 1000));
  const acknowledged = record?.status === "acknowledged" || confirmation?.status === "acknowledged" || confirmation?.status === "already_acknowledged";

  return <main className="page-shell">
    <div className="container narrow-content">
      <Link href="/" className="back-link">← DSAI-এর মূল পাতা</Link>
      <section className="composer-result saved-drafts space-y-4" aria-labelledby="acknowledgment-title">
        <div className="result-meta"><span>DSAI · নথি গ্রহণ নিশ্চিতকরণ</span><ShieldCheck size={18} /></div>
        <h1 id="acknowledgment-title">নথিটি দেখে গ্রহণ নিশ্চিত করুন</h1>
        <p className="form-boundary">এই পৃষ্ঠায় দেখানো নথির একটি অপরিবর্তনীয় কপি সংরক্ষিত আছে। এটি পরিচয়-যাচাইকৃত বা আইনগত ই-স্বাক্ষর নয়; শুধু নথি দেখা ও গ্রহণ নিশ্চিত করার রেকর্ড।</p>
        {open.isPending && <p role="status" className="flex items-center gap-2"><Loader2 className="animate-spin" /> নথি যাচাই করা হচ্ছে…</p>}
        {open.isError && <p role="alert" className="text-sm text-destructive">নথি খোলা যায়নি। লিংকটি সঠিক কি না এবং মেয়াদ আছে কি না প্রেরকের সঙ্গে যাচাই করুন।</p>}
        {record?.status === "disabled" && <p role="status">এই সুবিধা বর্তমানে চালু নেই। প্রেরকের সঙ্গে যোগাযোগ করুন।</p>}
        {record?.status === "invalid" && <p role="alert">লিংকটি সঠিক নয় অথবা বাতিল করা হয়েছে।</p>}
        {record?.status === "expired" && <p role="alert">এই লিংকের মেয়াদ শেষ। নতুন লিংকের জন্য প্রেরকের সঙ্গে যোগাযোগ করুন।</p>}
        {record?.snapshot && <>
          <div className="rounded-xl border p-4 space-y-3">
            <h2 className="text-xl font-semibold">{record.snapshot.title}</h2>
            <div className="whitespace-pre-wrap break-words text-sm leading-7">{record.snapshot.body}</div>
            <p className="break-all border-t pt-3 text-xs text-muted-foreground">নথির SHA-256: {record.documentSha256}</p>
            {record.expiresAt && <p className="text-xs text-muted-foreground">লিংকের মেয়াদ: {new Date(record.expiresAt).toLocaleString("bn-BD")}</p>}
          </div>
          {acknowledged ? <div role="status" className="rounded-xl border p-4 space-y-2">
            <CheckCircle2 className="text-green-700" />
            <h2 className="font-semibold">নথি গ্রহণ নিশ্চিত হয়েছে</h2>
            <p className="text-sm">নাম: {confirmation?.status === "acknowledged" ? name : record.acknowledgmentName || name}</p>
            <p className="text-sm text-muted-foreground">সময়: {record.acknowledgedAt ? new Date(record.acknowledgedAt).toLocaleString("bn-BD") : confirmation?.acknowledgedAt ? new Date(confirmation.acknowledgedAt).toLocaleString("bn-BD") : "সার্ভারে সংরক্ষিত"}</p>
            <p className="text-xs text-muted-foreground">প্রেরক এই acknowledgment-এর সময় ও নথির hash দেখতে পারবেন।</p>
          </div> : record.status === "pending" && <>
            <label className="block text-sm font-medium">আপনার নাম লিখুন
              <input className="mt-1 w-full rounded-lg border bg-background p-3" value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={160} required />
            </label>
            <p className="text-xs text-muted-foreground">নামটি আপনার নিজের দেওয়া তথ্য; DSAI এখানে পরিচয় যাচাই করে না।</p>
            {remainingSeconds > 0 ? <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 size={16} /> নথিটি দেখে নেওয়ার জন্য {remainingSeconds} সেকেন্ড অপেক্ষা করুন।</p>
              : <p className="text-sm text-muted-foreground">আপনি নথিটি দেখে থাকলে এখন গ্রহণ নিশ্চিত করতে পারেন।</p>}
            <Button type="button" disabled={remainingSeconds > 0 || name.trim().length < 2 || confirm.isPending} onClick={() => confirm.mutate({ token, acknowledgmentName: name })}>
              {confirm.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> সংরক্ষণ হচ্ছে…</> : "আমি নথিটি গ্রহণ করেছি"}
            </Button>
            {confirmation?.status === "wait" && <p role="status" className="text-sm">আরও কিছুক্ষণ অপেক্ষা করুন।</p>}
            {confirmation?.status === "expired" && <p role="alert" className="text-sm text-destructive">লিংকের মেয়াদ শেষ হয়েছে।</p>}
            {confirm.isError && <p role="alert" className="text-sm text-destructive">নিশ্চিতকরণ সংরক্ষণ হয়নি। আবার চেষ্টা করুন।</p>}
          </>}
        </>}
      </section>
    </div>
  </main>;
}
