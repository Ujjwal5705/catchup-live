// CatchUp — match data, replay engine, and offline analysis fallback.
// The ball-by-ball feed is a scripted simulation of a T20 chase so the demo
// runs anywhere. Swap replay() for a real feed adapter (e.g. a cricket data
// API) and every layer above it keeps working unchanged.

const MATCH = {
  title: 'IPL-style T20',
  venue: 'Wankhede Stadium, Mumbai',
  batTeam: 'MI',
  bowlTeam: 'CSK',
  firstInnings: {
    team: 'CSK',
    runs: 180,
    wickets: 5,
    overs: 20,
    summary: 'Ruturaj 62(38), Dube 41(26); Bumrah 2/24'
  },
  batsmen: [
    'Rohit Sharma', 'Ishan Kishan', 'Suryakumar Yadav', 'Tilak Varma',
    'Hardik Pandya', 'Tim David', 'Naman Dhir', 'Romario Shepherd',
    'Jasprit Bumrah', 'Gerald Coetzee', 'Piyush Chawla'
  ],
  overs: [
    { bowler: 'Tushar Deshpande', balls: ['1', '4', '0', '1', '6', '1'] },
    { bowler: 'Mustafizur Rahman', balls: ['0', '1', '1', '0', 'W', '1'] },
    { bowler: 'Tushar Deshpande', balls: ['4', '1', '0', '2', '1', '4'] },
    { bowler: 'Maheesh Theekshana', balls: ['1', '0', '1', '1', '0', '1'] },
    { bowler: 'Matheesha Pathirana', balls: ['6', '0', '1', 'W', '0', '1'] },
    { bowler: 'Moeen Ali', balls: ['4', '4', '1', '0', 'wd', '1', '2'] },
    { bowler: 'Ravindra Jadeja', balls: ['1', '1', '0', '1', '1', '1'] },
    { bowler: 'Maheesh Theekshana', balls: ['0', '1', 'W', '0', '1', '0'] },
    { bowler: 'Ravindra Jadeja', balls: ['1', '0', '1', '4', '1', '0'] },
    { bowler: 'Moeen Ali', balls: ['1', '1', '1', '0', '6', '1'] },
    { bowler: 'Ravindra Jadeja', balls: ['0', '1', '1', '1', '0', '4'] },
    { bowler: 'Mustafizur Rahman', balls: ['1', 'W', '0', '0', '1', '1'] },
    { bowler: 'Matheesha Pathirana', balls: ['4', '0', '1', '6', '0', '1'] },
    { bowler: 'Maheesh Theekshana', balls: ['1', '1', '4', '0', '1', '1'] },
    { bowler: 'Mustafizur Rahman', balls: ['6', '1', '0', 'W', '0', '1'] },
    { bowler: 'Matheesha Pathirana', balls: ['1', '4', '0', '1', 'W', '0'] },
    { bowler: 'Tushar Deshpande', balls: ['4', '1', '6', '1', '1', '2'] },
    { bowler: 'Mustafizur Rahman', balls: ['0', 'W', '1', '4', '1', '0'] },
    { bowler: 'Matheesha Pathirana', balls: ['1', '6', '1', '1', '4', '1'] },
    { bowler: 'Tushar Deshpande', balls: ['6', '4', '6', '2', '4', '4'] }
  ]
};

const TOTAL_BALLS = 120;
const TARGET = MATCH.firstInnings.runs + 1;

function overLabel(legalBalls) {
  return `${Math.floor((legalBalls - 1) / 6)}.${((legalBalls - 1) % 6) + 1}`;
}

