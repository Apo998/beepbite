import { BB } from './ui';
import { type CustomerCode, type Order } from './data';
import { Api } from './api';
import { Live } from './live';
import { Session } from './session';
export namespace Customer {
  export const user = Session.last()!;
  export const firstName = user.name.split(' ')[0];

  let names = new Map<string, string>();
  export const restaurantName = (o: Order): string => names.get(o.restaurantId) ?? 'Restaurant';
  export const trackerHref = (o: Order): string => `/customer/orders/${encodeURIComponent(o._id)}`;


  const NAV: [string, string, string, string][] = [
    ['home', 'Home', 'home', '/customer'],
    ['orders', 'Orders', 'receipt', '/customer/orders'],
    ['profile', 'Profile', 'user', '/customer/profile']
  ];
  export const renderNav = (orders: Order[]): void => BB.$$('[data-bottom-nav]').forEach(nav => {
    const current = nav.dataset.bottomNav;
    const live = orders.filter(o => o.status !== 'COMPLETED').length;
    nav.innerHTML = NAV.map(([id, label, ic, href]) => `
      <a href="${href}"${id === current ? ' aria-current="page"' : ''}>
        ${BB.icon(ic)}${label}
        ${id === 'orders' && live ? `<span class="bottom-nav__dot" aria-label="${live} live orders">${live}</span>` : ''}
      </a>`).join('');
  });
  renderNav([]);

  // 'ready' uses GET /order/ready, everything else GET /order/all. Restaurant names come from GET /restaurant.
  export type Source = 'all' | 'ready';
  export async function load(source: Source = 'all'): Promise<Order[]> {
    const [orders, restaurants] = await Promise.all([
      source === 'ready' ? Api.readyOrders() : Api.orders(),
      names.size ? null : Api.restaurants()
    ]);
    if (restaurants) names = new Map(restaurants.map(r => [r._id, r.name]));
    return orders;
  }

  // Keeps a list current from the socket: new orders (customer room) and status changes (order rooms).
  // `ready` lists the orders that just turned READY, so the page can beep.
  export function watch(source: Source, initial: Order[], render: (orders: Order[], ready: Order[]) => void): void {
    let current = initial;
    const follow = (list: Order[]): void => Live.watch(list.filter(o => o.status !== 'COMPLETED').map(o => o._id));
    const update = (next: Order[]): void => {
      if (source === 'ready') next = next.filter(o => o.status === 'READY');
      const before = new Map(current.map(o => [o._id, o.status]));
      const ready = next.filter(o => o.status === 'READY' && before.get(o._id) !== 'READY' && (before.has(o._id) || source === 'ready'));
      current = next;
      follow(next);
      render(next, ready);
    };
    follow(current);
    Live.joinRoom('customer.join');
    Live.onUpdate(u => {
      if (!current.some(o => o._id === u.id)) return;
      update(current.map(o => (o._id === u.id ? { ...o, status: u.status, updatedAt: new Date().toISOString() } : o)));
    });
    const refresh = (): void => { load(source).then(update, () => {}); };
    Live.onCreated(o => {
      if (current.some(x => x._id === o._id)) return;
      // A restaurant that joined after the page loaded: reload to get its name.
      if (!names.has(o.restaurantId)) { names = new Map(); refresh(); return; }
      update([o, ...current]);
    });
    Live.onReconnect(refresh);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
  }

  export const code = (): Promise<CustomerCode> => Api.customerCode();

  export function orderCard(o: Order): string {
    const when = o.status === 'READY'
      ? `Ready since ${BB.time(o.updatedAt)}`
      : `${BB.day(o.createdAt)}, ${BB.time(o.createdAt)}`;
    return `
      <a class="order-card" href="${trackerHref(o)}" data-status="${o.status}" data-item>
        <span class="order-card__no"><span class="order-no order-no--sm"><small>#</small>${o.orderId}</span></span>
        <span class="order-card__body">
          <span class="order-card__title">${BB.esc(restaurantName(o))}</span>
          <span class="order-card__meta">${when}</span>
        </span>
        <span class="order-card__end">
          <span class="order-card__amount">${BB.money(o.amountPaid)}</span>
          ${BB.badge(o.status)}
        </span>
      </a>`;
  }

  export const skeletonCards = (n: number): string =>
    Array.from({ length: n }, () => '<span class="skel skel--card" aria-hidden="true"></span>').join('');

  export function revealList(root: ParentNode): void {
    if (!BB.motion()) return;
    gsap.from(BB.$$('[data-item]', root), { y: 8, autoAlpha: 0, duration: 0.32, stagger: 0.04, ease: 'power3.out', clearProps: 'all' });
  }

  export function failed(err: unknown): void {
    BB.toast(BB.esc(Api.errorText(err)), 'error');
  }
}
