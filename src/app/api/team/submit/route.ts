import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { drawKit, ROUNDS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'team_session');
  if (!s || s.role !== 'team') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { content } = body;
  if (!content || String(content).trim().length < 10)
    return NextResponse.json({ error: 'Submission content is too short (minimum 10 characters).' }, { status: 400 });
  if (String(content).length > 20000)
    return NextResponse.json({ error: 'Submission too long (max 20,000 characters).' }, { status: 400 });

  const stateRows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = stateRows[0];
  if (!state || state.status !== 'active')
    return NextResponse.json({ error: 'No round is currently active.' }, { status: 409 });

  const roundIdx: number = state.current_round_idx;
  if (roundIdx >= ROUNDS.length - 1)
    return NextResponse.json({ error: 'Use the PPT upload endpoint for the final round.' }, { status: 400 });

  const alreadyAccepted = await sql`
    SELECT 1 FROM submissions WHERE team_code = ${s.code} AND round_idx = ${roundIdx} AND status = 'accepted'
  `;
  if (alreadyAccepted.length > 0)
    return NextResponse.json({ error: 'This round is already accepted for your team.' }, { status: 409 });

  // Draw kit on first submission (Round 0)
  if (roundIdx === 0) {
    const existingKit = await sql`SELECT 1 FROM kits WHERE team_code = ${s.code}`;
    if (!existingKit.length) {
      const teamRows = await sql`SELECT track FROM teams WHERE code = ${s.code}`;
      const track = teamRows[0]?.track as 'A' | 'B' | 'C';
      if (!track) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
      const kit = drawKit(track);
      await sql`
        INSERT INTO kits (team_code, disease, patient, problem, tech, budget, constraint_text)
        VALUES (${s.code}, ${kit.disease}, ${kit.patient}, ${kit.problem}, ${kit.tech}, ${kit.budget}, ${kit.constraintText})
      `;
    }
  }

  await sql`
    INSERT INTO submissions (team_code, round_idx, content)
    VALUES (${s.code}, ${roundIdx}, ${String(content).trim()})
  `;

  return NextResponse.json({ ok: true, roundIdx });
}
