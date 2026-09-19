"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

const ROUNDS = ["Ideation","Mini Review","Twist Round","Final Review","Final Pitch"];
const CRITERIA = [
  { key: "medical", label: "Medical Relevance", weight: 25 },
  { key: "technical", label: "Technical Feasibility", weight: 20 },
  { key: "adapt", label: "Adaptability", weight: 20 },
  { key: "budget", label: "Budget Discipline", weight: 15 },
  { key: "innovation", label: "Innovation", weight: 10 },
  { key: "pitch", label: "Pitch & Q&A", weight: 10 },
];

export default function JudgePage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [mustChangePass, setMustChangePass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [activeRound, setActiveRound] = useState(0);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [teamDoc, setTeamDoc] = useState("");
    const [teamTwist, setTeamTwist] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [existingScore, setExistingScore] = useState<any>(null);
  const [scores, setScores] = useState<any>({ medical:5, technical:5, adapt:5, budget:5, innovation:5, pitch:5 });
  const [feedback, setFeedback] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const S = {
    wrap: { maxWidth:"1180px", margin:"0 auto", padding:"0 32px" },
    tag: { fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase" as const, letterSpacing:"0.08em", color:"var(--coral)", marginBottom:"12px", display:"block" },
    h2: { fontFamily:"var(--display)", fontWeight:600, fontSize:"clamp(1.8rem,3.4vw,2.6rem)", letterSpacing:"-0.01em", marginBottom:"14px" },
    input: { width:"100%", fontFamily:"var(--body)", fontSize:"0.92rem", padding:"11px 12px", border:"1px solid var(--line)", borderRadius:"4px", background:"var(--paper)", color:"var(--ink)" },
    btn: { fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase" as const, background:"var(--teal)", color:"var(--teal-deep)", border:"none", padding:"12px 24px", borderRadius:"3px", cursor:"pointer", whiteSpace:"nowrap" as const, fontWeight:600 },
    pcard: { background:"var(--surface)", border:"1px solid var(--line)", borderRadius:"8px", padding:"22px" },
    h4: { fontFamily:"var(--display)", fontSize:"1rem", marginBottom:"14px" },
    badge: (status:string) => {
      let bg = "rgba(226,147,59,0.18)", col = "var(--amber)";
      if(status==="accepted") { bg = "rgba(63,203,224,0.18)"; col = "var(--teal)"; }
      if(status==="rejected") { bg = "rgba(198,80,63,0.18)"; col = "var(--coral)"; }
      return { display:"inline-block", fontFamily:"var(--mono)", fontSize:"0.68rem", textTransform:"uppercase" as const, padding:"3px 9px", borderRadius:"20px", letterSpacing:"0.03em", background:bg, color:col };
    }
  };

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
    setSelectedTeam(code); setMsg(""); setLoading(true);
    const [subRes, scoreRes] = await Promise.all([
      api(`/api/judge/submissions?teamCode=${code}&round=${activeRound}`),
      api(`/api/judge/score/${code}/${activeRound}`),
    ]);
    if (subRes.ok) { setSubmissions(subRes.data.submissions || []); setTeamDoc(subRes.data.docLink || ""); setTeamTwist(subRes.data.twist || null); }
    if (scoreRes.ok && scoreRes.data.score) setExistingScore(scoreRes.data.score);
    else setExistingScore(null);
    setLoading(false);
  }

  async function decide(id: number, decision: "accept" | "reject") {
    setLoading(true); setMsg("");
    const { ok, data } = await api(`/api/judge/submissions/${id}/decide`, "POST", { decision, feedback: feedback.trim() || undefined });
    if (!ok) { alert(data.error || "Error"); setLoading(false); return; }
    setFeedback("");
    if (selectedTeam) await selectTeam(selectedTeam);
    await loadTeams(activeRound); setLoading(false);
  }

  async function submitScore() {
    if (!selectedTeam) return;
    setLoading(true); setMsg("");
    const { ok, data } = await api("/api/judge/score", "POST", { code: selectedTeam, roundIdx: activeRound, ...scores });
    if (!ok) { alert(data.error || "Error"); setLoading(false); return; }
    alert(`Score saved: ${data.total.toFixed(1)}/100`);
    await selectTeam(selectedTeam); setLoading(false);
  }

  const total = CRITERIA.reduce((s, c) => s + (scores[c.key] / 10) * c.weight, 0);

  if (checking) return <div style={{minHeight:"100vh", background:"var(--paper)"}} />;

  if (!authed) return (
    <>
      <Nav active="judge" />
      <section style={{padding:"88px 0", minHeight:"calc(100vh - 160px)"}}>
        <div style={S.wrap}>
          <div style={{maxWidth:"640px", marginBottom:"52px"}}>
            <span style={S.tag}>Judging Panel</span>
            <h2 style={S.h2}>Evaluate Submissions</h2>
          </div>
          <div style={{background:"var(--surface)", border:"1px solid var(--line)", borderRadius:"10px", padding:"44px 36px", maxWidth:"500px", margin:"0 auto"}}>
            <div style={{display:"grid", gap:"16px", marginBottom:"22px"}}>
              <div><label style={{fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--ink)", display:"block", marginBottom:"6px"}}>Username</label><input style={S.input} value={username} onChange={e=>setUsername(e.target.value)} /></div>
              <div><label style={{fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", color:"var(--ink)", display:"block", marginBottom:"6px"}}>Password</label><input type="password" style={S.input} value={password} onChange={e=>setPassword(e.target.value)} /></div>
            </div>
            <button style={{...S.btn, width:"100%"}} onClick={login} disabled={loading}>{loading?"Signing in...":"Enter Portal"}</button>
            {loginErr && <p style={{fontFamily:"var(--mono)", fontSize:"0.72rem", color:"var(--coral)", marginTop:"14px", textAlign:"center"}}>{loginErr}</p>}
          </div>
        </div>
      </section>
    </>
  );

  if (mustChangePass) return (
    <>
      <Nav active="judge" />
      <section style={{padding:"88px 0", minHeight:"calc(100vh - 160px)"}}>
        <div style={S.wrap}>
          <div style={{background:"var(--surface)", border:"1px solid var(--line)", borderRadius:"10px", padding:"44px 36px", maxWidth:"500px", margin:"0 auto"}}>
            <h3 style={{fontFamily:"var(--display)", fontSize:"1.2rem", marginBottom:"10px"}}>Set Your Password</h3>
            <p style={{color:"#C7DEE1", fontSize:"0.95rem", marginBottom:"22px"}}>You must set a new password before judging.</p>
            <input type="password" style={{...S.input, marginBottom:"22px"}} placeholder="New password (8+ chars)" value={newPass} onChange={e=>setNewPass(e.target.value)} />
            <button style={{...S.btn, width:"100%"}} onClick={changePass} disabled={loading||newPass.length<8}>Set Password</button>
            {loginErr && <p style={{fontFamily:"var(--mono)", fontSize:"0.72rem", color:"var(--coral)", marginTop:"14px"}}>{loginErr}</p>}
          </div>
        </div>
      </section>
    </>
  );

  const pending = submissions.filter(s => s.status === "pending");
  const accepted = submissions.some(s => s.status === "accepted");

  return (
    <>
      <Nav active="judge" />
      <section style={{padding:"40px 0 88px"}}>
        <div style={{maxWidth:"1280px", margin:"0 auto", padding:"0 20px"}}>
          
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
            <div style={{display:"flex", alignItems:"center", gap:"14px"}}>
              <div style={{width:"40px", height:"40px", borderRadius:"50%", background:"var(--teal)", color:"var(--teal-deep)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--display)", fontSize:"1.2rem", fontWeight:700}}>⚖</div>
              <div>
                <div style={{fontFamily:"var(--display)", fontWeight:600, fontSize:"1.1rem"}}>{me?.username}</div>
                <div style={{fontFamily:"var(--mono)", fontSize:"0.75rem", color:"#8FA8AD", textTransform:"uppercase"}}>{ROUNDS[activeRound]}</div>
              </div>
            </div>
            <button onClick={logout} style={{fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase", background:"transparent", color:"var(--ink)", border:"1px solid var(--line)", padding:"8px 16px", borderRadius:"3px", cursor:"pointer"}}>Log out</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"300px 1fr", gap:"30px"}}>
            
            {/* Sidebar */}
            <div style={{background:"var(--surface)", border:"1px solid var(--line)", borderRadius:"8px", padding:"20px", height:"calc(100vh - 200px)", overflowY:"auto"}}>
              <h4 style={{fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase", color:"var(--teal)", marginBottom:"16px", letterSpacing:"0.05em"}}>Assigned Teams</h4>
              {teams.length===0 ? (
                <p style={{fontFamily:"var(--mono)", fontSize:"0.8rem", color:"#8FA8AD"}}>No teams assigned to you for this round.</p>
              ) : teams.map(t=>(
                <button key={t.code} onClick={()=>selectTeam(t.code)} style={{width:"100%", textAlign:"left", padding:"12px 14px", marginBottom:"8px", background:selectedTeam===t.code?"var(--paper-2)":"transparent", border:selectedTeam===t.code?"1px solid var(--teal)":"1px solid var(--line)", borderRadius:"4px", cursor:"pointer", transition:"border-color 0.15s"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px"}}>
                    <span style={{fontFamily:"var(--display)", fontWeight:600, fontSize:"0.95rem", color:selectedTeam===t.code?"var(--teal)":"var(--ink)"}}>{t.name}</span>
                    {t.pendingCount > 0 && <span style={{background:"var(--amber)", color:"var(--paper)", fontSize:"0.65rem", padding:"2px 6px", borderRadius:"10px", fontWeight:700}}>{t.pendingCount} new</span>}
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:"8px", fontFamily:"var(--mono)", fontSize:"0.75rem", color:"#8FA8AD"}}>
                    <span>{t.code}</span>
                    {t.locked && <span style={{color:"var(--teal)"}}>✓ Accepted</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* Main Panel */}
            <div style={{height:"calc(100vh - 200px)", overflowY:"auto", paddingRight:"10px"}}>
              {!selectedTeam ? (
                <div style={{height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", color:"#8FA8AD"}}>Select a team to start reviewing.</div>
              ) : (
                <>
                  <div style={{...S.pcard, marginBottom:"20px"}}>
                    
  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
    <h4 style={{...S.h4, margin:0}}>Submissions Queue</h4>
    {teamDoc && (
      <button onClick={() => window.open(teamDoc, '_blank')} style={{...S.btn, background:"var(--teal)", color:"var(--teal-deep)", border:"none", padding:"8px 16px", fontSize:"0.85rem", fontWeight:600}}>
        View Problem Document (Docs)
      </button>
    )}
  </div>
  
                    
                      {teamTwist && (
                        <div style={{background: "var(--coral)", color: "#fff", padding: "16px", borderRadius: "6px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px"}}>
                          <h4 style={{margin: 0, fontFamily: "var(--display)", fontSize: "1.1rem"}}>TWIST ACTIVE FOR THIS TEAM</h4>
                          <p style={{margin: 0, fontSize: "0.9rem", fontFamily: "var(--mono)"}}><strong>Limitation:</strong> {teamTwist.limitation}</p>
                          <p style={{margin: 0, fontSize: "0.9rem", fontFamily: "var(--mono)"}}><strong>New Budget:</strong> {teamTwist.budget}</p>
                        </div>
                      )}

                      {submissions.length===0 ? (
                      <p style={{fontFamily:"var(--mono)", fontSize:"0.8rem", color:"#8FA8AD"}}>No submissions from this team yet.</p>
                    ) : submissions.map(s=>(
                      <div key={s.id} style={{padding:"20px", background:"var(--paper)", border:"1px solid var(--line)", borderRadius:"6px", marginBottom:"16px"}}>
                        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px"}}>
                          <span style={{fontFamily:"var(--mono)", fontSize:"0.75rem", color:"#8FA8AD"}}>{new Date(s.created_at).toLocaleString()}</span>
                          <span style={S.badge(s.status)}>{s.status}</span>
                        </div>
                        {s.content && <p style={{fontSize:"0.95rem", color:"#D3E8EA", whiteSpace:"pre-wrap", marginBottom:"16px"}}>{s.content}</p>}
                        {s.file_name && <a href={s.file_url??"#"} target="_blank" style={{color:"var(--teal)", fontSize:"0.85rem", textDecoration:"underline", display:"inline-block", marginBottom:"16px"}}>📎 {s.file_name}</a>}
                        
                        {s.status === "pending" && (
                          <div style={{background:"var(--paper-2)", padding:"16px", borderRadius:"4px", border:"1px solid var(--line)"}}>
                            <input style={{...S.input, marginBottom:"12px"}} placeholder="Feedback (required for rejection, optional for accept)" value={feedback} onChange={e=>setFeedback(e.target.value)} />
                            <div style={{display:"flex", gap:"12px"}}>
                              <button onClick={()=>decide(s.id,"accept")} style={{...S.btn, flex:1}}>Accept</button>
                              <button onClick={()=>decide(s.id,"reject")} style={{...S.btn, flex:1, background:"var(--coral)", color:"#fff"}}>Reject</button>
                            </div>
                          </div>
                        )}
                        {s.feedback && <div style={{padding:"10px 14px", background:"var(--paper-2)", borderLeft:"2px solid var(--line)", fontSize:"0.85rem", color:"#D3E8EA"}}><b>Feedback given:</b> {s.feedback}</div>}
                      </div>
                    ))}
                  </div>

                  {accepted && activeRound > 0 && (
                    <div style={S.pcard}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px"}}>
                        <h4 style={{...S.h4, margin:0}}>Score This Team</h4>
                        {existingScore ? (
                          <span style={{background:"rgba(63,203,224,0.12)", color:"var(--teal)", padding:"6px 12px", borderRadius:"20px", fontFamily:"var(--mono)", fontSize:"0.75rem", fontWeight:600}}>Score Locked</span>
                        ) : (
                          <span style={{fontFamily:"var(--display)", fontSize:"1.8rem", fontWeight:700}}>{total.toFixed(1)}<span style={{fontSize:"1rem", color:"#8FA8AD", fontWeight:400}}>/100</span></span>
                        )}
                      </div>
                      
                      {existingScore ? (
                        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px"}}>
                          {CRITERIA.map(c=>(
                            <div key={c.key} style={{display:"flex", justifyContent:"space-between", padding:"12px", background:"var(--paper-2)", borderRadius:"4px", border:"1px solid var(--line)"}}>
                              <span style={{color:"#D3E8EA", fontSize:"0.9rem"}}>{c.label}</span>
                              <span style={{fontFamily:"var(--mono)", fontWeight:600}}>{existingScore[c.key]}/10</span>
                            </div>
                          ))}
                          <div style={{gridColumn:"1 / -1", display:"flex", justifyContent:"space-between", padding:"16px", background:"rgba(63,203,224,0.05)", borderRadius:"4px", border:"1px solid var(--teal)", marginTop:"10px"}}>
                            <span style={{fontFamily:"var(--display)", fontSize:"1.1rem", fontWeight:600}}>Total Score</span>
                            <span style={{fontFamily:"var(--mono)", fontSize:"1.2rem", fontWeight:700, color:"var(--teal)"}}>{Number(existingScore.total).toFixed(1)}/100</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {CRITERIA.map(c=>(
                            <div key={c.key} style={{marginBottom:"20px"}}>
                              <div style={{display:"flex", justifyContent:"space-between", marginBottom:"8px"}}>
                                <span style={{fontSize:"0.9rem", color:"#D3E8EA"}}>{c.label} <span style={{fontFamily:"var(--mono)", fontSize:"0.75rem", color:"var(--coral)"}}>({c.weight}%)</span></span>
                                <span style={{fontFamily:"var(--mono)", fontWeight:600}}>{scores[c.key]}/10</span>
                              </div>
                              <input type="range" min={0} max={10} step={1} value={scores[c.key]} onChange={e=>setScores((prev: any)=>({...prev, [c.key]:Number(e.target.value)}))} style={{width:"100%", accentColor:"var(--teal)"}} />
                            </div>
                          ))}
                          <button onClick={submitScore} style={{...S.btn, width:"100%", marginTop:"10px"}}>Lock Score — {total.toFixed(1)}/100</button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
