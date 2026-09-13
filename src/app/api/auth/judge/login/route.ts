import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { setSessionCookie, isLockedOut, logAttempt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { username, password } = body;
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const uname = String(username || '').trim().toLowerCase();
  const identifier = 'judge:' + uname;

  if (!uname || !password) return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
  if (await isLockedOut(sql, identifier)) return NextResponse.json({ error: 'Too many failed attempts. Wait 15 minutes.' }, { status: 429 });

  const rows = await sql`SELECT * FROM judges WHERE username = ${uname}`;
  const judge = rows[0];
  if (!judge) { await logAttempt(sql, identifier, ip, false); return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 }); }

  const ok = await bcrypt.compare(password, judge.password_hash);
  await logAttempt(sql, identifier, ip, ok);
  if (!ok) return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });

  const res = NextResponse.json({ username: judge.username, mustChangePassword: !!judge.must_change_password });
  return setSessionCookie(res, 'judge_session', { role: 'judge', username: judge.username });
}
