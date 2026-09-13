import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { username, tempPassword } = await req.json().catch(() => ({}));
  const uname = String(username || '').trim().toLowerCase();
  if (!uname || !tempPassword || tempPassword.length < 8)
    return NextResponse.json({ error: 'Username and an 8+ character temporary password are required.' }, { status: 400 });
  const existing = await sql`SELECT 1 FROM judges WHERE username = ${uname}`;
  if (existing.length) return NextResponse.json({ error: 'That username already exists.' }, { status: 409 });
  const hash = await bcrypt.hash(tempPassword, 12);
  await sql`INSERT INTO judges (username, password_hash, must_change_password) VALUES (${uname}, ${hash}, 1)`;
  await sql`INSERT INTO admin_log (actor, message) VALUES (${'organizer'}, ${`Created judge account: ${uname}`})`;
  return NextResponse.json({ ok: true, username: uname });
}