function replay(ballLimit) {
  const st = {
    runs: 0, wickets: 0, balls: 0,
    batters: {}, bowling: {},
    log: [], fow: [],
    lastOverBalls: [], finished: false, result: null,
    striker: null, nonStriker: null
  };
  let striker = 0, nonStriker = 1, nextIn = 2;

  const batter = (i) => {
    const name = MATCH.batsmen[i];
    if (!st.batters[name]) {
      st.batters[name] = { name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, how: null };
    }
    return st.batters[name];
  };
  const bowlerFig = (name) => {
    if (!st.bowling[name]) st.bowling[name] = { name, runs: 0, balls: 0, wickets: 0 };
    return st.bowling[name];
  };

  let done = false;
  for (let o = 0; o < MATCH.overs.length && !done; o++) {
    const over = MATCH.overs[o];
    const fig = bowlerFig(over.bowler);
    const thisOver = [];
    for (const tok of over.balls) {
      if (st.balls >= ballLimit || st.runs >= TARGET) { done = true; break; }
      const bat = batter(striker);
      if (tok === 'wd') {
        st.runs += 1; fig.runs += 1;
        const label = 'wd';
        thisOver.push(label);
        st.log.push({ over: `${o + 1}`, ball: label, text: `${over.bowler} to ${bat.name}, wide`, big: false, runs: 1, wicket: false });
        continue;
      }
      st.balls += 1; fig.balls += 1; bat.balls += 1;
      const ol = overLabel(st.balls);
      if (tok === 'W') {
        st.wickets += 1; fig.wickets += 1;
        bat.out = true; bat.how = `b ${over.bowler}`;
        st.fow.push({ name: bat.name, runs: bat.runs, balls: bat.balls, score: `${st.runs}/${st.wickets}`, over: ol });
        thisOver.push('W');
        st.log.push({ over: ol, ball: 'W', text: `${over.bowler} to ${bat.name}, OUT! ${bat.name} goes for ${bat.runs}(${bat.balls})`, big: true, runs: 0, wicket: true });
        striker = nextIn < MATCH.batsmen.length ? nextIn++ : striker;
      } else {
        const r = parseInt(tok, 10);
        st.runs += r; bat.runs += r; fig.runs += r;
        if (r === 4) bat.fours += 1;
        if (r === 6) bat.sixes += 1;
        thisOver.push(tok);
        const desc = r === 0 ? 'no run' : r === 4 ? 'FOUR!' : r === 6 ? 'SIX!' : `${r} run${r > 1 ? 's' : ''}`;
        st.log.push({ over: ol, ball: tok, text: `${over.bowler} to ${bat.name}, ${desc}`, big: r >= 4, runs: r, wicket: false });
        if (r % 2 === 1) { const t = striker; striker = nonStriker; nonStriker = t; }
      }
    }
    if (thisOver.length) st.lastOverBalls = thisOver;
    if (done) break;
    const t = striker; striker = nonStriker; nonStriker = t; // over-end swap
  }

  st.striker = MATCH.batsmen[striker];
  st.nonStriker = MATCH.batsmen[nonStriker];
  if (st.runs >= TARGET) {
    st.finished = true;
    const wktsLeft = 10 - st.wickets;
    st.result = `${MATCH.batTeam} won by ${wktsLeft} wicket${wktsLeft === 1 ? '' : 's'}` +
      (TOTAL_BALLS - st.balls > 0 ? ` with ${TOTAL_BALLS - st.balls} ball${TOTAL_BALLS - st.balls > 1 ? 's' : ''} to spare` : ' off the last ball');
  } else if (st.balls >= TOTAL_BALLS || st.wickets >= 10) {
    st.finished = true;
    st.result = `${MATCH.bowlTeam} won by ${TARGET - st.runs} runs`;
  }
  return st;
}

// Simplified Dream11-style fantasy scoring.
function fantasyPoints(st) {
  const table = {};
  for (const b of Object.values(st.batters)) {
    let pts = b.runs + b.fours * 1 + b.sixes * 2;
    if (b.runs >= 50) pts += 16; else if (b.runs >= 30) pts += 8;
    if (b.out && b.runs === 0) pts -= 2;
    table[b.name] = { name: b.name, pts, bat: `${b.runs}(${b.balls})`, bowl: null };
  }
  for (const bw of Object.values(st.bowling)) {
    if (!table[bw.name]) table[bw.name] = { name: bw.name, pts: 0, bat: null, bowl: null };
    table[bw.name].pts += bw.wickets * 25;
    table[bw.name].bowl = `${bw.wickets}/${bw.runs}`;
  }
  return Object.values(table).sort((a, b) => b.pts - a.pts);
}

function winProb(st) {
  if (st.finished) return st.runs >= TARGET ? 1 : 0;
  const ballsLeft = TOTAL_BALLS - st.balls;
  if (ballsLeft <= 0) return 0;
  const need = TARGET - st.runs;
  const rrr = need / (ballsLeft / 6);
  const wktsLeft = 10 - st.wickets;
  const z = (9.2 - rrr) * 0.6 + (wktsLeft - 7) * 0.25 - 0.6;
  return 1 / (1 + Math.exp(-z));
}

function facts(st) {
  const overStr = `${Math.floor(st.balls / 6)}.${st.balls % 6}`;
  const ballsLeft = TOTAL_BALLS - st.balls;
  const need = TARGET - st.runs;
  const crr = st.balls ? (st.runs / (st.balls / 6)) : 0;
  const rrr = ballsLeft > 0 ? need / (ballsLeft / 6) : 0;
  const batters = Object.values(st.batters).sort((a, b) => b.runs - a.runs);
  const bowlers = Object.values(st.bowling).sort((a, b) => b.wickets - a.wickets || a.runs - b.runs);
  const moments = st.log.filter(l => l.big).slice(-6).map(l => `[${l.over}] ${l.text}`);
  const last30 = st.log.slice(-30).reduce((s, l) => s + l.runs, 0);
  const last30w = st.log.slice(-30).filter(l => l.wicket).length;
  return { overStr, ballsLeft, need, crr, rrr, batters, bowlers, moments, last30, last30w };
}

