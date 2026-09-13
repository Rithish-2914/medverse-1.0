import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import sql from "@/lib/db";
import { setSessionCookie, isLockedOut, logAttempt } from "@/lib/auth";

function genCode(track: string) {
  return "MV-" + track + "-" + Math.floor(1000 + Math.random() * 9000);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { teamName, track, leadName, leadEmail, college, size, password, members } = body;

  if (!teamName || !leadName || !password)
    return NextResponse.json({ error: "Team name, lead name, and password are required." }, { status: 400 });
  if (String(teamName).trim().length > 80 || String(leadName).trim().length > 80)
    return NextResponse.json({ error: "Team name and lead name must be under 80 characters." }, { status: 400 });
  if (String(password).length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const trackLetter = ["A", "B", "C"].includes(track) ? track : null;
  if (!trackLetter) return NextResponse.json({ error: "Invalid track." }, { status: 400 });

  const teamSize = Number(size) || 1;
  if (teamSize < 1 || teamSize > 3)
    return NextResponse.json({ error: "Team size must be between 1 and 3." }, { status: 400 });

  if (!Array.isArray(members) || members.length !== teamSize)
    return NextResponse.json({ error: "Provide details for all " + teamSize + " team members." }, { status: 400 });

  const cleanMembers: { name: string; regNo: string }[] = [];
  for (const m of members) {
    const name = String(m?.name || "").trim();
    const regNo = String(m?.regNo || "").trim().toUpperCase();
    if (!name || !regNo)
      return NextResponse.json({ error: "Every member needs a name and registration number." }, { status: 400 });
    cleanMembers.push({ name, regNo });
  }
  const regNoSet = new Set(cleanMembers.map(m => m.regNo));
  if (regNoSet.size !== cleanMembers.length)
    return NextResponse.json({ error: "Two members have the same registration number." }, { status: 400 });

  const regNos = cleanMembers.map(m => m.regNo);
  const conflicts = await sql`SELECT reg_no FROM team_members WHERE reg_no = ANY(${regNos})`;
  if (conflicts.length > 0)
    return NextResponse.json({ error: "Registration number already taken: " + conflicts.map((c: any) => c.reg_no).join(", ") }, { status: 409 });

  let code = "";
  for (let i = 0; i < 5; i++) {
    const candidate = genCode(trackLetter);
    const existing = await sql`SELECT 1 FROM teams WHERE code = ${candidate}`;
    if (!existing.length) { code = candidate; break; }
  }
  if (!code) return NextResponse.json({ error: "Could not generate unique team code — try again." }, { status: 500 });

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await sql`INSERT INTO teams (code, name, track, lead_name, lead_email, college, size, password_hash) VALUES (${code}, ${String(teamName).trim()}, ${trackLetter}, ${String(leadName).trim()}, ${leadEmail ? String(leadEmail).trim() : null}, ${college ? String(college).trim() : null}, ${teamSize}, ${passwordHash})`;
    for (const m of cleanMembers) {
      await sql`INSERT INTO team_members (team_code, name, reg_no) VALUES (${code}, ${m.name}, ${m.regNo})`;
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("UNIQUE"))
      return NextResponse.json({ error: "A registration number was just claimed by another team." }, { status: 409 });
    return NextResponse.json({ error: "Registration failed — please try again." }, { status: 500 });
  }

  const res = NextResponse.json({ code, teamName, track: trackLetter });
  return setSessionCookie(res, "team_session", { role: "team", code });
}