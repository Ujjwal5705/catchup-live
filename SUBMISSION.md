# Submission note (max 200 words)

**What fan problem am I solving?**
Most fans can't watch an entire live match — they join late, check scores between
meetings, or step away. A bare scorecard (134/4 after 14.2 overs) tells them the
numbers but none of the story. The first thing every late-joining fan asks is
"what did I miss?" — and for the 200M+ fantasy players on platforms like Dream11,
not knowing *why* the match swung makes following their team frustrating.

**How does CatchUp help?**
CatchUp is a live-match companion. One tap on **"Catch Me Up"** generates an instant
AI recap of the match so far, in the fan's preferred tone — quick stats, a story,
or Hinglish. Fans can then ask anything in plain language ("why is the required rate
climbing?", "who should I captain?") and get answers grounded in the live match state,
alongside win probability and Dream11-style fantasy points updated ball by ball.

**Which AI tools did I use?**
A free Groq-hosted LLM (openai/gpt-oss-120b) powers the recaps and Q&A, grounded
in a live JSON snapshot of the match so answers stay factual, not hallucinated. A
rules-based fallback keeps the artifact fully functional without an API key, so any
reviewer can run it. Claude pair-programmed the build itself.
