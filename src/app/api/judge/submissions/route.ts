import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const s = getSession(req, 'judge_session');
  if (!s || s.role !== 'judge') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const teamCode = String(req.nextUrl.searchParams.get('teamCode') || '').toUpperCase();
  const roundIdx = parseInt(req.nextUrl.searchParams.get('round') ?? '', 10);
  if (!teamCode || isNaN(roundIdx)) return NextResponse.json({ error: 'teamCode and round are required.' }, { status: 400 });
  const assigned = await sql`SELECT 1 FROM judge_assignments WHERE judge_username = ${s.username} AND team_code = ${teamCode} AND round_idx = ${roundIdx}`;
  if (!assigned.length) return NextResponse.json({ error: 'You are not assigned to this team for this round.' }, { status: 403 });
  const rows = await sql`SELECT id, round_idx, content, file_url, file_name, status, decided_by, feedback, decided_at, created_at FROM submissions WHERE team_code = ${teamCode} AND round_idx = ${roundIdx} ORDER BY created_at ASC`;
  const kit = await sql`SELECT disease FROM kits WHERE team_code = ${teamCode}`;
let docLink = '';
if (kit.length) {
  const pId = kit[0].disease.split(':')[0];
  const { problems } = require('@/data/problems');
  const p = problems.find((x: any) => x.id === pId);
  if (p) docLink = p.docLink || '';
}
return NextResponse.json({ submissions: rows, docLink });
}
