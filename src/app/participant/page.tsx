"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function ParticipantPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [content, setContent] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [submitOk, setSubmitOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kitRevealed, setKitRevealed] = useState(false);
  const [checking, setChecking] = useState(true);

  const S = {
    wrap: { maxWidth:"1180px", margin:"0 auto", padding:"0 32px" },
    sectionHead: { maxWidth:"640px", marginBottom:"52px" },
    tag: { fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase" as const, letterSpacing:"0.08em", color:"var(--coral)", marginBottom:"12px", display:"block" },
    h2: { fontFamily:"var(--display)", fontWeight:600, fontSize:"clamp(1.8rem,3.4vw,2.6rem)", letterSpacing:"-0.01em", marginBottom:"14px" },
    input: { width:"100%", fontFamily:"var(--mono)", fontSize:"0.9rem", padding:"13px 16px", border:"1px solid var(--line)", borderRadius:"3px", background:"var(--paper)", color:"var(--ink)", minWidth:"220px" },
    btn: { fontFamily:"var(--mono)", textTransform:"uppercase" as const, fontSize:"0.8rem", letterSpacing:"0.03em", background:"var(--coral)", color:"#fff", border:"none", padding:"14px 22px", borderRadius:"3px", cursor:"pointer", whiteSpace:"nowrap" as const, transition:"transform 0.15s" },
    shell: { background:"var(--surface)", border:"1px solid var(--line)", borderRadius:"10px", overflow:"hidden" },
    loginBox: { padding:"44px 36px", textAlign:"center" as const },
    pcard: { background:"var(--paper)", border:"1px solid var(--line)", borderRadius:"8px", padding:"22px" },
    h4: { fontFamily:"var(--display)", fontSize:"1rem", marginBottom:"14px" },
    badge: (status:string) => {
      let bg = "rgba(226,147,59,0.18)", col = "var(--amber)";
      if(status==="accepted") { bg = "rgba(63,203,224,0.18)"; col = "var(--teal)"; }
      if(status==="rejected") { bg = "rgba(198,80,63,0.18)"; col = "var(--coral)"; }
      return { display:"inline-block", fontFamily:"var(--mono)", fontSize:"0.68rem", textTransform:"uppercase" as const, padding:"3px 9px", borderRadius:"20px", letterSpacing:"0.03em", background:bg, color:col };
    }
  };

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

  async function drawKit() {
    if (loading) return;
    setLoading(true);
    const res = await fetch("/api/team/draw-kit", { method: "POST" });
    if (res.ok) {
      const meRes = await fetch("/api/team/me");
      if (meRes.ok) {
        const data = await meRes.json();
        setMe(data);
      }
      setKitRevealed(true);
    } else {
      alert("Error drawing kit.");
    }
    setLoading(false);
  }

  async function submit() {
    setLoading(true); setSubmitErr(""); setSubmitOk(false);
    const res = await fetch("/api/team/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    const data = await res.json();
    if (!res.ok) { setSubmitErr(data.error || "Submit failed"); setLoading(false); return; }
    setSubmitOk(true); setContent(""); await loadData(); setLoading(false);
  }

  if (checking) return <div style={{minHeight:"100vh", background:"var(--paper)"}} />;

  if (!loggedIn) return (
    <>
      <Nav active="participant" />
      <section style={{padding:"88px 0", minHeight:"calc(100vh - 160px)"}}>
        <div style={S.wrap}>
          <div style={S.sectionHead}>
            <span style={S.tag}>Authenticated — participants only</span>
            <h2 style={S.h2}>Participant Portal</h2>
            <p style={{color:"#C7DEE1", fontSize:"1.02rem"}}>Your team code and password, set at registration. Wrong credentials are rejected — this is real login.</p>
          </div>
          
          <div style={S.shell}>
            <div style={S.loginBox}>
              <p style={{fontFamily:"var(--mono)", textTransform:"uppercase", fontSize:"0.75rem", color:"var(--ink)"}}>Team Login</p>
              <p style={{color:"#C7DEE1", maxWidth:"44ch", margin:"8px auto 22px", fontSize:"0.95rem"}}>Enter your team code and the password you set when registering.</p>
              <div style={{display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap"}}>
                <input style={S.input} placeholder="Team code, e.g. MV-A-2291" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} />
                <input style={S.input} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
                <button style={{...S.btn, opacity:loading?0.5:1}} onClick={login} disabled={loading}>{loading?"Entering...":"Enter Portal"}</button>
              </div>
              {loginErr && <p style={{fontFamily:"var(--mono)", fontSize:"0.72rem", color:"var(--coral)", marginTop:"14px"}}>{loginErr}</p>}
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const ROUNDS = ["Ideation","Mini Review","Twist Round","Final Review","Final Pitch"];
  const canSubmit = me?.roundState?.status === "active" && (me?.roundState?.currentRoundIdx ?? 99) < 4;
  const thisRound = me?.roundState?.currentRoundIdx ?? 0;
  const accepted = history.some(s => s.round_idx === thisRound && s.status === "accepted");

  return (
    <>
      <Nav active="participant" />
      <section style={{padding:"88px 0"}}>
        <div style={S.wrap}>
          
          <div style={{...S.shell, marginBottom:"40px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"14px", padding:"20px 32px", background:"var(--paper-2)", borderBottom:"1px solid var(--line)"}}>
              <div style={{fontFamily:"var(--display)", fontWeight:600, fontSize:"1.05rem"}}>{me.team.name} <span style={{opacity:0.5, marginLeft:"8px", fontSize:"0.9rem"}}>{me.team.code} · Track {me.team.track}</span></div>
              <div style={{fontFamily:"var(--mono)", fontSize:"0.8rem", textAlign:"right"}}>
                <div>Current round</div>
                <div style={{color:"var(--coral)", fontWeight:500}}>
                  {me.roundState?.roundName ?? "—"} <span style={S.badge(me.roundState?.status==="active"?"pending":"rejected")}>{me.roundState?.status==="active"?"LIVE":me.roundState?.status==="ended"?"ENDED":"STANDBY"}</span>
                </div>
              </div>
              <button onClick={logout} style={{fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase", background:"transparent", color:"var(--ink)", border:"1px solid var(--line)", padding:"8px 16px", borderRadius:"3px", cursor:"pointer"}}>Log out</button>
            </div>
            
            <div style={{display:"flex", padding:"24px 32px 6px", gap:"4px", flexWrap:"wrap"}}>
              {ROUNDS.map((r,i) => (
                <div key={i} style={{flex:1, minWidth:"110px", textAlign:"center", fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase", padding:"10px 6px", borderBottom: i<=thisRound ? (i===thisRound ? "3px solid var(--coral)" : "3px solid var(--teal)") : "3px solid var(--line)", color: i<=thisRound ? (i===thisRound ? "var(--coral)" : "var(--ink)") : "#93ADB2", fontWeight: i===thisRound ? 600 : 400}}>{r}</div>
              ))}
            </div>

            <div style={{padding:"28px 32px 34px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"26px"}}>
              
              <div style={S.pcard}>
                <h4 style={S.h4}>Your sealed kit</h4>
                {!me.kit ? (
                  <div style={{fontFamily:"var(--mono)", fontSize:"0.82rem", lineHeight:1.9, color:"#D3E8EA"}}>
                    Click below to receive your assigned problem.
                  </div>
                ) : !kitRevealed ? (
                  <button onClick={drawKit} style={{...S.btn, background:"var(--teal)", color:"var(--teal-deep)"}}>Reveal Kit</button>
                ) : (
                  <div style={{fontFamily:"var(--mono)", fontSize:"0.82rem", lineHeight:1.9, color:"#D3E8EA"}}>
                    <b style={{color:"var(--ink)",display:"inline-block",width:"100px"}}>Problem:</b>{me.kit.disease}<br/>
                    <b style={{color:"var(--ink)",display:"inline-block",width:"100px"}}>Patient:</b>{me.kit.patient}<br/>
                    <b style={{color:"var(--ink)",display:"inline-block",width:"100px"}}>Tech:</b>{me.kit.tech}<br/>
                    <b style={{color:"var(--ink)",display:"inline-block",width:"100px"}}>Budget:</b>{me.kit.budget}<br/>
                    <b style={{color:"var(--ink)",display:"inline-block",width:"100px"}}>Constraint:</b><span style={{color:"var(--coral)"}}>{me.kit.constraint}</span><br/>
                    {me.kit.twist && (
                      <div style={{marginTop:"16px", padding:"12px", background:"var(--paper-2)", border:"1px solid var(--coral)", borderRadius:"6px"}}>
                        <b style={{color:"var(--coral)", display:"block", marginBottom:"6px"}}>⚠️ TWIST REVEALED</b>
                        <b style={{color:"var(--ink)", display:"inline-block", width:"100px"}}>New Limitation:</b> <span style={{color:"var(--coral)"}}>{me.kit.twist.limitation}</span><br/>
                        <b style={{color:"var(--ink)", display:"inline-block", width:"100px"}}>New Budget:</b> <span style={{fontFamily:"var(--mono)", color:"var(--teal-deep)", fontWeight:600}}>{me.kit.twist.budget}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={S.pcard}>
                <h4 style={S.h4}>Submit this round</h4>
                {accepted && (
                  <div style={{background:"rgba(63,203,224,0.12)", borderLeft:"2px solid var(--teal)", padding:"10px 14px", borderRadius:"0 4px 4px 0", marginBottom:"12px", color:"var(--ink)", fontFamily:"var(--mono)", fontSize:"0.72rem"}}>
                    This round is locked — a judge has accepted your submission. Wait for the next round.
                  </div>
                )}
                {!canSubmit && !accepted && (
                  <div style={{background:"rgba(226,147,59,0.12)", borderLeft:"2px solid var(--amber)", padding:"10px 14px", borderRadius:"0 4px 4px 0", marginBottom:"12px", color:"var(--ink)", fontFamily:"var(--mono)", fontSize:"0.72rem"}}>
                    {me.roundState?.status === "ended" ? "Round has ended." : "Round not active."}
                  </div>
                )}
                {canSubmit && !accepted && (
                  <div>
                    <textarea style={{width:"100%", fontFamily:"var(--body)", fontSize:"0.92rem", padding:"12px", border:"1px solid var(--line)", borderRadius:"4px", minHeight:"100px", resize:"vertical", background:"var(--surface)", color:"var(--ink)"}} placeholder="Describe your solution for this round..." value={content} onChange={e=>setContent(e.target.value)} />
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"12px", gap:"10px", flexWrap:"wrap"}}>
                      <span style={{fontFamily:"var(--mono)", fontSize:"0.72rem", color:"#8FA8AD"}}>{submitErr ? <span style={{color:"var(--coral)"}}>{submitErr}</span> : submitOk ? <span style={{color:"var(--teal)"}}>Submitted!</span> : "Judges review every submission — resubmit freely."}</span>
                      <button onClick={submit} disabled={loading||content.length<10} style={{...S.btn, background:"var(--teal)", color:"var(--teal-deep)", fontWeight:600, opacity:(loading||content.length<10)?0.5:1}}>{loading?"Submitting...":"Submit"}</button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div style={{...S.pcard, margin:"0 32px 30px"}}>
              <h4 style={S.h4}>Submission log</h4>
              {history.length === 0 ? (
                <div style={{fontFamily:"var(--mono)", fontSize:"0.78rem", padding:"6px 0", color:"#C7DEE1"}}>No submissions yet.</div>
              ) : (
                history.map(s => (
                  <div key={s.id} style={{padding:"12px 0", borderBottom:"1px dashed var(--line)"}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px"}}>
                      <span style={{fontFamily:"var(--mono)", fontSize:"0.78rem", color:"#C7DEE1"}}>Round {s.round_idx+1} · {new Date(s.created_at).toLocaleString()}</span>
                      <span style={S.badge(s.status)}>{s.status}</span>
                    </div>
                    {s.content && <p style={{fontSize:"0.92rem", color:"var(--ink)", whiteSpace:"pre-wrap"}}>{s.content}</p>}
                    {s.file_name && <p style={{fontSize:"0.85rem", color:"var(--teal)", marginTop:"4px"}}>📎 {s.file_name}</p>}
                    {s.feedback && <div style={{marginTop:"8px", padding:"8px 10px", background:"var(--paper-2)", borderLeft:"2px solid var(--line)", borderRadius:"0 4px 4px 0", fontSize:"0.76rem", color:"var(--ink)"}}><b>Feedback:</b> {s.feedback}</div>}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}


