import { NextRequest, NextResponse } from 'next/server';
import { getSession, clearSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = getSession(req, 'team_session');
  if (!session) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  return clearSessionCookie(res, 'team_session');
}
