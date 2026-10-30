import { NextResponse } from 'next/server';
import { currentState } from '../../../lib/matchState';
import { buildRecap, contextForLLM } from '../../../lib/match';
import { askAI, SYSTEM } from '../../../lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { tone = 'quick' } = await req.json().catch(() => ({}));
  const st = currentState();
  const ai = await askAI(SYSTEM,
    `Give a "catch me up" recap of the match so far. Tone: ${tone === 'hinglish' ? 'casual Hinglish' : tone === 'story' ? 'short narrative story' : 'crisp bullet-style summary'}.\nMatch data: ${contextForLLM(st)}`);
  return NextResponse.json({ text: ai || buildRecap(st, tone), engine: ai ? 'groq' : 'offline' });
}
