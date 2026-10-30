import { BB } from '../../shared/ui';
import { type Restaurant } from '../../shared/data';
import { Api, ApiError } from '../../shared/api';
import { Admin } from '../../shared/admin';
(() => {
  const id = decodeURIComponent(location.pathname.split('/').pop() || '');
  const copyBtn = BB.$('[data-copy]');
  let email: string | null = null;

  function show(r: Restaurant): void {
    const joined = new Date(r.createdAt);
    BB.$$('[data-name]').forEach(el => { el.textContent = r.name; });
    BB.$$('[data-email]').forEach(el => { el.textContent = email ?? 'the sign-in email'; });
    BB.$('[data-email-row]').textContent = email ?? '–';
    copyBtn.hidden = !email;
    BB.$('[data-crumb]').textContent = r.name;
    BB.$('[data-joined]').textContent = Admin.date(r.createdAt);
    BB.$('[data-since]').textContent = Date.now() - joined.getTime() < 864e5 ? 'just joined. say hi!' : `on BeepBite since ${joined.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
    BB.$('[data-tile]').innerHTML = Admin.tile(r, 'r-tile--lg');
    document.title = `${r.name} · BeepBite admin`;
    if (BB.motion()) gsap.from('.r-tile--lg', { scale: 0.5, rotation: -20, duration: 0.6, ease: 'back.out(1.8)' });
  }

  function missing(): void {
    BB.setState('missing');
    BB.$('[data-found]').hidden = true;
    BB.$('[data-missing]').hidden = false;
    BB.$('[data-crumb]').textContent = 'Not found';
  }

  copyBtn.addEventListener('click', () => {
    if (!email) return;
    const copied = email;
    const done = (): void => {
      copyBtn.innerHTML = `${BB.icon('check', 'icon--sm')}Copied`;
      BB.toast(`Copied ${BB.esc(copied)}`, 'success', 'check');
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    };
    navigator.clipboard?.writeText(copied).then(done, done) ?? done();
  });

  // The restaurant from GET /restaurant/:id, its sign-in email from GET /restaurant/accounts.
  Promise.all([Api.restaurant(id), Admin.restaurants.catch(() => [])]).then(([r, accounts]) => {
    email = accounts.find(a => a._id === r._id)?.email ?? null;
    BB.setState('default');
    BB.$('[data-found]').hidden = false;
    show(r);
  }, err => {
    missing();
    // A malformed id (400) or no such restaurant (404) is just "not found".
    if (!(err instanceof ApiError && (err.status === 400 || err.status === 404))) Admin.failed(err);
  });
})();
