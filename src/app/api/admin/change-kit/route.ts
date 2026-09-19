import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { problems } from '@/data/problems';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { teamCode, problemId } = await req.json();
  if (!teamCode || !problemId) return NextResponse.json({ error: 'Team Code and Problem ID are required.' }, { status: 400 });

  const p = problems.find(x => x.id === problemId);
  if (!p) return NextResponse.json({ error: 'Invalid Problem ID (e.g. AI-01, DEVICE-03, INNOVATION-05).' }, { status: 404 });

  const diseaseStr = p.id + ': ' + p.title;
  const budgetStr = 'Rs. ' + p.budget.toLocaleString();
  const techStr = p.technologies.join(', ');

  const existing = await sql\SELECT 1 FROM kits WHERE team_code = \$teamCode\;
  if (existing.length) {
    await sql\
      UPDATE kits 
      SET disease = \${diseaseStr}\, patient = \${p.story}\, problem = \${p.problemStatement}\, tech = \${techStr}\, budget = \${budgetStr}\, constraint_text = \${p.limitation}\
      WHERE team_code = \$teamCode
    \;
  } else {
    await sql\
      INSERT INTO kits (team_code, disease, patient, problem, tech, budget, constraint_text)
      VALUES (\$teamCode, \${diseaseStr}\, \${p.story}\, \${p.problemStatement}\, \${techStr}\, \${budgetStr}\, \${p.limitation}\)
    \;
  }

  await sql\INSERT INTO admin_log (actor, message) VALUES ('organizer', 'Forced changed problem for team ' || \$teamCode || ' to ' || \$problemId)\;

  return NextResponse.json({ ok: true });
}
