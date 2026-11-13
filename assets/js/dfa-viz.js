// Interactive DFA visualiser.
//   DFAViz.mount(rootEl, dfa, { tableEl, meaningEl, tupleEl })
// `dfa` has the shape produced by tools/build.mjs:
//   { id, sigma: ['a','b'], symLabels, states: [{ name, accept, dead, label }], delta: [{ a: 1, b: 0 }, …], given, samples }
// State 0 is always the start state.
(function () {
  let vizPromise = null;
  const getViz = () => (vizPromise ||= Viz.instance());
  let uid = 0;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const symLabel = (d, a) => (d.symLabels && d.symLabels[a]) || a;
  const sigmaText = d => '{' + d.sigma.map(a => symLabel(d, a)).join(', ') + '}';

  function buildDot(d, prefix, hideDead) {
    const L = [
      'digraph G {',
      'rankdir=LR; bgcolor="transparent"; nodesep=0.32; ranksep=0.5; pad=0.15;',
      'node [shape=circle fontname="JetBrains Mono" fontsize=13 width=0.56 height=0.56 fixedsize=true];',
      'edge [fontname="JetBrains Mono" fontsize=12 arrowsize=0.7];',
      '__s [shape=point style=invis width=0.01 height=0.01 label=""];',
      `__s -> n0 [id="${prefix}es" class="start"];`,
    ];
    d.states.forEach((s, i) => {
      if (hideDead && s.dead) return;
      const cls = ['state', s.accept && 'accept', s.dead && 'dead'].filter(Boolean).join(' ');
      const shape = s.accept ? ' shape=doublecircle width=0.5 height=0.5' : '';
      L.push(`n${i} [id="${prefix}n${i}" label="${s.name}" class="${cls}"${shape}];`);
    });
    const groups = new Map();
    d.delta.forEach((row, i) => {
      if (hideDead && d.states[i].dead) return;
      for (const a of d.sigma) {
        const j = row[a];
        if (hideDead && d.states[j].dead) continue;
        const k = i + '_' + j;
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(a);
      }
    });
    for (const [k, syms] of groups) {
      const [i, j] = k.split('_');
      const all = syms.length === d.sigma.length && d.sigma.length > 3;
      const label = all ? 'Σ' : syms.map(a => symLabel(d, a)).join(',');
      const cls = d.states[j].dead ? 'to-dead' : '';
      L.push(`n${i} -> n${j} [id="${prefix}e${k}" label=" ${label.replace(/"/g, '\\"')} " class="${cls}"];`);
    }
    L.push('}');
    return L.join('\n');
  }

  function transitionTable(d) {
    let h = '<div class="table-scroll"><table class="tt"><thead><tr><th>δ</th>';
    for (const a of d.sigma) h += `<th>${esc(symLabel(d, a))}</th>`;
    h += '</tr></thead><tbody>';
    d.states.forEach((s, i) => {
      const mark = (i === 0 ? '→' : '') + (s.accept ? '*' : '');
      h += `<tr data-i="${i}" class="${s.dead ? 'dead' : ''}"><td class="sn">${mark}${s.name}</td>`;
      for (const a of d.sigma) h += `<td data-a="${esc(a)}">${d.states[d.delta[i][a]].name}</td>`;
      h += '</tr>';
    });
    return h + '</tbody></table></div><p class="small muted" style="margin-top:6px">→ start state, * accept state</p>';
  }

  function meaningTable(d) {
    let h = '<table class="meaning"><tbody>';
    d.states.forEach((s, i) => {
      const cls = [s.accept && 'acc', s.dead && 'dead'].filter(Boolean).join(' ');
      const label = s.label || '';
      h += `<tr data-i="${i}" class="${cls}"><td>${s.name}${i === 0 ? ' <span class="muted">(start)</span>' : ''}</td><td>${esc(label)}${s.accept ? ' <span class="pill ok">accept</span>' : ''}</td></tr>`;
    });
    return h + '</tbody></table>';
  }

  function tuple(d) {
    const names = d.states.map(s => s.name);
    const F = d.states.filter(s => s.accept).map(s => s.name);
    return `<div class="tuple">M = (Q, Σ, δ, q0, F)<br>` +
      `Q = {${names.join(', ')}}<br>` +
      `Σ = ${esc(sigmaText(d))}<br>` +
      `δ : Q × Σ → Q &nbsp;(see the transition table)<br>` +
      `q0 = ${names[0]} &nbsp;(start state)<br>` +
      `F = {${F.join(', ')}}</div>`;
  }

  function mount(root, d, opts = {}) {
    const prefix = 'v' + (++uid) + '_';
    const hasDead = d.states.some(s => s.dead);
    root.classList.add('viz');
    root.innerHTML = `
      <div class="viz-stage">
        ${hasDead ? '<div class="viz-tools"><label><input type="checkbox" class="hide-dead"> hide dead state</label></div>' : ''}
        <div class="svg-host"><span class="loading">Drawing the DFA…</span></div>
      </div>
      <div class="viz-controls">
        <input type="text" class="inp" spellcheck="false" autocomplete="off" aria-label="Input string" placeholder="type a string over Σ = ${esc(sigmaText(d))}">
        <button class="btn primary play" type="button">▶ Run</button>
        <button class="btn back" type="button" title="Step back">◀</button>
        <button class="btn step" type="button" title="Step forward (one symbol)">Step ▶</button>
        <button class="btn reset" type="button">Reset</button>
        <label class="speed">speed <input type="range" class="spd" min="1" max="10" value="6"></label>
      </div>
      <div class="tape"></div>
      <div class="status"></div>
      <div class="trace"></div>
      <div class="sample-rows"></div>
      <div class="quiz"><button class="btn qnew" type="button">🎯 Quiz me</button><span class="qbody muted small">Guess whether a random string is accepted, then watch it run.</span></div>`;

    const $ = s => root.querySelector(s);
    const host = $('.svg-host'), inp = $('.inp'), tape = $('.tape'), status = $('.status'), trace = $('.trace');
    const tableEl = opts.tableEl, meaningEl = opts.meaningEl;
    if (tableEl) tableEl.innerHTML = transitionTable(d);
    if (meaningEl) meaningEl.innerHTML = meaningTable(d);
    if (opts.tupleEl) opts.tupleEl.innerHTML = tuple(d);

    let svg = null, hideDead = false, w = '', pos = 0, path = [0], bad = null, timer = null, ran = false;

    function draw() {
      host.innerHTML = '<span class="loading">Drawing the DFA…</span>';
      getViz().then(viz => {
        svg = viz.renderSVGElement(buildDot(d, prefix, hideDead));
        svg.classList.add('dfa-svg');
        const wpt = parseFloat(svg.getAttribute('width'));
        svg.removeAttribute('height');
        svg.setAttribute('width', Math.round(wpt * 1.3) + 'px');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'State diagram of the DFA');
        d.states.forEach((s, i) => {
          const g = svg.querySelector('#' + prefix + 'n' + i);
          const t = g && g.querySelector('title');
          if (t) t.textContent = s.name + (s.label ? ' — ' + s.label : '');
        });
        host.replaceChildren(svg);
        render();
      }).catch(err => {
        host.innerHTML = '<span class="loading">Could not draw the diagram (' + esc(err.message) + '). The transition table below still works.</span>';
      });
    }

    function setInput(str) {
      stop();
      w = str;
      ran = false;
      bad = [...w].find(c => !d.sigma.includes(c)) || null;
      path = [0];
      if (!bad) for (const c of w) path.push(d.delta[path[path.length - 1]][c]);
      pos = 0;
      render();
    }

    function node(i) { return svg && svg.querySelector('#' + prefix + 'n' + i); }
    function edge(i, j) { return svg && svg.querySelector('#' + prefix + 'e' + i + '_' + j); }

    function render() {
      // tape
      if (!w.length) tape.innerHTML = '<div class="cell eps">ε (empty string)</div>';
      else tape.innerHTML = [...w].map((c, k) =>
        `<div class="cell ${k < pos ? 'done' : ''} ${k === pos && !bad ? 'now' : ''}">${esc(symLabel(d, c).length > 2 ? c : symLabel(d, c))}</div>`).join('');

      // graph
      if (svg) {
        svg.querySelectorAll('.cur,.fire,.used,.final-ok,.final-no,.hl').forEach(el => el.classList.remove('cur', 'fire', 'used', 'final-ok', 'final-no', 'hl'));
        if (!bad) {
          for (let k = 1; k < pos; k++) edge(path[k - 1], path[k])?.classList.add('used');
          if (pos > 0) edge(path[pos - 1], path[pos])?.classList.add('fire');
          const cur = path[pos], n = node(cur);
          const end = pos === w.length && (w.length > 0 || ran);
          if (n) n.classList.add(end ? (d.states[cur].accept ? 'final-ok' : 'final-no') : 'cur');
        }
      }

      // tables
      if (tableEl) {
        tableEl.querySelectorAll('.cur,.fire').forEach(el => el.classList.remove('cur', 'fire'));
        if (!bad) {
          tableEl.querySelector(`tr[data-i="${path[pos]}"]`)?.classList.add('cur');
          if (pos > 0) tableEl.querySelector(`tr[data-i="${path[pos - 1]}"] td[data-a="${CSS.escape(w[pos - 1])}"]`)?.classList.add('fire');
        }
      }

      // status + trace
      const cur = d.states[path[pos]];
      if (bad) {
        status.innerHTML = `<span class="verdict no">“${esc(bad)}” is not in Σ = ${esc(sigmaText(d))}</span>`;
        trace.innerHTML = '';
      } else {
        const done = pos === w.length;
        let s = '';
        if (!w.length && !ran) {
          s = `<span class="muted">Type a string or click a sample below, then press <b>Run</b>. (The empty string ε is <b>${cur.accept ? 'accepted' : 'rejected'}</b>: ${cur.name} is ${cur.accept ? "" : "not "}an accept state.)</span>`;
        } else if (done) {
          s = cur.accept
            ? `<span class="verdict ok">✓ ACCEPTED</span><span>ended in <b>${cur.name}</b>, an accept state${cur.label ? ' — ' + esc(cur.label) : ''}</span>`
            : `<span class="verdict no">✗ REJECTED</span><span>ended in <b>${cur.name}</b>, not an accept state${cur.label ? ' — ' + esc(cur.label) : ''}</span>`;
        } else {
          s = `<span class="pill">read ${pos}/${w.length}</span><span>in <b>${cur.name}</b>${cur.label ? ' — ' + esc(cur.label) : ''}</span>`;
          if (cur.dead) s += '<span class="pill no">dead state: the rest cannot save it</span>';
          else s += `<span class="muted small">next symbol: <b class="mono">${esc(symLabel(d, w[pos]))}</b> → ${d.states[d.delta[path[pos]][w[pos]]].name}</span>`;
        }
        status.innerHTML = s;
        let t = `<span class="st ${pos === 0 ? 'last' : ''}">${d.states[0].name}</span>`;
        for (let k = 1; k <= pos; k++) t += ` <span class="sym">–${esc(symLabel(d, w[k - 1]))}→</span> <span class="st ${k === pos ? 'last' : ''}">${d.states[path[k]].name}</span>`;
        trace.innerHTML = 'δ̂ trace: ' + t;
      }
      root.querySelector('.step').disabled = !!bad || pos >= w.length;
      root.querySelector('.back').disabled = !!bad || pos === 0;
      root.querySelector('.play').textContent = timer ? '❚❚ Pause' : (pos >= w.length && w.length ? '↻ Replay' : '▶ Run');
    }

    function step() { if (!bad && pos < w.length) { pos++; render(); } }
    function back() { if (!bad && pos > 0) { stop(); pos--; render(); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() {
      if (timer) { stop(); render(); return; }
      if (bad) return;
      if (pos >= w.length) pos = 0;
      ran = true;
      const delay = 1250 - 110 * +root.querySelector('.spd').value;
      render();
      timer = setInterval(() => {
        if (pos >= w.length) { stop(); render(); return; }
        step();
        if (pos >= w.length) { stop(); render(); }
      }, delay);
      render();
    }

    inp.addEventListener('input', () => setInput(inp.value.trim()));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); play(); } });
    root.querySelector('.play').addEventListener('click', play);
    root.querySelector('.step').addEventListener('click', () => { stop(); step(); });
    root.querySelector('.back').addEventListener('click', back);
    root.querySelector('.reset').addEventListener('click', () => { stop(); pos = 0; render(); });
    root.querySelector('.hide-dead')?.addEventListener('change', e => { hideDead = e.target.checked; draw(); });

    function load(str) { inp.value = str; setInput(str); play(); }

    // sample chips
    const rows = [];
    const chipRow = (label, list, cls) => list && list.length
      ? `<div class="chips"><span class="lbl">${label}</span>${list.map(s => `<button type="button" class="chip ${cls}" data-s="${esc(s)}">${s === '' ? 'ε' : esc(s)}</button>`).join('')}</div>` : '';
    if (d.given) {
      rows.push(chipRow('Paper ✓', d.given.acc, 'ok'));
      rows.push(chipRow('Paper ✗', d.given.rej, 'no'));
    }
    rows.push(chipRow('Accepted', d.samples.acc, 'ok'));
    rows.push(chipRow('Rejected', d.samples.rej, 'no'));
    $('.sample-rows').innerHTML = rows.join('');
    $('.sample-rows').addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (b) load(b.dataset.s);
    });

    // meaning-table hover highlights the node
    if (meaningEl) {
      meaningEl.addEventListener('mouseover', e => {
        const tr = e.target.closest('tr[data-i]');
        svg?.querySelectorAll('.hl').forEach(el => el.classList.remove('hl'));
        if (tr) node(+tr.dataset.i)?.classList.add('hl');
      });
      meaningEl.addEventListener('mouseleave', () => svg?.querySelectorAll('.hl').forEach(el => el.classList.remove('hl')));
    }

    // quiz
    const runDFA = s => { let q = 0; for (const c of s) q = d.delta[q][c]; return d.states[q].accept; };
    const quiz = $('.quiz .qbody');
    $('.qnew').addEventListener('click', () => {
      let pool = [...d.samples.acc, ...d.samples.rej, ...(d.given ? [...d.given.acc, ...d.given.rej] : [])];
      for (let t = 0; t < 6; t++) {
        let s = ''; const n = 2 + Math.floor(Math.random() * 7);
        for (let i = 0; i < n; i++) s += d.sigma[Math.floor(Math.random() * d.sigma.length)];
        pool.push(s);
      }
      const s = pool[Math.floor(Math.random() * pool.length)];
      const truth = runDFA(s);
      quiz.className = 'qbody';
      quiz.innerHTML = `Is <span class="qs">${s === '' ? 'ε' : esc(s)}</span> accepted? <button type="button" class="btn" data-g="1">Accept</button> <button type="button" class="btn" data-g="0">Reject</button> <span class="res"></span>`;
      quiz.onclick = e => {
        const b = e.target.closest('button[data-g]');
        if (!b) return;
        const right = (b.dataset.g === '1') === truth;
        quiz.querySelector('.res').innerHTML = (right ? '<span style="color:var(--accept)">✓ Correct!</span>' : '<span style="color:var(--reject)">✗ Not quite.</span>') +
          ` It is <b>${truth ? 'accepted' : 'rejected'}</b>. <a href="#" class="watch">Watch it run ▸</a>`;
        quiz.querySelectorAll('button[data-g]').forEach(x => (x.disabled = true));
        quiz.querySelector('.watch').onclick = ev => { ev.preventDefault(); load(s); root.querySelector('.viz-stage').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
      };
    });

    setInput('');
    draw();
    return { load };
  }

  window.DFAViz = { mount, buildDot, sigmaText };
})();
