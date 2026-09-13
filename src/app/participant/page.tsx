"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Kit { disease: string; patient: string; problem: string; tech: string; budget: string; constraint: string; drawnAt: string; }
interface RoundState { currentRoundIdx: number; status: string; roundName: string; }
interface Team { code: string; name: string; track: string; lead_name: string; }
interface MeData { team: Team; kit: Kit | null; roundState: RoundState | null; graceUsed: boolean; }
interface Submission { id: number; round_idx: number; content: string | null; file_url: string | null; file_name: string | null; status: string; feedback: string | null; created_at: string; }

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  accepted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  rejected: "bg-red-500/15 text-red-300 border-red-500/25",
};
const TRACK_COLOR: Record<string, string> = { A: "text-cyan-400", B: "text-violet-400", C: "text-emerald-400" };
const inputCls = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all text-sm";

export default function ParticipantPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [me, setMe] = useState<MeData | null>(null);
  const [history, setHistory] = useState<Submission[]>([]);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [content, setContent] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [submitOk, setSubmitOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kitRevealed, setKitRevealed] = useState(false);
  const [checking, setChecking] = useState(true);

  const loadData = useCallback(async () => {
    const [meRes, histRes] = await Promise.all([fetch("/api/team/me"), fetch("/api/team/history")]);
    if (meRes.ok) {
      const d = await meRes.json(); setMe(d); setLoggedIn(true);
      if (d.kit) setKitRevealed(true);
    }
    if (histRes.ok) { const h = await histRes.json(); setHistory(h.submissions || []); }
  }, []);

  useEffect(() => {
    (async () => { await loadData(); setChecking(false); })();
  }, [loadData]);

  async function login() {
    setLoading(true); setLoginErr("");
    const res = await fetch("/api/auth/team/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code.toUpperCase(), password }) });
    const data = await res.json();
    if (!res.ok) { setLoginErr(data.error || "Login failed"); setLoading(false); return; }
    await loadData(); setLoading(false);
  }

  async function logout() {
    await fetch("/api/auth/team/logout", { method: "POST" });
    setLoggedIn(false); setMe(null); setHistory([]);
  }

  async function submit() {
    setLoading(true); setSubmitErr(""); setSubmitOk(false);
    const res = await fetch("/api/team/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    const data = await res.json();
    if (!res.ok) { setSubmitErr(data.error || "Submit failed"); setLoading(false); return; }
    setSubmitOk(true); setContent(""); await loadData(); setLoading(false);
  }

  if (checking) return (
    <main className="min-h-screen bg-[#060612] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
    </main>
  );

  if (!loggedIn) return (
    <main className="min-h-screen bg-[#060612] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-600/8 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 text-slate-400 hover:text-white transition-colors text-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Home
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center font-black text-lg">M</div>
          <div><h1 className="text-xl font-black tracking-tight">Team Portal</h1><p className="text-slate-400 text-xs">MEDVERSE — Operation 9 Hours</p></div>
        </div>
        {loginErr && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{loginErr}</div>}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Team Code</label>
            <input className={inputCls} placeholder="MV-A-1234" value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <input className={inputCls} type="password" placeholder="Team password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <button onClick={login} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
            {loading ? "Signing in..." : "Enter"}
          </button>
        </div>
        <p className="text-center text-slate-500 text-xs mt-4">
          No team yet? <Link href="/register" className="text-cyan-400 hover:underline">Register here</Link>
        </p>
      </div>
    </main>
  );

  const canSubmit = me?.roundState?.status === "active" && (me?.roundState?.currentRoundIdx ?? 99) < 4;
  const thisRound = me?.roundState?.currentRoundIdx ?? 0;
  const accepted = history.some(s => s.round_idx === thisRound && s.status === "accepted");

  return (
    <main className="min-h-screen bg-[#060612] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/6 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-black/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center font-black text-sm">M</div>
          <div>
            <p className="font-bold text-sm">{me?.team.name}</p>
            <p className={`text-xs font-semibold ${TRACK_COLOR[me?.team.track ?? "A"]}`}>{me?.team.code} · Track {me?.team.track}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {me?.roundState && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${me.roundState.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : me.roundState.status === "ended" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
              {me.roundState.status === "active" ? "LIVE" : me.roundState.status === "ended" ? "ENDED" : "STANDBY"} · {me.roundState.roundName}
            </div>
          )}
          <button onClick={logout} className="text-xs text-slate-500 hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Kit Card */}
        {!me?.kit ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-slate-400 text-sm">Your sealed kit will unlock when you make your first submission in Round 1.</p>
          </div>
        ) : !kitRevealed ? (
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-8 text-center cursor-pointer hover:bg-cyan-500/10 transition-all" onClick={() => setKitRevealed(true)}>
            <div className="text-4xl mb-3 animate-pulse">📁</div>
            <p className="text-cyan-300 font-bold text-lg mb-1">Your Case File is Ready</p>
            <p className="text-slate-400 text-sm">Click to reveal your sealed scenario</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <h2 className="font-bold text-white">Your Case File</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">{me.kit.disease}</span>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/15">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">The Patient</p>
                <p className="text-sm text-slate-300 leading-relaxed">{me.kit.patient}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/15">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1.5">The Problem</p>
                <p className="text-sm text-slate-300 leading-relaxed">{me.kit.problem}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                  <p className="text-xs text-slate-500 mb-1">Assigned Technology</p>
                  <p className="text-sm font-semibold text-white">{me.kit.tech}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                  <p className="text-xs text-slate-500 mb-1">Budget Cap</p>
                  <p className="text-sm font-semibold text-emerald-400">{me.kit.budget}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/15">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5">Hard Constraint</p>
                <p className="text-sm text-slate-300 leading-relaxed">{me.kit.constraint}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {canSubmit && !accepted && (
          <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
            <h2 className="font-bold text-white mb-1">Submit for {me?.roundState?.roundName}</h2>
            <p className="text-xs text-slate-400 mb-4">Describe your solution clearly. You can resubmit after a rejection.</p>
            {submitErr && <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{submitErr}</div>}
            {submitOk && <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">Submitted successfully!</div>}
            <textarea className={inputCls + " resize-none"} rows={5} placeholder="Describe your approach, solution design, and how it addresses the patient scenario..." value={content} onChange={e => setContent(e.target.value)} />
            <button onClick={submit} disabled={loading || content.trim().length < 10} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        )}
        {accepted && (
          <div className="px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold flex items-center gap-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Round accepted! Wait for the next round to open.
          </div>
        )}
        {!canSubmit && me?.roundState?.status !== "active" && (
          <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm">
            {me?.roundState?.status === "ended" ? "This round has ended. Wait for the organiser to start the next round." : "No round is currently active. Stand by."}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/8">
              <h2 className="font-bold text-white">Submission History</h2>
            </div>
            <div className="divide-y divide-white/5">
              {history.map(s => (
                <div key={s.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Round {s.round_idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGE[s.status] ?? "bg-white/5 text-slate-400 border-white/10"}`}>{s.status.toUpperCase()}</span>
                  </div>
                  {s.content && <p className="text-xs text-slate-400 line-clamp-2">{s.content}</p>}
                  {s.file_name && <p className="text-xs text-cyan-400">📎 {s.file_name}</p>}
                  {s.feedback && <p className="text-xs text-amber-400 mt-1 italic">Feedback: {s.feedback}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}