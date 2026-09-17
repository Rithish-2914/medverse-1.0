"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

const s: React.CSSProperties = {};
const ROUNDS = ["Ideation","Mini Review","Twist Round","Final Review","Final Pitch"];

interface PublicState { currentRoundIdx:number; status:string; roundName:string; totalRounds:number; revealedTwist:string|null; }
const KITS_A = [
  {disease:"Type 2 Diabetes (rural)",tech:"SMS-based chatbot",budget:"₹4,000",constraint:"No smartphone required"},
  {disease:"Hypertension screening",tech:"TinyML on microcontroller",budget:"₹6,500",constraint:"Battery-only power"},
  {disease:"Tuberculosis contact tracing",tech:"WhatsApp API",budget:"₹2,500",constraint:"Works on 2G network"},
];
const KITS_B = [
  {disease:"Diabetic foot ulcer monitoring",tech:"Resistive pressure sensor array",budget:"₹8,000",constraint:"Single-use strip"},
  {disease:"Neonatal jaundice",tech:"Photodiode + LED colorimeter",budget:"₹3,500",constraint:"No refrigeration"},
  {disease:"COPD exacerbation alert",tech:"MEMS microphone + DSP",budget:"₹5,000",constraint:"Clip-on, no straps"},
];
const KITS_C = [
  {disease:"Postpartum haemorrhage",tech:"Visual estimation protocol",budget:"₹1,200",constraint:"ASHA worker operable"},
  {disease:"Childhood stunting",tech:"Mid-upper arm circumference tape",budget:"₹800",constraint:"Illiterate-friendly"},
  {disease:"Snake-bite first response",tech:"Paper-based triage card",budget:"₹300",constraint:"No electricity"},
];

