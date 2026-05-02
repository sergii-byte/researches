// Tab filter
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const items = document.querySelectorAll('.pub-item');

  // Count items per tab and update the count badge
  tabs.forEach(t => {
    const cat = t.dataset.tab;
    const n = cat === 'all' ? items.length : Array.from(items).filter(i => i.dataset.cat === cat).length;
    let badge = t.querySelector('.count');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'count';
      t.appendChild(badge);
    }
    badge.textContent = n;
  });

  function applyFilter(cat) {
    items.forEach(it => {
      const match = cat === 'all' || it.dataset.cat === cat;
      it.classList.toggle('show', match);
    });
    // Reset counter for visible items
    let n = 0;
    items.forEach(it => {
      if (it.classList.contains('show')) {
        n++;
        it.style.setProperty('--n', n);
      }
    });
  }

  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      applyFilter(t.dataset.tab);
    });
  });

  applyFilter('all');

  // Citation buttons (APA / BibTeX) + Crossref "cited by" count
  document.querySelectorAll('.pub-item').forEach(item => {
    const doiAnchor = item.querySelector('a[href*="doi.org"]');
    if (!doiAnchor) return;
    const doi = doiAnchor.href.replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '');
    const meta = item.querySelector('.pub-meta');
    if (!meta) return;

    // Build citation strings from existing DOM
    const authors = item.querySelector('.pub-authors')?.textContent.replace(/\s+/g, ' ').trim() || '';
    const title = item.querySelector('.pub-title')?.textContent.trim() || '';
    const venue = item.querySelector('.pub-venue')?.textContent.trim() || '';
    const pages = item.querySelector('.pages')?.textContent.replace(/^[А-ЯA-Z]+\s*\.?\s*/, '').trim() || '';
    const yearMatch = venue.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? yearMatch[0] : '';

    function apa() {
      return `${authors} (${year}). ${title}. ${venue}. https://doi.org/${doi}`;
    }
    function bibtex() {
      const key = (authors.split(/[,.]/)[0]?.replace(/\s+/g,'') || 'ref') + year;
      return `@article{${key},\n  author = {${authors}},\n  title = {${title}},\n  journal = {${venue.split('·')[0].trim()}},\n  year = {${year}},\n  pages = {${pages}},\n  doi = {${doi}}\n}`;
    }

    const cite = document.createElement('button');
    cite.className = 'pub-cite';
    cite.type = 'button';
    cite.title = 'Скопіювати цитування';
    cite.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> APA';
    cite.addEventListener('click', () => {
      navigator.clipboard.writeText(apa()).then(() => {
        cite.classList.add('copied');
        const orig = cite.innerHTML;
        cite.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg> Скопійовано';
        setTimeout(() => { cite.classList.remove('copied'); cite.innerHTML = orig; }, 1800);
      });
    });
    meta.appendChild(cite);

    const bib = document.createElement('button');
    bib.className = 'pub-cite';
    bib.type = 'button';
    bib.title = 'Скопіювати BibTeX';
    bib.textContent = 'BibTeX';
    bib.addEventListener('click', () => {
      navigator.clipboard.writeText(bibtex()).then(() => {
        bib.classList.add('copied');
        const orig = bib.textContent;
        bib.textContent = 'Скопійовано';
        setTimeout(() => { bib.classList.remove('copied'); bib.textContent = orig; }, 1800);
      });
    });
    meta.appendChild(bib);

    // Crossref "cited by" count (async, non-blocking, fail-silent)
    fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const n = data?.message?.['is-referenced-by-count'];
        if (typeof n === 'number' && n > 0) {
          const el = document.createElement('span');
          el.className = 'pub-cited-by';
          el.dataset.count = n;
          el.innerHTML = `cited by <strong>${n}</strong>`;
          meta.appendChild(el);
        }
      })
      .catch(() => {});
  });

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

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});
