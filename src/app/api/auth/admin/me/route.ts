import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  return NextResponse.json({ ok: true, username: s.username });
}
