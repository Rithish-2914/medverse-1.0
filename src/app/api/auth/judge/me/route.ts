import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const s = getSession(req, 'judge_session');
  if (!s || s.role !== 'judge') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  const rows = await sql`SELECT must_change_password FROM judges WHERE username = ${s.username}`;
  if (!rows[0]) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  return NextResponse.json({ username: s.username, mustChangePassword: !!rows[0].must_change_password });
}
