"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

const ROUNDS = ["Ideation","Mini Review","Twist Round","Final Review","Final Pitch"];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [roundState, setRoundState] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [judges, setJudges] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [log, setLog] = useState<any[]>([]);
  const [newJudgeUser, setNewJudgeUser] = useState("");
  const [newJudgePass, setNewJudgePass] = useState("");
  const [assignJudge, setAssignJudge] = useState("");
  const [assignTeam, setAssignTeam] = useState("");
  const [changeProblemTeam, setChangeProblemTeam] = useState("");
  const [changeProblemId, setChangeProblemId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const S = {
    wrap: { maxWidth:"1180px", margin:"0 auto", padding:"0 32px" },
    tag: { fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase" as const, letterSpacing:"0.08em", color:"var(--coral)", marginBottom:"12px", display:"block" },
    h2: { fontFamily:"var(--display)", fontWeight:600, fontSize:"clamp(1.8rem,3.4vw,2.6rem)", letterSpacing:"-0.01em", marginBottom:"14px" },
    input: { width:"100%", fontFamily:"var(--body)", fontSize:"0.92rem", padding:"11px 12px", border:"1px solid var(--line)", borderRadius:"4px", background:"var(--paper)", color:"var(--ink)" },
    btn: { fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase" as const, background:"var(--amber)", color:"var(--ink)", border:"none", padding:"10px 16px", borderRadius:"3px", cursor:"pointer", whiteSpace:"nowrap" as const },
    panel: { background:"var(--teal-deep)", color:"var(--white)", borderRadius:"10px", padding:"32px" },
    row: { display:"flex", justifyContent:"space-between", alignItems:"center", gap:"16px", flexWrap:"wrap" as const, padding:"16px 0", borderBottom:"1px solid #2A5F55" },
    aLabel: { fontFamily:"var(--display)", fontSize:"0.98rem" },
    aSub: { fontFamily:"var(--mono)", fontSize:"0.75rem", color:"#8FB6AC", marginTop:"3px" },
    pcard: { background:"var(--surface)", border:"1px solid var(--line)", borderRadius:"8px", padding:"22px" },
    h4: { fontFamily:"var(--display)", fontSize:"1rem", marginBottom:"14px" },
    badge: (status:string) => {
      let bg = "rgba(226,147,59,0.18)", col = "var(--amber)";
      if(status==="active") { bg = "rgba(63,203,224,0.18)"; col = "var(--teal)"; }
      if(status==="ended") { bg = "rgba(198,80,63,0.18)"; col = "var(--coral)"; }
      return { display:"inline-block", fontFamily:"var(--mono)", fontSize:"0.68rem", textTransform:"uppercase" as const, padding:"3px 9px", borderRadius:"20px", letterSpacing:"0.03em", background:bg, color:col };
    }
  };

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
    if (!ok) alert(data.error || "Error");
    await loadAll(); setLoading(false);
  }

  async function drawTwist() {
    setLoading(true);
    const { ok, data } = await api("/api/admin/twist", "POST");
    if (ok) alert("TWIST REVEALED: " + data.text);
    else alert(data.error);
    await loadAll(); setLoading(false);
  }

  async function createJudge() {
    if (!newJudgeUser || !newJudgePass) return;
    setLoading(true); setMsg("");
    const { ok, data } = await api("/api/admin/create-judge", "POST", { username: newJudgeUser, tempPassword: newJudgePass });
    if (!ok) alert(data.error || "Error");
    setNewJudgeUser(""); setNewJudgePass(""); await loadAll(); setLoading(false);
  }

  async function doChangeProblem() {
    if (!changeProblemTeam || !changeProblemId) return;
    setLoading(true); setMsg("");
    const { ok, data } = await api("/api/admin/change-kit", "POST", { teamCode: changeProblemTeam.toUpperCase(), problemId: changeProblemId.toUpperCase() });
    if (!ok) alert(data.error || "Error");
    else alert("Problem changed successfully!");
    setChangeProblemTeam(""); setChangeProblemId("");
    await loadAll(); setLoading(false);
  }

  async function doAssign() {
    if (!assignJudge || !assignTeam || roundState === null) return;
    setLoading(true); setMsg("");
    const { ok, data } = await api("/api/admin/assign-judge", "POST", { judgeUsername: assignJudge, teamCode: assignTeam, roundIdx: roundState.currentRoundIdx });
    if (!ok) alert(data.error || "Error");
    await loadAll(); setLoading(false);
  }

  async function unassign(judgeUsername: string, teamCode: string) {
    if (!roundState) return;
    await api("/api/admin/unassign-judge", "POST", { judgeUsername, teamCode, roundIdx: roundState.currentRoundIdx });
    await loadAll();
  }

  if (checking) return <div style={{minHeight:"100vh", background:"var(--paper)"}} />;

  if (!authed) return (
    <>
      <Nav active="admin" />
      <section style={{padding:"88px 0", minHeight:"calc(100vh - 160px)"}}>
        <div style={S.wrap}>
          <div style={{maxWidth:"640px", marginBottom:"52px"}}>
            <span style={S.tag}>Authenticated — organisers only</span>
            <h2 style={S.h2}>Organizer Console</h2>
            <p style={{color:"#C7DEE1", fontSize:"1.02rem"}}>First visit sets the organiser password; every visit after that requires it.</p>
          </div>
          <div style={{background:"var(--surface)", border:"1px solid var(--line)", borderRadius:"10px", padding:"44px 36px", textAlign:"center"}}>
            <p style={{fontFamily:"var(--mono)", textTransform:"uppercase", fontSize:"0.75rem", color:"var(--ink)"}}>Organizer Login</p>
            <div style={{display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap", marginTop:"22px"}}>
              <input style={{...S.input, minWidth:"220px", width:"auto"}} type="password" placeholder="Organizer password" value={password} onChange={e=>setPassword(e.target.value)} />
              <button style={{...S.btn, background:"var(--coral)", color:"#fff", padding:"12px 24px"}} onClick={login} disabled={loading}>{loading?"Entering...":"Continue"}</button>
            </div>
            {loginErr && <p style={{fontFamily:"var(--mono)", fontSize:"0.72rem", color:"var(--coral)", marginTop:"14px"}}>{loginErr}</p>}
          </div>
        </div>
      </section>
    </>
  );

  const ri = roundState?.currentRoundIdx ?? 0;
  const rstatus = roundState?.status ?? "not_started";

  return (
    <>
      <Nav active="admin" />
      <section style={{padding:"88px 0"}}>
        <div style={S.wrap}>
          
          <div style={{textAlign:"right", marginBottom:"14px"}}>
            <button onClick={logout} style={{fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase", background:"transparent", color:"var(--white)", border:"1px solid rgba(245,251,252,0.35)", padding:"10px 16px", borderRadius:"3px", cursor:"pointer"}}>Log out</button>
          </div>

          <div style={S.panel}>
            <div style={S.row}>
              <div><div style={S.aLabel}>Current round</div><div style={S.aSub}>{ROUNDS[ri] ?? "—"}</div></div>
              <span style={S.badge(rstatus)}>{rstatus}</span>
            </div>
            <div style={S.row}>
              <div><div style={S.aLabel}>Start this round</div><div style={S.aSub}>Opens submissions for everyone right now.</div></div>
              <button style={{...S.btn, background:"var(--teal)", color:"var(--teal-deep)"}} onClick={()=>roundAction("/api/admin/start-round")} disabled={rstatus==="active"}>Start Round</button>
            </div>
            <div style={S.row}>
              <div><div style={S.aLabel}>End this round</div><div style={S.aSub}>Closes submissions immediately.</div></div>
              <button style={{...S.btn, background:"var(--coral)", color:"#fff"}} onClick={()=>roundAction("/api/admin/end-round")} disabled={rstatus!=="active"}>End Round</button>
            </div>
            <div style={S.row}>
              <div><div style={S.aLabel}>Move to next round</div><div style={S.aSub}>Advances to the next round, not-started.</div></div>
              <button style={S.btn} onClick={()=>roundAction("/api/admin/next-round")} disabled={ri>=4}>Next Round →</button>
            </div>
            <div style={{...S.row, borderBottom:"none"}}>
              <div><div style={S.aLabel}>Reveal next twist</div><div style={S.aSub}>Draws the next card from the sealed twist deck.</div></div>
              <button style={S.btn} onClick={drawTwist}>Draw Twist Card</button>
            </div>
            <div style={{background:"#0D2F2B", borderRadius:"6px", padding:"16px 18px", marginTop:"20px", maxHeight:"160px", overflowY:"auto"}}>
              {log.length===0 ? <div style={{fontFamily:"var(--mono)", fontSize:"0.78rem", color:"#8FB6AC"}}>No activity yet…</div> : log.map((l,i)=>(
                <div key={i} style={{fontFamily:"var(--mono)", fontSize:"0.78rem", color:"#8FB6AC", padding:"4px 0", borderBottom:"1px dashed #2A5F55"}}>
                  <span style={{color:"var(--amber)", marginRight:"8px"}}>[{new Date(l.created_at).toLocaleTimeString()}]</span>
                  <strong style={{color:"var(--white)"}}>{l.actor}:</strong> {l.message}
                </div>
              ))}
            </div>
          </div>

          <div style={{...S.pcard, marginTop:"22px"}}>
            <h4 style={S.h4}>Create a judge account</h4>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px"}}>
              <div><label style={{fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--ink)", display:"block", marginBottom:"6px"}}>Username</label><input style={S.input} value={newJudgeUser} onChange={e=>setNewJudgeUser(e.target.value)} /></div>
              <div><label style={{fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--ink)", display:"block", marginBottom:"6px"}}>Temp Password</label><input style={S.input} value={newJudgePass} onChange={e=>setNewJudgePass(e.target.value)} /></div>
            </div>
            <button style={{...S.btn, background:"var(--teal)", color:"var(--teal-deep)", fontWeight:600, marginTop:"14px"}} onClick={createJudge}>Create Judge Account</button>
          </div>

          
          <div style={{...S.pcard, marginTop:"22px"}}>
            <h4 style={S.h4}>Change Team Problem Statement</h4>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px"}}>
              <div><label style={{fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--ink)", display:"block", marginBottom:"6px"}}>Team Code</label><input style={S.input} value={changeProblemTeam} onChange={e=>setChangeProblemTeam(e.target.value)} placeholder="e.g. MV-A-1234" /></div>
              <div><label style={{fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--ink)", display:"block", marginBottom:"6px"}}>New Problem ID</label><input style={S.input} value={changeProblemId} onChange={e=>setChangeProblemId(e.target.value)} placeholder="e.g. AI-01, DEVICE-03" /></div>
            </div>
            <button style={{...S.btn, background:"var(--coral)", color:"#fff", fontWeight:600, marginTop:"14px"}} onClick={doChangeProblem}>Force Change Problem</button>
          </div>

          <div style={{...S.pcard, marginTop:"22px"}}>

            <h4 style={S.h4}>Assign judges — {ROUNDS[ri]}</h4>
            <p style={{fontFamily:"var(--mono)", fontSize:"0.72rem", color:"#8FA8AD", marginBottom:"14px"}}>Assignment is per round on purpose — reassign for each new round.</p>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px"}}>
              <div><label style={{fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--ink)", display:"block", marginBottom:"6px"}}>Team</label>
                <select style={S.input} value={assignTeam} onChange={e=>setAssignTeam(e.target.value)}>
                  <option value="">Select a team</option>
                  {roster.map(r=><option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}
                </select>
              </div>
              <div><label style={{fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--ink)", display:"block", marginBottom:"6px"}}>Judge</label>
                <select style={S.input} value={assignJudge} onChange={e=>setAssignJudge(e.target.value)}>
                  <option value="">Select a judge</option>
                  {judges.map(j=><option key={j.username} value={j.username}>{j.username}</option>)}
                </select>
              </div>
            </div>
            <button style={{...S.btn, background:"var(--teal)", color:"var(--teal-deep)", fontWeight:600, marginTop:"14px"}} onClick={doAssign}>Assign</button>

            <div style={{overflowX:"auto", marginTop:"18px"}}>
              <table style={{width:"100%", borderCollapse:"collapse", fontSize:"0.95rem"}}>
                <thead><tr>
                  {["Team","Judge","Action"].map(h=><th key={h} style={{fontFamily:"var(--mono)", textTransform:"uppercase", fontSize:"0.72rem", letterSpacing:"0.04em", textAlign:"left", padding:"12px 14px", borderBottom:"2px solid var(--ink)", color:"var(--ink)"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {assignments.length===0 ? <tr><td colSpan={3} style={{padding:"16px 14px", fontFamily:"var(--mono)", color:"#8FA8AD"}}>No assignments for this round.</td></tr> : assignments.map((a,i)=>(
                    <tr key={i}>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)"}}>{a.team_code}</td>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)"}}>{a.judge_username}</td>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)"}}><button style={{color:"var(--coral)", background:"transparent", border:"none", cursor:"pointer", textDecoration:"underline"}} onClick={()=>unassign(a.judge_username, a.team_code)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{...S.pcard, marginTop:"22px"}}>
            <h4 style={S.h4}>Team Roster</h4>
            <div style={{overflowX:"auto", marginTop:"14px"}}>
              <table style={{width:"100%", borderCollapse:"collapse", fontSize:"0.95rem"}}>
                <thead><tr>
                  {["Team","Track","Kit","Pending","Assigned","Avg Score"].map(h=><th key={h} style={{fontFamily:"var(--mono)", textTransform:"uppercase", fontSize:"0.72rem", letterSpacing:"0.04em", textAlign:"left", padding:"12px 14px", borderBottom:"2px solid var(--ink)", color:"var(--ink)"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {roster.length===0 ? <tr><td colSpan={6} style={{padding:"16px 14px", fontFamily:"var(--mono)", color:"#8FA8AD"}}>No teams yet.</td></tr> : roster.map(r=>(
                    <tr key={r.code}>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)"}}><b>{r.name}</b><br/><span style={{fontSize:"0.8rem", color:"#8FA8AD"}}>{r.code}</span></td>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)"}}>{r.track}</td>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)"}}>{r.kitDrawn?"Yes":"No"}</td>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)"}}>{r.pendingThisRound>0?<b style={{color:"var(--amber)"}}>{r.pendingThisRound}</b>:"0"}</td>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)", fontSize:"0.8rem"}}>{r.assignedJudgesThisRound.join(", ") || "None"}</td>
                      <td style={{padding:"16px 14px", borderBottom:"1px solid var(--line)"}}>{r.avgScoreThisRound ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}