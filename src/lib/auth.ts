import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const SESSION_HOURS = 12;

export interface SessionPayload {
  role: 'admin' | 'team' | 'judge';
  code?: string;
  username?: string;
}

export function issueToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_HOURS}h` });
}

export function verifyToken(token: string): SessionPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as SessionPayload; }
  catch { return null; }
}

export function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: SESSION_HOURS * 60 * 60, path: '/' };
}

export function setSessionCookie(res: NextResponse, cookieName: string, payload: SessionPayload): NextResponse {
  res.cookies.set(cookieName, issueToken(payload), cookieOptions());
  return res;
}

export function clearSessionCookie(res: NextResponse, cookieName: string): NextResponse {
  res.cookies.set(cookieName, '', { ...cookieOptions(), maxAge: 0 });
  return res;
}

export function getSession(req: NextRequest, cookieName: string): SessionPayload | null {
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isLockedOut(sql: any, identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const rows = await sql`SELECT COUNT(*) AS n FROM login_attempts WHERE identifier = ${identifier} AND success = 0 AND created_at > ${windowStart}`;
  return Number(rows[0].n) >= 10;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logAttempt(sql: any, identifier: string, ip: string, success: boolean) {
  await sql`INSERT INTO login_attempts (identifier, ip, success) VALUES (${identifier}, ${ip}, ${success ? 1 : 0})`;
}