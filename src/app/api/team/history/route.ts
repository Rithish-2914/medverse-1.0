import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const s = getSession(req, 'team_session');
  if (!s || s.role !== 'team') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const rows = await sql`
    SELECT id, round_idx, content, file_url, file_name, status, feedback, decided_at, created_at
    FROM submissions WHERE team_code = ${s.code} ORDER BY round_idx ASC, created_at ASC
  `;
  return NextResponse.json({ submissions: rows });
}
