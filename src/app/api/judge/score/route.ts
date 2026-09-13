import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { CRITERIA, ROUNDS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'judge_session');
  if (!s || s.role !== 'judge') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { code, roundIdx, medical, technical, adapt, budget, innovation, pitch } = body;
  const teamCode = String(code || '').toUpperCase();
  const round = parseInt(roundIdx, 10);
  if (isNaN(round) || round < 0 || round >= ROUNDS.length) return NextResponse.json({ error: 'Invalid round.' }, { status: 400 });
  const assigned = await sql`SELECT 1 FROM judge_assignments WHERE judge_username = ${s.username} AND team_code = ${teamCode} AND round_idx = ${round}`;
  if (!assigned.length) return NextResponse.json({ error: 'Not assigned to this team for this round.' }, { status: 403 });
  const existing = await sql`SELECT 1 FROM scores WHERE team_code = ${teamCode} AND judge_username = ${s.username} AND round_idx = ${round}`;
  if (existing.length) return NextResponse.json({ error: "Score locked. Ask an organiser to override." }, { status: 409 });
  const vals: Record<string, number> = { medical, technical, adapt, budget, innovation, pitch };
  for (const [k, v] of Object.entries(vals)) {
    if (typeof v !== 'number' || v < 0 || v > 10) return NextResponse.json({ error: `Invalid score for ${k} — must be 0-10.` }, { status: 400 });
  }
  const total = CRITERIA.reduce((sum, c) => sum + (vals[c.key] / 10) * c.weight, 0);
  await sql`INSERT INTO scores (team_code, judge_username, round_idx, medical, technical, adapt, budget, innovation, pitch, total) VALUES (${teamCode}, ${s.username}, ${round}, ${medical}, ${technical}, ${adapt}, ${budget}, ${innovation}, ${pitch}, ${total})`;
  return NextResponse.json({ total });
}
