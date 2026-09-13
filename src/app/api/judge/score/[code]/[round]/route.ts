import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, context: { params: Promise<{ code: string; round: string }> }) {
  const s = getSession(req, "judge_session");
  if (!s || s.role !== "judge") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { code: rawCode, round } = await context.params;
  const code = rawCode.toUpperCase();
  const roundIdx = parseInt(round, 10);
  const assigned = await sql`SELECT 1 FROM judge_assignments WHERE judge_username = ${s.username} AND team_code = ${code} AND round_idx = ${roundIdx}`;
  if (!assigned.length) return NextResponse.json({ error: "Not assigned." }, { status: 403 });
  const rows = await sql`SELECT * FROM scores WHERE team_code = ${code} AND judge_username = ${s.username} AND round_idx = ${roundIdx}`;
  return NextResponse.json({ score: rows[0] ?? null });
}