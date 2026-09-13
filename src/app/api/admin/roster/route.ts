import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ROUNDS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const s = getSession(req, 'admin_session');
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const stateRows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = stateRows[0];
  const roundIdx: number = state?.current_round_idx ?? 0;
  const teams = await sql`SELECT code, name, track FROM teams ORDER BY created_at ASC`;
  const rows = await Promise.all(teams.map(async (t: Record<string, unknown>) => {
    const kit = await sql`SELECT 1 FROM kits WHERE team_code = ${t.code}`;
    const pending = await sql`SELECT COUNT(*) AS n FROM submissions WHERE team_code = ${t.code} AND round_idx = ${roundIdx} AND status = 'pending'`;
    const accepted = await sql`SELECT COUNT(*) AS n FROM submissions WHERE team_code = ${t.code} AND round_idx = ${roundIdx} AND status = 'accepted'`;
    const total = await sql`SELECT COUNT(*) AS n FROM submissions WHERE team_code = ${t.code} AND round_idx = ${roundIdx}`;
    const assignedJudges = await sql`SELECT judge_username FROM judge_assignments WHERE team_code = ${t.code} AND round_idx = ${roundIdx}`;
    const scores = await sql`SELECT total FROM scores WHERE team_code = ${t.code} AND round_idx = ${roundIdx}`;
    const members = await sql`SELECT name, reg_no FROM team_members WHERE team_code = ${t.code}`;
    const avgScore = scores.length ? scores.reduce((acc: number, r: Record<string, unknown>) => acc + Number(r.total), 0) / scores.length : null;
    return {
      code: t.code, name: t.name, track: t.track, kitDrawn: !!kit.length,
      submissionsThisRound: Number(total[0].n), pendingThisRound: Number(pending[0].n),
      lockedThisRound: Number(accepted[0].n) > 0,
      assignedJudgesThisRound: assignedJudges.map((j: Record<string, unknown>) => j.judge_username),
      avgScoreThisRound: avgScore !== null ? Number(avgScore.toFixed(1)) : null,
      judgeCountThisRound: scores.length, members,
    };
  }));
  return NextResponse.json({ rows, currentRoundIdx: roundIdx, rounds: ROUNDS });
}