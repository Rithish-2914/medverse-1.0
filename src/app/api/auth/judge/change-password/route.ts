import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
export async function POST(req: NextRequest) {
  const s = getSession(req, 'judge_session');
  if (!s || s.role !== 'judge') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
  const { newPassword } = await req.json().catch(() => ({}));
  if (!newPassword || newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  const hash = await bcrypt.hash(newPassword, 12);
  await sql`UPDATE judges SET password_hash = ${hash}, must_change_password = 0 WHERE username = ${s.username}`;
  return NextResponse.json({ ok: true });
}
