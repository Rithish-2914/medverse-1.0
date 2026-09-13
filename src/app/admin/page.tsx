"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ROUNDS = ["Ideation","Mini Review","Twist Round","Final Review","Final Pitch"];
const inputCls = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all text-sm";
const btnPrimary = "px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-violet-400 text-white font-bold text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-40";
const btnSecondary = "px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-all disabled:opacity-40";
const btnDanger = "px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-all disabled:opacity-40";

interface RoundStateData { currentRoundIdx: number; status: string; startedRounds: number[]; }
interface RosterRow { code: string; name: string; track: string; kitDrawn: boolean; submissionsThisRound: number; pendingThisRound: number; lockedThisRound: boolean; assignedJudgesThisRound: string[]; avgScoreThisRound: number | null; members: {name:string;reg_no:string}[]; }
interface Judge { username: string; mustChangePassword: boolean; }
interface Assignment { judge_username: string; team_code: string; team_name: string; }
interface LogRow { actor: string; message: string; created_at: string; }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [tab, setTab] = useState<"round"|"roster"|"judges"|"log">("round");
  const [roundState, setRoundState] = useState<RoundStateData | null>(null);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [newJudgeUser, setNewJudgeUser] = useState("");
  const [newJudgePass, setNewJudgePass] = useState("");
  const [assignJudge, setAssignJudge] = useState("");
  const [assignTeam, setAssignTeam] = useState("");
  const [twist, setTwist] = useState<string|null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const api = useCallback(async (path: string, method = "GET", body?: object) => {
    const res = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
    return { ok: res.ok, data: await res.json() };
  }, []);

  const loadAll = useCallback(async () => {
    const [rs, ro, ju, lo] = await Promise.all([
      api("/api/admin/round-state"), api("/api/admin/roster"),
      api("/api/admin/judges"), api("/api/admin/log"),
    ]);
    if (rs.ok) setRoundState(rs.data);
    if (ro.ok) setRoster(ro.data.rows || []);
    if (ju.ok) setJudges(ju.data.judges || []);
    if (lo.ok) setLog(lo.data.rows || []);
    if (rs.ok) {
      const ar = await api(`/api/admin/assignments?round=${rs.data.currentRoundIdx}`);
      if (ar.ok) setAssignments(ar.data.assignments || []);
    }
  }, [api]);

  useEffect(() => {
    (async () => {
      const { ok } = await api("/api/auth/admin/me");
      if (ok) { setAuthed(true); await loadAll(); }
      setChecking(false);
    })();
  }, [api, loadAll]);

  async function login() {
    setLoading(true); setLoginErr("");
    const { ok, data } = await api("/api/auth/admin/login", "POST", { password });
    if (!ok) { setLoginErr(data.error || "Login failed"); setLoading(false); return; }
    setAuthed(true); await loadAll(); setLoading(false);
  }

  async function logout() {
    await api("/api/auth/admin/logout", "POST");
    setAuthed(false); setRoundState(null);
  }

  async function roundAction(path: string) {
    setLoading(true); setMsg("");
    const { ok, data } = await api(path, "POST");
    if (!ok) setMsg(data.error || "Error");
    await loadAll(); setLoading(false);
  }

  async function drawTwist() {
    setLoading(true);
    const { ok, data } = await api("/api/admin/twist", "POST");
    if (ok) setTwist(data.text);
    await loadAll(); setLoading(false);
  }

  async function createJudge() {
    if (!newJudgeUser || !newJudgePass) return;
    setLoading(true); setMsg("");
    const { ok, data } = await api("/api/admin/create-judge", "POST", { username: newJudgeUser, tempPassword: newJudgePass });
    if (!ok) { setMsg(data.error || "Error"); setLoading(false); return; }
    setNewJudgeUser(""); setNewJudgePass(""); await loadAll(); setLoading(false);
  }

  async function doAssign() {
    if (!assignJudge || !assignTeam || roundState === null) return;
    setLoading(true); setMsg("");
    const { ok, data } = await api("/api/admin/assign-judge", "POST", { judgeUsername: assignJudge, teamCode: assignTeam, roundIdx: roundState.currentRoundIdx });
    if (!ok) setMsg(data.error || "Error");
    await loadAll(); setLoading(false);
  }

  async function unassign(judgeUsername: string, teamCode: string) {
    if (!roundState) return;
    await api("/api/admin/unassign-judge", "POST", { judgeUsername, teamCode, roundIdx: roundState.currentRoundIdx });
    await loadAll();
  }

  if (checking) return <main className="min-h-screen bg-[#060612] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" /></main>;

  if (!authed) return (
    <main className="min-h-screen bg-[#060612] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none"><div className="absolute top-1/4 right-1/3 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px]" /></div>
      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 text-slate-400 hover:text-white transition-colors text-sm"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Home</Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center font-black text-lg">⚙</div>
          <div><h1 className="text-xl font-black tracking-tight">Organiser Panel</h1><p className="text-slate-400 text-xs">MEDVERSE Control Centre</p></div>
        </div>
        {loginErr && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{loginErr}</div>}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Organiser Password</label>
            <input className={inputCls} type="password" placeholder="First login creates the account" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <button onClick={login} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-400 text-white font-bold text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-violet-500/25 transition-all">{loading ? "Signing in..." : "Enter"}</button>
        </div>
      </div>
    </main>
  );

  const ri = roundState?.currentRoundIdx ?? 0;
  const rstatus = roundState?.status ?? "not_started";

  return (
    <main className="min-h-screen bg-[#060612] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/6 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-black/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-sm">⚙</div>
          <span className="font-bold text-sm">Organiser Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${rstatus === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : rstatus === "ended" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
            {ROUNDS[ri]} · {rstatus === "active" ? "LIVE" : rstatus === "ended" ? "ENDED" : "STANDBY"}
          </span>
          <button onClick={logout} className="text-xs text-slate-500 hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 border-b border-white/5 px-6 flex gap-1">
        {(["round","roster","judges","log"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-all ${tab === t ? "border-violet-400 text-violet-300" : "border-transparent text-slate-500 hover:text-slate-300"}`}>{t}</button>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-6">
        {msg && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{msg}</div>}
        {twist && <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm"><span className="font-bold">TWIST REVEALED: </span>{twist}</div>}

        {/* ROUND TAB */}
        {tab === "round" && (
          <div className="space-y-6">
            {/* Round progress */}
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
              <h2 className="font-bold text-white mb-4">Round Progress</h2>
              <div className="flex gap-2 mb-4">
                {ROUNDS.map((r, i) => (
                  <div key={i} className={`flex-1 p-3 rounded-xl border text-xs font-semibold text-center transition-all ${i === ri ? (rstatus === "active" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : rstatus === "ended" ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300") : i < ri ? "border-white/10 bg-white/5 text-slate-400" : "border-white/5 bg-transparent text-slate-600"}`}>
                    {r}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => roundAction("/api/admin/start-round")} disabled={loading || rstatus === "active"} className={btnPrimary}>Start Round</button>
                <button onClick={() => roundAction("/api/admin/end-round")} disabled={loading || rstatus !== "active"} className={btnSecondary}>End Round</button>
                <button onClick={() => roundAction("/api/admin/next-round")} disabled={loading || ri >= ROUNDS.length - 1} className={btnSecondary}>Next Round →</button>
                <button onClick={drawTwist} disabled={loading} className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-sm hover:bg-amber-500/20 transition-all disabled:opacity-40">Draw Twist ⚡</button>
              </div>
            </div>

            {/* Assign judges */}
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
              <h2 className="font-bold text-white mb-4">Assign Judges — {ROUNDS[ri]}</h2>
              <div className="flex gap-3 mb-4 flex-wrap">
                <select className={inputCls + " flex-1"} value={assignJudge} onChange={e => setAssignJudge(e.target.value)}>
                  <option value="">Select judge</option>
                  {judges.map(j => <option key={j.username} value={j.username}>{j.username}</option>)}
                </select>
                <select className={inputCls + " flex-1"} value={assignTeam} onChange={e => setAssignTeam(e.target.value)}>
                  <option value="">Select team</option>
                  {roster.map(r => <option key={r.code} value={r.code}>{r.code} — {r.name}</option>)}
                </select>
                <button onClick={doAssign} disabled={loading || !assignJudge || !assignTeam} className={btnPrimary}>Assign</button>
              </div>
              {assignments.length > 0 && (
                <div className="space-y-1">
                  {assignments.map((a, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3 border border-white/6 text-xs">
                      <span className="text-violet-300 font-semibold">{a.judge_username}</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="text-slate-300 flex-1">{a.team_code} · {a.team_name}</span>
                      <button onClick={() => unassign(a.judge_username, a.team_code)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROSTER TAB */}
        {tab === "roster" && (
          <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <h2 className="font-bold text-white">Team Roster</h2>
              <span className="text-xs text-slate-400">{roster.length} teams</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-left">Track</th>
                  <th className="px-4 py-3 text-center">Kit</th>
                  <th className="px-4 py-3 text-center">Pending</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Avg Score</th>
                </tr></thead>
                <tbody className="divide-y divide-white/5">
                  {roster.map(r => (
                    <tr key={r.code} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white text-sm">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.code}</p>
                      </td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${r.track === "A" ? "bg-cyan-500/10 text-cyan-400" : r.track === "B" ? "bg-violet-500/10 text-violet-400" : "bg-emerald-500/10 text-emerald-400"}`}>Track {r.track}</span></td>
                      <td className="px-4 py-3 text-center text-lg">{r.kitDrawn ? "✅" : "🔒"}</td>
                      <td className="px-4 py-3 text-center"><span className={`text-sm font-bold ${r.pendingThisRound > 0 ? "text-amber-400" : "text-slate-500"}`}>{r.pendingThisRound}</span></td>
                      <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${r.lockedThisRound ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400"}`}>{r.lockedThisRound ? "Accepted" : "Open"}</span></td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-white">{r.avgScoreThisRound !== null ? r.avgScoreThisRound : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JUDGES TAB */}
        {tab === "judges" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
              <h2 className="font-bold text-white mb-4">Create Judge Account</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input className={inputCls} placeholder="Username" value={newJudgeUser} onChange={e => setNewJudgeUser(e.target.value)} />
                <input className={inputCls} type="password" placeholder="Temp password (8+ chars)" value={newJudgePass} onChange={e => setNewJudgePass(e.target.value)} />
              </div>
              <button onClick={createJudge} disabled={loading || !newJudgeUser || newJudgePass.length < 8} className={btnPrimary}>Create Judge</button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8"><h2 className="font-bold text-white">Judge Accounts</h2></div>
              {judges.length === 0 ? <p className="px-6 py-8 text-slate-500 text-sm text-center">No judges created yet</p> : (
                <div className="divide-y divide-white/5">
                  {judges.map(j => (
                    <div key={j.username} className="px-6 py-4 flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">{j.username}</span>
                      {j.mustChangePassword && <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400">Must change password</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOG TAB */}
        {tab === "log" && (
          <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/8"><h2 className="font-bold text-white">Activity Log</h2></div>
            {log.length === 0 ? <p className="px-6 py-8 text-slate-500 text-sm text-center">No activity yet</p> : (
              <div className="divide-y divide-white/5">
                {log.map((l, i) => (
                  <div key={i} className="px-6 py-3 flex items-start gap-3">
                    <span className="text-xs font-bold text-violet-400 mt-0.5 shrink-0">{l.actor}</span>
                    <span className="text-xs text-slate-300 flex-1">{l.message}</span>
                    <span className="text-xs text-slate-600 shrink-0">{new Date(l.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}