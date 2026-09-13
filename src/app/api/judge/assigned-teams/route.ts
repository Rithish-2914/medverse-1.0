import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROUNDS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const s = getSession(req, "judge_session");
  if (!s || s.role !== "judge") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const roundIdx = parseInt(req.nextUrl.searchParams.get("round") ?? "", 10);
  if (isNaN(roundIdx) || roundIdx < 0 || roundIdx >= ROUNDS.length)
    return NextResponse.json({ error: "Invalid round." }, { status: 400 });

  const rows = await sql`
    SELECT t.code, t.name, t.track FROM judge_assignments ja
    JOIN teams t ON t.code = ja.team_code
    WHERE ja.judge_username = ${s.username} AND ja.round_idx = ${roundIdx}
    ORDER BY t.created_at ASC
  `;
  const withCounts = await Promise.all(rows.map(async (t: any) => {
    const pending = await sql`SELECT COUNT(*) AS n FROM submissions WHERE team_code = ${t.code} AND round_idx = ${roundIdx} AND status = 'pending'`;
    const accepted = await sql`SELECT COUNT(*) AS n FROM submissions WHERE team_code = ${t.code} AND round_idx = ${roundIdx} AND status = 'accepted'`;
    return { ...t, pendingCount: Number(pending[0].n), locked: Number(accepted[0].n) > 0 };
  }));
  return NextResponse.json({ roundIdx, roundName: ROUNDS[roundIdx], teams: withCounts });
}