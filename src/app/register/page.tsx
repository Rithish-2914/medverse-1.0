"use client";
import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [track, setTrack] = useState("A");
  const [password, setPassword] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderReg, setLeaderReg] = useState("");
  const [m2Name, setM2Name] = useState("");
  const [m2Reg, setM2Reg] = useState("");
  const [m3Name, setM3Name] = useState("");
  const [m3Reg, setM3Reg] = useState("");
  const [m4Name, setM4Name] = useState("");
  const [m4Reg, setM4Reg] = useState("");
  const [m5Name, setM5Name] = useState("");
  const [m5Reg, setM5Reg] = useState("");
  
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState("");

  const S = {
    wrap: { maxWidth:"1180px", margin:"0 auto", padding:"0 32px" },
    sectionHead: { maxWidth:"640px", marginBottom:"52px" },
    tag: { fontFamily:"var(--mono)", fontSize:"0.75rem", textTransform:"uppercase" as const, letterSpacing:"0.08em", color:"var(--coral)", marginBottom:"12px", display:"block" },
    h2: { fontFamily:"var(--display)", fontWeight:600, fontSize:"clamp(1.8rem,3.4vw,2.6rem)", letterSpacing:"-0.01em", marginBottom:"14px" },
    card: { background:"var(--surface)", borderRadius:"10px", padding:"36px", textAlign:"left" as const, color:"var(--ink)" },
    row: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"16px" },
    label: { fontFamily:"var(--mono)", fontSize:"0.7rem", textTransform:"uppercase" as const, color:"var(--ink)", display:"block", marginBottom:"6px" },
    input: { width:"100%", fontFamily:"var(--body)", fontSize:"0.92rem", padding:"11px 12px", border:"1px solid var(--line)", borderRadius:"4px", background:"var(--paper)", color:"var(--ink)" },
    btn: { fontFamily:"var(--mono)", fontSize:"0.8rem", textTransform:"uppercase" as const, letterSpacing:"0.03em", background:"var(--teal)", color:"var(--teal-deep)", padding:"12px 24px", borderRadius:"3px", border:"none", fontWeight:600, cursor:"pointer", transition:"transform 0.15s" },
    mini: { fontFamily:"var(--mono)", fontSize:"0.72rem", color:"var(--coral)", marginTop:"10px" }
  };

  async function submit() {
    setLoading(true); setErr("");
    const members = [];
    if(leaderName && leaderReg) members.push({name:leaderName, regNo:leaderReg, is_lead:true});
    if(m2Name && m2Reg) members.push({name:m2Name, regNo:m2Reg, is_lead:false});
    if(m3Name && m3Reg) members.push({name:m3Name, regNo:m3Reg, is_lead:false});
    
    

    if(members.length < 1) { setErr("Team leader is required."); setLoading(false); return; }

    const res = await fetch("/api/auth/register", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ teamName, leadName: leaderName, size: members.length, track, password, members })
    });
    const data = await res.json();
    if(!res.ok) { setErr(data.error || "Registration failed"); setLoading(false); return; }
    
    setSuccessCode(data.code);
    setStep(3);
    setLoading(false);
  }

  return (
    <>
      <Nav />
      <section style={{padding:"88px 0", minHeight:"calc(100vh - 160px)"}}>
        <div style={S.wrap}>
          <div style={S.sectionHead}>
            <span style={S.tag}>Team Registration</span>
            <h2 style={S.h2}>Enter the MEDVERSE</h2>
            <p style={{color:"#C7DEE1", fontSize:"1.02rem"}}>Register your team of 1-3 members. Choose your track carefully — it dictates the kind of kits you will draw.</p>
          </div>

          {step === 1 && (
            <div style={{...S.card, maxWidth:"700px"}}>
              <h3 style={{fontFamily:"var(--display)", fontSize:"1.15rem", marginBottom:"24px"}}>Step 1: Team Details</h3>
              <div style={S.row}>
                <div><label style={S.label}>Team Name</label><input style={S.input} value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="E.g. Innovators" /></div>
                <div><label style={S.label}>Track</label>
                  <select style={S.input} value={track} onChange={e=>setTrack(e.target.value)}>
                    <option value="A">Track A - AI</option>
                    <option value="B">Track B - Medical Devices & Hardware</option>
                    <option value="C">Track C - Healthcare Innovation</option>
                  </select>
                </div>
              </div>
              <div><label style={S.label}>Portal Password</label><input type="password" style={S.input} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 characters" /></div>
              <div style={{marginTop:"24px"}}>
                <button style={S.btn} onClick={()=>{
                  if(teamName.length<2 || password.length<6) setErr("Name must be 2+ chars, password 6+ chars.");
                  else { setErr(""); setStep(2); }
                }}>Next: Members</button>
                {err && <p style={S.mini}>{err}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{...S.card, maxWidth:"700px"}}>
              <h3 style={{fontFamily:"var(--display)", fontSize:"1.15rem", marginBottom:"24px"}}>Step 2: Members (1-3 members)</h3>
              
              <div style={{marginBottom:"20px", padding:"16px", background:"var(--paper-2)", borderRadius:"6px"}}>
                <label style={{...S.label, color:"var(--teal)"}}>Team Leader (Required)</label>
                <div style={S.row}>
                  <input style={S.input} placeholder="Name" value={leaderName} onChange={e=>setLeaderName(e.target.value)} />
                  <input style={S.input} placeholder="Reg Number" value={leaderReg} onChange={e=>setLeaderReg(e.target.value.toUpperCase())} />
                </div>
              </div>
              
              {[
                {lbl:"Member 2 (Optional)", n:m2Name, sn:setM2Name, r:m2Reg, sr:setM2Reg},
                {lbl:"Member 3 (Optional)", n:m3Name, sn:setM3Name, r:m3Reg, sr:setM3Reg},
                
                
              ].map((m,i)=>(
                <div key={i} style={{marginBottom:"12px"}}>
                  <label style={S.label}>{m.lbl}</label>
                  <div style={S.row}>
                    <input style={S.input} placeholder="Name" value={m.n} onChange={e=>m.sn(e.target.value)} />
                    <input style={S.input} placeholder="Reg Number" value={m.r} onChange={e=>m.sr(e.target.value.toUpperCase())} />
                  </div>
                </div>
              ))}

              <div style={{display:"flex", gap:"12px", marginTop:"24px"}}>
                <button style={{...S.btn, background:"transparent", border:"1px solid var(--ink)", color:"var(--ink)"}} onClick={()=>setStep(1)}>Back</button>
                <button style={S.btn} onClick={submit} disabled={loading}>{loading ? "Registering..." : "Complete Registration"}</button>
              </div>
              {err && <p style={S.mini}>{err}</p>}
            </div>
          )}

          {step === 3 && (
            <div style={{...S.card, maxWidth:"700px", textAlign:"center", background:"rgba(63,203,224,0.12)", border:"1px solid var(--teal)"}}>
              <h3 style={{fontFamily:"var(--display)", fontSize:"1.8rem", color:"var(--teal)", marginBottom:"10px"}}>Registration Complete!</h3>
              <p style={{marginBottom:"20px"}}>Your team code is your key to the portal. Save it.</p>
              <div style={{fontFamily:"var(--mono)", fontSize:"2.4rem", fontWeight:"bold", color:"var(--white)", padding:"20px", background:"var(--paper)", borderRadius:"8px", marginBottom:"24px", letterSpacing:"0.05em"}}>{successCode}</div>
              <Link href="/participant" style={S.btn}>Go to Participant Portal</Link>
            </div>
          )}

        </div>
      </section>
    </>
  );
}


