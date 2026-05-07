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

  // TOC search
  const search = document.getElementById('tocSearch');
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    toc.querySelectorAll('.toc-list li').forEach(li => {
      const text = li.textContent.toLowerCase();
      li.classList.toggle('toc-hidden', q && !text.includes(q));
    });
  });

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

  // Mobile hamburger menu
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  const backdrop = document.getElementById('menuBackdrop');
  function closeMenu() {
    navLinks?.classList.remove('open');
    backdrop?.classList.remove('open');
  }
  menuBtn?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    backdrop?.classList.toggle('open');
  });
  backdrop?.addEventListener('click', closeMenu);
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
});
