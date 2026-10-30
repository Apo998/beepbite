import { BB } from '../../shared/ui';
import { type Order } from '../../shared/data';
import { Customer } from '../../shared/customer';
(() => {
  const list = BB.$('[data-list]');

  const card = (o: Order): string => {
    const mins = BB.minutesAgo(o.updatedAt);
    return `
      <a class="ready-card" href="${Customer.trackerHref(o)}" data-item>
        <span class="ready-card__pattern ripple-pattern" aria-hidden="true"></span>
        <span class="label">${BB.esc(Customer.restaurantName(o))}</span>
        <span class="order-no"><small>#</small>${o.orderId}</span>
        <span class="ready-card__foot">
          <span>Ready since ${BB.time(o.updatedAt)} · ${mins ? `${mins} min ago` : 'just now'}</span>
          <span class="ready-card__go">Open ${BB.icon('chevron', 'icon--sm')}</span>
        </span>
      </a>`;
  };

  function render(orders: Order[]): void {
    BB.$$('[data-has-items]').forEach(el => { el.hidden = !orders.length; });
    BB.$('[data-title]').textContent = orders.length === 1 ? '1 order is waiting for you' : `${orders.length} orders are waiting for you`;
    list.innerHTML = orders.length ? orders.map(card).join('') : `
      <div class="empty" data-item>
        ${BB.mascot()}
        <h3>Nothing to pick up yet</h3>
        <p>When the kitchen marks an order Ready, it shows up here and your phone beeps.</p>
        <span class="hand">sit back. we'll beep.</span>
        <a class="btn" href="/customer/orders">See all orders</a>
      </div>`;
    if (BB.motion()) {
      gsap.from(BB.$$('[data-item]', list), { y: 24, rotation: () => gsap.utils.random(-4, 4), autoAlpha: 0, duration: 0.55, stagger: 0.08, ease: 'back.out(1.6)', clearProps: 'all' });
    }
  }

  BB.setState('loading');
  Customer.load('ready').then(orders => {
    BB.setState('default');
    render(orders);
    Customer.watch('ready', orders, (next, ready) => {
      render(next);
      if (ready.length) BB.beep();
    });
  }, err => {
    BB.setState('default');
    render([]);
    Customer.failed(err);
  });
})();
