import { NextResponse } from 'next/server';
import { currentState } from '../../../lib/matchState';
import { stateForClient } from '../../../lib/match';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(stateForClient(currentState()));
}
