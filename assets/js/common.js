// Shared header, footer and theme toggle for every page.
(function () {
  const PAGES = [
    ['index.html', 'Home'],
    ['concepts.html', 'Basic Concepts'],
    ['dfa.html', 'DFA'],
    ['papers.html', 'Past Papers'],
  ];
  const here = location.pathname.split('/').pop() || 'index.html';

  try {
    const saved = localStorage.getItem('toc-theme');
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* storage unavailable */ }

  const header = document.getElementById('top');
  if (header) {
    header.className = 'topbar';
    header.innerHTML = `<div class="topbar-inner">
      <a class="brand" href="index.html"><span class="brand-mark">δ</span><span>TOC Notes</span></a>
      <nav class="nav">${PAGES.map(([href, name]) => `<a href="${href}" class="${href === here ? 'active' : ''}">${name}</a>`).join('')}</nav>
      <button class="icon-btn" id="theme-btn" type="button" title="Toggle light / dark" aria-label="Toggle light or dark theme">🌓</button>
    </div>`;
    document.getElementById('theme-btn').addEventListener('click', () => {
      const root = document.documentElement;
      const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('toc-theme', root.dataset.theme); } catch (e) { /* ignore */ }
    });
  }

  const foot = document.getElementById('foot');
  if (foot) {
    foot.className = 'foot';
    foot.innerHTML = 'CSE 2233 · Theory of Computation — study notes built from UIU mid-term papers (2018–2026), class notes and slides.';
  }
})();
