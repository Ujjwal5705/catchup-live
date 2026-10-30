// Groq (OpenAI-compatible) LLM call with graceful fallback.
// Next.js loads .env automatically — GROQ_API_KEY / GROQ_MODEL just work.

export const SYSTEM = 'You are CatchUp, an AI companion inside a live cricket match app for fans who joined late. ' +
  'Answer using ONLY the match data provided. Be specific with names and numbers, keep it under 120 words, ' +
  'and sound like a knowledgeable friend, not a commentator robot.';

export const MODEL = () => process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export async function askAI(system, user) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${key}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL(),
        max_tokens: 400,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const msg = data.choices && data.choices[0] && data.choices[0].message;
    return (msg && msg.content) || null;
  } catch {
    return null; // offline fallback keeps the demo alive without a key
  }
}
