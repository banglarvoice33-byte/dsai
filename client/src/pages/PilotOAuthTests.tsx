import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole, Play, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

const scenarios = [["state_mismatch", "State / PKCE mismatch", "Callback must fail closed when state or verifier is wrong."], ["denied_consent", "User denied consent", "Consent denial must not create a connection."], ["insufficient_scope", "Insufficient read scope", "Pilot must disable discovery when granted scope is too narrow."], ["callback_success", "Callback success", "Provider callback accepted with exact redirect and read-only scope."], ["token_expired", "Expired token", "Refresh failure must stop the read-only request."], ["revoke_success", "Token revoke", "Revoke must remove the stored connection reference."], ["post_revoke_denied", "Post-revoke access denied", "A revoked connection must not be reused."]] as const;
export default function PilotOAuthTests() {
  const { user, loading, error: authError, refresh: refreshAuth } = useAuth();
  const [authWaitExpired, setAuthWaitExpired] = useState(false);
  const [selected, setSelected] = useState<(typeof scenarios)[number][0]>("state_mismatch");
  useEffect(() => {
    if (!loading) {
      setAuthWaitExpired(false);
      return;
    }
    const timer = window.setTimeout(() => setAuthWaitExpired(true), 8000);
    return () => window.clearTimeout(timer);
  }, [loading]);
  const tests = trpc.oauthTests.list.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const record = trpc.oauthTests.record.useMutation({ onSuccess: () => void tests.refetch() });
  const current = useMemo(() => scenarios.find(item => item[0] === selected)!, [selected]);
  const run = () => record.mutate({ provider: "sandbox-read-only-provider", scenario: selected, outcome: "blocked", scopes: "calendar.readonly | crm.readonly", detail: "Sandbox provider credentials or callback configuration are not verified; recorded as blocked rather than passed. No token or customer data was stored." });
  if (loading && !authWaitExpired) return <main className="oauth-tests-page" role="status"><section className="oauth-tests-auth"><LockKeyhole size={24} /><span className="learn-label">AUTHENTICATED TEST HARNESS</span><h1>পরিচয় যাচাই হচ্ছে…</h1><p>Session response আসার অপেক্ষায় আছি। কয়েক সেকেন্ড পরেও এই অবস্থা থাকলে আবার চেষ্টা করুন।</p></section></main>;
  if (loading && authWaitExpired && !authError) return <main className="oauth-tests-page"><section className="oauth-tests-auth"><LockKeyhole size={24} /><span className="learn-label">DSAI / CONNECTION CHECK</span><h1>Session response আসতে দেরি হচ্ছে।</h1><p>এটি provider success বা failure-এর প্রমাণ নয়। আবার session পরীক্ষা করুন অথবা sign in শুরু করুন।</p><div className="oauth-tests-actions"><button type="button" className="quiet-button" onClick={() => void refreshAuth()}>আবার পরীক্ষা করুন</button><button type="button" className="primary-button" onClick={() => startLogin()}>Sign in / create account</button></div></section></main>;
  if (loading && authWaitExpired && authError) return <main className="oauth-tests-page"><section className="oauth-tests-auth"><LockKeyhole size={24} /><span className="learn-label">DSAI / AUTHENTICATION ERROR</span><h1>Session পাওয়া যায়নি।</h1><p>আপনার login session যাচাই করা যায়নি। আবার চেষ্টা করুন অথবা sign in / create account শুরু করুন।</p><div className="oauth-tests-actions"><button type="button" className="quiet-button" onClick={() => void refreshAuth()}>আবার চেষ্টা করুন</button><button type="button" className="primary-button" onClick={() => startLogin()}>Sign in / create account</button></div></section></main>;
  if (!user) return <main className="oauth-tests-page"><section className="oauth-tests-auth"><LockKeyhole size={24} /><span className="learn-label">AUTHENTICATED TEST HARNESS</span><h1>Sign in করে<br /><em>OAuth gate দেখুন।</em></h1><p>OAuth test results user-owned এবং authenticated audit record হিসেবে সংরক্ষিত হয়।</p><button type="button" className="primary-button" onClick={() => startLogin()}>Sign in</button></section></main>;
  return <main className="oauth-tests-page"><header className="oauth-tests-topbar"><Link href="/integration-pilot" className="workspace-back"><ArrowLeft size={15} /> Read-only pilot</Link><Link href="/traces" className="quiet-button">Trace Store</Link></header><div className="oauth-tests-shell"><section className="oauth-tests-hero"><span className="learn-label">REAL PROVIDER CONTRACT · TEST HARNESS</span><h1>OAuth-এর প্রতিটি<br /><em>ব্যর্থতা আগে ধরুন।</em></h1><p>এই page real provider call করে না। Sandbox credentials ও exact callback URLs verified হলে একই scenarios real callback, scope এবং revoke tests-এর সঙ্গে চালানো যাবে।</p></section><div className="oauth-tests-boundary"><ShieldAlert size={17} /><span>Current environment: <strong>blocked, not passed</strong>. No client secret, access token or refresh token is stored.</span></div><section className="oauth-tests-grid"><div className="oauth-scenario-list">{scenarios.map(item => <button type="button" key={item[0]} className={selected === item[0] ? "selected" : ""} onClick={() => setSelected(item[0])}><span>{item[1]}</span><small>{item[0]}</small></button>)}</div><div className="oauth-scenario-card"><span className="learn-label">SELECTED SCENARIO</span><h2>{current[1]}</h2><p>{current[2]}</p><button type="button" className="primary-button" onClick={run} disabled={record.isPending}><Play size={14} /> {record.isPending ? "Recording…" : "Record blocked test"}</button><div className="oauth-test-history"><span className="learn-label">RECENT AUDIT RUNS</span>{tests.data?.length ? tests.data.slice(0, 8).map(item => <div key={item.id}><CheckCircle2 size={14} /><span>{item.scenario}</span><small>{item.outcome}</small></div>) : <p>No authenticated OAuth test run yet.</p>}</div></div></section></div></main>;
}
