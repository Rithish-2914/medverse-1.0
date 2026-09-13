"use client";
import Link from "next/link";
import { useState } from "react";

interface NavProps { active?: "home"|"participant"|"judge"|"admin"; }

export default function Nav({ active }: NavProps) {
  const [open, setOpen] = useState(false);
  const li = (href: string, label: string, key: string) => (
    <li>
      <Link href={href} style={{
        fontFamily:"var(--mono)", fontSize:"0.78rem", textTransform:"uppercase",
        letterSpacing:"0.03em", textDecoration:"none", opacity: active===key ? 1 : 0.75,
        borderBottom: active===key ? "1px solid var(--teal)" : "1px solid transparent",
        color: active===key ? "var(--teal)" : "inherit", paddingBottom:"4px",
        transition:"opacity 0.2s"
      }}>{label}</Link>
    </li>
  );
  return (
    <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(10,13,16,0.88)",backdropFilter:"blur(8px)",borderBottom:"1px solid var(--line)"}}>
      <div className="wrap" style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:"68px"}}>
        <Link href="/" style={{textDecoration:"none",color:"inherit"}}>
          <div style={{fontFamily:"var(--display)",fontWeight:700,fontSize:"1.15rem",letterSpacing:"0.02em",display:"flex",alignItems:"center",gap:"10px"}}>
            <img src="/logo.jpeg" alt="The Medtech Innovators Club logo" style={{width:"34px",height:"34px",borderRadius:"50%",objectFit:"cover"}} />
            MEDVERSE
          </div>
        </Link>
        <nav style={{display: open ? "none" : undefined}}>
          <ul style={{listStyle:"none",display:"flex",gap:"28px",fontFamily:"var(--mono)",fontSize:"0.78rem",letterSpacing:"0.03em",textTransform:"uppercase"}}>
            {li("/","Home","home")}
            {li("/participant","Participant","participant")}
            {li("/judge","Judges","judge")}
            {li("/admin","Organizer","admin")}
          </ul>
        </nav>
        <Link href="/register" style={{fontFamily:"var(--mono)",fontSize:"0.78rem",textTransform:"uppercase",letterSpacing:"0.03em",background:"var(--teal)",color:"var(--teal-deep)",padding:"9px 18px",borderRadius:"3px",textDecoration:"none",whiteSpace:"nowrap",fontWeight:600}}>Register Team</Link>
      </div>
    </header>
  );
}