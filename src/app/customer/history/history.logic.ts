import { BB } from '../../shared/ui';
import { type OrderStatus, type Order } from '../../shared/data';
import { Customer } from '../../shared/customer';
(() => {
  type Filter = 'ALL' | OrderStatus;
  const FILTERS: [Filter, string][] = [['ALL', 'All'], ['PREPARING', 'Preparing'], ['READY', 'Ready'], ['COMPLETED', 'Completed']];
  const tabs = BB.$('[data-tabs]');
  const list = BB.$('[data-list]');
  let orders: Order[] = [];
  let filter: Filter = 'ALL';

  function renderTabs(): void {
    tabs.innerHTML = FILTERS.map(([id, label]) => {
      const count = id === 'ALL' ? orders.length : orders.filter(o => o.status === id).length;
      return `<button class="tab" type="button" role="tab" aria-selected="${id === filter}" data-filter="${id}">${label}<span class="tab__count">${count}</span></button>`;
    }).join('');
  }

  function renderList(): void {
    if (!orders.length) {
      list.innerHTML = `
        <div class="empty" data-item>
          ${BB.mascot()}
          <h3>No orders yet</h3>
          <p>Show your code at any BeepBite counter. Your orders land here, newest first.</p>
          <a class="btn btn--primary" href="/customer">${BB.icon('qr')}Show my code</a>
        </div>`;
      Customer.revealList(list);
      return;
    }
    const shown = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);
    if (!shown.length) {
      list.innerHTML = `<div class="empty" data-item><h3>Nothing here</h3><p>No ${BB.STATUS_LABEL[filter as OrderStatus].toLowerCase()} orders right now.</p></div>`;
      Customer.revealList(list);
      return;
    }
    const groups = new Map<string, Order[]>();
    shown.forEach(o => {
      const d = BB.day(o.createdAt);
      groups.set(d, [...(groups.get(d) || []), o]);
    });
    list.innerHTML = [...groups].map(([d, items]) => `
      <section class="group" aria-label="${d}">
        <h2 class="group__day" data-item>${d}</h2>
        ${items.map(Customer.orderCard).join('')}
      </section>`).join('');
    Customer.revealList(list);
  }

  tabs.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-filter]');
    if (!b || b.dataset.filter === filter) return;
    filter = b.dataset.filter as Filter;
    renderTabs();
    renderList();
    if (BB.motion()) gsap.fromTo(BB.$(`[data-filter="${filter}"]`, tabs), { scale: 0.9 }, { scale: 1, duration: 0.32, ease: 'back.out(2.4)' });
  });

  function render(next: Order[]): void {
    orders = next;
    Customer.renderNav(orders);
    BB.$$('[data-has-orders]').forEach(el => { el.hidden = !orders.length; });
    const picked = orders.filter(o => o.status === 'COMPLETED').length;
    BB.$('[data-summary]').innerHTML = `${orders.length} ${orders.length === 1 ? 'order' : 'orders'},<br>${picked} picked up`;
    renderTabs();
    renderList();
  }

  BB.setState('loading');
  Customer.load().then(list => {
    BB.setState('default');
    render(list);
    Customer.watch('all', list, (next, ready) => {
      render(next);
      if (ready.length) BB.beep();
    });
  }, err => {
    BB.setState('default');
    render([]);
    Customer.failed(err);
  });
})();
