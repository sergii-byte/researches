document.addEventListener('DOMContentLoaded', () => {
  const toc = document.getElementById('tocPanel');
  const toggle = document.getElementById('tocToggle');
  const close = document.getElementById('tocClose');
  const links = toc.querySelectorAll('a[href^="#"]');
  const headings = Array.from(document.querySelectorAll('.diss-content h1, .diss-content h2, .diss-content h3')).filter(h => h.id);

  // Robust same-page anchor navigation: explicitly scroll the target into view.
  // Fixes cases where the browser's default hash-jump silently fails because the
  // body had overflow-x and an alternate scroll context, or sticky headers
  // confuse position calculation.
  function scrollToHash(hash, behavior) {
    if (!hash || hash === '#') return;
    const id = decodeURIComponent(hash.slice(1));
    const el = document.getElementById(id);
    if (!el) return;
    const distance = Math.abs(el.getBoundingClientRect().top);
    const mode = behavior || (distance > 4000 ? 'instant' : 'smooth');
    el.scrollIntoView({ behavior: mode, block: 'start' });
    document.querySelectorAll('.is-target').forEach(n => n.classList.remove('is-target'));
    el.classList.add('is-target');
    setTimeout(() => el.classList.remove('is-target'), 2200);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    if (!document.getElementById(id)) return;
    e.preventDefault();
    history.pushState(null, '', href);
    scrollToHash(href);
    if (window.innerWidth <= 980) toc.classList.remove('open');
  });
  // Handle direct deep-links (page loaded with #hash) and back/forward navigation.
  // Use 'instant' for the initial jump so a long-distance scroll doesn't time out
  // before the smooth animation reaches the target.
  if (location.hash) {
    // Wait until images and layout are settled
    setTimeout(() => scrollToHash(location.hash, 'instant'), 200);
    window.addEventListener('load', () => scrollToHash(location.hash, 'instant'));
  }
  window.addEventListener('popstate', () => scrollToHash(location.hash, 'instant'));

  // TOC search (sidebar) — adds .searching to TOC list so collapsed children become visible too
  const search = document.getElementById('tocSearch');
  const tocList = toc.querySelector('.toc-list');
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    tocList?.classList.toggle('searching', !!q);
    toc.querySelectorAll('.toc-list li').forEach(li => {
      const text = li.textContent.toLowerCase();
      li.classList.toggle('toc-hidden', q && !text.includes(q));
    });
  });

  // Collapsible TOC groups (Module → Lessons)
  function setExpanded(parentLi, expanded) {
    const btn = parentLi.querySelector('.toc-expand');
    if (!btn) return;
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    parentLi.classList.toggle('expanded', expanded);
    const parentId = parentLi.querySelector('a').getAttribute('href').slice(1);
    document.querySelectorAll(`.toc-child[data-parent="${CSS.escape(parentId)}"]`).forEach(child => {
      if (expanded) child.removeAttribute('hidden');
      else child.setAttribute('hidden', '');
    });
  }
  document.querySelectorAll('.toc-expand').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const li = btn.closest('li');
      const isExpanded = li.classList.contains('expanded');
      setExpanded(li, !isExpanded);
    });
  });
  // Auto-expand parent group when navigating to a child (e.g. clicking "Заняття 5" elsewhere)
  function autoExpandParentForHash(hash) {
    if (!hash || hash.length < 2) return;
    const id = hash.slice(1);
    const childLi = document.querySelector(`.toc-child a[href="#${CSS.escape(id)}"]`)?.closest('li');
    if (!childLi) return;
    const parentId = childLi.dataset.parent;
    if (!parentId) return;
    const parentA = document.querySelector(`.toc-list a[href="#${CSS.escape(parentId)}"]`);
    const parentLi = parentA?.closest('li.has-children');
    if (parentLi && !parentLi.classList.contains('expanded')) setExpanded(parentLi, true);
  }
  // Auto-expand when clicking a child link from anywhere
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) autoExpandParentForHash(a.getAttribute('href'));
  }, true);
  // Auto-expand on page load with hash
  if (location.hash) requestAnimationFrame(() => autoExpandParentForHash(location.hash));

  // Header search (pinned in nav) — searches headings AND paragraph content
  const headerInput = document.getElementById('headerSearch');
  const resultsList = document.getElementById('searchResults');
  if (headerInput && resultsList) {
    // Index: all headings with id, level, text, and the section's text content
    const sectionIndex = headings.map(h => {
      const items = [];
      let n = h.nextElementSibling;
      while (n && !/^H[123]$/.test(n.tagName)) {
        items.push(n.textContent || '');
        n = n.nextElementSibling;
      }
      return {
        id: h.id,
        level: parseInt(h.tagName[1]),
        title: h.textContent.replace(/\d+\s*хв$/, '').trim(),
        body: items.join(' ').toLowerCase(),
      };
    });

    function escHtml(s) { return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
    function highlight(text, q) {
      if (!q) return escHtml(text);
      const i = text.toLowerCase().indexOf(q);
      if (i < 0) return escHtml(text);
      return escHtml(text.slice(0, i)) + '<mark>' + escHtml(text.slice(i, i + q.length)) + '</mark>' + escHtml(text.slice(i + q.length));
    }
    function snippetAround(body, q, span = 60) {
      const i = body.indexOf(q);
      if (i < 0) return '';
      const start = Math.max(0, i - span);
      const end = Math.min(body.length, i + q.length + span);
      return (start > 0 ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '');
    }

    function renderResults(query) {
      const q = query.trim().toLowerCase();
      if (!q) { resultsList.hidden = true; resultsList.innerHTML = ''; return; }
      const hits = [];
      for (const s of sectionIndex) {
        const titleHit = s.title.toLowerCase().includes(q);
        const bodyHit = s.body.includes(q);
        if (titleHit || bodyHit) hits.push({ s, score: titleHit ? 2 : 1, snippet: bodyHit ? snippetAround(s.body, q) : '' });
        if (hits.length >= 30) break;
      }
      hits.sort((a, b) => b.score - a.score);
      if (hits.length === 0) {
        resultsList.innerHTML = '<li class="empty">Нічого не знайдено</li>';
      } else {
        resultsList.innerHTML = hits.map(({s, snippet}) =>
          `<li><a href="#${s.id}" class="level-l${s.level}">${highlight(s.title, q)}` +
          (snippet ? `<div style="font-size:12px;color:var(--ink-mute);margin-top:3px;line-height:1.4">${highlight(snippet, q)}</div>` : '') +
          `</a></li>`).join('');
      }
      resultsList.hidden = false;
    }

    headerInput.addEventListener('input', () => renderResults(headerInput.value));
    headerInput.addEventListener('focus', () => { if (headerInput.value.trim()) resultsList.hidden = false; });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-search-wrap')) resultsList.hidden = true;
    });
    headerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { headerInput.value = ''; resultsList.hidden = true; }
      if (e.key === 'Enter') {
        const first = resultsList.querySelector('a');
        if (first) { first.click(); resultsList.hidden = true; }
      }
    });
  }

  toggle?.addEventListener('click', () => toc.classList.add('open'));
  close?.addEventListener('click', () => toc.classList.remove('open'));

  // Close on link click (mobile)
  links.forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth <= 980) toc.classList.remove('open');
  }));

  // Active link highlighting
  const linkById = new Map();
  links.forEach(a => linkById.set(a.getAttribute('href').slice(1), a));

  function setActive(id) {
    links.forEach(a => a.classList.remove('active'));
    const a = linkById.get(id);
    if (a) {
      a.classList.add('active');
      // ensure visible in TOC scroll
      const r = a.getBoundingClientRect();
      const tr = toc.getBoundingClientRect();
      if (r.top < tr.top + 60 || r.bottom > tr.bottom - 60) {
        a.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }

  const io = new IntersectionObserver(entries => {
    let visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.target.offsetTop - b.target.offsetTop);
    if (visible.length) setActive(visible[0].target.id);
  }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
  headings.forEach(h => io.observe(h));

  // Reading progress: top bar + circular ring with %
  const progress = document.getElementById('readingProgress');
  const ring = document.getElementById('readingRing');
  const ringFill = ring?.querySelector('.ring-fill');
  const ringPct = document.getElementById('ringPct');
  const RING_CIRC = 150.7; // 2*pi*24
  function updateOnScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
    if (progress) progress.style.width = pct + '%';
    if (ringFill) ringFill.style.strokeDashoffset = (RING_CIRC * (1 - pct / 100)).toFixed(2);
    if (ringPct) ringPct.textContent = Math.round(pct) + '%';
    if (ring) ring.classList.toggle('complete', pct >= 99);
  }
  window.addEventListener('scroll', updateOnScroll, { passive: true });
  window.addEventListener('resize', updateOnScroll);
  updateOnScroll();
  ring?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile hamburger menu lives in assets/nav.js (shared by every page).
});
