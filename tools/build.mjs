// Builds assets/data/dfa-data.js from tools/questions.mjs + tools/notes.mjs.
//
//   node tools/build.mjs          build + verify
//   node tools/build.mjs --dump   also print each DFA's states (access strings) to help write notes
//
// Each DFA is the *minimal* DFA of the question's predicate, found with the
// Myhill–Nerode construction: two prefixes go to the same state iff no suffix
// (up to length K) tells them apart. Every DFA is then checked against the
// predicate on all strings up to length L, so a wrong DFA fails the build.

import { writeFileSync, mkdirSync } from 'node:fs';
import { questions } from './questions.mjs';
import { notes, types } from './notes.mjs';

const DUMP = process.argv.includes('--dump');

function allStrings(sigma, maxLen) {
  const out = [''];
  let layer = [''];
  for (let n = 1; n <= maxLen; n++) {
    const next = [];
    for (const w of layer) for (const a of sigma) next.push(w + a);
    for (const w of next) out.push(w);
    layer = next;
  }
  return out;
}

function lenBound(k, budget) { // largest L with k^L <= budget
  let L = 0, p = 1;
  while (p * k <= budget) { p *= k; L++; }
  return L;
}

function buildDFA(q) {
  const sigma = [...q.sigma];
  const K = lenBound(sigma.length, 3000);
  const suffixes = allStrings(sigma, K);
  const sig = w => suffixes.map(s => (q.pred(w + s) ? '1' : '0')).join('');

  const reps = [''];
  const index = new Map([[sig(''), 0]]);
  const delta = [];
  for (let i = 0; i < reps.length; i++) {
    if (reps.length > 60) throw new Error(`${q.id}: too many states`);
    delta[i] = {};
    for (const a of sigma) {
      const w = reps[i] + a;
      const s = sig(w);
      if (!index.has(s)) { index.set(s, reps.length); reps.push(w); }
      delta[i][a] = index.get(s);
    }
  }
  const accept = reps.map(w => q.pred(w));

  // verify
  const L = lenBound(sigma.length, 400000);
  for (const w of allStrings(sigma, L)) {
    let s = 0;
    for (const c of w) s = delta[s][c];
    if (accept[s] !== q.pred(w)) throw new Error(`${q.id}: DFA disagrees with predicate on "${w}"`);
  }

  // dead states: non-accepting, every symbol loops back to itself
  const dead = reps.map((_, i) => !accept[i] && sigma.every(a => delta[i][a] === i));
  // names: q0.. in BFS order, dead state = qd
  let k = 0;
  const names = reps.map((_, i) => (dead[i] ? 'qd' : 'q' + k++));
  return { sigma, reps, delta, accept, dead, names, verifiedLen: L };
}

// sample strings: a spread of accepted / rejected strings of varied length
function samples(q, dfa) {
  let seed = [...q.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32);
  const acc = new Set(), rej = new Set();
  const run = w => { let s = 0; for (const c of w) s = dfa.delta[s][c]; return dfa.accept[s]; };
  // guided search: random walks biased toward reaching accept states
  for (let t = 0; t < 4000 && (acc.size < 6 || rej.size < 6); t++) {
    const len = 1 + Math.floor(rnd() * 10);
    let w = '';
    for (let i = 0; i < len; i++) w += dfa.sigma[Math.floor(rnd() * dfa.sigma.length)];
    // also try prefixing with a shortest-path-ish seed from reps
    const rep = dfa.reps[Math.floor(rnd() * dfa.reps.length)];
    const cand = rnd() < 0.5 ? w : rep + w;
    if (cand.length > 12) continue;
    (run(cand) ? acc : rej).add(cand);
  }
  // shortest accepted from BFS so there is always something
  const pick = set => [...set].sort((a, b) => a.length - b.length || a.localeCompare(b));
  const spread = arr => {
    if (arr.length <= 6) return arr;
    const out = [];
    for (let i = 0; i < 6; i++) out.push(arr[Math.round(i * (arr.length - 1) / 5)]);
    return [...new Set(out)];
  };
  return { acc: spread(pick(acc)), rej: spread(pick(rej)) };
}

const out = [];
let failures = 0;
for (const q of questions) {
  let dfa;
  try { dfa = buildDFA(q); } catch (e) { console.error('✗', e.message); failures++; continue; }
  const n = notes[q.id] || {};
  for (const g of ['acc', 'rej']) for (const w of (q.given?.[g] || [])) {
    const ok = q.pred(w) === (g === 'acc');
    if (!ok) { console.error(`✗ ${q.id}: paper sample "${w}" (${g}) disagrees with predicate`); failures++; }
  }
  const labels = n.labels || {};
  const unknown = Object.keys(labels).filter(r => !dfa.reps.includes(r));
  if (unknown.length) { console.error(`✗ ${q.id}: labels for unknown states ${JSON.stringify(unknown)}`); failures++; }

  if (DUMP) {
    console.log(`\n== ${q.id} [${q.type}] ${q.lang}  (${dfa.reps.length} states, verified ≤ ${dfa.verifiedLen})`);
    dfa.reps.forEach((r, i) => console.log(
      `  ${dfa.names[i].padEnd(4)} ${dfa.accept[i] ? '*' : ' '} ${JSON.stringify(r).padEnd(12)} ` +
      dfa.sigma.map(a => `${a}→${dfa.names[dfa.delta[i][a]]}`).join(' ') +
      (labels[r] ? `   « ${labels[r]}` : '')));
  }

  out.push({
    id: q.id, type: q.type, src: q.src, lang: q.lang, note: q.note || null,
    sigma: dfa.sigma, symLabels: q.symLabels || {},
    states: dfa.reps.map((r, i) => ({
      name: dfa.names[i], rep: r, accept: dfa.accept[i], dead: dfa.dead[i],
      label: labels[r] || (dfa.dead[i] ? 'dead / trap state — can never accept' : null),
    })),
    delta: dfa.delta.map(row => Object.fromEntries(Object.entries(row).map(([a, j]) => [a, j]))),
    given: q.given || null,
    samples: samples(q, dfa),
    verifiedLen: dfa.verifiedLen,
    idea: n.idea || null, steps: n.steps || null, trap: n.trap || null,
  });
}

mkdirSync(new URL('../assets/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../assets/data/dfa-data.js', import.meta.url),
  '// Generated by tools/build.mjs — do not edit by hand.\n' +
  'window.DFA_TYPES = ' + JSON.stringify(types, null, 1) + ';\n' +
  'window.DFA_DATA = ' + JSON.stringify(out) + ';\n');

console.log(`\n${out.length} DFAs built and verified; ${failures} problem(s).`);
if (failures) process.exit(1);
