import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { pick, TWISTS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const rows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = rows[0];
  const text = pick(TWISTS);
  await sql`INSERT INTO twist_deck (round_idx, text, revealed, revealed_at) VALUES (${state.current_round_idx}, ${text}, 1, NOW())`;
  await sql`INSERT INTO admin_log (actor, message) VALUES (${'organizer'}, ${`Twist revealed: "${text}"`})`;
  return NextResponse.json({ text });
}
