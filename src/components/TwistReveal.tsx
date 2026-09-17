"use client";
import { useState } from 'react';

export default function TwistReveal({ twist, budget, description }: { twist: string, budget: number, description: string }) {
  const [open, setOpen] = useState(false);
  const S = {
    wrap: { background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden", marginTop: "40px" },
    btn: { width: "100%", padding: "20px", background: open ? "var(--teal-deep)" : "var(--surface)", color: open ? "#fff" : "var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", cursor: "pointer", fontFamily: "var(--display)", fontSize: "1.2rem", fontWeight: 600, transition: "background 0.2s" },
    content: { padding: "24px", display: open ? "block" : "none" },
    label: { fontFamily: "var(--mono)", fontSize: "0.8rem", textTransform: "uppercase" as const, color: "#666", marginBottom: "8px", display: "block" },
    val: { fontSize: "1.1rem", marginBottom: "20px" },
    budgetWrap: { background: "var(--surface)", padding: "16px", borderRadius: "6px", display: "inline-block" }
  };

  return (
    <div style={S.wrap}>
      <button onClick={() => setOpen(!open)} style={S.btn}>
        <span>{open ? "Twist Revealed" : "Reveal Challenge Twist"}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      <div style={S.content}>
        <span style={S.label}>New Limitation</span>
        <div style={S.val}><b>{twist}</b></div>
        <div style={S.budgetWrap}>
          <span style={S.label}>Revised Budget</span>
          <div style={{fontFamily: "var(--mono)", fontSize: "1.4rem", fontWeight: 600, color: "var(--coral)", marginBottom: "8px"}}>₹{budget.toLocaleString()}</div>
          <div style={{fontSize: "0.9rem", color: "#666"}}>{description}</div>
        </div>
      </div>
    </div>
  );
}
