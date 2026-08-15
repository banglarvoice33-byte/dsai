import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const statuses = ["pending", "in_review", "completed", "rejected"] as const;

export default function AdminDeletionRequests() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | typeof statuses[number]>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const utils = trpc.useUtils();
  const requests = trpc.admin.deletion.list.useQuery(undefined, { enabled: user?.role === "admin", retry: false });
  const update = trpc.admin.deletion.update.useMutation({ onSuccess: () => { toast.success("Deletion request status updated"); void utils.admin.deletion.list.invalidate(); }, onError: error => toast.error(error.message) });
  const filteredRequests = (requests.data ?? []).filter(request => {
    const date = new Date(request.createdAt);
    const afterFrom = !fromDate || date >= new Date(`${fromDate}T00:00:00`);
    const beforeTo = !toDate || date.getTime() < new Date(`${toDate}T00:00:00`).getTime() + 86400000;
    return (statusFilter === "all" || request.status === statusFilter) && afterFrom && beforeTo;
  }).sort((a, b) => sortOrder === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const clearFilters = () => { setStatusFilter("all"); setFromDate(""); setToDate(""); setSortOrder("newest"); };
  if (loading) return <div className="min-h-screen bg-[#f2eee4] flex items-center justify-center"><Loader2 className="animate-spin text-[#c85a3f]" /></div>;
  if (!user) return <main className="min-h-screen bg-[#f2eee4] p-8 flex items-center justify-center"><div className="max-w-md text-center"><p className="learn-label">DSAI / DATA RIGHTS</p><h1 className="font-display text-4xl mt-4">প্রথমে sign in করুন।</h1><Button onClick={() => startLogin()} className="mt-8 bg-[#c85a3f]">Sign in / create account</Button></div></main>;
  if (user.role !== "admin") return <main className="min-h-screen bg-[#f2eee4] p-8 flex items-center justify-center"><div className="max-w-md text-center"><ShieldCheck className="mx-auto text-[#c85a3f]" /><h1 className="font-display text-4xl mt-4">Admin permission প্রয়োজন।</h1><Button onClick={() => setLocation("/")} variant="outline" className="mt-8">মূল সাইটে ফিরুন</Button></div></main>;
  return <main className="admin-deletion-page"><div className="admin-deletion-shell"><header className="admin-deletion-header"><button onClick={() => setLocation("/")} className="inline-flex items-center gap-2"><ArrowLeft size={16} /> DSAI</button><div><p className="learn-label">ADMIN / DATA RIGHTS</p><h1>Deletion requests</h1></div><span className="admin-role"><ShieldCheck size={14} /> admin</span></header><p className="admin-deletion-warning">এই console request review করে। Status “completed” করার আগে account identity, retention obligation, linked records এবং operator/legal policy যাচাই করুন। এখানে কোনো password, API key বা raw document দেখানো হয় না।</p><section className="admin-deletion-controls" aria-label="Deletion request filters"><label>Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">সব status</option>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select></label><label>From date<input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} /></label><label>To date<input type="date" value={toDate} onChange={event => setToDate(event.target.value)} /></label><label>Sort<select value={sortOrder} onChange={event => setSortOrder(event.target.value as typeof sortOrder)}><option value="newest">নতুন আগে</option><option value="oldest">পুরনো আগে</option></select></label><button type="button" onClick={clearFilters}>Reset</button><span className="admin-filter-count">{filteredRequests.length} / {requests.data?.length ?? 0} requests</span></section><section className="admin-deletion-list">{requests.isLoading ? <Loader2 className="animate-spin" /> : filteredRequests.length ? filteredRequests.map(request => <article key={request.id} className="admin-deletion-item"><div className="admin-deletion-item-head"><div><span className="changelog-version">Request #{request.id}</span><h2>{request.email}</h2></div><span className={`admin-status ${request.status}`}>{request.status}</span></div><div className="admin-deletion-meta"><span>Scope: {request.scope}</span><span>Submitted: {new Date(request.createdAt).toLocaleString("bn-BD")}</span><span>Identity confirmed: {request.identityConfirmed ? "yes" : "no"}</span></div>{request.details && <p className="admin-deletion-details">{request.details}</p>}<div className="admin-deletion-actions"><select value={request.status} onChange={event => update.mutate({ id: request.id, status: event.target.value as typeof statuses[number], operatorNote: notes[request.id] || request.operatorNote || undefined })}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select><input value={notes[request.id] ?? request.operatorNote ?? ""} onChange={event => setNotes({ ...notes, [request.id]: event.target.value })} maxLength={2000} placeholder="Operator note (optional)" /><Button size="sm" onClick={() => update.mutate({ id: request.id, status: request.status, operatorNote: notes[request.id] || request.operatorNote || undefined })} disabled={update.isPending} className="bg-[#c85a3f]">Save review</Button></div></article>) : <div className="admin-deletion-empty"><ShieldCheck size={22} /><h2>{requests.data?.length ? "No matching requests." : "No deletion requests yet."}</h2><p>Public Privacy Policy form থেকে request এলে এখানে review করা যাবে।</p></div>}</section></div></main>;
}
