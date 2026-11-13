// Teaching content for the DFA page.
// `types`  — one section per question type (in the order they appear on the page).
// `notes`  — per-question state meanings (keyed by the shortest string that reaches
//            the state, as printed by `node tools/build.mjs --dump`), idea, steps, trap.

export const types = [
  {
    key: 'count', n: 1, title: 'Counting one symbol',
    tag: 'even / odd / divisible by k / at least / at most',
    cue: 'The language only cares <b>how many</b> times some symbol appears: “odd number of a’s”, “number of a’s divisible by 3”, “at least two 1’s”, “at most three 0’s”.',
    recipe: [
      'Ask: <i>what is the only thing I must remember?</i> → the count so far (mod k, or capped).',
      '<b>even/odd</b> → 2 states (even, odd). <b>divisible by k</b> → k states (remainder 0 … k−1) in a cycle.',
      '<b>at least n</b> → states 0, 1, …, n; the last one loops on everything (once you have n you can never lose it).',
      '<b>at most n</b> → states 0 … n are all accepting; one more occurrence goes to a dead state.',
      'Other symbols do not change the count → self-loop on every state.',
    ],
    tricks: [
      'Start state = “zero seen so far”. Zero is <b>even</b> and <b>divisible by every k</b>, so for “even” / “divisible by k” the start state is also accepting (ε is accepted).',
      '“At least” never needs a dead state; “at most” always does.',
      'If a question has two count limits (“at least two a’s and at most one b”), build a grid: rows = a-count, columns = b-count (that is Type 2).',
    ],
  },
  {
    key: 'product', n: 2, title: 'Two conditions at once (AND / OR)',
    tag: 'product construction',
    cue: 'Two independent conditions joined by <b>and</b> / <b>or</b>: “odd number of 0’s and even number of 1’s”, “even a’s or odd b’s”.',
    recipe: [
      'Build the small DFA for each condition separately (e.g. 2 states each).',
      'Make one state for every <b>pair</b> (state of DFA-1, state of DFA-2). 2 × 2 = 4 states — draw them as a square.',
      'On a symbol, move both components: e.g. reading a flips the a-parity and keeps the b-parity.',
      '<b>AND</b> → accept the pairs where <i>both</i> are accepting. <b>OR</b> → accept where <i>at least one</i> is accepting.',
    ],
    tricks: [
      'The 4-state square is the same picture for AND and OR — only the double circles change. Learn the square once.',
      'Name states by what they remember, e.g. <code>(even a, odd b)</code>. It makes transitions obvious and examiners love it.',
      'Symbols that affect neither counter (like c in Σ = {a,b,c}) → self-loop on every state.',
      'For OR with “even” the start state (0,0) is accepting, so ε ∈ L.',
    ],
  },
  {
    key: 'length', n: 3, title: 'Length-based languages',
    tag: '|w| mod n, exact length, position',
    cue: 'Only the <b>length</b> (or a symbol at a fixed position) matters: “|w| is a multiple of 3”, “length leaves remainder 2 when divided by 4”, “ΣΣ”, “length exactly 3 and third symbol is a”.',
    recipe: [
      '|w| mod n → n states in a cycle; <b>every</b> symbol moves one step forward.',
      'Accept the state(s) whose remainder satisfies the condition.',
      '“divisible by 3 but not by 2” → think mod 6 (lcm): accept only remainder 3.',
      'Exact length k / length ≤ k → a chain of k+1 states, then a dead state for anything longer.',
      'Fixed position (“3rd symbol is a”) → count positions in a chain and branch only at that position.',
    ],
    tricks: [
      'All edges carry <b>all</b> symbols (e.g. “a,b,c”) — a quick sanity check for this type.',
      'Combining two length conditions (mod 2 and mod 3) → use lcm, not a product of two DFAs; it is simpler to draw.',
      'A finite language (like palindromes of length ≤ 3) is always regular: make a tree of all prefixes and a dead state.',
    ],
  },
  {
    key: 'runs', n: 4, title: 'Starts / ends with an odd or even NUMBER of a symbol',
    tag: 'leading run & trailing run',
    cue: '“starts with an odd number of a’s”, “ends with an even number of b’s”, “starts with a non-zero even number of a”. This is about the <b>first block</b> (or <b>last block</b>) of the same symbol — not the total count.',
    recipe: [
      '<b>Starts with</b> odd/even a’s: two states toggle on a (even ↔ odd) while you are still inside the first block.',
      'The first non-a symbol <b>freezes</b> the decision: from the correct parity go to the rest of the machine; from the wrong parity go to a dead state.',
      '<b>Ends with</b> odd/even b’s: keep a parity of the <i>current trailing block</i>; any other symbol resets it to 0.',
      'If there is also a “contains …”/“ends with …” part, the frozen state becomes the start of that sub-DFA (Type 7 chain).',
    ],
    tricks: [
      'Check with a counter-example: for “starts with odd a’s”, <code>aabac</code> must be REJECTED (first block has 2 a’s) even though it has 3 a’s in total.',
      '“even number” — decide if 0 counts. If the string must <i>start with</i> a’s, 0 a’s usually means it does not start with a → not accepted. Here we use non-zero (≥ 2). If your teacher counts 0 as even, just send the start state’s non-a edge to the “block done” state instead of the dead state.',
      'For “ends with odd a’s” the non-a symbols always go back to the “ends with even (0) a’s” state.',
    ],
  },
  {
    key: 'substr', n: 5, title: 'Contains / does not contain a substring',
    tag: 'pattern matching & complement',
    cue: '“contains 0010”, “does not contain 1011”, “does not contain the word fear”.',
    recipe: [
      'Make a chain of states for the pattern p: state i = “the last i symbols I read match the first i symbols of p”.',
      'The correct symbol moves forward one state. The final state (whole p seen) loops on everything.',
      'On a wrong symbol, <b>do not always go back to the start!</b> Go to the longest prefix of p that is a suffix of what you have read so far (use the box method from class).',
      '<b>Does not contain</b> → build “contains”, then <b>swap</b> accept and non-accept states (complement). The “found” state becomes the dead state.',
    ],
    tricks: [
      '<b>Box method</b> for a failed match: write what you read (e.g. 1010 while matching 1011), then slide the pattern under it to the right until the overlapping part matches; the overlap length is the state you go to (here 10 → state “10”).',
      'Complement only works on a <b>complete</b> DFA — every state must have an edge for every symbol (including the dead state) before you swap.',
      'Big alphabets (a…z): group every letter not in the pattern as one edge “others”. Only pattern letters need their own edges.',
      'Exactly “two consecutive 1’s” (183) is read from the samples as “contains 11 but not 111”.',
    ],
  },
  {
    key: 'ends', n: 6, title: 'Ends with … (last k symbols)',
    tag: 'suffix tracking',
    cue: '“ends with 01 or 10”, “last two symbols are different”, “starts with r and ends with pq”.',
    recipe: [
      'Remember the <b>last few symbols</b> (as many as the longest ending you need).',
      'State = the longest suffix read so far that is a prefix of the ending (same idea as Type 5, but the final state does NOT loop — reading more can break the ending).',
      'From the accept state, each symbol moves to the state matching the new suffix (use the box method).',
      'With a “starts with” part: the start chain first, then this ending machine. A wrong first symbol → dead state.',
    ],
    tricks: [
      '“Ends with 01 or 10” is the <b>same language</b> as “last two symbols are different” over {0,1} — 241(b) and 233(c) are the same DFA!',
      'Test the accept state with one more symbol: <code>…01</code> + 0 → <code>…10</code> is still accepted; + 1 → <code>…11</code> is not.',
    ],
  },
  {
    key: 'sce', n: 7, title: 'Starts with X, contains Y, ends with Z',
    tag: 'S → C → E chain (the most common Q1)',
    cue: 'Almost every mid since 2021 has one: “starts with ab, contains bac and ends with ba”.',
    recipe: [
      '<b>S block</b> — a straight chain for the start pattern. Any wrong symbol → dead state (it can never be fixed).',
      '<b>C block</b> — continue as in Type 5 to find the “contains” pattern. ⚠ The end of the S part may already be the beginning of Y (overlap!).',
      '<b>E block</b> — after Y is found, track the ending like Type 6. ⚠ The end of Y may already be the beginning of Z (overlap!), and Y itself may already end with Z.',
      'Accept state = “Y found and the last symbols are Z”. From the accept state, every symbol goes back somewhere inside the E block — never to the dead state, never back to S/C.',
      'Fill every missing edge with the box method (longest suffix that is a prefix of what you are matching).',
    ],
    tricks: [
      '<b>Overlaps are allowed.</b> In the class example, <code>abbacac</code> is accepted: “abb” + “bac” share one b, and “bac” + “cac” share one c. Always test the shortest overlapping string.',
      'Once you are in the E block, the “contains” condition is satisfied forever; you only track the suffix now.',
      'In the C block, a wrong symbol goes back to “matched part of Y”, never back into the S block.',
      'Count states: |S| + (states for Y) + (states for Z) + dead state. 9–11 states is normal for these questions.',
      'Draw the S → C → E boxes first (like the class note), then fill in the states.',
    ],
  },
  {
    key: 'cond-end', n: 8, title: 'A condition + ends with',
    tag: 'count / leading run / not-contain combined with an ending',
    cue: '“odd number of b’s and ends with ac”, “even number of a’s and ends with bc”, “ends with 0 and does not contain 101”.',
    recipe: [
      'Track two things together: the condition (parity, block, forbidden pattern) <i>and</i> the progress toward the ending.',
      'For parity + ending: states = (parity, how much of the ending is matched). Many pairs merge, so the DFA is usually smaller than 2 × (|Z|+1).',
      'A symbol that changes the parity usually also breaks the ending → it goes to (other parity, 0 or 1 matched).',
      'For “not contain P + ends with Z”: build the not-contain DFA (Type 5); then accept only the states whose last symbols are Z.',
    ],
    tricks: [
      'Accept state = right parity <b>and</b> ending complete. Check a string where the ending is complete but the parity is wrong — it must be rejected.',
      'In “odd b’s and ends with ac”, the last b decides the parity; after it you need an a then a c.',
    ],
  },
  {
    key: 'same-diff', n: 9, title: 'Starts and ends with the same / different symbol',
    tag: 'branch on the first symbol',
    cue: '“starts and ends with the same symbol”, “… different symbols”, “… and the length is even”, “made of only one type of symbol”.',
    recipe: [
      'From the start state make <b>one branch per first symbol</b> (a-branch, b-branch, …). The branch remembers the first symbol forever.',
      'Inside each branch use 2 states: “last symbol = first symbol” and “last symbol ≠ first symbol”.',
      'Same → accept the “last = first” states. Different → accept the “last ≠ first” states. (The same drawing, swapped double circles.)',
      'Extra length condition → each branch state also remembers length parity (up to 4 states per branch, many merge).',
    ],
    tricks: [
      'A single symbol “a” starts and ends with a → in “same”, it is accepted; in “different” it is rejected.',
      '“Only one type of symbol” = same idea, but any different symbol → dead state.',
      'When the condition differs per branch (242a: even length if starts with a, odd if starts with b), solve each branch on its own.',
    ],
  },
  {
    key: 'consec', n: 10, title: 'No two consecutive … / neither … nor …',
    tag: 'remember the last symbol',
    cue: '“neither two consecutive a’s nor two consecutive b’s”, “neither 00 nor 11 as a substring”.',
    recipe: [
      'Remember just the <b>last symbol</b>: states = start, “last was a”, “last was b”, dead.',
      'Reading the same symbol again → dead state. Reading a different one → switch.',
      'All non-dead states are accepting (ε too).',
      'Extra symbols that are not restricted (like 2 in Σ = {0,1,2}) → go back to the start (“no danger”).',
    ],
    tricks: [
      'It is a “does not contain” problem (Type 5) with two short patterns. Complement view: L = NOT(contains aa OR contains bb).',
    ],
  },
  {
    key: 'aibj', n: 11, title: 'Languages of the form aⁱbʲ',
    tag: 'block order + counting',
    cue: '“aᵐbⁿ, m, n > 0”, “aⁱbʲ with i + j odd”, “pⁱqʲ with i > 1, j > 0 and i + j even”.',
    recipe: [
      'Two phases: an <b>a-phase</b> and a <b>b-phase</b>. A b → a switch (a after b) goes to the dead state — the order is broken.',
      'Inside each phase, count only what the conditions need (minimum counts, parity of i + j).',
      'i + j parity = parity of the whole length → keep one parity bit across both phases.',
      'Minimum conditions (i > 1, j > 0) → add chain states before the counting loop starts.',
    ],
    tricks: [
      'If both i ≥ 0 and j ≥ 0, ε and pure-a / pure-b strings must be handled. Check ε, “a”, “b”.',
      'This is NOT aⁿbⁿ (that is not regular!). Here i and j are independent, so a DFA works.',
    ],
  },
  {
    key: 'binary', n: 12, title: 'Binary numbers (value mod k)',
    tag: 'remainder states',
    cue: '“binary numbers divisible by 3”, “… or ends with 011”.',
    recipe: [
      'State = remainder of the value read so far (mod k).',
      'Reading bit b: new value = 2 × old + b → new remainder = (2r + b) mod k.',
      'Accept remainder 0. For “or ends with …”, combine with a suffix tracker (Type 2 OR-product, then simplify).',
    ],
    tricks: [
      'For mod 3: from r: on 0 → 2r mod 3, on 1 → (2r+1) mod 3. Table: r0 →(0) r0, (1) r1; r1 →(0) r2, (1) r0; r2 →(0) r1, (1) r2.',
      'Leading zeros do not change the value — the start state (remainder 0) loops on 0.',
    ],
  },
];

