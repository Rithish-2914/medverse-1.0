import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'team_session');
  if (!s || s.role !== 'team') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  
  const { content, file_name } = await req.json();
  if (!content || content.trim().length < 10) return NextResponse.json({ error: 'Content too short.' }, { status: 400 });

  const rows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = rows[0];
  if (!state || state.status !== 'active') return NextResponse.json({ error: 'Round not active.' }, { status: 403 });
  
  const roundIdx = state.current_round_idx;
  if (roundIdx > 4) return NextResponse.json({ error: 'Event over.' }, { status: 403 });

  const pastRows = await sql`SELECT status FROM submissions WHERE team_code = ${s.code} AND round_idx = ${roundIdx} ORDER BY id DESC LIMIT 1`;
  if (pastRows.length && pastRows[0].status === 'accepted') {
    return NextResponse.json({ error: 'Round already accepted.' }, { status: 403 });
  }

  await sql`
    INSERT INTO submissions (team_code, round_idx, content, file_name, status)
    VALUES (${s.code}, ${roundIdx}, ${content}, ${file_name || null}, 'pending')
  `;

  return NextResponse.json({ ok: true });
}
