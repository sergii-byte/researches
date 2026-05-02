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
