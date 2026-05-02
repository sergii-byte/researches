document.addEventListener('DOMContentLoaded', () => {
  const toc = document.getElementById('tocPanel');
  const toggle = document.getElementById('tocToggle');
  const close = document.getElementById('tocClose');
  const toTop = document.getElementById('toTop');
  const links = toc.querySelectorAll('a[href^="#"]');
  const headings = Array.from(document.querySelectorAll('.diss-content h1, .diss-content h2, .diss-content h3')).filter(h => h.id);

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

  // Scroll-to-top
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 600);
  });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
