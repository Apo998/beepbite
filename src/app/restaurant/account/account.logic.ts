import { BB } from '../../shared/ui';
import { Api } from '../../shared/api';
import { Resto } from '../../shared/restaurant';
(() => {
  const dialog = BB.$('[data-dialog]');

  BB.$$('[data-name]').forEach(el => { el.textContent = Resto.name; });
  BB.$$('[data-email]').forEach(el => { el.textContent = Resto.user.email; });
  BB.$('#so-title').textContent = `Sign out of ${Resto.name}?`;

  function stats(): void {
    const today = Resto.today();
    BB.$('[data-s-ready]').textContent = String(today.filter(o => o.status === 'READY').length);
    BB.$('[data-s-total]').textContent = BB.money(today.reduce((sum, o) => sum + o.amountPaid, 0));
    BB.$('[data-s-orders]').textContent = String(today.length);
  }
  Resto.ready.then(() => {
    stats();
    Resto.onChange(stats);
  }, () => {});

  Api.myRestaurant().then(r => {
    const joined = new Date(r.createdAt);
    BB.$$('[data-name]').forEach(el => { el.textContent = r.name; });
    BB.$('[data-joined]').textContent = joined.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    BB.$('[data-since]').textContent = `beeping since ${joined.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
  }, err => Resto.failed(err));

  BB.$('[data-signout]').addEventListener('click', () => BB.openLayer(dialog));
  BB.$('[data-cancel]').addEventListener('click', () => BB.closeLayer(dialog));
  dialog.addEventListener('click', e => { if (e.target === dialog) BB.closeLayer(dialog); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') BB.closeLayer(dialog); });

  if (BB.motion()) {
    gsap.from('.profile__icon', { scale: 0.5, rotation: -30, duration: 0.7, ease: 'back.out(1.8)' });
    gsap.from('.stat', { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.1 });
  }
})();
