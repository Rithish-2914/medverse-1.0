import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROUNDS } from "@/lib/constants";

export async function GET(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const s = getSession(req, "admin_session");
  if (!s || s.role !== "admin") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { code: rawCode } = await context.params;
  const code = rawCode.toUpperCase();
  const teams = await sql`SELECT * FROM teams WHERE code = ${code}`;
  const team = teams[0];
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
  const kit = await sql`SELECT * FROM kits WHERE team_code = ${code}`;
  const members = await sql`SELECT id, name, reg_no FROM team_members WHERE team_code = ${code}`;
  const allSubmissions = await sql`SELECT * FROM submissions WHERE team_code = ${code} ORDER BY round_idx ASC, created_at ASC`;
  const assignments = await sql`SELECT judge_username, round_idx FROM judge_assignments WHERE team_code = ${code} ORDER BY round_idx ASC`;
  const allScores = await sql`SELECT * FROM scores WHERE team_code = ${code} ORDER BY round_idx ASC, judge_username ASC`;
  const rounds = ROUNDS.map((name: string, idx: number) => {
    const roundScores = allScores.filter((s: any) => s.round_idx === idx);
    const roundAvg = roundScores.length ? Number((roundScores.reduce((sum: number, s: any) => sum + s.total, 0) / roundScores.length).toFixed(1)) : null;
    return { roundIdx: idx, roundName: name, assignedJudges: assignments.filter((a: any) => a.round_idx === idx).map((a: any) => a.judge_username), submissions: allSubmissions.filter((s: any) => s.round_idx === idx), scores: roundScores, roundAvg };
  });
  return NextResponse.json({ team, members, kit: kit[0] ?? null, rounds });
}