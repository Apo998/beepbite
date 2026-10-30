import { BB } from '../../shared/ui';
import { type CustomerCode, type Order } from '../../shared/data';
import { Customer } from '../../shared/customer';
(() => {
  const banner = BB.$<HTMLAnchorElement>('[data-ready-banner]');
  const kitchen = BB.$('[data-kitchen]');
  const full = BB.$('[data-qr-full]');
  const enlarged = new URLSearchParams(location.search).get('state') === 'enlarged';
  let points = 0;

  BB.$('[data-hello]').textContent = `hey ${Customer.firstName},`;
  BB.$$('[data-name], #qr-full-name').forEach(el => { el.textContent = Customer.user.name; });

  function showCode(c: CustomerCode): void {
    BB.$$('[data-qr-img]').forEach(el => {
      const img = document.createElement('img');
      img.src = c.qrCode;
      img.alt = '';
      el.replaceChildren(img);
    });
    BB.$('[data-full-code]').textContent = c.qrToken;
    showPoints(c.pointsBalance);
  }

  function showPoints(n: number): void {
    BB.$('[data-points-chip]').textContent = String(n);
    BB.$('.points-chip').setAttribute('aria-label', `${n} points`);
    BB.countUp(BB.$('[data-points]'), n, points, 1.4);
    points = n;
  }

  function codeMissing(): void {
    BB.$$('[data-code]').forEach(el => { el.hidden = true; });
    BB.$('[data-code-missing]').hidden = false;
  }

  function renderBanner(ready: Order[]): void {
    banner.hidden = !ready.length;
    if (!ready.length) return;
    const one = ready.length === 1;
    BB.$('[data-ready-title]').textContent = one ? `Beep! Order #${ready[0].orderId} is ready` : `Beep! ${ready.length} orders are ready`;
    BB.$('[data-ready-sub]').textContent = one
      ? `${Customer.restaurantName(ready[0])} · go to the counter`
      : ready.map(o => `${Customer.restaurantName(o)} #${o.orderId}`).join(' · ');
    banner.href = one ? Customer.trackerHref(ready[0]) : '/customer/ready';
  }

  function renderKitchen(list: Order[]): void {
    kitchen.innerHTML = list.length
      ? list.map(Customer.orderCard).join('')
      : `<div class="kitchen__empty" data-item>${BB.mascot()}<span><span class="hand">nothing cooking yet.</span><br><span class="muted">Show your code to order.</span></span></div>`;
    Customer.revealList(kitchen);
  }

  function render(orders: Order[]): void {
    Customer.renderNav(orders);
    renderBanner(orders.filter(o => o.status === 'READY'));
    renderKitchen(orders.filter(o => o.status === 'PREPARING'));
  }

  function celebrate(): void {
    BB.beep();
    if (!BB.motion()) return;
    gsap.timeline()
      .from(banner, { y: -60, scale: 0.8, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.8)' })
      .fromTo(BB.$$('.burst', banner), { scale: 0.5, autoAlpha: 0.9 }, { scale: 3.4, autoAlpha: 0, duration: 1, stagger: 0.18, ease: 'power2.out' }, 0.15)
      .fromTo('.ready-banner__icon', { rotation: -18 }, { rotation: 18, duration: 0.08, repeat: 7, yoyo: true, ease: 'none', clearProps: 'rotation' }, 0.1)
      .fromTo('.device, .app', { x: 0 }, { x: 5, duration: 0.05, repeat: 5, yoyo: true, ease: 'none', clearProps: 'x' }, 0.1);
  }

  function openQR(): void {
    if (!full.querySelector('[data-qr-img] img')) return;
    full.hidden = false;
    BB.$<HTMLButtonElement>('[data-qr-close]').focus({ preventScroll: true });
    if (BB.motion()) {
      gsap.timeline()
        .fromTo(full, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
        .fromTo(BB.$('.qr', full), { scale: 0.7, rotation: -4 }, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.6)' }, 0)
        .from(BB.$$('.qr-full > :not(.qr)', full), { y: 10, autoAlpha: 0, duration: 0.3, stagger: 0.05 }, 0.15);
    }
  }
  function closeQR(): void {
    if (full.hidden) return;
    const done = (): void => { full.hidden = true; };
    if (BB.motion()) gsap.to(full, { autoAlpha: 0, duration: 0.2, onComplete: done, clearProps: 'opacity,visibility' });
    else done();
  }
  BB.$$('[data-qr-open]').forEach(b => b.addEventListener('click', openQR));
  BB.$('[data-qr-close]').addEventListener('click', closeQR);
  full.addEventListener('click', e => { if (e.target === full) closeQR(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQR(); });

  const card = BB.$('[data-qr-card]');
  if (BB.motion()) {
    card.addEventListener('pointerenter', () => gsap.to(card, { y: -4, rotation: -1, duration: 0.16, ease: 'power3.out' }));
    card.addEventListener('pointerleave', () => gsap.to(card, { y: 0, rotation: 0, duration: 0.32, ease: 'power3.out' }));
  }

  BB.setState('loading');
  Promise.all([Customer.load(), Customer.code()]).then(([orders, code]) => {
    BB.setState(enlarged ? 'enlarged' : 'default');
    showCode(code);
    render(orders);
    if (enlarged) openQR();
    if (BB.motion()) {
      gsap.from('[data-coin]', { scale: 0.4, rotation: -90, duration: 0.8, ease: 'back.out(1.8)', delay: 0.2 });
      gsap.from('.greet, .qr-card', { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
    }
    Customer.watch('all', orders, (list, ready) => {
      // Points change when an order is picked up, so refresh them when a status changes.
      Customer.code().then(c => { if (c.pointsBalance !== points) showPoints(c.pointsBalance); }, () => {});
      render(list);
      if (ready.length) celebrate();
    });
  }, err => {
    BB.setState('default');
    render([]);
    codeMissing();
    Customer.failed(err);
  });
})();
