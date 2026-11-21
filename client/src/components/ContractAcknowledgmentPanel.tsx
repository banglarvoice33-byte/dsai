import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Copy, FileCheck2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ContractAcknowledgmentPanel() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const auth = trpc.auth.me.useQuery();
  const status = trpc.contractAcknowledgment.status.useQuery(undefined, { enabled: Boolean(auth.data), retry: false });
  const history = trpc.contractAcknowledgment.list.useQuery(undefined, {
    enabled: status.data?.enabled === true,
    retry: false,
  });
  const create = trpc.contractAcknowledgment.create.useMutation({
    onSuccess: result => {
      const url = new URL(`/confirm/${result.token}`, window.location.origin).toString();
      setShareUrl(url);
      void history.refetch();
      toast.success("একবার ব্যবহারযোগ্য নিশ্চিতকরণ লিংক তৈরি হয়েছে।");
    },
    onError: error => toast.error(error.message || "নিশ্চিতকরণ লিংক তৈরি করা যায়নি।"),
  });

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("লিংক কপি হয়েছে। নির্দিষ্ট প্রাপকের সঙ্গে নিজে শেয়ার করুন।");
    } catch {
      toast.error("লিংক কপি করা যায়নি। লিংকটি নির্বাচন করে কপি করুন।");
    }
  };

  return <section className="composer-result saved-drafts space-y-4" aria-labelledby="contract-ack-title">
    <div className="result-meta"><span>চূড়ান্ত ধাপ · নথি গ্রহণ নিশ্চিতকরণ</span><span><ShieldCheck size={14} className="inline" /> একবার ব্যবহারযোগ্য</span></div>
    <h2 id="contract-ack-title">গ্রাহকের কাছ থেকে নথি গ্রহণ নিশ্চিত করুন</h2>
    <p className="form-boundary">এখানে দেওয়া সম্পূর্ণ লেখার একটি অপরিবর্তনীয় snapshot ও SHA-256 hash সংরক্ষণ হবে। প্রাপক লিংক খুলে নথি দেখে অন্তত ৩ সেকেন্ড পর গ্রহণ নিশ্চিত করতে পারবেন। DSAI নিজে কোনো ইমেইল বা SMS পাঠাবে না।</p>
    <p className="form-boundary"><strong>গুরুত্বপূর্ণ সীমা:</strong> এটি নথি দেখা/প্রাপ্তির acknowledgment; পরিচয়-যাচাইকৃত বা আইনগত ই-স্বাক্ষর নয়। প্রয়োজন হলে আলাদা আইনসম্মত e-signature সেবা ব্যবহার করুন।</p>
    {auth.isLoading || status.isLoading ? <p role="status" className="text-sm text-muted-foreground">সুবিধার অবস্থা যাচাই হচ্ছে…</p>
      : !auth.data ? <p role="status" className="text-sm text-muted-foreground">নথি গ্রহণ নিশ্চিতকরণ তৈরি করতে আগে <a className="underline" href="/auth/login?returnTo=%2Fworkspace%3Fpanel%3Dfiles">প্রবেশ করুন</a>।</p>
      : status.isError ? <p role="alert" className="text-sm text-destructive">নিশ্চিতকরণ সুবিধার অবস্থা পাওয়া যায়নি।</p>
      : !status.data?.enabled ? <p role="status" className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">এই সুবিধা এখনো বন্ধ আছে। ডেটাবেস migration, security tests এবং production acceptance সম্পন্ন হলে প্রশাসক এটি চালু করবেন। এখন কোনো নিশ্চিতকরণ লিংক তৈরি হবে না।</p>
      : <>
        <form className="space-y-3" onSubmit={event => {
          event.preventDefault();
          create.mutate({ title, body, recipientName, recipientEmail });
        }}>
          <label className="block text-sm font-medium">নথির শিরোনাম
            <input className="mt-1 w-full rounded-lg border bg-background p-3" value={title} onChange={event => setTitle(event.target.value)} maxLength={240} required />
          </label>
          <label className="block text-sm font-medium">চূড়ান্ত নথির সম্পূর্ণ লেখা (ফাইল থেকে সংগৃহীত লেখা এখানে পেস্ট করুন)
            <textarea className="mt-1 w-full rounded-lg border bg-background p-3 leading-7" value={body} onChange={event => setBody(event.target.value)} minLength={1} maxLength={30000} rows={8} required placeholder="Work Desk থেকে TXT/CSV/JSON লেখা সংগ্রহ করে সম্পূর্ণ চূড়ান্ত লেখা এখানে পেস্ট করুন। শুধু এই লেখাটিই snapshot ও hash হবে; মূল PDF/ছবি ফাইল নয়।" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">প্রাপকের নাম
              <input className="mt-1 w-full rounded-lg border bg-background p-3" value={recipientName} onChange={event => setRecipientName(event.target.value)} minLength={2} maxLength={160} required />
            </label>
            <label className="block text-sm font-medium">প্রাপকের ইমেইল (রেকর্ডের জন্য)
              <input className="mt-1 w-full rounded-lg border bg-background p-3" type="email" value={recipientEmail} onChange={event => setRecipientEmail(event.target.value)} maxLength={320} required />
            </label>
          </div>
          <Button type="submit" disabled={create.isPending || title.trim().length < 1 || body.trim().length < 1 || recipientName.trim().length < 2 || !recipientEmail.includes("@")}>
            {create.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> তৈরি হচ্ছে…</> : <><FileCheck2 className="mr-2 h-4 w-4" /> নিশ্চিতকরণ লিংক তৈরি করুন</>}
          </Button>
        </form>
        {shareUrl && <div className="rounded-xl border bg-muted/40 p-3 space-y-2">
          <strong className="text-sm">লিংকটি এখনই কপি করে প্রাপকের সঙ্গে শেয়ার করুন</strong>
          <p className="break-all text-sm">{shareUrl}</p>
          <Button type="button" size="sm" variant="outline" onClick={() => void copyLink()}><Copy className="mr-2 h-4 w-4" /> লিংক কপি</Button>
          <p className="text-xs text-muted-foreground">নিরাপত্তার কারণে লিংকের গোপন token শুধু একবার দেখানো হয়। পৃষ্ঠা বন্ধ করার আগে কপি করে রাখুন। লিংকটি যার কাছে থাকবে, সে ব্যবহার করতে পারবে; ইমেইল মালিকানা যাচাই করা হয় না। মেয়াদ ৭ দিন।</p>
        </div>}
        <div className="space-y-2">
          <h3 className="font-semibold">সাম্প্রতিক নিশ্চিতকরণ</h3>
          {history.isLoading ? <p className="text-sm text-muted-foreground">লোড হচ্ছে…</p>
            : history.isError ? <p role="alert" className="text-sm text-destructive">ইতিহাস পাওয়া যায়নি।</p>
            : history.data?.length ? history.data.map((item: any) => <article key={item.id} className="rounded-lg border p-3 text-sm">
              <strong>{item.title}</strong>
              <p className="text-muted-foreground">{item.recipient_name} · {item.recipient_email}</p>
              <p>{item.status === "acknowledged" ? "গ্রহণ নিশ্চিত" : new Date(item.expires_at).getTime() <= Date.now() ? "মেয়াদ শেষ" : "অপেক্ষমাণ"}</p>
              <p className="break-all text-xs text-muted-foreground">SHA-256: {item.document_sha256}</p>
              {item.acknowledged_at && <p className="text-xs text-muted-foreground">নিশ্চিতের সময়: {new Date(item.acknowledged_at).toLocaleString("bn-BD")}</p>}
            </article>) : <p className="text-sm text-muted-foreground">এখনো কোনো নিশ্চিতকরণ লিংক তৈরি হয়নি।</p>}
        </div>
      </>}
  </section>;
}
