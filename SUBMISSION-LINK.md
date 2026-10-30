# Dream11 Forward Deployed Engineer Intern — Assignment Submission

**Name:** Ujjwal Sharma

## Working Artifact

**Live demo:** https://catchup-live.onrender.com
**GitHub repo:** https://github.com/Ujjwal5705/catchup-live

**CatchUp** — an AI live-match companion for fans who join the game late.

### How to try it (2 minutes)

1. Open the link. First load can take ~50 seconds — the free-tier server
   wakes from sleep.
2. Click **Catch Me Up** — get an instant recap of the match so far. Try all
   three tones: Quick, Story, Hinglish.
3. Ask the chat anything: *"who should I captain?"*, *"what are the win
   chances?"*, *"how has Mustafizur bowled?"*
4. Watch the score bug, win probability, ball-by-ball feed and fantasy points
   update live (simulated ball-by-ball feed, new ball every 4 seconds).
5. The chase goes down to the last ball — stick around for the finish.

## Submission note (max 200 words)

**What fan problem am I solving?**
Most fans can't watch an entire live match — they join late, check scores
between meetings, or step away. A bare scorecard (134/4 after 14.2 overs)
tells them the numbers but none of the story. The first thing every
late-joining fan asks is "what did I miss?" — and for the 200M+ fantasy
players on platforms like Dream11, not knowing *why* the match swung makes
following their team frustrating.

**How does CatchUp help?**
CatchUp is a live-match companion. One tap on **"Catch Me Up"** generates an
instant AI recap of the match so far, in the fan's preferred tone — quick
stats, a story, or Hinglish. Fans can then ask anything in plain language
("why is the required rate climbing?", "who should I captain?") and get
answers grounded in the live match state, alongside win probability and
Dream11-style fantasy points updated ball by ball.

**Which AI tools did I use?**
A free Groq-hosted LLM (openai/gpt-oss-120b) powers the recaps and Q&A,
grounded in a live JSON snapshot of the match so answers stay factual, not
hallucinated. A rules-based fallback keeps the artifact fully functional
without an API key, so any reviewer can run it. Claude pair-programmed the
build itself.
