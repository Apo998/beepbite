import { BB } from './ui';
import { type Role } from './data';
export namespace Auth {
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  export const HOME: Record<Role, string> = {
    CUSTOMER: '/customer',
    RESTAURANT: '/restaurant/orders/new',
    ADMIN: '/admin/restaurants'
  };

  export const callback = (event: string, extra: Record<string, string> = {}): string =>
    `/auth/callback?${new URLSearchParams({ state: event, auto: '1', ...extra })}`;

  export const field = (name: string): HTMLElement => BB.$(`[data-field="${name}"]`);
  export const input = (name: string): HTMLInputElement => BB.$<HTMLInputElement>('input, textarea, select', field(name));

  export function setError(name: string, message: string | null): void {
    const f = field(name);
    const err = BB.$('.inline-error', f);
    f.classList.toggle('field--error', !!message);
    input(name).setAttribute('aria-invalid', String(!!message));
    err.hidden = !message;
    err.innerHTML = message ? `${BB.icon('alert')}<span>${message}</span>` : '';
  }

  export function clearErrors(): void {
    BB.$$('[data-field]').forEach(f => setError(f.dataset.field!, null));
  }

  export function validate(rules: Record<string, (v: string) => string | null>): string | null {
    let first: string | null = null;
    Object.entries(rules).forEach(([name, rule]) => {
      const msg = rule(input(name).value.trim());
      setError(name, msg);
      if (msg && !first) first = name;
    });
    return first;
  }

  export const rules = {
    name: (v: string): string | null => (v ? null : 'Tell us what to call you.'),
    email: (v: string): string | null => (!v ? 'Enter your email.' : EMAIL.test(v) ? null : "That doesn't look like an email. Check for a typo."),
    password: (v: string): string | null => (v ? null : 'Enter your password.'),
    newPassword: (v: string): string | null => (!v ? 'Pick a password.' : v.length < 8 ? 'Use at least 8 characters.' : null)
  };

  export function setLoading(on: boolean): void {
    const btn = BB.$<HTMLButtonElement>('[data-submit]');
    btn.classList.toggle('is-loading', on);
    btn.setAttribute('aria-busy', String(on));
    BB.$$<HTMLInputElement>('[data-form] :is(input, textarea, select)').forEach(i => { i.disabled = on; });
  }

  export function shake(): void {
    if (!BB.motion()) return;
    gsap.fromTo('[data-card]', { x: 0 }, { x: 8, duration: 0.07, repeat: 5, yoyo: true, ease: 'none', clearProps: 'x' });
  }

  export function success(href: string, label: string): void {
    const btn = BB.$<HTMLButtonElement>('[data-submit]');
    btn.classList.remove('is-loading');
    btn.innerHTML = `${BB.icon('check')} ${label}`;
    if (BB.motion()) gsap.fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' });
    setTimeout(() => BB.go(href), BB.motion() ? 650 : 0);
  }

  if (BB.motion()) {
    gsap.registerPlugin(DrawSVGPlugin);
    const has = (sel: string): boolean => !!document.querySelector(sel);
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (has('[data-arcs]')) tl.from('[data-arcs] path', { drawSVG: '0%', duration: 1.3, stagger: 0.06, ease: 'power2.inOut' }, 0);
    if (has('[data-card]')) tl.from('[data-card]', { y: 28, autoAlpha: 0, duration: 0.7 }, 0.15);
    if (has('.auth__note')) tl.from('.auth__note', { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)' }, 0.7);
    if (has('.auth__sticker')) {
      tl.from('.auth__sticker', { scale: 0, rotation: -120, duration: 0.7, ease: 'back.out(1.8)' }, 0.6);
      gsap.to('.auth__sticker', { rotation: 360, duration: 18, ease: 'none', repeat: -1, delay: 1.3 });
    }
  }
}
