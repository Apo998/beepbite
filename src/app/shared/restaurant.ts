import { BB } from './ui';
import { type OrderStatus, type Order } from './data';
import { Api } from './api';
import { Live } from './live';
import { Session } from './session';
export namespace Resto {
  export const user = Session.last()!;
  // The backend creates the restaurant's user and restaurant with the same name.
  export const name = user.name;

  // All of this restaurant's orders (GET /order/restaurant), kept current by the
  // restaurant socket room and by every POST/PATCH response.
  let list: Order[] = [];
  const listeners: (() => void)[] = [];
  const changed = (): void => { renderRail(); listeners.forEach(fn => fn()); };
  function remember(o: Order): Order {
    list = [o, ...list.filter(x => x._id !== o._id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    changed();
    return o;
  }
  const fetchAll = (): Promise<void> => Api.restaurantOrders().then(next => { list = next; changed(); });

  export const ready: Promise<void> = fetchAll();
  ready.catch(err => failed(err));
  Live.joinRoom('restaurant.join');
  Live.onCreated(remember);
  Live.onUpdate(u => {
    const o = list.find(x => x._id === u.id);
    if (o && o.status !== u.status) remember({ ...o, status: u.status, updatedAt: new Date().toISOString() });
  });
  Live.onReconnect(() => { fetchAll().catch(() => {}); });

  export const onChange = (fn: () => void): void => { listeners.push(fn); };
  export const orders = (): Order[] => list;
  export const today = (): Order[] => list.filter(o => BB.isToday(o.createdAt));
  export const order = (id: string): Order | undefined => list.find(o => o._id === id);

  export const create = (qrToken: string, amountPaid: number): Promise<Order> => Api.createOrder(qrToken, amountPaid).then(remember);
  export const setStatus = (id: string, status: OrderStatus): Promise<Order> => Api.setStatus(id, status).then(remember);

  export const href = (o: Order): string => `/restaurant/orders/${encodeURIComponent(o._id)}`;

  const NAV: [string, string, string, string][] = [
    ['new', 'New order', 'plus', '/restaurant/orders/new'],
    ['board', 'Board', 'board', '/restaurant/orders'],
    ['account', 'Account', 'store', '/restaurant/account']
  ];
  export const renderRail = (): void => BB.$$('[data-rail]').forEach(rail => {
    const current = rail.dataset.rail;
    const ready = today().filter(o => o.status === 'READY').length;
    rail.innerHTML = `
      <a class="rail__logo" href="/restaurant/orders" aria-label="BeepBite board">${BB.logo('')}</a>
      <nav class="rail__nav" aria-label="Main">
        ${NAV.map(([id, label, ic, link]) => `
          <a href="${link}"${id === current ? ' aria-current="page"' : ''}>${BB.icon(ic)}${label}
            ${id === 'board' && ready ? `<span class="rail__badge" aria-label="${ready} ready">${ready}</span>` : ''}</a>`).join('')}
      </nav>
      <div class="rail__foot">${BB.icon('store')}${BB.esc(name)}</div>`;
  });
  renderRail();

  const tick = (): void => BB.$$('[data-clock]').forEach(el => { el.textContent = BB.time(new Date().toISOString()); });
  tick();
  setInterval(tick, 15000);
  BB.$$('[data-restaurant]').forEach(el => { el.textContent = name; });

  export function failed(err: unknown): void {
    BB.toast(BB.esc(Api.errorText(err)), 'error');
  }

  export function reveal(targets: Element[]): void {
    if (!BB.motion() || !targets.length) return;
    gsap.from(targets, { y: 8, autoAlpha: 0, duration: 0.32, stagger: 0.04, ease: 'power3.out', clearProps: 'opacity,visibility,transform' });
  }
}
