import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { judgeUsername, teamCode, roundIdx } = await req.json().catch(() => ({}));
  const result = await sql`
    DELETE FROM judge_assignments WHERE judge_username = ${String(judgeUsername || '').toLowerCase()} AND team_code = ${String(teamCode || '').toUpperCase()} AND round_idx = ${parseInt(roundIdx, 10)}
  `;
  if (!result.length) return NextResponse.json({ error: 'No such assignment.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
