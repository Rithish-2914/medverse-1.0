import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ROUNDS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const rows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = rows[0];
  if (state.status === 'active') return NextResponse.json({ error: 'This round is already active.' }, { status: 409 });
  const started: number[] = JSON.parse(state.started_rounds || '[]');
  if (!started.includes(state.current_round_idx)) started.push(state.current_round_idx);
  await sql`UPDATE round_state SET status = 'active', started_rounds = ${JSON.stringify(started)} WHERE id = 1`;
  await sql`INSERT INTO admin_log (actor, message) VALUES (${'organizer'}, ${`Started round: ${ROUNDS[state.current_round_idx]}`})`;
  return NextResponse.json({ currentRoundIdx: state.current_round_idx, status: 'active' });
}
