import { NextRequest, NextResponse } from 'next/server';
import { getSession, clearSessionCookie } from '@/lib/auth';
export async function POST(req: NextRequest) {
  if (!getSession(req, 'judge_session')) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  return clearSessionCookie(NextResponse.json({ ok: true }), 'judge_session');
}
