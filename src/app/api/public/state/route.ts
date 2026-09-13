import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { ROUNDS, maskedRounds } from '@/lib/constants';

export async function GET(_req: NextRequest) {
  const [stateRow] = await sql`SELECT * FROM round_state WHERE id = 1`;
  if (!stateRow) return NextResponse.json({ bootstrapped: false });
  const started: number[] = JSON.parse(stateRow.started_rounds || '[]');
  const twistRows = await sql`SELECT text FROM twist_deck WHERE revealed = 1 ORDER BY id DESC LIMIT 1`;
  return NextResponse.json({
    currentRoundIdx: stateRow.current_round_idx,
    status: stateRow.status,
    roundName: maskedRounds(started)[stateRow.current_round_idx],
    rounds: maskedRounds(started),
    totalRounds: ROUNDS.length,
    revealedTwist: twistRows[0]?.text ?? null,
  });
}