export const notes = {
  // ---------------- count ----------------
  'n-odd-a': {
    labels: { '': 'even number of a’s so far', 'a': 'odd number of a’s so far ✓' },
    idea: 'Only the parity of the a-count matters. a flips the parity; b and c do nothing.',
    steps: ['2 states: even, odd.', 'a: even ↔ odd. b, c: self-loops.', 'Start = even (0 a’s). Accept = odd.'],
  },
  '183-1b': {
    labels: { '': 'a-count ≡ 0 (mod 3) ✓', 'a': 'a-count ≡ 1 (mod 3)', 'aa': 'a-count ≡ 2 (mod 3)' },
    idea: 'Remember the a-count modulo 3. Three states form a cycle on a; b loops.',
    steps: ['States = remainders 0, 1, 2.', 'a moves 0 → 1 → 2 → 0.', 'b is a self-loop everywhere.', 'Start and accept = remainder 0 (ε has zero a’s, and 0 is divisible by 3).'],
  },
  '191-1a': {
    labels: { '': 'no 1 seen yet', '1': 'exactly one 1 seen', '11': 'two or more 1’s ✓' },
    idea: '“At least two” → count 0, 1, 2+ and stop counting at 2.',
    steps: ['q0: zero 1’s, q1: one 1, q2: ≥ 2.', '1 moves forward; 0 loops.', 'q2 loops on 0,1 — once you have two 1’s you keep them.', 'Start q0, accept {q2}. Formal: Q={q0,q1,q2}, Σ={0,1}, start q0, F={q2}.'],
  },
  '222-1b': {
    labels: { '': '0 a’s, 0 b’s', 'a': '1 a, 0 b’s', 'b': '0 a’s, 1 b', 'aa': '≥2 a’s, 0 b’s ✓', 'ab': '1 a, 1 b', 'aab': '≥2 a’s, 1 b ✓', 'bb': 'two b’s — too many (dead)' },
    idea: 'Grid of (a-count capped at 2) × (b-count 0 or 1). A second b kills the string.',
    steps: ['Rows: a = 0, 1, ≥2. Columns: b = 0, 1.', 'a moves down (stops at ≥2). b moves right; a second b → dead.', 'Accept the cells with a ≥ 2 (both b = 0 and b = 1).'],
    trap: 'Order does not matter: “aba”, “baa” and “aab” are all accepted.',
  },
  '202-1a': {
    labels: { '': 'start', '0': 'started with 0 (dead)', '1': 'starts with 1, zero 0’s ✓', '10': 'one 0 ✓', '100': 'two 0’s ✓', '1000': 'three 0’s ✓' },
    idea: 'First check the first symbol, then count 0’s up to 3. A fourth 0 → dead.',
    steps: ['q0 –1→ q1, q0 –0→ dead.', 'q1 → q2 → q3 → q4 on 0 (0, 1, 2, 3 zeros); 1 loops.', 'All of q1…q4 accept (“at most three”). A 0 from q4 → dead.'],
  },

  // ---------------- product ----------------
  'n-odd-y': {
    labels: { '': 'even y’s so far', 'y': 'odd y’s so far ✓' },
    idea: 'Sipser’s E1: remember only “even so far” or “odd so far”.',
  },
  '182-1a': {
    labels: { '': '(even 0, even 1)', '0': '(odd 0, even 1) ✓', '1': '(even 0, odd 1)', '01': '(odd 0, odd 1)' },
    idea: 'Product of “parity of 0’s” × “parity of 1’s” → 4 states in a square. 0 moves horizontally, 1 vertically.',
    steps: ['States = (0-parity, 1-parity).', '0 flips the first component, 1 flips the second.', 'AND → accept only (odd 0, even 1).', 'Transition table: see below (marks: 2 for diagram, 2 for table).'],
  },
  '192-1a': {
    labels: { '': '(even a, even b) ✓', 'a': '(odd a, even b)', 'b': '(even a, odd b) ✓', 'ab': '(odd a, odd b) ✓' },
    idea: 'Same 4-state square as 182, but with OR → 3 accept states. c is a self-loop everywhere.',
    steps: ['States = (a-parity, b-parity).', 'a flips a-parity, b flips b-parity, c loops.', 'OR → accept every state except (odd a, even b).', '5 components: Q = {q0..q3}, Σ = {a,b,c}, δ = table, q0 = start, F = {q0,q2,q3}.'],
  },
  '233-1a': {
    labels: { '': '(even a, even b) ✓', 'a': '(odd a, even b)', 'b': '(even a, odd b) ✓', 'ab': '(odd a, odd b) ✓' },
    idea: 'Exactly 192(a) without the c. OR → only (odd a, even b) rejects.',
  },
  '222-1c': {
    labels: { '': '(even 0, even 2) ✓', '0': '(odd 0, even 2)', '2': '(even 0, odd 2) ✓', '02': '(odd 0, odd 2) ✓' },
    idea: 'Parity of 0’s × parity of 2’s, OR. The symbol 1 changes nothing → self-loop on every state.',
  },

  // ---------------- length ----------------
  'n-len3': {
    labels: { '': '|w| mod 3 = 0 ✓', 'a': '|w| mod 3 = 1', 'aa': '|w| mod 3 = 2' },
    idea: 'Every symbol moves one step around a 3-cycle.',
  },
  '191-1b': {
    labels: { '': '|w| mod 3 = 0 ✓', 'a': '|w| mod 3 = 1', 'aa': '|w| mod 3 = 2' },
    idea: 'Same as the class note: 3-cycle on {a,b}. ε (length 0) is accepted.',
  },
  '223-1d': {
    labels: { '': '|w| mod 4 = 0', '0': '|w| mod 4 = 1', '00': '|w| mod 4 = 2 ✓', '000': '|w| mod 4 = 3' },
    idea: '4-cycle, accept remainder 2.',
  },
  '243-1c': {
    labels: { '': '|w| mod 6 = 0', 'a': 'mod 6 = 1', 'aa': 'mod 6 = 2', 'aaa': 'mod 6 = 3 ✓ (div by 3, odd)', 'aaaa': 'mod 6 = 4', 'aaaaa': 'mod 6 = 5' },
    idea: 'Divisible by 3 and not by 2 ⇔ length ≡ 3 (mod 6). Lengths 3, 9, 15, 21 … (the class note crossed out 6, 12, 18).',
    steps: ['lcm(2,3) = 6 → 6 states in a cycle.', 'Every symbol moves forward.', 'Accept only remainder 3.'],
  },
  '252-1a': {
    labels: { '': 'length 0', '0': 'length 1', '00': 'length 2 ✓', '000': 'longer than 2 (dead)' },
    idea: 'ΣΣ = every string of exactly two symbols. Chain of 3 states + dead.',
  },
  '223-1b': {
    labels: { '': 'length 0', 'a': 'length 1', 'aa': 'length 2', 'aaa': 'length 3, third = a ✓', 'aab': 'third = b, or too long (dead)' },
    idea: 'Count positions 1, 2 with any symbol; at position 3 only a is allowed; anything after → dead.',
  },
  '232-1c': {
    labels: { '': 'ε ✓', '0': '0 ✓', '1': '1 ✓', '00': '00 ✓', '01': '01', '10': '10', '11': '11 ✓', '000': 'length-3 palindrome ✓ (000, 010, 101, 111)', '001': 'not a palindrome / too long (dead)' },
    idea: 'A finite language → draw the prefix tree. The 3rd symbol must equal the 1st.',
    steps: ['Accepted: ε, 0, 1, 00, 11, 000, 010, 101, 111.', 'After 2 symbols remember the first one; the 3rd must match it.', 'Anything of length ≥ 4 → dead.'],
  },

  // ---------------- runs ----------------
  'n-start-odd-a': {
    labels: { '': 'first block: even a’s (start)', 'a': 'first block: odd a’s ✓', 'ab': 'first block ended with odd a’s ✓ (anything goes)', 'b': 'first block ended with even a’s (dead)' },
    idea: 'Toggle even/odd while still reading the first a-block. The first non-a decides forever.',
    steps: ['q0 –a→ q1 –a→ q0 (toggle).', 'From q1 (odd), b/c → q2 which loops on everything (accept).', 'From q0 (even), b/c → dead.'],
    trap: '“aabac” has 3 a’s in total but starts with 2 → rejected.',
  },
  'n-end-odd-a': {
    labels: { '': 'ends with an even number (0, 2, …) of a’s', 'a': 'ends with an odd number of a’s ✓' },
    idea: 'Parity of the current trailing a-block; b or c resets it to 0 (even).',
  },
  '253-1b': {
    labels: { '': 'start', 'a': 'starts with a (dead)', 'b': 'odd b-block, length odd', 'ba': 'first block was odd ✓ & length even', 'baa': 'first block was odd & length odd' },
    idea: 'Leading b-block parity first; once it ends (with an a) on odd, just track length parity.',
    steps: ['q0 –b→ q1 –b→ q0 (inside first block).', 'q1 –a→ q2 (block odd; length so far even ⇒ accept).', 'q2 ↔ q3 on any symbol (length parity).', 'q0 –a→ dead (even block, incl. zero).'],
    trap: 'Inside the first b-block, length parity = block parity, so “odd block” and “odd length” are the same state q1. A string of only b’s (odd count) has odd length → rejected.',
  },
  '261-1c': {
    labels: { '': 'start', 'a': 'first a-block odd', 'aa': 'first a-block even (≥2)', 'b': 'bad start (dead)', 'aab': 'ends with odd b’s ✓', 'aaba': 'ends with even b’s (incl. 0)' },
    idea: 'Phase 1: leading a-block must be even and non-zero. Phase 2: track the parity of the trailing b-block.',
    steps: ['q0 –a→ q1 –a→ q2 –a→ q1 … (a-block parity).', 'q0 –b→ dead (zero a’s); q1 –b→ dead (odd block).', 'q2 –b→ q3 (one b ✓). q3 –b→ q4, q4 –b→ q3; a sends to q4 (trailing b-block reset to 0).'],
  },
  '251-1a': {
    labels: { '': 'start', 'a': 'first a-block odd', 'aa': 'first a-block even ✓ (≥2)', 'b': 'bad start (dead)', 'aab': 'trailing b-block odd', 'aaba': 'trailing b-block = 0', 'aabb': 'trailing b-block even (≥2) ✓' },
    idea: 'Leading a-block even (≥2), then the last b-block must be even and non-zero.',
    steps: ['q0/q1/q2: leading a-block parity; b too early → dead.', 'q3: odd b’s at the end, q5: even b’s at the end (accept), q4: last symbol a.', 'b toggles q3 ↔ q5; a from anywhere in phase 2 → q4.'],
    trap: 'Trailing block of 0 b’s does not count as “ends with an even number of b” (string must end with b). So q4 is NOT accepting.',
  },
  '233-1b': {
    labels: { '': 'start / first r-block even', 'b': 'bad start (dead)', 'r': 'first r-block odd', 'rb': 'block OK — suffix “b”', 'rbr': 'suffix “br”', 'rbrb': 'suffix “brb” ✓', 'rbrr': 'suffix “rr” (no progress)' },
    idea: 'Leading r-block parity (Type 4), then a suffix tracker for “brb” (Type 6).',
    steps: ['q0 ↔ q1 on r; q0 –b→ dead.', 'q1 –b→ q2 (block was odd, and “b” starts the ending).', 'q2 –r→ q3 –b→ q4 ✓. q4 –r→ q3 (“brbr” ends with “br”), q4 –b→ q2.', 'q3 –r→ q5 (no progress), q5 –b→ q2.'],
    trap: '“rbrb”: the ending “brb” overlaps the first block’s neighbour — still accepted.',
  },
  '252-1b': {
    labels: { '': 'start / leading 0-block even', '0': 'leading 0-block odd', '1': 'bad start (dead)', '00': 'leading block even ✓ (≥2), nothing of “112” yet', '001': 'suffix “1”', '002': 'no progress', '0011': 'suffix “11”', '00112': 'ends with “112” ✓' },
    idea: 'Leading 0-block (even, non-zero), then match the ending “112”.',
    steps: ['q0 ↔ q1 on 0 until q2 (“00”). 1 or 2 in q0/q1 → dead.', 'q2 –0→ q1: still inside the leading 0-block (now odd again).', 'After the first non-0 the block is frozen: 1 → q3 (“1”), 1 → q5 (“11”), 2 → q6 (“112”) ✓. A 0/2 that breaks the pattern → q4 (no progress); q4 –1→ q3.'],
    trap: 'While still reading 0’s at the start you are in the leading block; only after the first non-0 is the block frozen.',
  },
  '232-1b': {
    labels: { '': 'start', 'a': 'leading a-block odd', 'aa': 'leading a-block even ✓', 'b': 'bad start (dead)', 'aab': 'suffix “b”', 'aaba': 'suffix “ba” (contains “ba” ✓)', 'aabaa': 'ends with “baa” ✓', 'aabaaa': 'suffix “aa” only' },
    idea: 'Since the string must end with “baa”, it automatically contains “ba”. So it is just: leading even a-block + ends with “baa”.',
    steps: ['q0 –a→ q1 –a→ q2 (even), q2 –a→ q1.', 'From q2: b → q3, a after b → q4 (“ba”), a → q5 (“baa”) ✓.', 'From q5: a → q6 (“aaa”, must see a b again), b → q3.'],
    trap: 'Notice the “contains ba” condition is redundant — spotting this makes the DFA much smaller.',
  },

  // ---------------- substr ----------------
  'n-001': {
    labels: { '': 'no part of 001', '0': 'seen “0”', '00': 'seen “00”', '001': 'found 001 ✓' },
    idea: 'Sipser’s E2: four possibilities — nothing, “0”, “00”, or the whole “001”.',
    steps: ['q0 –0→ q1 –0→ q2 –1→ q3.', 'q2 –0→ q2 (“000” still ends with “00”).', 'q1 –1→ q0, q0 –1→ q0.', 'q3 loops on everything.'],
  },
  '192-1b': {
    labels: { '': 'no part of 0010', '0': '“0”', '00': '“00”', '001': '“001”', '0010': 'found 0010 ✓' },
    idea: 'Chain for 0010, with correct fallbacks.',
    steps: ['q2 –0→ q2 (“000” ends in “00”).', 'q3 –1→ q0 (“0011” has no useful suffix).', 'q4 loops on 0,1.'],
  },
  '202-1b': {
    labels: { '': 'safe, nothing matched ✓', '1': 'matched “1” ✓', '10': 'matched “10” ✓', '101': 'matched “101” ✓', '1011': 'found 1011 (dead)' },
    idea: 'Build “contains 1011”, then flip accept states. The found state becomes dead.',
    steps: ['Chain 1 → 10 → 101 → 1011.', 'Fallbacks: “1” + 1 → “1”; “10” + 0 → nothing; “101” + 0 → “10” (box method: 1010 ends with “10”).', 'Every state except the last is accepting.'],
    trap: '“101” + 0 goes to “10”, NOT to the start: 1010 ends with 10, which is a prefix of 1011.',
  },
  '232-1a': {
    labels: { '': 'safe ✓', '1': 'matched “1” ✓', '10': 'matched “10” ✓', '101': 'found 101 (dead)' },
    idea: 'Complement of “contains 101”.',
  },
  '213-1b': {
    labels: { '': 'nothing matched ✓', '0': '“0” ✓', '01': '“01” ✓', '012': '“012” ✓', '0121': 'found 0121 (dead)' },
    idea: 'Complement of “contains 0121” over {0,1,2}. Every 0 restarts at “0”.',
    trap: '“012” + 0 → “0” (not start). Every 0 is a fresh beginning of the pattern.',
  },
  '231-1b': {
    labels: { '': 'nothing matched ✓', 'm': '“m” ✓', 'mn': '“mn” ✓', 'mnm': 'found mnm (dead)' },
    idea: 'Complement of “contains mnm”. w is just another symbol here (not the string variable!).',
    trap: '“m” + m → “m”. “mn” + n → start.',
  },
  '182-1b': {
    labels: { '': 'nothing of “fear” ✓', 'f': '“f” ✓', 'fe': '“fe” ✓', 'fea': '“fea” ✓', 'fear': 'found “fear” (dead)' },
    idea: 'Complement of “contains fear”. Only f, e, a, r need separate edges; every other letter behaves the same.',
    steps: ['Chain f → fe → fea → fear.', 'Every f goes to “f” (fresh start of the word).', 'Any other wrong letter → start.', 'Flip accept states: all except “fear” accept.'],
  },
  '183-1a': {
    labels: { '': 'no 11 yet', '1': 'no 11 yet, last = 1', '11': 'have 11, block of exactly two ✓', '110': 'have 11, last = 0 ✓', '1101': 'have 11, last block = 1 ✓', '111': 'three 1’s in a row (dead)' },
    idea: 'Contains “11” but never “111”.',
    steps: ['Before the first 11: q0 / q1 (last symbol 1).', 'After 11 → q2 (accept). Another 1 → dead (111).', 'After a 0, keep accepting, but remember a single trailing 1 (q4) so that 1 more makes 11 again (q2).'],
    trap: 'Components (for 2 marks): Q = {q0,…,q4, qd}, Σ = {0,1}, start q0, F = {q2,q3,q4}, δ = table.',
  },

  // ---------------- ends ----------------
  '241-1b': {
    labels: { '': 'start', '0': 'ends with 0 (not 10)', '1': 'ends with 1 (not 01)', '01': 'ends with “01” ✓', '10': 'ends with “10” ✓' },
    idea: 'Remember the last two symbols. Accept when they are 01 or 10 (= the last two are different).',
    steps: ['q1 = last 0, q2 = last 1.', '0 then 1 → q3 (01). 1 then 0 → q4 (10).', 'q3 –0→ q4 (…010 ends with 10), q3 –1→ q2 (…011).', 'q4 –1→ q3, q4 –0→ q1.'],
  },
  '233-1c': {
    labels: { '': 'start', 'a': 'last two = aa (or just “a”)', 'b': 'last two = bb (or just “b”)', 'ab': 'last two = ab ✓', 'ba': 'last two = ba ✓' },
    idea: 'Same DFA as 241(b) with a, b instead of 0, 1.',
  },
  '212-1': {
    labels: { '': 'start', 'p': 'did not start with r (dead)', 'r': 'started with r, no progress', 'rp': 'ends with “p”', 'rpq': 'ends with “pq” ✓' },
    idea: 'Check the first symbol, then a 3-state suffix tracker for “pq”.',
    steps: ['q0 –r→ q1; p, q → dead.', 'q1 –p→ q2 –q→ q3 ✓.', 'q2 –p→ q2 (still ends in p). q3 –p→ q2, q3 –q/r→ q1.'],
  },

  // ---------------- sce ----------------
  'n-abb-bac-cac': {
    labels: { '': 'start', 'a': 'S: “a”', 'ab': 'S: “ab”', 'b': 'wrong start (dead)', 'abb': 'S done; C: suffix “b” (start of bac)', 'abba': 'C: “ba”', 'abbc': 'C: nothing matched', 'abbac': 'C done (bac ✓); E: “c”', 'abbaca': 'E: “ca”', 'abbacb': 'E: nothing matched', 'abbacac': 'ends with “cac” ✓' },
    idea: 'Your class example. S = abb, C = bac, E = cac — and both overlaps happen: the last b of “abb” starts “bac”, and the last c of “bac” starts “cac”.',
    steps: [
      'S chain: q0 –a→ q1 –b→ q2 –b→ q3. Wrong symbols → dead.',
      'q3 already holds “b” (start of bac): q3 –a→ q4 (“ba”) –c→ q6 = “bac” found.',
      'C fallbacks: q3 –b→ q3 (still “b”), q3 –c→ q5 (nothing); q4 –a→ q5, q4 –b→ q3; q5 –b→ q3, q5 –a,c→ q5.',
      'E block — q6 already holds “c” (start of cac): q6 –a→ q7 (“ca”) –c→ q9 = “cac” ✓. q6 –c→ q6, q6 –b→ q8 (nothing), q7 –a,b→ q8, q8 –c→ q6.',
      'From the accept state q9: a → q7 (“caca” ends in “ca”), c → q6 (“cacc” ends in “c”), b → q8.',
    ],
    trap: '“abbacac” (7 letters) is the shortest accepted string — test it!',
  },
  '223-1a': {
    labels: { '': 'start', 'a': 'S: “a”', 'b': 'wrong start (dead)', 'ab': 'S done; C: “b”', 'aba': 'C: nothing', 'abb': 'C: “bb”', 'abba': 'C done (bba ✓); E: nothing', 'abbab': 'E: “b”', 'abbabb': 'ends with “bb” ✓' },
    idea: 'S = ab, C = bba, E = bb. The b at the end of “ab” is already the first b of “bba”.',
    steps: ['q0 –a→ q1 –b→ q2 (start done, and holding “b”).', 'q2 –b→ q4 (“bb”), q4 –a→ q5 = bba found. q2 –a→ q3 (nothing), q3 –b→ q2. q4 –b→ q4.', 'E block: q5 –b→ q6 –b→ q7 ✓. a from q6/q7 → q5.'],
    trap: 'Shortest accepted: “abbabb”. A wrong-looking “abba…bb” string still needs the C part first.',
  },
  '231-1c': {
    labels: { '': 'start', 'g': 'S: “g”', 'h': 'wrong start (dead)', 'gh': 'S done; C: nothing', 'ghk': 'C: “k”', 'ghkg': 'C: “kg”', 'ghkgh': 'C done and ends with “gh” ✓', 'ghkghg': 'E: “g”', 'ghkghh': 'E: nothing' },
    idea: 'S = gh, C = kgh, E = gh. Here C itself ends with E, so the moment kgh is found the string is accepted.',
    steps: ['q0 –g→ q1 –h→ q2.', 'C: q2 –k→ q3 –g→ q4 –h→ q5 ✓.', 'E: q5 –g→ q6 –h→ q5. Other symbols → q7 (nothing), q7 –g→ q6.'],
    trap: 'Shortest accepted: “ghkgh” (5 letters), because “kgh” already ends in “gh”.',
  },
  '241-1a': {
    labels: { '': 'start', '2': 'S: “2”', '3': 'wrong start (dead)', '23': 'S done; C: nothing', '234': 'C: “4”', '2344': 'C: “44”', '23443': 'C done (443 ✓); E: “3”', '234432': 'ends with “32” ✓', '234434': 'E: nothing' },
    idea: 'S = 23, C = 443, E = 32. The last 3 of “443” is the first symbol of “32”.',
    steps: ['q0 –2→ q1 –3→ q2.', 'q2 –4→ q3 –4→ q4 –3→ q5 (443 found, holding “3”). q4 –4→ q4.', 'q5 –2→ q6 ✓. q6 –3→ q5, q6 –2/4→ q7, q7 –3→ q5.'],
  },
  '242-1b': {
    labels: { '': 'start', 'a': 'S: “a”', 'b': 'wrong start (dead)', 'ab': 'S done; C: nothing', 'abc': 'C: “c”', 'abcc': 'C: “cc”', 'abcca': 'C done (cca ✓); E: “a”', 'abccab': 'E: “ab”', 'abccac': 'E: nothing', 'abccaba': 'ends with “aba” ✓' },
    idea: 'S = ab, C = cca, E = aba. The a at the end of “cca” is the first a of “aba”.',
    steps: ['q0 –a→ q1 –b→ q2.', 'q2 –c→ q3 –c→ q4 –a→ q5. q4 –c→ q4 (ccc still ends in cc).', 'E: q5 –b→ q6 –a→ q8 ✓. q8 –b→ q6 (“abab” ends in “ab”), q8 –a→ q5.'],
    trap: 'From q8 on b you go to “ab” (q6), not to the start of E.',
  },
  '243-1b': {
    labels: { '': 'start', 'a': 'S: “a”', 'b': 'wrong start (dead)', 'ab': 'S done; C: “b”', 'aba': 'C: “ba”', 'abc': 'C: nothing', 'abac': 'C done (bac ✓); E: nothing', 'abacb': 'E: “b”', 'abacba': 'ends with “ba” ✓' },
    idea: 'S = ab, C = bac, E = ba. The b of “ab” already starts “bac” → “abac” finishes C after only 4 symbols.',
    steps: ['q0 –a→ q1 –b→ q2 (holding “b”).', 'q2 –a→ q3 –c→ q5 (bac ✓). Fallbacks: q2 –c→ q4, q3 –a→ q4, q3 –b→ q2, q4 –b→ q2.', 'E: q5 –b→ q6 –a→ q7 ✓. q7 –b→ q6, q7 –a/c→ q5.'],
    trap: 'Shortest accepted: “abacba”. Many students wrongly need “ab” + “bac” separately (“abbac…”).',
  },
  '251-1b': {
    labels: { '': 'start', 'a': 'S: “a”', 'aa': 'S: “aa”', 'b': 'wrong start (dead)', 'aab': 'S done; C: “b”', 'aaba': 'C: “ba”', 'aabaa': 'C: nothing (ends “aa”)', 'aabab': 'C done (bab ✓); E: nothing', 'aababa': 'E: “a”', 'aababaa': 'ends with “aa” ✓' },
    idea: 'S = aab, C = bab, E = aa. The b of “aab” starts “bab”.',
    steps: ['q0 –a→ q1 –a→ q2 –b→ q3. (q2 –a→ dead: “aaa” is a wrong start.)', 'q3 –a→ q4 –b→ q6 (bab ✓). q4 –a→ q5, q5 –b→ q3, q3 –b→ q3, q5 –a→ q5.', 'E: q6 –a→ q7 –a→ q8 ✓. b anywhere in E → q6.'],
  },
  '252-1c': {
    labels: { '': 'start', '0': 'S: “0”', '01': 'S: “01”', '1': 'wrong start (dead)', '011': 'S done; C: “1”', '0110': 'C: nothing', '0112': 'C: “12”', '01120': 'C done (120 ✓); E: nothing', '011201': 'E: “1”', '0112012': 'ends with “12” ✓' },
    idea: 'S = 011, C = 120, E = 12. The last 1 of “011” starts “120”.',
    steps: ['q0 –0→ q1 –1→ q2 –1→ q3.', 'q3 –2→ q5 –0→ q6 (120 ✓). Fallbacks: 1 → q3, other → q4.', 'E: q6 –1→ q7 –2→ q8 ✓. q8 –1→ q7.'],
  },
  '253-1a': {
    labels: { '': 'start', '0': 'wrong start (dead)', '1': 'S: “1”', '10': 'S: “10”', '101': 'S done; C: “01”', '1010': 'C done (010 ✓); E: nothing', '1011': 'C: nothing', '10101': 'E: “1”', '10110': 'C: “0”', '101011': 'ends with “11” ✓' },
    idea: 'S = 101, C = 010, E = 11. Big overlap: “101” already holds “01” of “010”, so “1010” finishes C.',
    steps: ['q0 –1→ q1 –0→ q2 –1→ q3.', 'q3 –0→ q4 (010 ✓). q3 –1→ q5 (no progress), q5 –0→ q7 (“0”), q7 –1→ q3 (“01”).', 'E: q4 –1→ q6 –1→ q8 ✓. 0 → q4.'],
    trap: 'Shortest accepted: “101011”. Both paper examples pass — try them in the visualiser.',
  },
  '261-1a': {
    labels: { '': 'start', 'a': 'S: “a”', 'b': 'wrong start (dead)', 'ab': 'S done; C: nothing', 'aba': 'C: “a”', 'abaa': 'ends with “aa” (next b completes aab)', 'abaab': 'C done (aab ✓); E: “b”', 'abaaba': 'E: “ba”', 'abaabab': 'ends with “bab” ✓' },
    idea: 'S = ab, C = aab, E = bab. The final b of “aab” starts “bab”.',
    steps: ['q0 –a→ q1 –b→ q2.', 'q2 –a→ q3 –a→ q4 –b→ q5 (aab ✓). q3 –b→ q2, q4 –a→ q4.', 'E: q5 –a→ q6 (“ba”) –b→ q7 = “bab” ✓. q5 –b→ q5, q7 –a→ q6, q7 –b→ q5.', 'q6 –a→ q4: the string now ends with “aa”.'],
    trap: 'Nice merge: once a string ends with “aa”, the next b completes “aab” whether or not aab was seen before — so the C-state “aa” and the E-state “…aa” behave identically and become one state (q4). Drawing them as two separate states is also correct, just not minimal.',
  },
  '213-1c': {
    labels: { '': 'start', 'm': 'S: “m”', 'n': 'wrong start (dead)', 'mn': 'S done; C: nothing', 'mnx': 'C: “x”', 'mnxm': 'C done (xm ✓); last ≠ x', 'mnxmx': 'ends with “x” ✓' },
    idea: 'S = mn, C = xm, E = x.',
    steps: ['q0 –m→ q1 –n→ q2.', 'q2 –x→ q3 –m→ q4 (xm ✓). q3 –x→ q3.', 'E: x → q5 ✓, m/n → q4.'],
  },
  '221-1a': {
    labels: { '': 'start', '0': 'S done; nothing of 110', '1': 'wrong start (dead)', '01': 'C: “1”', '011': 'C: “11”', '0110': 'C done (110 ✓); E: “0”', '01101': 'ends with “01” ✓' },
    idea: 'S = 0, C = 110, E = 01. The 0 of “110” starts “01”.',
    steps: ['q0 –0→ q1; 1 → dead.', 'q1 –1→ q2 –1→ q3 –0→ q4 (110 ✓). q2 –0→ q1, q3 –1→ q3.', 'E (q4 already holds “0”): q4 –1→ q5 ✓, q4 –0→ q4. q5 –0→ q4, q5 –1→ q3.'],
    trap: 'Shortest accepted: “01101”. Merge: q5 –1→ q3 — a string ending in “11” behaves the same whether or not 110 was already seen, because the next 0 makes “110” anyway.',
  },
  '221-1b': {
    labels: { '': 'start', 'a': 'wrong start (dead)', 'c': 'S done; C: nothing', 'ca': 'C: “a”', 'cb': 'C: “b”', 'cab': 'C: “ab”', 'cbc': 'C: “bc”', 'cabc': 'C done (abc / bca ✓); last ≠ b', 'cabcb': 'ends with “b” ✓' },
    idea: 'S = c, C = abc OR bca (track both at once), E = b.',
    steps: ['q0 –c→ q1.', 'Track progress of both patterns: “a”, “ab” (for abc) and “b”, “bc” (for bca).', '“ab” + c or “bc” + a → C found (q6).', 'E: b → q7 ✓, a/c → q6.'],
    trap: '“cbcabb”: bca appears at positions 2–4 → accepted (paper sample).',
  },
  '213-1a': {
    labels: { '': 'nothing of zyx', 'z': 'C: “z”', 'zy': 'C: “zy”', 'zyx': 'C done (zyx ✓); E: nothing', 'zyxz': 'E: “z”', 'zyxzy': 'ends with “zy” ✓' },
    idea: 'C = zyx, then E = zy. (No start condition.)',
  },

  // ---------------- cond-end ----------------
  'n-oddb-ac': {
    labels: { '': 'start / first b-block even', 'a': 'bad start (dead)', 'b': 'first b-block odd', 'ba': 'block OK; ends with “a”', 'bc': 'block OK; nothing of “ac”', 'bac': 'ends with “ac” ✓' },
    idea: 'Class note: leading b-block odd (Type 4), then ends with “ac” (Type 6).',
  },
  '241-1c': {
    labels: { '': 'even b’s', 'b': 'odd b’s, nothing of “ac”', 'ba': 'odd b’s, ends with “a”', 'bac': 'odd b’s, ends with “ac” ✓' },
    idea: 'Class note. (parity of b) × (progress on “ac”). Every b flips parity and destroys the ending, so even-parity states merge into one.',
    steps: ['q0: even b’s. b → q1 (odd).', 'q1 –a→ q2 –c→ q3 ✓.', 'Any b → q0 (even again). q2 –a→ q2, q3 –a→ q2, q3 –c→ q1.'],
    trap: 'With even b’s the ending does not matter yet — one state is enough for “even”.',
  },
  '231-1a': {
    labels: { '': 'even a’s, nothing of “bc”', 'a': 'odd a’s', 'b': 'even a’s, ends with “b”', 'bc': 'even a’s, ends with “bc” ✓' },
    idea: '(parity of a) × (progress on “bc”). With odd a’s you only wait for the next a.',
    steps: ['q0 –b→ q2 –c→ q3 ✓.', 'Any a → toggle parity (q0 ↔ q1).', 'q1 loops on b, c.'],
  },
  '261-1b': {
    labels: { '': 'even a’s, nothing of “bba”', 'a': 'odd a’s, ends with “a”', 'ab': 'odd a’s, ends with “b”', 'abb': 'odd a’s, ends with “bb”', 'abba': 'even a’s, ends with “bba” ✓' },
    idea: 'The final a of “bba” flips the parity — so you need an ODD number of a’s just before it.',
    steps: ['q0 –a→ q1 (odd).', 'q1 –b→ q2 –b→ q3 –a→ q4 ✓ (that a makes it even).', 'q3 –b→ q3. Other a’s: q2 –a→ q0, q4 –a→ q1.'],
    trap: '“abba” is accepted: a-count 2 (even), ends with bba.',
  },
  '212-2': {
    labels: { '': 'start', '0': 'ends with 0 ✓', '1': 'ends with 1', '10': 'ends with “10” ✓ (danger)', '101': 'contains 101 (dead)' },
    idea: 'Not-contain “101” DFA, accept only states whose last symbol is 0.',
  },
  '243-1a': {
    labels: { '': 'start', '0': 'last = 0', '1': 'ends with 1 (not 11)', '00': 'saw “00” — next 1 makes 001 → can never end with 11 safely (dead)', '11': 'ends with “11” ✓' },
    idea: 'Once “00” appears, the string must end with 11, which needs a 1 → “001” appears. So “00” itself is already a dead end!',
    steps: ['q0 –0→ q1, q0 –1→ q2.', 'q1 –0→ dead (00). q1 –1→ q2.', 'q2 –1→ q3 ✓, q3 –1→ q3, any 0 → q1.'],
    trap: 'A smart observation: “00” → dead immediately. Examiners give full marks if explained.',
  },
  '221-1c': {
    labels: { '': 'safe, nothing', 'x': '“x”', 'y': 'ends with “y”', 'xy': '“xy” (danger)', 'yy': 'ends with “yy” ✓', 'xyz': 'contains xyz (dead)' },
    idea: 'Not-contain “xyz” combined with ends-with “yy”.',
  },

  // ---------------- same-diff ----------------
  'n-same': {
    labels: { '': 'start', 'a': 'first a, last a ✓', 'b': 'first b, last b ✓', 'c': 'first c, last c ✓', 'ab': 'first a, last ≠ a', 'ba': 'first b, last ≠ b', 'ca': 'first c, last ≠ c' },
    idea: 'Class note: one branch per first symbol, two states per branch.',
  },
  'n-diff': {
    labels: { '': 'start', 'a': 'first a, last a', 'b': 'first b, last b', 'c': 'first c, last c', 'ab': 'first a, last ≠ a ✓', 'ba': 'first b, last ≠ b ✓', 'ca': 'first c, last ≠ c ✓' },
    idea: 'Same picture as “same”, the double circles are swapped.',
  },
  '222-1a': {
    labels: { '': 'start', '0': 'first 0, odd length', '1': 'first 1, odd length', '00': 'first 0, even length, last 0', '01': 'first 0, even length, last 1 ✓', '10': 'first 1, even length, last 0 ✓', '11': 'first 1, even length, last 1' },
    idea: 'Branch on the first symbol. Then each branch remembers length parity and (at even length) the last symbol.',
    trap: 'At odd length the last symbol does not matter (it will be decided later), so odd-length states are merged per branch.',
  },
  '242-1a': {
    labels: { '': 'start', 'a': 'first a, odd length', 'aa': 'first a, even length, last a', 'ab': 'first a, even length, last b ✓', 'b': 'first b, odd length, last b', 'ba': 'first b, even length', 'baa': 'first b, odd length, last a ✓' },
    idea: 'Two independent branches: a-branch accepts even length ending in b; b-branch accepts odd length ending in a.',
    steps: ['a-branch: q1 (odd) → q3/q4 (even, last a / last b). Next symbol → back to q1.', 'b-branch: q2 (odd, last b) → q5 (even) → q6 (odd, last a ✓) or back to q2.'],
  },
  '251-1c': {
    labels: { '': 'start (ε rejected)', 'a': 'only a’s ✓', 'b': 'only b’s ✓', 'c': 'only c’s ✓', 'ab': 'mixed (dead)' },
    idea: 'Branch on the first symbol; a different symbol → dead.',
  },

  // ---------------- consec ----------------
  '242-1c': {
    labels: { '': 'start ✓', 'a': 'last = a ✓', 'b': 'last = b ✓', 'aa': 'two equal in a row (dead)' },
    idea: 'Class note: remember only the last symbol.',
  },
  '223-1c': {
    labels: { '': 'start / last = 2 ✓', '0': 'last = 0 ✓', '1': 'last = 1 ✓', '00': '00 or 11 seen (dead)' },
    idea: 'Like 242(c), but 2 is a free symbol that resets the danger.',
  },

  // ---------------- aibj ----------------
  '193-1a': {
    labels: { '': 'start', 'a': 'a-phase (≥1 a)', 'b': 'order broken / no a (dead)', 'ab': 'b-phase (≥1 b) ✓' },
    idea: 'a⁺b⁺: at least one a, then at least one b, never an a after a b.',
    steps: ['Transition table and 4 strings: ab, aab, abb, aaabbb.'],
  },
  '232-1d': {
    labels: { '': 'a-phase, even length', 'a': 'a-phase, odd length ✓', 'b': 'b-phase, odd length ✓', 'ab': 'b-phase, even length', 'ba': 'a after b (dead)' },
    idea: 'i + j odd ⇔ total length odd. Keep (phase, length parity).',
  },
  '253-1c': {
    labels: { '': 'start', 'p': 'one p', 'q': 'bad (dead)', 'pp': 'p-phase, i ≥ 2, even length', 'ppp': 'p-phase, i ≥ 3, odd length', 'ppq': 'q-phase, odd length', 'pppq': 'q-phase, even length ✓' },
    idea: 'Need ≥ 2 p’s, ≥ 1 q, total length even, and no p after a q.',
    steps: ['q0 –p→ q1 –p→ q2 (i ≥ 2). q of less than 2 p’s → dead.', 'q2 ↔ q3 on p (length parity).', 'q2 –q→ q4 (odd), q3 –q→ q5 (even ✓). q4 ↔ q5 on q. p in q-phase → dead.'],
  },

  // ---------------- binary ----------------
  'n-div3': {
    labels: { '': 'remainder 0 ✓', '1': 'remainder 1', '10': 'remainder 2' },
    idea: 'new remainder = (2r + bit) mod 3.',
  },
  '222-1d': {
    labels: { '': 'rem 0 ✓', '1': 'rem 1', '10': 'rem 2, ends “0”', '100': 'rem 1, ends “0”', '101': 'rem 2, ends “01”', '1001': 'rem 0, ends “01” ✓', '1011': 'rem 2, ends “011” ✓', '10011': 'rem 0, ends “011” ✓', '10111': 'rem 2, ends “11”' },
    idea: 'OR-product of the mod-3 DFA (3 states) and the “ends with 011” DFA (4 states). After merging equivalent pairs, 9 states remain.',
    steps: ['Each state = (remainder, progress on “011”).', 'Accept if remainder = 0 OR progress = “011”.', 'Remainder-0 states merge with each other when the suffix does not matter.'],
    trap: 'For the exam, drawing the full 12-state product (3 × 4) is also correct; the visualiser shows the minimized one.',
  },
};
