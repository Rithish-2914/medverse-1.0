import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ROUNDS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const rows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = rows[0];
  if (state.current_round_idx >= ROUNDS.length - 1) return NextResponse.json({ error: 'Already on the final round.' }, { status: 409 });
  const next = state.current_round_idx + 1;
  await sql`UPDATE round_state SET current_round_idx = ${next}, status = 'not_started' WHERE id = 1`;
  await sql`INSERT INTO admin_log (actor, message) VALUES (${'organizer'}, ${`Moved to round: ${ROUNDS[next]}`})`;
  return NextResponse.json({ currentRoundIdx: next, status: 'not_started' });
}
