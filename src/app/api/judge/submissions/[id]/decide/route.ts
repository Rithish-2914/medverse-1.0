import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROUNDS } from "@/lib/constants";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const s = getSession(req, "judge_session");
  if (!s || s.role !== "judge") return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  const { decision, feedback } = await req.json().catch(() => ({}));
  if (!["accept", "reject"].includes(decision))
    return NextResponse.json({ error: "decision must be 'accept' or 'reject'." }, { status: 400 });
  const rows = await sql`SELECT * FROM submissions WHERE id = ${parseInt(id, 10)}`;
  const submission = rows[0];
  if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  const assigned = await sql`SELECT 1 FROM judge_assignments WHERE judge_username = ${s.username} AND team_code = ${submission.team_code} AND round_idx = ${submission.round_idx}`;
  if (!assigned.length) return NextResponse.json({ error: "Not assigned to this team for this round." }, { status: 403 });
  if (submission.status !== "pending") return NextResponse.json({ error: "This submission was already " + submission.status + "." }, { status: 409 });
  const status = decision === "accept" ? "accepted" : "rejected";
  await sql`UPDATE submissions SET status = ${status}, decided_by = ${s.username}, decided_at = NOW(), feedback = ${feedback ? String(feedback).slice(0, 1000) : null} WHERE id = ${submission.id}`;
  await sql`INSERT INTO admin_log (actor, message) VALUES (${s.username}, ${(status === "accepted" ? "Accepted" : "Rejected") + " submission from team " + submission.team_code + " for round " + ROUNDS[submission.round_idx]})`;
  return NextResponse.json({ ok: true, status });
}