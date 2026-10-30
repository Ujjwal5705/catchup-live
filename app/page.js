'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const TONES = ['quick', 'story', 'hinglish'];

export default function Home() {
  const [s, setS] = useState(null);
  const [tone, setTone] = useState('quick');
  const [recap, setRecap] = useState('');
  const [recapLoading, setRecapLoading] = useState(false);
  const [chat, setChat] = useState([]);
  const [q, setQ] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch('/api/state');
        if (alive) setS(await r.json());
      } catch { /* transient poll failure */ }
    };
    poll();
    const t = setInterval(poll, 2500);
    return () => { alive = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  const post = async (url, body) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    return r.json();
  };

  const catchUp = async () => {
    setRecapLoading(true);
    setRecap('Putting your recap together…');
    const r = await post('/api/recap', { tone });
    setRecap(r.text + (r.engine === 'offline' ? '\n\n(offline analyst — add GROQ_API_KEY for LLM-written recaps)' : ''));
    setRecapLoading(false);
  };

  const ask = async () => {
    const question = q.trim();
    if (!question) return;
    setQ('');
    setChat(c => [...c, { role: 'user', text: question }, { role: 'bot', text: 'Thinking…' }]);
    const r = await post('/api/ask', { question });
    setChat(c => [...c.slice(0, -1), { role: 'bot', text: r.text, eng: r.engine === 'groq' ? 'answered by Groq LLM' : 'offline analyst' }]);
  };

  const chipClass = (t) =>
    'chip' + (t === '4' ? ' b4' : t === '6' ? ' b6' : t === 'W' ? ' bW' : t === 'wd' ? ' bwd' : '');

  return (
    <div className="wrap">
      <header>
        <div className="logo">Catch<span>Up</span></div>
        <div className="live">LIVE</div>
        <div className="sim">{s ? `${s.title} · ${s.venue} · simulated live feed` : ''}</div>
      </header>

      <div className="scorebug">
        <div className="teams">
          <div className="score">{s ? `${s.batTeam} ${s.runs}/${s.wickets}` : '–'}</div>
          {s && <div className="target">vs {s.bowlTeam} {s.firstInnings.runs}/{s.firstInnings.wickets} · target {s.target} · {s.overStr} ov</div>}
        </div>
        <div className="equation">{s ? (s.finished ? s.result : `Need ${s.need} off ${s.ballsLeft} balls`) : ''}</div>
        {s && <div className="meta">CRR {s.crr} · Req {s.rrr} · At crease: {s.striker} & {s.nonStriker} · 1st inn: {s.firstInnings.summary}</div>}
        <div className="winbar"><div style={{ width: (s?.winProb ?? 50) + '%' }} /></div>
        {s && <div className="winlabel">Win probability — {s.batTeam} {s.winProb}% · {s.bowlTeam} {100 - s.winProb}%</div>}
        <div className="chips">{s?.lastOverBalls.map((t, i) => <div key={i} className={chipClass(t)}>{t}</div>)}</div>
      </div>

      <div className="grid">
        <div>
          <div className="card">
            <h3>Ball-by-ball</h3>
            <div className="feed">
              {s?.feed.map((b, i) => (
                <div key={i} className={b.big ? 'big' : ''}><span className="over">{b.over}</span>{b.text}</div>
              ))}
            </div>
          </div>
          <div className="card chat">
            <h3>Ask the match anything</h3>
            <div id="chatlog" ref={chatRef}>
              {chat.map((m, i) => (
                <div key={i} className={'msg ' + m.role}>
                  {m.text}
                  {m.eng && <span className="eng">{m.eng}</span>}
                </div>
              ))}
            </div>
            <div className="chatrow">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') ask(); }}
                placeholder="What did I miss? Who should I captain? Why is the rate climbing?"
              />
              <button onClick={ask}>Ask</button>
            </div>
            <div className="hint">Powered by a free Groq LLM when a GROQ_API_KEY is configured; a built-in offline analyst otherwise.</div>
          </div>
        </div>
        <div>
          <div className="card">
            <h3>Catch me up</h3>
            <div className="tones">
              {TONES.map(t => (
                <button key={t} className={tone === t ? 'active' : ''} onClick={() => setTone(t)}>
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button className="catchbtn" onClick={catchUp} disabled={recapLoading}>Catch Me Up</button>
            {recap && <div id="recap">{recap}</div>}
          </div>
          <div className="card" style={{ marginTop: 14 }}>
            <h3>Fantasy points (Dream11-style)</h3>
            <table>
              <thead>
                <tr><th>Player</th><th>Bat</th><th>Bowl</th><th>Pts</th></tr>
              </thead>
              <tbody>
                {s?.fantasy.map(p => (
                  <tr key={p.name}><td>{p.name}</td><td>{p.bat || '—'}</td><td>{p.bowl || '—'}</td><td><b>{p.pts}</b></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
