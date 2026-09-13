import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { setSessionCookie, isLockedOut, logAttempt } from '@/lib/auth';

const ADMIN_USERNAME = 'organizer';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { password } = body;
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const identifier = 'admin:' + ADMIN_USERNAME;

  if (!password || password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  if (await isLockedOut(sql, identifier))
    return NextResponse.json({ error: 'Too many failed attempts. Wait 15 minutes.' }, { status: 429 });

  const rows = await sql`SELECT * FROM admins WHERE username = ${ADMIN_USERNAME}`;
  const existing = rows[0];

  if (!existing) {
    const hash = await bcrypt.hash(password, 12);
    await sql`INSERT INTO admins (username, password_hash) VALUES (${ADMIN_USERNAME}, ${hash})`;
    await sql`INSERT INTO admin_log (actor, message) VALUES (${ADMIN_USERNAME}, 'Organizer account created (bootstrap).')`;
    await logAttempt(sql, identifier, ip, true);
    const res = NextResponse.json({ bootstrapped: true });
    return setSessionCookie(res, 'admin_session', { role: 'admin', username: ADMIN_USERNAME });
  }

  const ok = await bcrypt.compare(password, existing.password_hash);
  await logAttempt(sql, identifier, ip, ok);
  if (!ok) return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });

  const res = NextResponse.json({ bootstrapped: true });
  return setSessionCookie(res, 'admin_session', { role: 'admin', username: ADMIN_USERNAME });
}
