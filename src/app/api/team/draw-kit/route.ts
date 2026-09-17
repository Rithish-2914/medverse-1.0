import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { drawKit } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'team_session');
  if (!s || s.role !== 'team') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const existingKit = await sql`SELECT 1 FROM kits WHERE team_code = ${s.code}`;
  if (existingKit.length) return NextResponse.json({ error: 'Kit already drawn.' }, { status: 409 });

  const teamRows = await sql`SELECT track FROM teams WHERE code = ${s.code}`;
  const track = teamRows[0]?.track as 'A' | 'B' | 'C';
  if (!track) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });

  const kit = drawKit(track);
  await sql`
    INSERT INTO kits (team_code, disease, patient, problem, tech, budget, constraint_text)
    VALUES (${s.code}, ${kit.disease}, ${kit.patient}, ${kit.problem}, ${kit.tech}, ${kit.budget}, ${kit.constraintText})
  `;

  return NextResponse.json({ ok: true });
}
