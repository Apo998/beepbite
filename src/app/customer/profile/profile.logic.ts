import { BB } from '../../shared/ui';
import { Api } from '../../shared/api';
import { Customer } from '../../shared/customer';
(() => {
  const sheet = BB.$('[data-sheet]');

  function showUser(name: string, email: string, createdAt?: string): void {
    BB.$$('[data-name]').forEach(el => { el.textContent = name; });
    BB.$$('[data-email]').forEach(el => { el.textContent = email; });
    BB.$('[data-initials]').textContent = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    if (!createdAt) return;
    const since = new Date(createdAt);
    BB.$('[data-since]').textContent = since.toLocaleDateString('en-GB', { month: 'short' });
    BB.$('[data-since-year]').textContent = `member since ${since.getFullYear()}`;
  }

  BB.$('[data-signout]').addEventListener('click', () => BB.openLayer(sheet));
  BB.$('[data-cancel]').addEventListener('click', () => BB.closeLayer(sheet));
  sheet.addEventListener('click', e => { if (e.target === sheet) BB.closeLayer(sheet); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') BB.closeLayer(sheet); });

  showUser(Customer.user.name, Customer.user.email);
  BB.setState('loading');
  Promise.all([Api.me(), Customer.load(), Customer.code()]).then(([me, orders, code]) => {
    BB.setState('default');
    showUser(me.name, me.email, me.createdAt);
    Customer.renderNav(orders);
    BB.countUp(BB.$('[data-points]'), code.pointsBalance);
    BB.$('[data-picked]').textContent = String(orders.filter(o => o.status === 'COMPLETED').length);
    if (BB.motion()) {
      gsap.from('.profile .avatar', { scale: 0.5, rotation: -40, duration: 0.7, ease: 'back.out(1.8)' });
      gsap.from('.stat', { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.1 });
    }
  }, err => {
    BB.setState('default');
    Customer.failed(err);
  });
})();