function buildRecap(st, tone) {
  const f = facts(st);
  if (st.balls === 0) return 'The chase has not started yet — tap Catch Me Up once a few balls have been bowled.';
  const top = f.batters[0];
  const bestBowl = f.bowlers[0];
  const situation = st.finished
    ? `${st.result}.`
    : `${MATCH.batTeam} are ${st.runs}/${st.wickets} after ${f.overStr} overs, needing ${f.need} off ${f.ballsLeft} balls (req. rate ${f.rrr.toFixed(1)}).`;
  const momentum = st.finished
    ? `${MATCH.bowlTeam} made it tense late, taking ${f.last30w} wickets in the final 30 balls.`
    : f.last30w >= 2
    ? `${MATCH.bowlTeam} have hit back with ${f.last30w} wickets in the last 30 balls.`
    : f.last30 >= 45 ? `${MATCH.batTeam} are flying — ${f.last30} runs in the last 30 balls.`
    : `It has been a grind lately: ${f.last30} runs in the last 30 balls.`;

  if (tone === 'story') {
    const lead = st.finished
      ? `Here is how it ended at the ${MATCH.venue}. Chasing ${TARGET}, ${situation} `
      : `Here is the story so far at the ${MATCH.venue}. Chasing ${TARGET}, ${situation} `;
    return lead +
      `${top.name} has led the charge with ${top.runs} off ${top.balls}. ` +
      `${st.fow.length ? `The innings lost its way when ${st.fow[st.fow.length - 1].name} fell at ${st.fow[st.fow.length - 1].score}. ` : ''}` +
      `${momentum} For ${MATCH.bowlTeam}, ${bestBowl.name} has been the pick of the bowlers with ${bestBowl.wickets}/${bestBowl.runs}. ` +
      (st.finished ? '' : 'This one is going down to the wire.');
  }
  if (tone === 'hinglish') {
    return `Bhai, kya chase chal raha hai Wankhede mein! ${st.finished ? st.result : `${MATCH.batTeam} ${st.runs}/${st.wickets} pe hain ${f.overStr} over baad — chahiye ${f.need} runs ${f.ballsLeft} balls mein.`} ` +
      `${top.name} ne sabse zyada maara: ${top.runs}(${top.balls}). ` +
      `${f.last30w >= 2 ? `Lekin ${MATCH.bowlTeam} ne wapasi ki hai, ${f.last30w} wickets pichle 30 balls mein.` : `Momentum abhi ${f.last30 >= 45 ? MATCH.batTeam + ' ke saath' : 'balance'} hai.`} ` +
      `${bestBowl.name} sabse khatarnak bowler raha: ${bestBowl.wickets}/${bestBowl.runs}. Abhi match kisi ka bhi ho sakta hai!`;
  }
  // quick
  return [
    `Score: ${MATCH.batTeam} ${st.runs}/${st.wickets} (${f.overStr} ov) chasing ${TARGET}` +
      (st.finished ? ` — ${st.result}` : ` — need ${f.need} off ${f.ballsLeft} at ${f.rrr.toFixed(1)} rpo`),
    `Top batter: ${top.name} ${top.runs}(${top.balls}) | Best bowler: ${bestBowl.name} ${bestBowl.wickets}/${bestBowl.runs}`,
    `Momentum: ${momentum}`,
    `Key moments: ${f.moments.length ? f.moments.join(' · ') : 'none yet'}`
  ].join('\n');
}

