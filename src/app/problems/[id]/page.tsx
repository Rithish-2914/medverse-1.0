import { problems } from '@/data/problems';
import Nav from '@/components/Nav';
import Link from 'next/link';
import TwistReveal from '@/components/TwistReveal';

export default async function ProblemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = problems.find(p => p.id === id);

  if (!problem) return <div style={{padding:'88px', textAlign:'center'}}>Problem not found. <Link href='/problems'>Go back</Link></div>;

  const S = {
    wrap: { maxWidth: '900px', margin: '0 auto', padding: '40px 32px 120px', minHeight: '100vh' },
    back: { color: 'var(--teal)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'inline-block', marginBottom: '32px' },
    tag: { fontFamily: 'var(--mono)', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--coral)', marginBottom: '12px', display: 'block' },
    h1: { fontFamily: 'var(--display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, marginBottom: '24px', lineHeight: 1.1 },
    storyBox: { background: 'var(--surface)', padding: '32px', borderRadius: '10px', marginBottom: '40px', borderLeft: '4px solid var(--teal)' },
    section: { marginBottom: '40px' },
    h2: { fontFamily: 'var(--display)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' },
    p: { fontSize: '1.05rem', color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const },
    tech: { display: 'inline-block', background: 'var(--paper)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'var(--mono)', marginRight: '8px', marginBottom: '8px' },
    budgetBox: { background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', padding: '24px' },
    bRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed var(--line)' },
    bTotal: { display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontWeight: 600, fontSize: '1.2rem', color: 'var(--teal-deep)' },
    list: { paddingLeft: '20px', color: 'var(--ink)', lineHeight: 1.6 }
  };

  return (
    <>
      <Nav />
      <div style={S.wrap}>
        <Link href='/problems' style={S.back}>&larr; Back to Problem Bank</Link>
        <span style={S.tag}>{problem.id} &middot; {problem.track}</span>
        <h1 style={S.h1}>{problem.title}</h1>
        
        <div style={S.storyBox}>
          <div style={{fontFamily: 'var(--mono)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '8px'}}>Clinical Context</div>
          <div style={S.p}>{problem.story}</div>
        </div>

        <div style={{...S.section}}>
          <h2 style={S.h2}>Problem Statement</h2>
          <p style={S.p}><b>{problem.problemStatement}</b></p>
        </div>

        <div style={{...S.section}}>
          <h2 style={S.h2}>Technologies to be Used</h2>
          <div>{problem.technologies.map(t => <span key={t} style={S.tech}>{t}</span>)}</div>
        </div>

        <div style={{...S.section}}>
          <h2 style={S.h2}>Limitation</h2>
          <p style={S.p}>{problem.limitation}</p>
        </div>

        <div style={{...S.section}}>
          <h2 style={S.h2}>Initial Budget (₹{problem.budget.toLocaleString()})</h2>
          <div style={S.budgetBox}>
            {problem.budgetAnalysis.map((b, i) => (
              <div key={i} style={S.bRow}><span>{b.item}</span><span style={{fontFamily: 'var(--mono)'}}>₹{b.amount.toLocaleString()}</span></div>
            ))}
            <div style={S.bTotal}><span>Total</span><span style={{fontFamily: 'var(--mono)'}}>₹{problem.budget.toLocaleString()}</span></div>
          </div>
        </div>

        <TwistReveal twist={problem.twistLimitation} budget={problem.twistBudget} description={problem.twistBudgetDescription} />

        <div style={{...S.section, marginTop: '40px'}}>
          <h2 style={S.h2}>What Participants Learn</h2>
          <ul style={S.list}>
            {problem.learningOutcomes.map(l => <li key={l}>{l}</li>)}
          </ul>
        </div>
        
        <div style={{marginTop: '80px', padding: '20px', background: 'var(--surface)', fontSize: '0.85rem', color: '#666', borderRadius: '6px'}}>
          <b>Disclaimer:</b> This is an educational innovation challenge. The proposed systems are research challenges and should not be presented as clinically validated medical devices, diagnostic systems, or treatment recommendations.
        </div>
      </div>
    </>
  );
}