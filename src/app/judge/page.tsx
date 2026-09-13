"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ROUNDS = ["Ideation","Mini Review","Twist Round","Final Review","Final Pitch"];
const CRITERIA = [
  { key: "medical", label: "Medical Relevance", weight: 25 },
  { key: "technical", label: "Technical Feasibility", weight: 20 },
  { key: "adapt", label: "Adaptability", weight: 20 },
  { key: "budget", label: "Budget Discipline", weight: 15 },
  { key: "innovation", label: "Innovation", weight: 10 },
  { key: "pitch", label: "Pitch & Q&A", weight: 10 },
];
const inputCls = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all text-sm";
const STATUS_BADGE: Record<string,string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  accepted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  rejected: "bg-red-500/15 text-red-300 border-red-500/25",
};

interface JudgeMe { username: string; mustChangePassword: boolean; }
interface AssignedTeam { code: string; name: string; track: string; pendingCount: number; locked: boolean; }
interface Submission { id: number; round_idx: number; content: string | null; file_url: string | null; file_name: string | null; status: string; feedback: string | null; created_at: string; }
type ScoreMap = Record<string, number>;

export default function JudgePage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState<JudgeMe | null>(null);
  const [mustChangePass, setMustChangePass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [activeRound, setActiveRound] = useState(0);
  const [teams, setTeams] = useState<AssignedTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [existingScore, setExistingScore] = useState<ScoreMap | null>(null);
  const [scores, setScores] = useState<ScoreMap>({ medical:5, technical:5, adapt:5, budget:5, innovation:5, pitch:5 });
  const [feedback, setFeedback] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: false });
  const [loading, setLoading] = useState(false);

  const api = useCallback(async (path: string, method = "GET", body?: object) => {
    const res = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
    return { ok: res.ok, data: await res.json() };
  }, []);

  const loadTeams = useCallback(async (round: number) => {
    const { ok, data } = await api(`/api/judge/assigned-teams?round=${round}`);
    if (ok) setTeams(data.teams || []);
  }, [api]);

  useEffect(() => {
    (async () => {
      const { ok, data } = await api("/api/auth/judge/me");
      if (ok) {
        setAuthed(true); setMe(data); setMustChangePass(!!data.mustChangePassword);
        const ps = await api("/api/public/state");
        const round = ps.ok ? ps.data.currentRoundIdx : 0;
        setActiveRound(round); await loadTeams(round);
      }
      setChecking(false);
    })();
  }, [api, loadTeams]);

  async function login() {
    setLoading(true); setLoginErr("");
    const { ok, data } = await api("/api/auth/judge/login", "POST", { username, password });
    if (!ok) { setLoginErr(data.error || "Login failed"); setLoading(false); return; }
    setAuthed(true); setMe(data); setMustChangePass(!!data.mustChangePassword);
    const ps = await api("/api/public/state");
    const round = ps.ok ? ps.data.currentRoundIdx : 0;
    setActiveRound(round); await loadTeams(round); setLoading(false);
  }

  async function changePass() {
    setLoading(true); setLoginErr("");
    const { ok, data } = await api("/api/auth/judge/change-password", "POST", { newPassword: newPass });
    if (!ok) { setLoginErr(data.error || "Error"); setLoading(false); return; }
    setMustChangePass(false); await loadTeams(activeRound); setLoading(false);
  }

  async function logout() {
    await api("/api/auth/judge/logout", "POST");
    setAuthed(false); setMe(null); setTeams([]); setSelectedTeam(null);
  }

  async function selectTeam(code: string) {
    setSelectedTeam(code); setMsg({ text: "", ok: false }); setLoading(true);
    const [subRes, scoreRes] = await Promise.all([
      api(`/api/judge/submissions?teamCode=${code}&round=${activeRound}`),
      api(`/api/judge/score/${code}/${activeRound}`),
    ]);
    if (subRes.ok) setSubmissions(subRes.data.submissions || []);
    if (scoreRes.ok && scoreRes.data.score) setExistingScore(scoreRes.data.score);
    else setExistingScore(null);
    setLoading(false);
  }

  async function decide(id: number, decision: "accept" | "reject") {
    setLoading(true); setMsg({ text: "", ok: false });
    const { ok, data } = await api(`/api/judge/submissions/${id}/decide`, "POST", { decision, feedback: feedback.trim() || undefined });
    if (!ok) { setMsg({ text: data.error || "Error", ok: false }); setLoading(false); return; }
    setMsg({ text: `Submission ${decision}ed.`, ok: true }); setFeedback("");
    if (selectedTeam) await selectTeam(selectedTeam);
    await loadTeams(activeRound); setLoading(false);
  }

  async function submitScore() {
    if (!selectedTeam) return;
    setLoading(true); setMsg({ text: "", ok: false });
    const { ok, data } = await api("/api/judge/score", "POST", { code: selectedTeam, roundIdx: activeRound, ...scores });
    if (!ok) { setMsg({ text: data.error || "Error", ok: false }); setLoading(false); return; }
    setMsg({ text: `Score saved: ${data.total.toFixed(1)}/100`, ok: true });
    await selectTeam(selectedTeam); setLoading(false);
  }

  const total = CRITERIA.reduce((s, c) => s + (scores[c.key] / 10) * c.weight, 0);

  if (checking) return <main className="min-h-screen bg-[#060612] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" /></main>;

  if (!authed) return (
    <main className="min-h-screen bg-[#060612] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-600/8 rounded-full blur-[120px]" /></div>
      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 text-slate-400 hover:text-white transition-colors text-sm"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Home</Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-lg">⚖</div>
          <div><h1 className="text-xl font-black tracking-tight">Judge Panel</h1><p className="text-slate-400 text-xs">MEDVERSE — Operation 9 Hours</p></div>
        </div>
        {loginErr && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{loginErr}</div>}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label><input className={inputCls} placeholder="Your judge username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} /></div>
          <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label><input className={inputCls} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} /></div>
          <button onClick={login} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/25 transition-all">{loading ? "Signing in..." : "Enter"}</button>
        </div>
      </div>
    </main>
  );

  if (mustChangePass) return (
    <main className="min-h-screen bg-[#060612] text-white flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-sm">
        <h1 className="text-xl font-black mb-2">Set Your Password</h1>
        <p className="text-slate-400 text-sm mb-6">You must set a new password before judging.</p>
        {loginErr && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{loginErr}</div>}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <input className={inputCls} type="password" placeholder="New password (8+ chars)" value={newPass} onChange={e => setNewPass(e.target.value)} />
          <button onClick={changePass} disabled={loading || newPass.length < 8} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm disabled:opacity-50 transition-all">Set Password</button>
        </div>
      </div>
    </main>
  );

  const pending = submissions.filter(s => s.status === "pending");
  const accepted = submissions.some(s => s.status === "accepted");

  return (
    <main className="min-h-screen bg-[#060612] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/6 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-black/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-sm">⚖</div>
          <span className="font-bold text-sm">{me?.username}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold border bg-white/5 border-white/10 text-slate-400">{ROUNDS[activeRound]}</span>
          <button onClick={logout} className="text-xs text-slate-500 hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      <div className="relative z-10 flex h-[calc(100vh-57px)]">
        {/* Team list sidebar */}
        <div className="w-64 shrink-0 border-r border-white/5 overflow-y-auto bg-black/10">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Teams</p>
            <p className="text-xs text-slate-600 mt-0.5">{ROUNDS[activeRound]}</p>
          </div>
          {teams.length === 0 ? (
            <p className="px-4 py-6 text-slate-600 text-xs text-center">No teams assigned to you for this round</p>
          ) : teams.map(t => (
            <button key={t.code} onClick={() => selectTeam(t.code)} className={`w-full text-left px-4 py-3 border-b border-white/5 transition-all hover:bg-white/5 ${selectedTeam === t.code ? "bg-white/8 border-l-2 border-l-emerald-400" : ""}`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-white truncate">{t.name}</span>
                {t.pendingCount > 0 && <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-xs font-black flex items-center justify-center shrink-0">{t.pendingCount}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{t.code}</span>
                {t.locked && <span className="text-xs text-emerald-400 font-semibold">✓ Accepted</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Main panel */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {!selectedTeam ? (
            <div className="flex items-center justify-center h-full text-slate-600 text-sm">Select a team from the sidebar to start reviewing</div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full"><div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" /></div>
          ) : (
            <>
              {msg.text && <div className={`px-4 py-3 rounded-xl border text-sm ${msg.ok ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>{msg.text}</div>}

              {/* Submissions queue */}
              {submissions.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/3 px-6 py-8 text-center text-slate-500 text-sm">No submissions yet for this round</div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/8"><h2 className="font-bold text-white">Submissions</h2></div>
                  <div className="divide-y divide-white/5">
                    {submissions.map(s => (
                      <div key={s.id} className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-slate-500">{new Date(s.created_at).toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGE[s.status] ?? ""}`}>{s.status.toUpperCase()}</span>
                        </div>
                        {s.content && <p className="text-sm text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">{s.content}</p>}
                        {s.file_name && <a href={s.file_url ?? "#"} target="_blank" className="text-cyan-400 text-sm hover:underline">📎 {s.file_name}</a>}
                        {s.status === "pending" && (
                          <div className="mt-4 space-y-3">
                            <input className={inputCls} placeholder="Feedback (optional)" value={feedback} onChange={e => setFeedback(e.target.value)} />
                            <div className="flex gap-3">
                              <button onClick={() => decide(s.id, "accept")} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-all disabled:opacity-40">Accept</button>
                              <button onClick={() => decide(s.id, "reject")} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all disabled:opacity-40">Reject</button>
                            </div>
                          </div>
                        )}
                        {s.feedback && <p className="text-xs text-amber-400 mt-2 italic">Feedback: {s.feedback}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scoring */}
              {accepted && (
                <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                    <h2 className="font-bold text-white">Score This Team</h2>
                    {existingScore ? <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">Scored — Locked</span> : <span className="text-2xl font-black text-white">{total.toFixed(1)}<span className="text-slate-500 text-sm font-normal">/100</span></span>}
                  </div>
                  <div className="p-6 space-y-5">
                    {existingScore ? (
                      <div className="grid grid-cols-2 gap-3">
                        {CRITERIA.map(c => (
                          <div key={c.key} className="flex justify-between text-sm">
                            <span className="text-slate-400">{c.label}</span>
                            <span className="font-bold text-white">{existingScore[c.key]}/10</span>
                          </div>
                        ))}
                        <div className="col-span-2 pt-3 border-t border-white/8 flex justify-between">
                          <span className="font-bold text-white">Total</span>
                          <span className="font-black text-emerald-400">{Number(existingScore.total).toFixed(1)}/100</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {CRITERIA.map(c => (
                          <div key={c.key}>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-300 font-semibold">{c.label}</span>
                              <span className="text-white font-bold">{scores[c.key]}/10 <span className="text-slate-500">({c.weight}%)</span></span>
                            </div>
                            <input type="range" min={0} max={10} step={1} value={scores[c.key]} onChange={e => setScores(prev => ({ ...prev, [c.key]: Number(e.target.value) }))} className="w-full accent-emerald-400" />
                          </div>
                        ))}
                        <button onClick={submitScore} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-40">
                          Lock Score — {total.toFixed(1)}/100
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}