import { type OrderStatus } from './data';
export namespace BB {

  const ICONS: Record<string, string> = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.5v.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.5v.01"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 11v9h14v-9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17v.01"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2M20 14v.01M18 18h2v2M14 20h2"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="12" rx="1.5"/><rect x="17" y="4" width="4" height="8" rx="1.5"/>',
    backspace: '<path d="M21 5H9l-6 7 6 7h12z"/><path d="M12 9.5l5 5M17 9.5l-5 5"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'
  };

  const symbols = Object.entries(ICONS).map(([id, d]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${d}</symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <mask id="bite-full" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
    <rect width="200" height="200" fill="#fff"/>
    <circle cx="168" cy="32" r="86" fill="#000"/><circle cx="168" cy="32" r="79" fill="#fff"/>
    <circle cx="168" cy="32" r="69" fill="#000"/><circle cx="168" cy="32" r="62" fill="#fff"/>
    <circle cx="168" cy="32" r="48" fill="#000"/>
    <circle cx="160.5" cy="79.4" r="7" fill="#000"/><circle cx="141.9" cy="72.3" r="7" fill="#000"/>
    <circle cx="127.7" cy="58.1" r="7" fill="#000"/><circle cx="120.6" cy="39.5" r="7" fill="#000"/>
  </mask>
  <mask id="bite-quiet" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
    <rect width="200" height="200" fill="#fff"/>
    <circle cx="168" cy="32" r="62" fill="#000"/>
    <circle cx="158.3" cy="93.2" r="8" fill="#000"/><circle cx="134.2" cy="84" r="8" fill="#000"/>
    <circle cx="116" cy="65.8" r="8" fill="#000"/><circle cx="106.8" cy="41.7" r="8" fill="#000"/>
  </mask>
  ${symbols}
</defs></svg>`);


  const prefersMotion = (): boolean => matchMedia('(prefers-reduced-motion: no-preference)').matches;

  export const motion = (): boolean => prefersMotion() && typeof gsap !== 'undefined';

  export function $<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`Missing element: ${sel}`);
    return el;
  }
  export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] => [...root.querySelectorAll<T>(sel)];

  let wipeIn = false;
  try { wipeIn = sessionStorage.getItem('bb-wipe') === '1' && prefersMotion(); sessionStorage.removeItem('bb-wipe'); } catch {  }
  const wipe = document.createElement('div');
  wipe.className = 'wipe';
  wipe.setAttribute('aria-hidden', 'true');
  const wipeScale = (): number => Math.hypot(innerWidth, innerHeight) / 20 + 2;
  if (wipeIn) wipe.style.transform = `translate(${innerWidth / 2}px,${innerHeight / 2}px) scale(${wipeScale()})`;
  document.body.appendChild(wipe);

  export function go(href: string, x = innerWidth / 2, y = innerHeight / 2): void {
    if (!motion()) { location.href = href; return; }
    try { sessionStorage.setItem('bb-wipe', '1'); } catch {  }
    gsap.timeline({ onComplete: () => { location.href = href; } })
      .set(wipe, { x, y, scale: 0 })
      .to(wipe, { scale: wipeScale(), duration: 0.55, ease: 'power3.in' });
  }

  export const icon = (id: string, cls = ''): string => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  export const logo = (cls = 'logo-mark', quiet = false): string =>
    `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="90" fill="currentColor" mask="url(#bite-${quiet ? 'quiet' : 'full'})"/></svg>`;

  export const mascot = (cls = 'mascot', label = 'BeepBite mascot'): string => `
<svg class="${cls}" viewBox="0 0 200 200" role="img" aria-label="${label}">
  <circle cx="100" cy="100" r="90" fill="var(--color-tomato)" mask="url(#bite-full)"/>
  <circle cx="100" cy="100" r="89" fill="none" stroke="var(--color-ink)" stroke-width="3" mask="url(#bite-full)"/>
  <g class="face">
    <circle class="eye" cx="66" cy="110" r="8" fill="var(--color-ink)"/>
    <circle class="eye" cx="102" cy="110" r="8" fill="var(--color-ink)"/>
    <path class="smile" d="M64 134Q84 150 104 134" fill="none" stroke="var(--color-ink)" stroke-width="7" stroke-linecap="round"/>
    <path class="smile-happy" d="M58 128Q84 166 110 128Z" fill="var(--color-ink)" stroke="var(--color-ink)" stroke-width="5" stroke-linejoin="round"/>
  </g>
</svg>`;

  export function qrSVG(seed: number, size = 25): string {
    let s = seed;
    const rnd = (): number => (s = (s * 16807) % 2147483647) / 2147483647;
    const finder = (x: number, y: number, r: number, c: number): boolean | null => {
      const i = r - y, j = c - x;
      if (i < 0 || j < 0 || i > 6 || j > 6) return null;
      return i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4);
    };
    let rects = '';
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const f = finder(0, 0, r, c) ?? finder(size - 7, 0, r, c) ?? finder(0, size - 7, r, c);
      const reserved = (r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8);
      const on = f !== null ? f : (!reserved && rnd() > 0.52);
      if (on) rects += `<rect x="${c}" y="${r}" width="1.02" height="1.02"/>`;
    }
    return `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true"><g fill="#1C1A17">${rects}</g></svg>`;
  }

  const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  // Escape server data before it goes into an HTML template.
  export const esc = (s: string): string => s.replace(/[&<>"']/g, c => ENTITIES[c]);

  export const money = (n: number): string => n.toFixed(2);
  export const time = (d: string): string => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  export function day(d: string): string {
    const a = new Date(d); a.setHours(0, 0, 0, 0);
    const b = new Date(); b.setHours(0, 0, 0, 0);
    const diff = Math.round((b.getTime() - a.getTime()) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  export const isToday = (d: string): boolean => new Date(d).toDateString() === new Date().toDateString();

  export const minutesAgo = (d: string): number => Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 6e4));

  export const STATUS_LABEL: Record<OrderStatus, string> = { PREPARING: 'Preparing', READY: 'Ready', COMPLETED: 'Completed' };
  export const badge = (status: OrderStatus, extra = ''): string =>
    `<span class="badge badge--${status.toLowerCase()} ${extra}">${STATUS_LABEL[status]}</span>`;

  type ToastType = 'info' | 'success' | 'error' | 'ready';
  let toastBox: HTMLElement | undefined;
  export interface ToastAction { label: string; run: () => void }
  export function toast(text: string, type: ToastType = 'info', iconId?: string, action?: ToastAction): void {
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'toasts';
      toastBox.setAttribute('role', 'status');
      toastBox.setAttribute('aria-live', 'polite');
      (document.querySelector('[data-overlay-root]') || document.body).appendChild(toastBox);
    }
    const id = iconId || { success: 'check', error: 'alert', ready: 'bell', info: 'info' }[type];
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `${icon(id)}<span class="toast__text">${text}</span>`;
    toastBox.appendChild(el);
    const remove = (): void => el.remove();
    const stay = action ? 5.2 : 3.4;
    if (action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'toast__action';
      b.textContent = action.label;
      b.addEventListener('click', () => { action.run(); remove(); });
      el.appendChild(b);
    }
    if (motion()) {
      gsap.from(el, { y: -24, scale: 0.9, autoAlpha: 0, duration: 0.45, ease: 'back.out(1.7)' });
      gsap.to(el, { y: -16, autoAlpha: 0, duration: 0.3, delay: stay, ease: 'power2.in', onComplete: remove });
    } else setTimeout(remove, stay * 1000 + 200);
  }

  let audio: AudioContext | undefined;
  export function beep(): void {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audio = audio || new Ctx();
      const ctx = audio;
      const t = ctx.currentTime;
      ([[0, 988], [0.17, 1319]] as const).forEach(([d, f]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.exponentialRampToValueAtTime(0.18, t + d + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.14);
        o.connect(g).connect(ctx.destination);
        o.start(t + d); o.stop(t + d + 0.15);
      });
    } catch {  }
    if (navigator.vibrate) navigator.vibrate([90, 60, 90]);
  }

  export function countUp(el: HTMLElement, to: number, from = 0, duration = 1.2): void {
    if (!motion()) { el.textContent = String(to); return; }
    const o = { v: from };
    gsap.to(o, { v: to, duration, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
  }

  export function openLayer(scrim: HTMLElement): void {
    scrim.hidden = false;
    const panel = scrim.firstElementChild as HTMLElement;
    if (motion()) {
      gsap.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
      gsap.fromTo(panel, scrim.classList.contains('scrim--center') ? { scale: 0.85, autoAlpha: 0 } : { yPercent: 100 },
        { scale: 1, autoAlpha: 1, yPercent: 0, duration: 0.45, ease: 'back.out(1.4)' });
    }
    panel.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true });
  }
  export function closeLayer(scrim: HTMLElement): void {
    if (scrim.hidden) return;
    if (!motion()) { scrim.hidden = true; return; }
    const panel = scrim.firstElementChild as HTMLElement;
    gsap.to(panel, scrim.classList.contains('scrim--center') ? { scale: 0.9, autoAlpha: 0, duration: 0.2 } : { yPercent: 100, duration: 0.28, ease: 'power2.in' });
    gsap.to(scrim, { autoAlpha: 0, duration: 0.28, onComplete: () => { scrim.hidden = true; gsap.set([scrim, panel], { clearProps: 'all' }); } });
  }

  type StateHandler = (state: string) => void;
  const stateHandlers: StateHandler[] = [];
  let states: { id: string; label: string }[] = [];

  export function setState(name: string): void {
    if (!states.some(s => s.id === name)) name = states[0]?.id;
    if (!name) return;
    document.body.dataset.state = name;
    const url = new URL(location.href);
    if (name === states[0].id) url.searchParams.delete('state'); else url.searchParams.set('state', name);
    history.replaceState(null, '', url);
    stateHandlers.forEach(fn => fn(name));
  }

  export function onState(fn: StateHandler): void {
    stateHandlers.push(fn);
    if (document.body.dataset.state) fn(document.body.dataset.state);
  }

  function init(): void {
    $$('[data-qr]').forEach(el => { el.innerHTML = qrSVG(Number(el.dataset.qr) || 7); });
    $$('[data-logo]').forEach(el => { el.outerHTML = logo(el.getAttribute('class') || 'logo-mark', el.hasAttribute('data-quiet')); });
    $$('[data-mascot-slot]').forEach(el => { el.innerHTML = mascot(); });
    $$('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon || 'info', el.getAttribute('class') || ''); });

    $$<HTMLButtonElement>('[data-password-toggle]').forEach(btn => {
      const input = $<HTMLInputElement>('input', btn.parentElement!);
      btn.innerHTML = icon('eye');
      btn.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-pressed', String(show));
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.innerHTML = icon(show ? 'eye-off' : 'eye');
      });
    });

    states = (document.body.dataset.states || '').split(',').filter(Boolean).map(s => {
      const [id, label] = s.split(':');
      return { id, label: label || id };
    });
    if (states.length) setState(new URLSearchParams(location.search).get('state') || states[0].id);


    document.addEventListener('click', e => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-transition]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button || !motion()) return;
      e.preventDefault();
      go(a.href, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    });

    if (wipeIn && typeof gsap !== 'undefined') {
      gsap.fromTo(wipe, { x: innerWidth / 2, y: innerHeight / 2, scale: wipeScale() }, { scale: 0, duration: 0.7, ease: 'power3.out', delay: 0.05 });
    } else wipe.style.transform = 'scale(0)';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
