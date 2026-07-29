// Mobile navigation drawer — shared by every page.
// The drawer (.nav-links) lives inside the sticky header, which is its own
// stacking context, so the backdrop is kept below the header in CSS
// (see .menu-backdrop in style.css) — otherwise it covers the drawer and
// intercepts every tap on the menu links.
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('menuBtn');
  var drawer = document.getElementById('navLinks');
  var backdrop = document.getElementById('menuBackdrop') || document.querySelector('.menu-backdrop');
  if (!btn || !drawer) return;

  btn.setAttribute('aria-controls', 'navLinks');

  function setOpen(open) {
    drawer.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  setOpen(false);

  btn.addEventListener('click', function () {
    setOpen(!drawer.classList.contains('open'));
  });
  if (backdrop) backdrop.addEventListener('click', function () { setOpen(false); });

  // Any link inside the drawer closes it — in-page anchors would otherwise
  // scroll to their target behind a drawer that stays open.
  drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') setOpen(false);
  });

  // Reset when the layout goes back to the desktop nav.
  window.addEventListener('resize', function () {
    if (window.innerWidth > 880 && drawer.classList.contains('open')) setOpen(false);
  });
});
