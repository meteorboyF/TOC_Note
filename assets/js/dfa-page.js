// Builds the DFA notes page from window.DFA_TYPES and window.DFA_DATA.
(function () {
  const types = window.DFA_TYPES, data = window.DFA_DATA;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isPaper = q => /\d{4}/.test(q.src);
  const main = document.getElementById('types');
  const side = document.getElementById('side-types');

  const byType = Object.fromEntries(types.map(t => [t.key, data.filter(q => q.type === t.key)]));

  side.innerHTML = types.map(t => {
    const n = byType[t.key].filter(isPaper).length;
    return `<a href="#t-${t.key}" data-key="${t.key}"><span class="num">${t.n}</span><span>${esc(t.title)}</span><span class="count">${n || ''}</span></a>`;
  }).join('');

  function card(q, worked) {
    const pills = [
      worked ? '<span class="pill accent">Worked example</span>' : '',
      `<span class="pill ${isPaper(q) ? 'warn' : ''}">${esc(q.src)}</span>`,
      `<span class="pill">${q.states.length} states</span>`,
    ].join('');
    return `<details class="q" id="q-${q.id}" data-id="${q.id}" ${worked ? 'open' : ''}>
      <summary><span class="chev">▶</span><span class="qlang"><span class="meta">${pills}</span><span class="l">${esc(q.lang)}</span><span class="muted small"> &nbsp;Σ = ${esc(DFAViz.sigmaText(q))}</span></span></summary>
      <div class="qbody"></div>
    </details>`;
  }

  function fillCard(el, q) {
    const body = el.querySelector('.qbody');
    if (body.dataset.ready) return;
    body.dataset.ready = '1';
    body.innerHTML = `
      ${q.note ? `<div class="callout" style="margin-top:16px"><div class="callout-title">ⓘ Reading the question</div>${esc(q.note)}</div>` : ''}
      ${q.idea ? `<h4>Idea — what must the DFA remember?</h4><p>${esc(q.idea)}</p>` : ''}
      <div class="viz-root"></div>
      <div class="qcols">
        <div>
          <h4>What each state means</h4><div class="meaning-root"></div>
          ${q.steps ? `<h4>Step-by-step construction</h4><ol class="steps">${q.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
          ${q.trap ? `<div class="callout trap"><div class="callout-title">⚠ Watch out</div>${esc(q.trap)}</div>` : ''}
        </div>
        <div>
          <h4>Transition table</h4><div class="table-root"></div>
          <h4>Formal definition (5-tuple)</h4><div class="tuple-root"></div>
          <p class="small muted" style="margin-top:8px">✓ This DFA is the minimal one and was machine-checked against every string up to length ${q.verifiedLen}.</p>
        </div>
      </div>`;
    DFAViz.mount(body.querySelector('.viz-root'), q, {
      tableEl: body.querySelector('.table-root'),
      meaningEl: body.querySelector('.meaning-root'),
      tupleEl: body.querySelector('.tuple-root'),
    });
  }

  main.innerHTML = types.map(t => {
    const qs = byType[t.key];
    const worked = qs.filter(q => !isPaper(q));
    const past = qs.filter(isPaper);
    return `<section class="type-section" id="t-${t.key}">
      <div class="type-head"><span class="tnum">Type ${t.n}</span><h2>${esc(t.title)}</h2><span class="pill">${esc(t.tag)}</span></div>
      <div class="callout"><div class="callout-title">🔍 How to recognise it</div>${t.cue}</div>
      <div class="type-grid">
        <div class="callout tip recipe"><div class="callout-title">🧭 Recipe</div><ol>${t.recipe.map(r => `<li>${r}</li>`).join('')}</ol></div>
        <div class="callout trap"><div class="callout-title">💡 Tricks & traps</div><ul>${t.tricks.map(r => `<li>${r}</li>`).join('')}</ul></div>
      </div>
      ${worked.length ? `<div class="qlist-title">Worked example${worked.length > 1 ? 's' : ''} (class notes / slides)</div>` + worked.map((q, i) => card(q, i === 0)).join('') : ''}
      <div class="qlist-title">Past mid questions of this type (${past.length})</div>
      ${past.map(q => card(q, false)).join('')}
    </section>`;
  }).join('');

  main.querySelectorAll('details.q').forEach(el => {
    const q = data.find(x => x.id === el.dataset.id);
    if (el.open) fillCard(el, q);
    el.addEventListener('toggle', () => { if (el.open) fillCard(el, q); });
  });

  // open + scroll to #q-xxx links
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id.startsWith('q-')) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.open = true;
    setTimeout(() => { el.scrollIntoView({ block: 'start' }); el.classList.add('anchor-flash'); }, 50);
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();

  // expand / collapse all
  document.getElementById('open-all')?.addEventListener('click', () => main.querySelectorAll('details.q').forEach(d => (d.open = true)));
  document.getElementById('close-all')?.addEventListener('click', () => main.querySelectorAll('details.q').forEach(d => (d.open = false)));

  // search filter
  const search = document.getElementById('q-search');
  search?.addEventListener('input', () => {
    const term = search.value.trim().toLowerCase();
    main.querySelectorAll('details.q').forEach(el => {
      const q = data.find(x => x.id === el.dataset.id);
      const hay = (q.lang + ' ' + q.src + ' ' + q.id).toLowerCase();
      el.style.display = !term || hay.includes(term) ? '' : 'none';
    });
    main.querySelectorAll('.type-section').forEach(sec => {
      const any = [...sec.querySelectorAll('details.q')].some(d => d.style.display !== 'none');
      sec.style.display = any ? '' : 'none';
    });
  });

  // scroll-spy for the sidebar
  const links = [...side.querySelectorAll('a')];
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.dataset.key === e.target.id.slice(2)));
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  main.querySelectorAll('.type-section').forEach(s => obs.observe(s));

  const totalPast = data.filter(isPaper).length;
  const el = document.getElementById('dfa-count');
  if (el) el.textContent = totalPast;
})();
