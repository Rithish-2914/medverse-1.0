import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ROUNDS, maskedRounds } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const s = getSession(req, 'team_session');
  if (!s || s.role !== 'team') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const teams = await sql`SELECT code, name, track, lead_name, college FROM teams WHERE code = ${s.code}`;
  const team = teams[0];
  if (!team) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });

  const kitRows = await sql`SELECT * FROM kits WHERE team_code = ${s.code}`;
  const stateRows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = stateRows[0];
  const started: number[] = JSON.parse(state?.started_rounds || '[]');

  const graceRows = await sql`
    SELECT 1 FROM submissions WHERE team_code = ${s.code} AND content = '__GRACE__' LIMIT 1
  `;

  return NextResponse.json({
    team,
    kit: kitRows[0] ? {
      disease: kitRows[0].disease,
      patient: kitRows[0].patient,
      problem: kitRows[0].problem,
      tech: kitRows[0].tech,
      budget: kitRows[0].budget,
      constraint: kitRows[0].constraint_text,
      drawnAt: kitRows[0].drawn_at,
    } : null,
    roundState: state ? {
      currentRoundIdx: state.current_round_idx,
      status: state.status,
      roundName: maskedRounds(started)[state.current_round_idx],
    } : null,
    graceUsed: graceRows.length > 0,
  });
}
