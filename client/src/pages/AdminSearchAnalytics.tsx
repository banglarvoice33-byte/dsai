import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BarChart3, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";

export default function AdminSearchAnalytics() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const input = useMemo(() => ({ limit: 50 }), []);
  const analytics = trpc.admin.searchAnalytics.list.useQuery(input, { enabled: user?.role === "admin", retry: false });
  const rows = analytics.data ?? [];
  const totalSearches = rows.reduce((total, row) => total + row.searchCount, 0);
  const topTerm = rows[0];

  if (loading) return <div className="min-h-screen bg-[#f2eee4] flex items-center justify-center"><Loader2 className="animate-spin text-[#c85a3f]" /></div>;
  if (!user) return <main className="min-h-screen bg-[#f2eee4] p-8 flex items-center justify-center"><div className="max-w-md text-center"><p className="learn-label">DSAI / SEARCH INSIGHTS</p><h1 className="font-display text-4xl mt-4">প্রথমে sign in করুন।</h1><Button onClick={() => startLogin()} className="mt-8 bg-[#c85a3f]">Sign in / create account</Button></div></main>;
  if (user.role !== "admin") return <main className="min-h-screen bg-[#f2eee4] p-8 flex items-center justify-center"><div className="max-w-md text-center"><ShieldCheck className="mx-auto text-[#c85a3f]" /><h1 className="font-display text-4xl mt-4">Admin permission প্রয়োজন।</h1><Button onClick={() => setLocation("/")} variant="outline" className="mt-8">মূল সাইটে ফিরুন</Button></div></main>;

  return <main className="admin-search-page"><div className="admin-search-shell">
    <header className="admin-search-header"><button onClick={() => setLocation("/")} className="inline-flex items-center gap-2"><ArrowLeft size={16} /> DSAI</button><div><p className="learn-label">ADMIN / SEARCH INSIGHTS</p><h1>Search analytics</h1></div><span className="admin-role"><ShieldCheck size={14} /> admin</span></header>
    <div className="admin-search-notice"><BarChart3 size={18} /><p>এখানে শুধু user-এর নির্বাচিত search phrase-এর normalized aggregate দেখা যায়। কোনো user ID, IP address, device fingerprint বা keystroke সংরক্ষণ করা হয় না।</p></div>
    <section className="admin-search-summary" aria-label="Search analytics summary"><article><span>TRACKED TERMS</span><strong>{rows.length}</strong><small>সাম্প্রতিক ৫০টি aggregate term</small></article><article><span>TOTAL SELECTIONS</span><strong>{totalSearches}</strong><small>এই তালিকায় মোট recorded selection</small></article><article><span>TOP TERM</span><strong>{topTerm?.searchCount ?? 0}</strong><small>{topTerm?.normalizedTerm || "এখনো কোনো search নেই"}</small></article></section>
    <section className="admin-search-toolbar"><div><h2>কোন বিষয়গুলো বেশি খোঁজা হচ্ছে?</h2><p>Search suggestion বা Enter selection-এর সময় একটি aggregate count বাড়ে। টাইপ করার প্রতিটি অক্ষর record হয় না।</p></div><Button variant="outline" onClick={() => void analytics.refetch()} disabled={analytics.isFetching}><RefreshCw size={15} className={analytics.isFetching ? "animate-spin" : ""} /> Refresh</Button></section>
    <section className="admin-search-list" aria-label="Top search terms">{analytics.isLoading ? <div className="admin-search-empty"><Loader2 className="animate-spin" /></div> : analytics.isError ? <div className="admin-search-empty"><h2>Analytics লোড হয়নি</h2><p>আবার Refresh করুন অথবা server/database connection যাচাই করুন।</p></div> : rows.length ? rows.map((row, index) => <article key={`${row.source}-${row.normalizedTerm}`} className="admin-search-row"><span className="admin-search-rank">{String(index + 1).padStart(2, "0")}</span><div><h3>{row.normalizedTerm}</h3><p>Source: {row.source} · সর্বশেষ: {new Date(row.lastSearchedAt).toLocaleString("bn-BD")}</p></div><strong>{row.searchCount}<small> searches</small></strong></article>) : <div className="admin-search-empty"><BarChart3 size={22} /><h2>এখনো কোনো search selection নেই।</h2><p>Homepage search থেকে user কোনো result বেছে নিলে aggregate trend এখানে দেখা যাবে।</p></div>}</section>
  </div></main>;
}
