import { BB } from '../../shared/ui';
import { type OrderStatus, type Order } from '../../shared/data';
import { Resto } from '../../shared/restaurant';
(() => {
  const STATUSES: OrderStatus[] = ['PREPARING', 'READY', 'COMPLETED'];
  const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; icon: string; cls: string }>> = {
    PREPARING: { to: 'READY', label: 'Mark ready', icon: 'bell', cls: 'btn--primary' },
    READY: { to: 'COMPLETED', label: 'Picked up', icon: 'check', cls: '' }
  };
  const COMPLETED_SHOWN = 5;
  const board = BB.$('[data-board]');
  const more = BB.$<HTMLButtonElement>('[data-more]');
  const pending = new Set<string>();
  let showAll = false;

  const list = (): Order[] => Resto.today();

  function tile(o: Order): string {
    const since = o.status === 'PREPARING' ? o.createdAt : o.updatedAt;
    const mins = BB.minutesAgo(since);
    const ago = mins ? `${mins} min` : 'just now';
    const meta = o.status === 'COMPLETED'
      ? `<b>${BB.money(o.amountPaid)}</b><span>${BB.time(o.createdAt)}</span>`
      : `<b>${BB.money(o.amountPaid)}</b><span>${BB.time(o.createdAt)} · ${o.status === 'READY' ? `ready ${ago}` : ago}</span>`;
    const next = NEXT[o.status];
    return `
      <article class="tile" data-status="${o.status}" data-flip-id="${o._id}">
        <a class="tile__link" href="${Resto.href(o)}" aria-label="Order ${o.orderId}, ${BB.STATUS_LABEL[o.status]}">
          <span class="order-no tile__no"><small>#</small>${o.orderId}</span>
          <span class="tile__meta">${meta}</span>
        </a>
        ${o.status === 'READY' && mins >= 10 ? '<span class="tile__late" aria-hidden="true">still here?</span>' : ''}
        ${next ? `<button class="btn btn--block ${next.cls}${pending.has(o._id) ? ' is-loading' : ''}" type="button" data-move="${o._id}" data-to="${next.to}"${pending.has(o._id) ? ' disabled' : ''}>${BB.icon(next.icon)}${next.label}</button>` : ''}
      </article>`;
  }

  function empty(status: OrderStatus): string {
    if (status === 'PREPARING' && !list().length) {
      return `<div class="col__empty">${BB.mascot()}<span class="hand">quiet counter.</span>No orders yet today.<a class="btn btn--primary btn--sm" href="/restaurant/orders/new">${BB.icon('plus', 'icon--sm')}New order</a></div>`;
    }
    const text: Record<OrderStatus, string> = { PREPARING: 'Nothing cooking.', READY: 'Nothing waiting at the counter.', COMPLETED: 'Nothing handed over yet.' };
    return `<div class="col__empty">${text[status]}</div>`;
  }

  function render(): void {
    const all = list();
    STATUSES.forEach(status => {
      const col = BB.$(`[data-col="${status}"]`, board);
      let items = all.filter(o => o.status === status);
      if (status === 'PREPARING') items = items.reverse();
      BB.$('[data-count]', col).textContent = String(items.length);
      const shown = status === 'COMPLETED' && !showAll ? items.slice(0, COMPLETED_SHOWN) : items;
      BB.$('[data-list]', col).innerHTML = shown.length ? shown.map(tile).join('') : empty(status);
      if (status === 'COMPLETED') {
        more.hidden = items.length <= COMPLETED_SHOWN;
        more.textContent = showAll ? 'Show fewer' : `Show all ${items.length}`;
      }
    });
    const count = (s: OrderStatus): number => all.filter(o => o.status === s).length;
    BB.$('[data-sum]').innerHTML = `<span class="live">${count('READY')} ready</span> · ${count('PREPARING')} cooking`;
    Resto.renderRail();
  }

  async function move(id: string, to: OrderStatus, undoable = true): Promise<void> {
    const o = Resto.order(id);
    if (!o || pending.has(id)) return;
    const from = o.status;
    pending.add(id);
    render();
    let ok = true;
    try { await Resto.setStatus(id, to); } catch (err) { ok = false; Resto.failed(err); }
    pending.delete(id);
    if (!ok) { render(); return; }
    const state = BB.motion() && typeof Flip !== 'undefined' ? Flip.getState('.tile') : null;
    render();
    if (state) {
      Flip.from(state, {
        duration: 0.55, ease: 'power3.inOut', absolute: true, scale: true,
        onEnter: els => gsap.fromTo(els, { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.7)' }),
        onLeave: els => gsap.to(els, { scale: 0.85, autoAlpha: 0, duration: 0.25 })
      });
      const moved = board.querySelector(`[data-flip-id="${id}"]`);
      if (moved && to === 'READY') gsap.fromTo(moved, { rotation: -3 }, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', delay: 0.5 });
    }
    if (!undoable) { BB.toast(`Order #${o.orderId} moved back to ${BB.STATUS_LABEL[to]}`, 'info', 'refresh'); return; }
    const undo = { label: 'Undo', run: () => { void move(id, from, false); } };
    if (to === 'READY') BB.toast(`Beep sent. Order #${o.orderId} is ready.`, 'ready', 'bell', undo);
    else BB.toast(`Order #${o.orderId} picked up.`, 'success', 'check', undo);
  }

  board.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-move]');
    if (b?.dataset.move && b.dataset.to) void move(b.dataset.move, b.dataset.to as OrderStatus);
  });
  more.addEventListener('click', () => { showAll = !showAll; render(); });

  BB.setState('loading');
  Resto.ready.then(() => {
    BB.setState('default');
    render();
    Resto.reveal(BB.$$('.tile', board));
    // New orders and status changes from other screens arrive over the socket.
    Resto.onChange(() => { if (!pending.size) render(); });
    // Keep the "x min" ages current.
    setInterval(() => { if (!pending.size) render(); }, 30000);
  }, () => { BB.setState('default'); render(); });
})();
