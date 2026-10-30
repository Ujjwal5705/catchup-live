# CatchUp — AI live-match companion

**Problem:** Most fans can't watch a full match. They join late, check scores between
meetings, or step away — and a bare scorecard (`134/4 after 14.2`) tells them nothing
about the *story* of the game. Fantasy players feel it even more: every ball changes
their team, but they have no idea why.

**CatchUp** is a live-match companion that answers the first question every late-joining
fan asks — *"what did I miss?"* — and then lets them keep asking:

- **Catch Me Up** — one-tap AI recap of the match so far, in three tones: Quick, Story, Hinglish
- **Ask anything** — "Why is the required rate climbing?" "Who should I captain?" "How has Bumrah bowled?"
- **Live context** — win probability, momentum, fall of wickets, and Dream11-style fantasy points, updated ball by ball

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

Next.js 14 (App Router) + React 18, Node 18.17+. The app starts mid-match and ticks
a new ball every 4 seconds. Production: `npm run build && npm start`.

## AI engine

- With `GROQ_API_KEY` set, recaps and Q&A are written by a free Groq-hosted LLM
  (default `openai/gpt-oss-120b`; override with `GROQ_MODEL`), grounded in a live
  JSON snapshot of the match so answers stay factual, not hallucinated. Groq's free
  tier is plenty for this demo — get a key at https://console.groq.com/keys
- Without a key, a built-in rules-based analyst answers from the same match state —
  the artifact works for any reviewer, key or no key.

Paste your key into `.env` (created on first run of this repo):

```
GROQ_API_KEY=gsk_...
```

Next.js loads `.env` automatically. Optional: add `GROQ_MODEL=llama-3.3-70b-versatile`
(or another free Groq model) to switch models.

## Deploy (for the submission link)

- **Render / Railway** (recommended — persistent Node process keeps the simulated
  match clock running): build `npm install && npm run build`, start `npm start`,
  set `GROQ_API_KEY` in the platform's env-var dashboard.
- **Vercel** works one-click, but serverless functions don't preserve the in-memory
  ticker between invocations, so the match may restart when idle.
- **ngrok** to expose your local run instantly: `npm run dev` then `ngrok http 3000`.

Never commit or upload `.env` — it holds your key (already in `.gitignore`).

## Architecture

```
lib/match.js      — ball-by-ball dataset + replay engine + fantasy scoring + offline analyst
lib/matchState.js — simulated live clock (globalThis so dev hot-reloads don't duplicate it)
lib/ai.js         — Groq client (OpenAI-compatible chat completions)
app/page.js       — React client component: the whole live UI (polls /api/state every 2.5s)
app/api/*/route.js— Next.js route handlers: state, recap, ask, reset
```

The feed is a scripted T20 chase (CSK 180/5; MI chasing 181, decided off the last ball)
so the demo is deterministic. `replay()` is the only seam — swap in a real ball-by-ball
API adapter and everything above it (recaps, Q&A, fantasy, win-prob) works unchanged.

## Next steps with more time

- Real feed adapter + push (WebSocket) instead of polling
- Personalization: recap framed around the players in *your* fantasy XI
- Notifications: "You left 10 minutes ago — here's what you missed"
