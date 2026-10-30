import { NextResponse } from 'next/server';
import { currentState } from '../../../lib/matchState';
import { answerQuestion, contextForLLM } from '../../../lib/match';
import { askAI, SYSTEM } from '../../../lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { question = '' } = await req.json().catch(() => ({}));
  const st = currentState();
  const ai = question.trim()
    ? await askAI(SYSTEM, `Fan question: "${question}"\nMatch data: ${contextForLLM(st)}`)
    : null;
  return NextResponse.json({ text: ai || answerQuestion(st, question), engine: ai ? 'groq' : 'offline' });
}
