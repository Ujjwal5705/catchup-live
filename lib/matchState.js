// Shared in-process match clock. Lives in globalThis so Next.js dev
// hot-reloads don't reset the ticker or spawn duplicate intervals.
import { TOTAL_BALLS, replay } from './match';

const g = globalThis;
if (!g.__catchup) {
  const START_AT_BALL = 14; // join mid-match so there is history to catch up on
  const TICK_MS = 4000;
  g.__catchup = { ballCount: START_AT_BALL };
  setInterval(() => {
    if (g.__catchup.ballCount < TOTAL_BALLS) g.__catchup.ballCount += 1;
  }, TICK_MS).unref?.();
}

export const currentState = () => replay(g.__catchup.ballCount);
export const resetMatch = () => { g.__catchup.ballCount = 0; };
