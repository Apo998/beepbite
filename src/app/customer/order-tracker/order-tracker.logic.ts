import { BB } from '../../shared/ui';
import { MESSAGES, type Order, type OrderStatus } from '../../shared/data';
import { Api } from '../../shared/api';
import { Customer } from '../../shared/customer';
(() => {
  const id = decodeURIComponent(location.pathname.split('/').pop() || '');
  const app = BB.$('.app');
  const hero = BB.$('.hero[data-found]');
  const num = BB.$('[data-num]');
  const badge = BB.$('[data-badge]');
  const steps = BB.$$('[data-stepper] li');
  const fill = BB.$('[data-fill]');
  const STEP: Record<OrderStatus, number> = { PREPARING: 0, READY: 1, COMPLETED: 2 };
  const MSG: Record<OrderStatus, string> = {
    PREPARING: "The kitchen is on it. Sit anywhere, we'll beep.",
    READY: 'Beep! Go to the counter and show your code.',
    COMPLETED: 'Collected. Enjoy every bite.'
  };

  BB.$('[data-back]').addEventListener('click', e => {
    if (document.referrer && new URL(document.referrer).origin === location.origin && /^\/customer(?:\/|$)/.test(new URL(document.referrer).pathname) && history.length > 1) { e.preventDefault(); history.back(); }
  });

  function fillIn(order: Order): void {
    const name = Customer.restaurantName(order);
    BB.$('[data-restaurant]').textContent = name;
    BB.$('[data-d-restaurant]').textContent = name;
    BB.$('[data-d-amount]').textContent = BB.money(order.amountPaid);
    BB.$('[data-d-time]').textContent = `${BB.day(order.createdAt)}, ${BB.time(order.createdAt)}`;
    num.innerHTML = `<small>#</small>${order.orderId}`;
    document.title = `Order #${order.orderId} · BeepBite`;
  }

  function setFill(idx: number, animate: boolean): void {
    const base = fill.parentElement!.getBoundingClientRect().top;
    const y = steps.map(li => BB.$('.stepper__dot', li).getBoundingClientRect().top - base);
    const total = y[2] - y[0];
    fill.style.top = `${y[0] + 14}px`;
    fill.style.height = `${total}px`;
    const scale = total > 0 ? (y[idx] - y[0]) / total : 0;
    if (animate && BB.motion()) gsap.to(fill, { scaleY: scale, duration: 0.7, ease: 'power3.out' });
    else fill.style.transform = `scaleY(${scale})`;
  }

  function setStatus(order: Order, animate = false): void {
    const status = order.status;
    const idx = STEP[status];
    BB.setState(status.toLowerCase());
    app.dataset.status = status;
    badge.className = `badge badge--lg badge--${status.toLowerCase()}`;
    badge.textContent = BB.STATUS_LABEL[status];
    BB.$('[data-msg]').textContent = MSG[status];
    const notes = [
      `${BB.time(order.createdAt)} · Order placed`,
      idx === 0 ? "We'll beep you" : status === 'READY' ? `${BB.time(order.updatedAt)} · Pick it up at the counter` : 'Beeped',
      idx === 2 ? `${BB.time(order.updatedAt)} · Picked up` : 'When you collect it'
    ];
    steps.forEach((li, i) => {
      li.classList.toggle('is-done', i < idx || (i === idx && idx === 2));
      li.classList.toggle('is-current', i === idx && idx < 2);
      li.classList.toggle('is-todo', i > idx);
      BB.$('[data-step-note]', li).textContent = notes[i];
    });
    setFill(idx, animate);
  }

  function showFound(found: boolean): void {
    BB.$$('[data-found]').forEach(el => { el.hidden = !found; });
    BB.$('[data-missing]').hidden = found;
    BB.$('[data-live]').hidden = !found;
    if (!found) BB.$('[data-restaurant]').textContent = 'Order';
  }

  function celebrate(): void {
    BB.beep();
    if (!BB.motion()) return;
    gsap.timeline()
      .fromTo(BB.$$('.burst', hero), { scale: 0.4, autoAlpha: 0.9 }, { scale: 3.6, autoAlpha: 0, duration: 1.1, stagger: 0.18, ease: 'power2.out' }, 0)
      .fromTo(num, { scale: 0.6 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1.1, 0.45)' }, 0)
      .fromTo(badge, { scale: 0.4 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 0.08)
      .fromTo('[data-sticker]', { scale: 0, rotation: -120 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.8)' }, 0.25)
      .fromTo('.device, .app', { x: 0 }, { x: 5, duration: 0.05, repeat: 5, yoyo: true, ease: 'none', clearProps: 'x' }, 0)
      .from('[data-show-code]', { y: 16, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' }, 0.4);
  }

  if (BB.motion()) gsap.to('[data-sticker]', { rotation: '+=360', duration: 18, ease: 'none', repeat: -1 });

  function missing(message = MESSAGES.orderNotFound.ui): void {
    app.dataset.status = '';
    BB.setState('missing');
    BB.$('[data-missing-msg]').textContent = message;
    showFound(false);
  }

  BB.setState('loading');
  Customer.load().then(orders => {
    const order = orders.find(o => o._id === id);
    if (!order) { missing(); return; }
    showFound(true);
    fillIn(order);
    setStatus(order);
    if (BB.motion()) gsap.from(num, { scale: 0.8, duration: 0.6, ease: 'back.out(2)' });
    let current = order;
    Customer.watch('all', orders, list => {
      const next = list.find(o => o._id === id);
      if (!next || next.status === current.status) return;
      current = next;
      setStatus(next, true);
      if (next.status === 'READY') celebrate();
    });
  }, err => missing(Api.errorText(err)));
})();
