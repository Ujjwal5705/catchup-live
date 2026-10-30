import { NextResponse } from 'next/server';
import { resetMatch } from '../../../lib/matchState';

export async function POST() {
  resetMatch();
  return NextResponse.json({ ok: true });
}