export default function Home() {
  const [state, setState] = useState<PublicState|null>(null);
  const [kit, setKit] = useState<{disease:string;tech:string;budget:string;constraint:string}|null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(()=>{
    fetch("/api/public/state").then(r=>r.json()).then(setState).catch(()=>{});
    const t = setInterval(()=>fetch("/api/public/state").then(r=>r.json()).then(setState).catch(()=>{}),10000);
    return ()=>clearInterval(t);
  },[]);

  function drawKit(){
    setDrawing(true);
    setTimeout(()=>{
      const allKits=[...KITS_A,...KITS_B,...KITS_C];
      setKit(allKits[Math.floor(Math.random()*allKits.length)]);
      setDrawing(false);
    },600);
  }

  const S={
    wrap:"wrap",
    tag:{fontFamily:"var(--mono)",fontSize:"0.75rem",textTransform:"uppercase" as const,letterSpacing:"0.08em",color:"var(--coral)",marginBottom:"12px",display:"block"},
    h2:{fontFamily:"var(--display)",fontWeight:600,fontSize:"clamp(1.8rem,3.4vw,2.6rem)",letterSpacing:"-0.01em",marginBottom:"14px"},
    sectionHead:{maxWidth:"640px",marginBottom:"52px"},
    monoSm:{fontFamily:"var(--mono)",fontSize:"0.78rem"},
    btn1:{fontFamily:"var(--mono)",textTransform:"uppercase" as const,fontSize:"0.8rem",letterSpacing:"0.03em",background:"var(--coral)",color:"var(--white)",padding:"15px 26px",borderRadius:"3px",textDecoration:"none",border:"1px solid var(--coral)",display:"inline-block"},
    btn2:{fontFamily:"var(--mono)",textTransform:"uppercase" as const,fontSize:"0.8rem",letterSpacing:"0.03em",background:"transparent",color:"var(--ink)",padding:"15px 26px",borderRadius:"3px",textDecoration:"none",border:"1px solid var(--ink)",display:"inline-block"},
  };

  return (
    <>
      <Nav active="home" />

      {/* HERO */}
      <section style={{position:"relative",padding:"96px 0 70px",overflow:"hidden"}}>
        <div className={S.wrap}>
          <div style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:"48px",alignItems:"center"}}>
            <div>
              <span style={{fontFamily:"var(--mono)",fontSize:"0.78rem",textTransform:"uppercase",letterSpacing:"0.08em",display:"flex",alignItems:"center",gap:"10px",marginBottom:"18px"}}>
                <span style={{width:"26px",height:"1px",background:"var(--coral)",display:"inline-block"}}/>
                A cross-domain medtech build event — by The Medtech Innovators Club, VIT Vellore
              </span>
              <h1 style={{fontFamily:"var(--display)",fontWeight:700,fontSize:"clamp(2.6rem,6vw,4.4rem)",lineHeight:0.98,letterSpacing:"-0.01em",marginBottom:"22px"}}>
                Diagnose the<br/>constraint. <em style={{fontStyle:"normal",color:"var(--teal)"}}>Prescribe</em><br/>the innovation.
              </h1>
              <p style={{fontSize:"1.15rem",maxWidth:"46ch",color:"#D3E8EA",marginBottom:"32px"}}>
                MEDVERSE hands your team a real disease, a real technology, and a real budget — then narrows all three under real-world pressure. No domain sits on the sidelines: CSE, IT, Mechanical, ECE, Biomedical, Medicine and Pharmacy each have a track built for them.
              </p>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                <Link href="/register" style={S.btn1}>Register Your Team</Link>
                <a href="#flow" style={S.btn2}>See the Flow</a>
              </div>
            </div>
            <div style={{background:"var(--teal-deep)",borderRadius:"6px",padding:"28px 22px 20px",position:"relative"}}>
              <div style={{fontFamily:"var(--mono)",color:"#B9D8CF",fontSize:"0.72rem",textTransform:"uppercase",letterSpacing:"0.08em",display:"flex",justifyContent:"space-between",marginBottom:"14px"}}>
                <span>SOLUTION VITALS — LIVE</span>
                <span style={{color:"var(--amber)",display:"flex",alignItems:"center",gap:"6px"}}>
                  <span style={{width:"8px",height:"8px",borderRadius:"50%",background:"var(--amber)",animation:"blip 1.6s infinite",display:"inline-block"}}/>
                  {state ? (state.status==="active"?"LIVE":state.status==="ended"?"ENDED":"MONITORING") : "MONITORING"}
                </span>
              </div>
              <svg viewBox="0 0 460 120" preserveAspectRatio="none" style={{width:"100%",height:"120px",display:"block"}}>
                <path fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="900" strokeDashoffset="900"
                  d="M0,60 L60,60 L80,60 L95,20 L110,100 L125,40 L140,60 L200,60 L215,60 L230,25 L245,95 L260,45 L275,60 L340,60 L355,60 L370,15 L385,105 L400,50 L415,60 L460,60"
                  style={{animation:"draw 3.6s ease-in-out infinite"}}
                />
              </svg>
              {state && (
                <div style={{marginTop:"12px"}}>
                  <div style={{fontFamily:"var(--mono)",color:"#7FA79B",fontSize:"0.7rem"}}>
                    {state.status==="active" ? `LIVE — ${state.roundName}` : state.status==="ended" ? `ENDED — ${state.roundName}` : `STANDBY — ${state.roundName}`}
                  </div>
                  <div style={{display:"flex",gap:"3px",marginTop:"8px"}}>
                    {ROUNDS.map((r,i)=>(
                      <div key={i} title={r} style={{flex:1,height:"3px",borderRadius:"2px",background:i<state.currentRoundIdx?"var(--teal)":i===state.currentRoundIdx?(state.status==="active"?"var(--amber)":"var(--coral)"):"rgba(255,255,255,0.1)"}}/>
                    ))}
                  </div>
                  {state.revealedTwist && <div style={{marginTop:"10px",padding:"8px 10px",background:"rgba(242,168,62,0.12)",borderLeft:"2px solid var(--amber)",borderRadius:"0 4px 4px 0",fontFamily:"var(--mono)",fontSize:"0.72rem",color:"var(--amber)"}}>TWIST: {state.revealedTwist}</div>}
                </div>
              )}
              <div style={{fontFamily:"var(--mono)",color:"#7FA79B",fontSize:"0.7rem",marginTop:"10px"}}>IDEATION → MINI REVIEW → TWIST → FINAL REVIEW → PITCH</div>
            </div>
          </div>
        </div>
        <style>{`@keyframes draw{0%{stroke-dashoffset:900}55%{stroke-dashoffset:0}100%{stroke-dashoffset:-900}} @keyframes blip{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(1.3)}} .wrap{max-width:1180px;margin:0 auto;padding:0 32px} @media(max-width:640px){.wrap{padding:0 20px}}`}</style>
      </section>

      {/* TRACKS */}
      <section style={{background:"var(--surface)",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)",padding:"88px 0"}}>
        <div className="wrap">
          <div style={S.sectionHead}>
            <span style={S.tag}>Entry point for every branch</span>
            <h2 style={S.h2}>Three tracks. No leftover teams.</h2>
            <p style={{color:"#C7DEE1",fontSize:"1.02rem",maxWidth:"56ch"}}>Kits are still drawn at random within a track — nobody picks the easy problem — but the track itself guarantees the technology fits the room you&apos;re bringing.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",background:"var(--line)",border:"1px solid var(--line)",borderRadius:"8px",overflow:"hidden"}}>
            {[
              {num:"TRACK A",title:"Digital Health & AI",desc:"Software, AI/ML, mobile and telemedicine problems — screening algorithms, triage bots, health data platforms.",chips:["CSE","IT","AI & DS","Data Science"]},
              {num:"TRACK B",title:"MedTech Hardware",desc:"Wearables, diagnostic devices, low-cost prototyping — build something a hand can hold and a clinic can afford.",chips:["Mechanical","ECE","Biomedical","Instrumentation"]},
              {num:"TRACK C",title:"Care Delivery & Diagnostics",desc:"Screening protocols, triage logic, public-health and last-mile delivery problems grounded in clinical reality.",chips:["Medicine","Pharmacy","Biotech","Nursing"]},
            ].map(t=>(
              <div key={t.num} style={{background:"var(--paper)",padding:"34px 28px"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:"0.75rem",color:"var(--teal)",marginBottom:"16px"}}>{t.num}</div>
                <h3 style={{fontFamily:"var(--display)",fontSize:"1.3rem",marginBottom:"10px"}}>{t.title}</h3>
                <p style={{fontSize:"0.95rem",color:"#C7DEE1",marginBottom:"16px"}}>{t.desc}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {t.chips.map(c=><span key={c} style={{fontFamily:"var(--mono)",fontSize:"0.68rem",textTransform:"uppercase",background:"var(--paper-2)",border:"1px solid var(--line)",padding:"4px 9px",borderRadius:"20px"}}>{c}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section id="flow" style={{padding:"88px 0"}}>
        <div className="wrap">
          <div style={S.sectionHead}>
            <span style={S.tag}>Five rounds, each one closing a gap</span>
            <h2 style={S.h2}>The event flow — and what stops it being gamed</h2>
          </div>
          <div style={{position:"relative"}}>
            <div style={{position:"absolute",left:"29px",top:"8px",bottom:"8px",width:"2px",background:"repeating-linear-gradient(to bottom,var(--teal) 0 6px,transparent 6px 12px)"}}/>
            {[
              {n:"1",h:"Ideation Round",p:"Teams draw a sealed kit — disease, assigned technology, starting budget, constraints — and submit an idea through the portal.",fix:<><b style={{color:"var(--coral)"}}>Fix:</b> no fixed attempt cap — submit and resubmit as needed until a judge accepts one.</>},
              {n:"2",h:"Mini Review",p:"Judges review every accepted idea against the published rubric and return written feedback before development starts.",fix:<><b style={{color:"var(--coral)"}}>Fix:</b> itemised costing sheet required — no budget line can go unexplained.</>},
              {n:"3",h:"Twist Round",p:"Details for this round are revealed once the organiser starts it — including a constraint change drawn from the sealed twist deck.",fix:<><b style={{color:"var(--coral)"}}>Fix:</b> twist is drawn and revealed live — no team gets advance notice.</>},
              {n:"4",h:"Final Review",p:"Judges evaluate how the solution evolved since the previous round, then teams get one last window for improvements.",fix:<><b style={{color:"var(--coral)"}}>Fix:</b> rounds are started and ended by the organiser manually — no countdown, no timezone confusion.</>},
              {n:"5",h:"Final Pitch",p:"Final PPT goes in on the standard MEDVERSE template. Teams pitch to judges, then take questions.",fix:<><b style={{color:"var(--coral)"}}>Fix:</b> template deviations cost pitch-clarity points, not disqualification — the idea is still judged on merit.</>},
            ].map((item,i)=>(
              <div key={i} style={{position:"relative",paddingLeft:"76px",marginBottom:"44px"}}>
                <div style={{position:"absolute",left:0,top:0,width:"60px",height:"60px",borderRadius:"50%",background:"var(--teal)",color:"var(--teal-deep)",fontFamily:"var(--mono)",fontSize:"1rem",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>{item.n}</div>
                <h3 style={{fontFamily:"var(--display)",fontSize:"1.25rem",marginBottom:"8px"}}>{item.h}</h3>
                <p style={{color:"#C7DEE1",maxWidth:"60ch",marginBottom:"10px"}}>{item.p}</p>
                <div style={{fontFamily:"var(--mono)",fontSize:"0.78rem",background:"rgba(63,203,224,0.12)",borderLeft:"2px solid var(--teal)",padding:"10px 14px",borderRadius:"0 4px 4px 0",maxWidth:"60ch"}}>{item.fix}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KIT DEMO */}
      <section id="kit" style={{padding:"88px 0"}}>
        <div className="wrap">
          <div style={{background:"var(--teal-deep)",color:"var(--white)",borderRadius:"10px",padding:"44px 36px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"20px",flexWrap:"wrap",marginBottom:"28px"}}>
              <div>
                <h2 style={{fontFamily:"var(--display)",color:"var(--white)",marginBottom:"8px",fontSize:"clamp(1.8rem,3.4vw,2.6rem)",fontWeight:600}}>See the fairness mechanism</h2>
                <p style={{color:"#B9D8CF",maxWidth:"52ch",fontSize:"0.95rem"}}>This is the same random draw every real team gets — disease, technology, budget, and constraint pulled from a sealed pool. Nobody chooses their kit.</p>
              </div>
              <button onClick={drawKit} disabled={drawing} style={{fontFamily:"var(--mono)",textTransform:"uppercase",fontSize:"0.8rem",letterSpacing:"0.03em",background:"var(--amber)",color:"var(--teal-deep)",border:"none",padding:"14px 22px",borderRadius:"3px",cursor:"pointer",whiteSpace:"nowrap",opacity:drawing?0.6:1,transition:"transform 0.15s"}}>
                {drawing ? "Drawing…" : "Draw a Sample Kit"}
              </button>
            </div>
            <div style={{background:"#0D2F2B",border:"1px solid #2A5F55",borderRadius:"8px",padding:"26px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"22px"}}>
              {[
                {label:"Problem",val:kit?.disease ?? "—"},
                {label:"Assigned Tech",val:kit?.tech ?? "—"},
                {label:"Budget",val:kit?.budget ?? "—"},
                {label:"Constraint",val:kit?.constraint ?? "—"},
              ].map(f=>(
                <div key={f.label}>
                  <div style={{fontFamily:"var(--mono)",fontSize:"0.68rem",textTransform:"uppercase",color:"#7FA79B",marginBottom:"6px"}}>{f.label}</div>
                  <div style={{fontFamily:"var(--display)",fontSize:"1.02rem",lineHeight:1.3}}>{f.val}</div>
                </div>
              ))}
            </div>
            <div style={{fontFamily:"var(--mono)",fontSize:"0.72rem",color:"#5E8A80",marginTop:"22px",letterSpacing:"0.04em"}}>
              {kit ? `KIT DRAWN — ${new Date().toLocaleTimeString()}` : "KIT ID — draw to generate"}
            </div>
          </div>
        </div>
      </section>

      {/* RULES */}
      <section id="rules" style={{padding:"88px 0"}}>
        <div className="wrap">
          <div style={S.sectionHead}>
            <span style={S.tag}>Written down before Round 1, not decided after</span>
            <h2 style={S.h2}>Fair play, spelled out</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"22px"}}>
            {[
              {tag:"Kit Integrity",h:"Sealed & randomised",p:"Kits are drawn electronically within your track. No swapping, no re-rolling, no \"we'd prefer a different disease.\""},
              {tag:"Originality",h:"Similarity checked",p:"Every idea submission runs through a similarity check against all other teams' accepted ideas that season."},
              {tag:"Judging",h:"Conflict of interest = recusal",p:"Any judge who mentored or advised a team during development does not score that team, in any round."},
              {tag:"Round Control",h:"Started and ended manually",p:"Every round opens only when the organiser presses Start, and closes only when they press End. No countdowns, no timezones."},
              {tag:"Safety Net",h:"Organiser can step in",p:"A wrongly-drawn kit, a locked-out team, a stuck submission — organisers have direct override powers for exactly these situations, always logged."},
              {tag:"No Side Channels",h:"Portal-only, no exceptions",p:"Submissions via email, WhatsApp, or handing a judge a pen-drive after a round ends are not accepted — regardless of reason."},
              {tag:"Budget",h:"Itemised, always",p:"Every budget submission needs a line-by-line costing sheet — audited at Mini Review and re-checked at each later round."},
              {tag:"Adaptation",h:"Diff, not do-over",p:"A later round's portal shows judges a diff of your original vs. revised solution — starting from scratch is visible, and scored down."},
            ].map(r=>(
              <div key={r.tag} style={{background:"var(--surface)",border:"1px solid var(--line)",borderRadius:"8px",padding:"24px 26px"}}>
                <span style={{fontFamily:"var(--mono)",fontSize:"0.7rem",textTransform:"uppercase",color:"var(--coral)",marginBottom:"10px",display:"block"}}>{r.tag}</span>
                <h3 style={{fontFamily:"var(--display)",fontSize:"1.08rem",marginBottom:"8px"}}>{r.h}</h3>
                <p style={{fontSize:"0.92rem",color:"#C7DEE1"}}>{r.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RUBRIC */}
      <section style={{background:"var(--surface)",borderTop:"1px solid var(--line)",borderBottom:"1px solid var(--line)",padding:"88px 0"}}>
        <div className="wrap">
          <div style={S.sectionHead}>
            <span style={S.tag}>Published before the event starts</span>
            <h2 style={S.h2}>How every round is scored</h2>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.95rem"}}>
              <thead><tr>
                {["Criteria","What it measures","Weight"].map(h=><th key={h} style={{fontFamily:"var(--mono)",textTransform:"uppercase",fontSize:"0.72rem",letterSpacing:"0.04em",textAlign:"left",padding:"12px 14px",borderBottom:"2px solid var(--ink)",color:"var(--ink)"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  ["Medical relevance","Does the solution actually address the assigned disease/problem for the assigned users?","25%"],
                  ["Technical feasibility","Can the assigned technology realistically be built or prototyped within budget?","20%"],
                  ["Adaptability","How well the team adjusted an existing solution under a later constraint change, not a new one","20%"],
                  ["Budget discipline","Itemised, justified, and consistent across rounds","15%"],
                  ["Innovation","Originality of approach within the given constraints","10%"],
                  ["Pitch & Q&A","Clarity of the final presentation and quality of answers under questioning","10%"],
                ].map(([c,m,w])=>(
                  <tr key={c as string}>
                    <td style={{padding:"16px 14px",borderBottom:"1px solid var(--line)",verticalAlign:"top"}}>{c}</td>
                    <td style={{padding:"16px 14px",borderBottom:"1px solid var(--line)",verticalAlign:"top",color:"#C7DEE1"}}>{m}</td>
                    <td style={{padding:"16px 14px",borderBottom:"1px solid var(--line)",verticalAlign:"top",fontFamily:"var(--mono)",fontWeight:500,color:"var(--coral)"}}>{w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* DQ */}
      <section style={{padding:"88px 0"}}>
        <div className="wrap">
          <div style={{background:"var(--paper-2)",borderRadius:"8px",padding:"30px"}}>
            <h3 style={{fontFamily:"var(--display)",fontSize:"1.1rem",marginBottom:"14px"}}>Disqualification triggers — stated upfront, no exceptions after the fact</h3>
            <ul style={{paddingLeft:"20px",color:"#C7DEE1",fontSize:"0.94rem"}}>
              {["Two confirmed instances of plagiarised or copied submission content","Submitting after the organiser has ended that round","Submitting anything through a channel other than the portal","No-show at Final Pitch without prior notice to organisers","Kit swapping or attempting to influence kit assignment"].map(l=>(
                <li key={l} style={{marginBottom:"6px"}}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{background:"var(--teal-deep)",color:"var(--white)",textAlign:"center",padding:"90px 0"}}>
        <div className="wrap">
          <h2 style={{fontFamily:"var(--display)",color:"var(--white)",margin:"0 auto 14px",maxWidth:"20ch",fontSize:"clamp(1.8rem,3.4vw,2.6rem)",fontWeight:600}}>Ready to draw your kit?</h2>
          <p style={{color:"#B9D8CF",maxWidth:"48ch",margin:"0 auto 30px"}}>Registration takes two minutes. Your sealed scenario is waiting.</p>
          <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap"}}>
            <Link href="/register" style={S.btn1}>Register Your Team</Link>
            <Link href="/participant" style={{...S.btn2,color:"var(--white)",borderColor:"rgba(245,251,252,0.4)"}}>Team Portal</Link>
          </div>
        </div>
      </section>

      <footer style={{padding:"34px 0",textAlign:"center",fontFamily:"var(--mono)",fontSize:"0.75rem",color:"#7C9599"}}>
        MEDVERSE — CROSS-DOMAIN MEDTECH BUILD EVENT · Presented by The Medtech Innovators Club, VIT Vellore
      </footer>
    </>
  );
}
