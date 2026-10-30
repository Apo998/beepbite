import { BB } from '../../shared/ui';
import { type Order, type OrderStatus } from '../../shared/data';
import { Resto } from '../../shared/restaurant';
(() => {
  const id = decodeURIComponent(location.pathname.split('/').pop() || '');
  const ticket = BB.$('[data-ticket]');
  const badge = BB.$('[data-badge]');
  const confirm = BB.$('[data-confirm]');
  const steps = BB.$$('[data-stepper] li');
  const fill = BB.$('[data-fill]');
  const ORDER: OrderStatus[] = ['PREPARING', 'READY', 'COMPLETED'];
  const NOTE: Record<OrderStatus, string> = {
    PREPARING: "In the kitchen. Marking it Ready beeps the customer's phone.",
    READY: 'Waiting at the counter. Tap Completed when they pick it up.',
    COMPLETED: 'Handed over. Nothing left to do.'
  };
  let pending: OrderStatus | null = null;
  let busy = false;
  let order: Order;

  function missing(): void {
    BB.setState('missing');
    BB.$('[data-missing]').hidden = false;
    BB.$('[data-title]').textContent = 'Order not found';
  }

  function start(found: Order): void {
    order = found;
    BB.$('[data-found]').hidden = false;
    BB.$('[data-title]').textContent = `Order #${order.orderId}`;
    BB.$('[data-num]').innerHTML = `<small>#</small>${order.orderId}`;
    BB.$$('[data-amount], [data-d-amount]').forEach(el => { el.textContent = BB.money(order.amountPaid); });
    // Order numbers restart every day, so say which day this one belongs to.
    BB.$('[data-d-num]').textContent = BB.isToday(order.createdAt) ? `#${order.orderId} today` : `#${order.orderId} on ${BB.day(order.createdAt)}`;
    BB.$('[data-d-created]').textContent = `${BB.day(order.createdAt)}, ${BB.time(order.createdAt)}`;
    document.title = `Order #${order.orderId} · BeepBite`;
  }

  function setFill(idx: number): void {
    const base = fill.parentElement!.getBoundingClientRect().top;
    const y = steps.map(li => BB.$('.stepper__dot', li).getBoundingClientRect().top - base);
    const total = y[2] - y[0];
    fill.style.top = `${y[0] + 14}px`;
    fill.style.height = `${total}px`;
    const scale = total > 0 ? (y[idx] - y[0]) / total : 0;
    if (BB.motion()) gsap.to(fill, { scaleY: scale, duration: 0.6, ease: 'power3.out' });
    else fill.style.transform = `scaleY(${scale})`;
  }

  function show(o: Order): void {
    order = o;
    const s = o.status;
    const idx = ORDER.indexOf(s);
    BB.setState(s.toLowerCase());
    ticket.dataset.status = s;
    badge.className = `badge badge--lg badge--${s.toLowerCase()}`;
    badge.textContent = BB.STATUS_LABEL[s];
    BB.$('[data-note]').textContent = NOTE[s];
    BB.$('[data-d-updated]').textContent = BB.time(o.updatedAt);
    BB.$$<HTMLButtonElement>('[data-control] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.status === s)));
    const notes = [
      `${BB.time(o.createdAt)} · Order created`,
      idx >= 1 ? `${BB.time(o.updatedAt)} · Customer beeped` : 'Tap Ready when it is done',
      idx === 2 ? `${BB.time(o.updatedAt)} · Handed over` : 'When they pick it up'
    ];
    steps.forEach((li, i) => {
      li.classList.toggle('is-done', i < idx || (i === idx && idx === 2));
      li.classList.toggle('is-current', i === idx && idx < 2);
      li.classList.toggle('is-todo', i > idx);
      BB.$('[data-step-note]', li).textContent = notes[i];
    });
    setFill(idx);
  }

  async function apply(s: OrderStatus): Promise<void> {
    if (busy) return;
    busy = true;
    BB.$('[data-control]').setAttribute('aria-busy', 'true');
    try {
      show(await Resto.setStatus(order._id, s));
    } catch (err) {
      Resto.failed(err);
      return;
    } finally {
      busy = false;
      BB.$('[data-control]').removeAttribute('aria-busy');
    }
    Resto.renderRail();
    if (s === 'READY') {
      BB.toast(`Beep sent. Order #${order.orderId} is ready.`, 'ready', 'bell');
      if (BB.motion()) {
        gsap.timeline()
          .fromTo(BB.$$('.burst', ticket), { scale: 0.5, autoAlpha: 0.9 }, { scale: 3.6, autoAlpha: 0, duration: 1, stagger: 0.16, ease: 'power2.out' })
          .fromTo('[data-num]', { scale: 0.7 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1.1, 0.45)' }, 0);
      }
    } else if (s === 'COMPLETED') BB.toast(`Order #${order.orderId} picked up.`, 'success', 'check');
    else BB.toast(`Order #${order.orderId} is back to Preparing.`, 'info', 'refresh');
    if (BB.motion()) gsap.fromTo(badge, { scale: 0.5 }, { scale: 1, duration: 0.45, ease: 'back.out(2.4)' });
  }

  function askBack(s: OrderStatus): void {
    pending = s;
    BB.$('[data-confirm-title]').textContent = `Move #${order.orderId} back to ${BB.STATUS_LABEL[s]}?`;
    BB.openLayer(confirm);
  }

  BB.$('[data-control]').addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-status]');
    const s = b?.dataset.status as OrderStatus | undefined;
    if (!s || s === order.status) return;
    if (ORDER.indexOf(s) < ORDER.indexOf(order.status)) askBack(s);
    else void apply(s);
  });
  BB.$('[data-ok]').addEventListener('click', () => { BB.closeLayer(confirm); if (pending) void apply(pending); pending = null; });
  BB.$('[data-cancel]').addEventListener('click', () => { BB.closeLayer(confirm); pending = null; });
  confirm.addEventListener('click', e => { if (e.target === confirm) BB.closeLayer(confirm); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') BB.closeLayer(confirm); });

  Resto.ready.then(() => {
    const found = Resto.order(id);
    if (!found) { missing(); return; }
    start(found);
    show(found);
    // The status can also change from the board on another screen.
    Resto.onChange(() => {
      const next = Resto.order(id);
      if (next && !busy && next.status !== order.status) show(next);
    });
  }, missing);
})();
