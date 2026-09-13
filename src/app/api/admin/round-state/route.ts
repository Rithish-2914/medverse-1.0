import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ROUNDS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const rows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = rows[0];
  return NextResponse.json({
    rounds: ROUNDS,
    currentRoundIdx: state?.current_round_idx ?? 0,
    status: state?.status ?? 'not_started',
    startedRounds: JSON.parse(state?.started_rounds || '[]'),
  });
}
