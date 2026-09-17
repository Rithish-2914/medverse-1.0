"use client";
import { useState } from 'react';
import Nav from '@/components/Nav';
import { problems } from '@/data/problems';
import ProblemCard from '@/components/ProblemCard';

export default function ProblemsExplorer() {
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("All");

  const tracks = ["All", "AI", "Medical Devices & Hardware", "Healthcare Innovation"];

  const filtered = problems.filter(p => {
    if (track !== "All" && p.track !== track) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q) && !p.technologies.some(t => t.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  const S = {
    wrap: { maxWidth: "1180px", margin: "0 auto", padding: "0 32px", minHeight: "calc(100vh - 160px)", paddingBottom: "88px" },
    head: { padding: "88px 0 40px", borderBottom: "1px solid var(--line)", marginBottom: "40px" },
    h1: { fontFamily: "var(--display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 600, marginBottom: "16px" },
    desc: { fontSize: "1.1rem", color: "#666", maxWidth: "600px", lineHeight: 1.6 },
    controls: { display: "flex", flexWrap: "wrap" as const, gap: "20px", marginBottom: "40px", alignItems: "center" },
    search: { padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--line)", width: "100%", maxWidth: "320px", fontFamily: "var(--body)", fontSize: "0.95rem" },
    filters: { display: "flex", flexWrap: "wrap" as const, gap: "8px" },
    pill: (active: boolean) => ({ padding: "8px 16px", borderRadius: "20px", background: active ? "var(--ink)" : "var(--paper)", color: active ? "#fff" : "var(--ink)", border: active ? "1px solid var(--ink)" : "1px solid var(--line)", cursor: "pointer", fontSize: "0.85rem", fontWeight: active ? 600 : 400 }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }
  };

  return (
    <>
      <Nav />
      <div style={S.wrap}>
        <div style={S.head}>
          <h1 style={S.h1}>Problem Bank</h1>
          <p style={S.desc}>Explore 15 distinct healthcare innovation challenges. Discover problems across AI, medical hardware, and biotechnology.</p>
        </div>
        
        <div style={S.controls}>
          <input type="text" placeholder="Search by title, ID, or tech..." value={search} onChange={e => setSearch(e.target.value)} style={S.search} />
          <div style={S.filters}>
            {tracks.map(t => (
              <button key={t} onClick={() => setTrack(t)} style={S.pill(track === t)}>{t}</button>
            ))}
          </div>
        </div>

        <div style={S.grid}>
          {filtered.map(p => <ProblemCard key={p.id} problem={p} />)}
        </div>
        
        {filtered.length === 0 && <div style={{padding: "40px 0", textAlign: "center", color: "#888"}}>No problems found matching your criteria.</div>}
      </div>
    </>
  );
}
