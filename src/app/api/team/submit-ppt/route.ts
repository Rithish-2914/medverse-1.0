import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import { FINAL_ROUND_IDX } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const s = getSession(req, 'team_session');
  if (!s || s.role !== 'team') return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });

  const stateRows = await sql`SELECT * FROM round_state WHERE id = 1`;
  const state = stateRows[0];
  if (!state || state.status !== 'active' || state.current_round_idx !== FINAL_ROUND_IDX)
    return NextResponse.json({ error: 'PPT upload is only allowed during the Final Pitch round.' }, { status: 409 });

  const alreadyAccepted = await sql`
    SELECT 1 FROM submissions WHERE team_code = ${s.code} AND round_idx = ${FINAL_ROUND_IDX} AND status = 'accepted'
  `;
  if (alreadyAccepted.length > 0)
    return NextResponse.json({ error: 'Final round already accepted for your team.' }, { status: 409 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['ppt', 'pptx', 'pdf'].includes(ext ?? ''))
    return NextResponse.json({ error: 'Only PPT, PPTX or PDF files are accepted.' }, { status: 400 });
  if (file.size > 50 * 1024 * 1024)
    return NextResponse.json({ error: 'File must be under 50 MB.' }, { status: 400 });

  const blob = await put(`${s.code}-final.${ext}`, file, { access: 'public' });

  await sql`
    INSERT INTO submissions (team_code, round_idx, file_url, file_name)
    VALUES (${s.code}, ${FINAL_ROUND_IDX}, ${blob.url}, ${file.name})
  `;

  return NextResponse.json({ ok: true, fileUrl: blob.url });
}