function answerQuestion(st, qRaw) {
  const q = (qRaw || '').toLowerCase();
  const f = facts(st);
  const players = [...Object.keys(st.batters), ...Object.keys(st.bowling)];
  const named = players.find(p => p.toLowerCase().split(' ').some(part => part.length > 3 && q.includes(part.toLowerCase())));

  if (/captain|fantasy|dream11|points/.test(q)) {
    const top = fantasyPoints(st).slice(0, 3);
    const diff = f.batters.find(b => !b.out && b.balls > 0 && b.runs >= 15);
    return `Fantasy picture right now: ${top.map((t, i) => `${i + 1}) ${t.name} — ${t.pts} pts (${[t.bat, t.bowl].filter(Boolean).join(' & ')})`).join(', ')}. ` +
      `Captaincy shout: ${top[0].name} is the form pick${diff && diff.name !== top[0].name ? `, but ${diff.name} is a differential — still at the crease with ${f.ballsLeft} balls of upside left` : ''}.`;
  }
  if (/win|chance|momentum|jeet/.test(q)) {
    const p = Math.round(winProb(st) * 100);
    return `${MATCH.batTeam}'s win probability is about ${p}%. Need ${f.need} off ${f.ballsLeft} (req. ${f.rrr.toFixed(1)} rpo) with ${10 - st.wickets} wickets in hand. ` +
      (p >= 60 ? 'The set batters make them favourites from here.' : p >= 40 ? 'Genuinely 50-50 — the next two overs decide it.' : 'The bowlers are on top; it will take one big over to flip it.');
  }
  if (/wicket|out|fell|fall/.test(q)) {
    if (!st.fow.length) return 'No wickets yet — the openers are still going.';
    return `Fall of wickets: ${st.fow.map(w => `${w.name} ${w.runs}(${w.balls}) at ${w.score} in over ${w.over}`).join(' · ')}.`;
  }
  if (/last over|this over/.test(q)) {
    return `Recent over: ${st.lastOverBalls.join(' · ')}. ` + (st.log.length ? `Latest: ${st.log[st.log.length - 1].text}.` : '');
  }
  if (/required|need|rate|equation/.test(q)) {
    return st.finished ? st.result : `The equation: ${f.need} needed off ${f.ballsLeft} balls — required rate ${f.rrr.toFixed(1)}, current rate ${f.crr.toFixed(1)}.`;
  }
  if (/miss|catch ?up|summary|recap|happen|story/.test(q)) {
    return buildRecap(st, 'quick');
  }
  if (named && st.bowling[named]) {
    const bw = st.bowling[named];
    const bat = st.batters[named];
    const batPart = bat ? ` With the bat: ${bat.runs}(${bat.balls})${bat.out ? ' — out' : ' — still there'}.` : '';
    return `${named} has bowled ${Math.floor(bw.balls / 6)}.${bw.balls % 6} overs: ${bw.wickets}/${bw.runs} (econ ${bw.balls ? (bw.runs / (bw.balls / 6)).toFixed(1) : '-'}).` + batPart;
  }
  if (named && st.batters[named]) {
    const b = st.batters[named];
    const sr = b.balls ? ((b.runs / b.balls) * 100).toFixed(0) : '-';
    return `${named}: ${b.runs} off ${b.balls} (SR ${sr}), ${b.fours} fours and ${b.sixes} sixes — ${b.out ? `out (${b.how})` : 'batting right now'}. Fantasy: ${fantasyPoints(st).find(p => p.name === named)?.pts ?? 0} pts.`;
  }
  return `${buildRecap(st, 'quick')}\n\nTry asking about a player, "who should I captain?", "what are the win chances?" or "what did I miss?"`;
}

function stateForClient(st) {
  const f = facts(st);
  return {
    title: MATCH.title, venue: MATCH.venue,
    batTeam: MATCH.batTeam, bowlTeam: MATCH.bowlTeam,
    target: TARGET, runs: st.runs, wickets: st.wickets,
    overStr: `${Math.floor(st.balls / 6)}.${st.balls % 6}`,
    balls: st.balls, ballsLeft: f.ballsLeft, need: f.need,
    crr: +f.crr.toFixed(2), rrr: +f.rrr.toFixed(2),
    winProb: Math.round(winProb(st) * 100),
    finished: st.finished, result: st.result,
    firstInnings: MATCH.firstInnings,
    striker: st.striker, nonStriker: st.nonStriker,
    lastOverBalls: st.lastOverBalls,
    feed: st.log.slice(-8).reverse(),
    batters: Object.values(st.batters),
    bowling: Object.values(st.bowling),
    fow: st.fow,
    fantasy: fantasyPoints(st).slice(0, 8)
  };
}

function contextForLLM(st) {
  const f = facts(st);
  return JSON.stringify({
    match: `${MATCH.batTeam} chasing ${TARGET} vs ${MATCH.bowlTeam} at ${MATCH.venue} (first innings: ${MATCH.firstInnings.summary})`,
    score: `${st.runs}/${st.wickets} after ${f.overStr} overs`,
    equation: st.finished ? st.result : `need ${f.need} off ${f.ballsLeft}, req rate ${f.rrr.toFixed(1)}`,
    winProbPct: Math.round(winProb(st) * 100),
    batting: Object.values(st.batters).map(b => `${b.name} ${b.runs}(${b.balls})${b.out ? ' out' : ' batting'}`),
    bowling: Object.values(st.bowling).map(b => `${b.name} ${b.wickets}/${b.runs} in ${Math.floor(b.balls / 6)}.${b.balls % 6}`),
    fallOfWickets: st.fow.map(w => `${w.name} at ${w.score} (${w.over})`),
    recentBalls: st.log.slice(-12).map(l => `[${l.over}] ${l.text}`),
    fantasyTop: fantasyPoints(st).slice(0, 5).map(p => `${p.name} ${p.pts}pts`)
  });
}

export { MATCH, TARGET, TOTAL_BALLS, replay, fantasyPoints, winProb, buildRecap, answerQuestion, stateForClient, contextForLLM };
