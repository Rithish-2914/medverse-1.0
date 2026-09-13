import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ROUNDS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { judgeUsername, teamCode, roundIdx } = await req.json().catch(() => ({}));
  const uname = String(judgeUsername || '').trim().toLowerCase();
  const code = String(teamCode || '').trim().toUpperCase();
  const round = parseInt(roundIdx, 10);
  if (!uname || !code || isNaN(round) || round < 0 || round >= ROUNDS.length)
    return NextResponse.json({ error: 'judgeUsername, teamCode, and a valid roundIdx are required.' }, { status: 400 });
  try {
    await sql`INSERT INTO judge_assignments (judge_username, team_code, round_idx) VALUES (${uname}, ${code}, ${round})`;
  } catch {
    return NextResponse.json({ error: 'That judge is already assigned to that team for that round.' }, { status: 409 });
  }
  await sql`INSERT INTO admin_log (actor, message) VALUES (${'organizer'}, ${`Assigned judge "${uname}" to team ${code} for round ${ROUNDS[round]}`})`;
  return NextResponse.json({ ok: true });
}
