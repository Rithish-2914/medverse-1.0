import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ROUNDS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const roundIdx = parseInt(req.nextUrl.searchParams.get('round') ?? '', 10);
  if (isNaN(roundIdx) || roundIdx < 0 || roundIdx >= ROUNDS.length)
    return NextResponse.json({ error: 'Invalid round.' }, { status: 400 });
  const rows = await sql`
    SELECT ja.id, ja.judge_username, ja.team_code, t.name AS team_name, ja.assigned_at
    FROM judge_assignments ja JOIN teams t ON t.code = ja.team_code
    WHERE ja.round_idx = ${roundIdx} ORDER BY t.created_at ASC, ja.judge_username ASC
  `;
  return NextResponse.json({ roundIdx, assignments: rows });
}
