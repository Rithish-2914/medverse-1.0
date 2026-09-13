import { NextResponse } from 'next/server';
import { runMigrations } from '@/lib/db';

export async function POST() {
  try {
    await runMigrations();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
