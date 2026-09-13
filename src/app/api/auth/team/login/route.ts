import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { setSessionCookie, isLockedOut, logAttempt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { code, password } = body;
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const identifier = 'team:' + String(code || '').toUpperCase();

  if (!code || !password)
    return NextResponse.json({ error: 'Team code and password are required.' }, { status: 400 });
  if (await isLockedOut(sql, identifier))
    return NextResponse.json({ error: 'Too many failed attempts. Wait 15 minutes.' }, { status: 429 });

  const rows = await sql`SELECT * FROM teams WHERE code = ${String(code).toUpperCase()}`;
  const team = rows[0];
  if (!team) {
    await logAttempt(sql, identifier, ip, false);
    return NextResponse.json({ error: 'Invalid team code or password.' }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, team.password_hash);
  await logAttempt(sql, identifier, ip, ok);
  if (!ok) return NextResponse.json({ error: 'Invalid team code or password.' }, { status: 401 });

  const res = NextResponse.json({ code: team.code, teamName: team.name, track: team.track });
  return setSessionCookie(res, 'team_session', { role: 'team', code: team.code });
}
