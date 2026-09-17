import Link from 'next/link';

export default function ProblemCard({ problem }: { problem: any }) {
  const S = {
    card: { background: "var(--surface)", borderRadius: "10px", padding: "24px", color: "var(--ink)", textDecoration: "none", display: "flex", flexDirection: "column" as const, height: "100%", border: "1px solid var(--line)", transition: "transform 0.15s, border-color 0.15s" },
    tag: { fontFamily: "var(--mono)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--coral)", marginBottom: "12px", display: "inline-block" },
    h3: { fontFamily: "var(--display)", fontWeight: 600, fontSize: "1.4rem", marginBottom: "12px", lineHeight: 1.2 },
    story: { fontSize: "0.95rem", color: "#666", marginBottom: "20px", flex: 1 },
    meta: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--line)" },
    budget: { fontFamily: "var(--mono)", fontWeight: 600, color: "var(--teal-deep)" },
    techWrapper: { display: "flex", flexWrap: "wrap" as const, gap: "6px", marginBottom: "20px" },
    tech: { background: "var(--paper)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "var(--mono)", border: "1px solid var(--line)" }
  };

  return (
    <Link href={'/problems/' + problem.id} style={S.card} className="hover-lift">
      <span style={S.tag}>{problem.id} &middot; {problem.track}</span>
      <h3 style={S.h3}>{problem.title}</h3>
      <div style={S.techWrapper}>
        {problem.technologies.slice(0, 3).map((t: string) => (
          <span key={t} style={S.tech}>{t}</span>
        ))}
        {problem.technologies.length > 3 && <span style={S.tech}>+{problem.technologies.length - 3}</span>}
      </div>
      <p style={S.story}>{problem.story.slice(0, 100)}...</p>
      <div style={S.meta}>
        <div>
          <div style={{fontSize: "0.75rem", textTransform: "uppercase", color: "#888", marginBottom: "4px"}}>Budget</div>
          <div style={S.budget}>₹{problem.budget.toLocaleString()}</div>
        </div>
        <div style={{color: "var(--teal)", fontWeight: 600, fontSize: "0.9rem"}}>Explore &rarr;</div>
      </div>
    </Link>
  );
}



