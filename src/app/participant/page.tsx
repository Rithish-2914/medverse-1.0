"use client";
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';

export default function ParticipantPortal() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [me, setMe] = useState<any>(null);
  const [content, setContent] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [submitOk, setSubmitOk] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [kitRevealed, setKitRevealed] = useState(false);
  const [modalMedia, setModalMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);

  useEffect(() => {
    fetch("/api/team/me").then(r => r.json()).then(async d => {
      if (!d.error) {
        if (!d.kit && d.roundState?.status === "active") {
          await fetch("/api/team/draw-kit", { method: "POST" });
          const meRes = await fetch("/api/team/me");
          if (meRes.ok) d = await meRes.json();
        }
        setMe(d);
        if (d.kit) setKitRevealed(true);
        fetch("/api/team/history").then(r => r.json()).then(hd => setHistory(hd.submissions || []));
      }
    });
  }, []);

  async function login() {
    if (!code || !password || loading) return;
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ code, password, role: 'team' })
    });
    if (!res.ok) {
      setLoginErr("Invalid code or password.");
    } else {
      setLoginErr("");
      window.location.reload();
    }
    setLoading(false);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
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
    if (loading || content.length < 10) return;
    setLoading(true);
    setSubmitErr("");
    setSubmitOk(false);
    const res = await fetch('/api/team/submit', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ content })
    });
    if (!res.ok) {
      const e = await res.json();
      setSubmitErr(e.error || "Submission failed.");
    } else {
      setSubmitOk(true);
      setContent("");
      fetch('/api/team/history').then(r => r.json()).then(hd => setHistory(hd.submissions || []));
    }
    setLoading(false);
  }

  const S = {
    wrap: { maxWidth: "900px", margin: "0 auto", padding: "0 20px" },
    shell: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" },
    loginBox: { padding: "40px", textAlign: "center" as const },
    input: { padding: "10px 14px", borderRadius: "4px", border: "1px solid var(--line)", background: "var(--paper-2)", color: "var(--ink)", fontFamily: "var(--mono)", fontSize: "0.9rem" },
    btn: { padding: "10px 20px", borderRadius: "4px", border: "none", background: "var(--ink)", color: "var(--paper)", fontFamily: "var(--display)", fontWeight: 600, cursor: "pointer" },
    badge: (status: string) => ({ display: "inline-block", padding: "2px 8px", borderRadius: "20px", fontSize: "0.65rem", textTransform: "uppercase" as const, background: status==="active" ? "rgba(63,203,224,0.15)" : status==="rejected" ? "rgba(226,108,93,0.15)" : "var(--paper-2)", color: status==="active" ? "var(--teal)" : status==="rejected" ? "var(--coral)" : "var(--ink)" }),
    h4: { fontFamily: "var(--display)", fontWeight: 600, fontSize: "1rem", color: "var(--teal)", marginBottom: "16px", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
    pcard: { background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "6px", padding: "20px" }
  };

  if (!me) return (
    <>
      <Nav active="participant" />
      <section style={{padding:"88px 0"}}>
        <div style={S.wrap}>
          
          <div style={{marginBottom: "40px"}}>
            <h2 style={{fontFamily:"var(--display)", fontWeight:600, fontSize:"1.8rem", marginBottom:"12px"}}>Participant Portal</h2>
            <p style={{fontSize:"1rem", color:"#8FA8AD"}}>Access your assigned problem kit and submit your solutions for each round.</p>
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

  const ROUNDS = ["Ideation","Mini Review", me?.kit?.twist ? "Twist Round" : "Mid-Point Review", "Final Review","Final Pitch"];
  const canSubmit = me?.roundState?.status === "active" && (me?.roundState?.currentRoundIdx ?? 99) < 4;
  const thisRound = me?.roundState?.currentRoundIdx ?? 0;
  const accepted = history.some(s => s.round_idx === thisRound && s.status === "accepted");

  return (
    <>
      <Nav active="participant" />
      
      {modalMedia && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px'}} onClick={() => setModalMedia(null)}>
          <div style={{position: 'relative', width: '100%', maxWidth: '900px', height: '100%', maxHeight: '600px', background: '#000', borderRadius: '8px', overflow: 'hidden'}} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalMedia(null)} style={{position: 'absolute', top: '10px', right: '10px', background: 'var(--coral)', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold'}}>X</button>
            <iframe src={modalMedia.url} width="100%" height="100%" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <section style={{padding:"88px 0"}}>
        <div style={S.wrap}>
          
          <div style={{...S.shell, marginBottom:"40px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"14px", padding:"20px 32px", background:"var(--paper-2)", borderBottom:"1px solid var(--line)"}}>
              <div style={{fontFamily:"var(--display)", fontWeight:600, fontSize:"1.05rem"}}>{me.team.name} <span style={{opacity:0.5, marginLeft:"8px", fontSize:"0.9rem"}}>{me.team.code} &middot; Track {me.team.track}</span></div>
              <div style={{fontFamily:"var(--mono)", fontSize:"0.8rem", textAlign:"right"}}>
                <div>Current round</div>
                <div style={{color:"var(--coral)", fontWeight:500}}>
                  {me.roundState?.roundName ?? "-"} <span style={S.badge(me.roundState?.status==="active"?"pending":"rejected")}>{me.roundState?.status==="active"?"LIVE":me.roundState?.status==="ended"?"ENDED":"STANDBY"}</span>
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
                <h4 style={S.h4}>Your assigned kit</h4>
                {!me.kit ? (
                  <div style={{fontFamily:"var(--mono)", fontSize:"0.82rem", lineHeight:1.9, color:"#D3E8EA"}}>
                    {me.roundState?.status === "active" ? "Assigning your problem..." : "Your kit is currently sealed. It will automatically open when Round 1 begins."}
                  </div>
                ) : (
                  <div>
                    <div style={{marginBottom: "16px"}}>
                      <div style={{fontFamily:"var(--display)", fontSize:"1.1rem", fontWeight:600, color:"var(--ink)", marginBottom:"12px"}}>{me.kit.disease}</div>
                      
                      <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
                        <button 
                          onClick={() => setModalMedia({type: 'image', url: me.kit.imageLink})} 
                          style={{...S.btn, background:"#fff", color:"#000", border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", padding:"12px"}}
                        >
                          <span style={{fontSize:"1.2rem"}}>🖼️</span> View Problem Brief
                        </button>
                        
                        <button 
                          onClick={() => setModalMedia({type: 'video', url: me.kit.videoLink})} 
                          style={{...S.btn, background:"var(--teal)", color:"var(--teal-deep)", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", padding:"12px"}}
                        >
                          <span style={{fontSize:"1.2rem"}}>🎥</span> Watch Patient Story
                        </button>
                      </div>
                    </div>

                    {me.kit.twist && (
                      <div style={{marginTop:"20px", padding:"16px", background:"var(--paper-2)", border:"1px solid var(--coral)", borderRadius:"6px"}}>
                        <b style={{color:"var(--coral)", display:"block", marginBottom:"6px", textTransform:"uppercase", fontFamily:"var(--mono)", fontSize:"0.8rem"}}>⚠️ TWIST REVEALED</b>
                        <b style={{color:"var(--ink)", display:"inline-block", width:"100px", fontSize:"0.85rem"}}>New Limitation:</b> <span style={{color:"var(--coral)", fontSize:"0.85rem"}}>{me.kit.twist.limitation}</span><br/>
                        <b style={{color:"var(--ink)", display:"inline-block", width:"100px", fontSize:"0.85rem"}}>New Budget:</b> <span style={{fontFamily:"var(--mono)", color:"var(--teal-deep)", fontWeight:600, fontSize:"0.85rem"}}>{me.kit.twist.budget}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={S.pcard}>
                <h4 style={S.h4}>Submit this round</h4>
                {accepted && (
                  <div style={{background:"rgba(63,203,224,0.12)", borderLeft:"2px solid var(--teal)", padding:"10px 14px", borderRadius:"0 4px 4px 0", marginBottom:"12px", color:"var(--ink)", fontFamily:"var(--mono)", fontSize:"0.72rem"}}>
                    This round is locked - a judge has accepted your submission. Wait for the next round.
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
                      <span style={{fontFamily:"var(--mono)", fontSize:"0.72rem", color:"#8FA8AD"}}>{submitErr ? <span style={{color:"var(--coral)"}}>{submitErr}</span> : submitOk ? <span style={{color:"var(--teal)"}}>Submitted!</span> : "Judges review every submission - resubmit freely."}</span>
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
                      <span style={{fontFamily:"var(--mono)", fontSize:"0.78rem", color:"#C7DEE1"}}>Round {s.round_idx+1} &middot; {new Date(s.created_at).toLocaleString()}</span>
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


