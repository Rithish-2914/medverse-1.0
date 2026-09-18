import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ROUNDS, maskedRounds } from '@/lib/constants';
import { problems } from '@/data/problems';

export async function GET(req: NextRequest) {
  const s = getSession(req, 'team_session');
  if (!s || s.role !== 'team') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const teams = await sql`SELECT code, name, track, lead_name, college FROM teams WHERE code = ${s.code}`;
  const team = teams[0];
  if (!team) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });

  const kitRows = await sql`SELECT * FROM kits WHERE team_code = ${s.code}`;
  const kit = kitRows[0];
  const stateRows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = stateRows[0];
  const started: number[] = JSON.parse(state?.started_rounds || '[]');

  const graceRows = await sql`SELECT 1 FROM submissions WHERE team_code = ${s.code} AND content = '__GRACE__' LIMIT 1`;

  const twistRows = await sql`SELECT text FROM twist_deck WHERE revealed = 1 ORDER BY id DESC LIMIT 1`;
  const twistActive = twistRows[0]?.text === 'TWIST_PHASE_ACTIVE';
  
  let specificTwist = null;
  let docLink = "";
  
  if (kit) {
    const pId = kit.disease.split(':')[0];
    const p = problems.find(x => x.id === pId);
    if (p) {
      docLink = p.docLink || "";
            if (twistActive) {
        specificTwist = { limitation: p.twistLimitation, budget: 'Rs. ' + p.twistBudget.toLocaleString() };
      }
    }
  }

  return NextResponse.json({
    team,
    kit: kit ? {
      disease: kit.disease,
      patient: kit.patient,
      problem: kit.problem,
      tech: kit.tech,
      budget: kit.budget,
      constraint: kit.constraint_text,
      drawnAt: kit.drawn_at,
      docLink,
      twist: specificTwist
    } : null,
    roundState: state ? {
      currentRoundIdx: state.current_round_idx,
      status: state.status,
      roundName: maskedRounds(started)[state.current_round_idx],
    } : null,
    graceUsed: graceRows.length > 0,
  });
}
