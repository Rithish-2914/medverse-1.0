import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const rows = await sql`SELECT username, must_change_password, created_at FROM judges ORDER BY created_at ASC`;
  return NextResponse.json({ judges: rows.map((j: any) => ({ username: j.username, mustChangePassword: !!j.must_change_password, createdAt: j.created_at })) });
}
