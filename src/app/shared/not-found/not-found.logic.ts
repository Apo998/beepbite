import { BB } from '../../shared/ui';
import { Session } from '../../shared/session';
(() => {
  const HOME: Record<string, { label: string; href: string; icon: string }> = {
    visitor: { label: 'Back to the website', href: '/', icon: 'home' },
    customer: { label: 'Go to my code', href: '/customer', icon: 'qr' },
    restaurant: { label: 'Go to the board', href: '/restaurant/orders', icon: 'board' },
    admin: { label: 'Go to restaurants', href: '/admin/restaurants', icon: 'store' }
  };
  const actions = BB.$('[data-actions]');
  const params = new URLSearchParams(location.search);
  const tried = params.get('path');
  BB.$('[data-path]').textContent = tried || location.pathname;
  if (!params.get('state')) BB.setState(Session.user()?.role.toLowerCase() ?? 'visitor');

  BB.onState(state => {
    const main = HOME[state] || HOME.visitor;
    const second = state === 'visitor'
      ? { label: 'Sign in', href: '/login', icon: 'user' }
      : { label: 'Back to the website', href: '/', icon: 'home' };
    actions.innerHTML = `
      <a class="btn btn--primary" href="${main.href}" data-transition>${BB.icon(main.icon)}${main.label}</a>
      <a class="btn" href="${second.href}" data-transition>${BB.icon(second.icon)}${second.label}</a>`;
    if (BB.motion()) gsap.from(actions.children, { y: 10, autoAlpha: 0, duration: 0.35, stagger: 0.06, ease: 'power3.out' });
  });

  if (BB.motion()) {
    gsap.registerPlugin(DrawSVGPlugin);
    gsap.timeline()
      .from('[data-arcs] path', { drawSVG: '0%', duration: 1.3, stagger: 0.06, ease: 'power2.inOut' }, 0)
      .from('.nf__code > span:not(.nf__zero)', { yPercent: 60, rotation: () => gsap.utils.random(-14, 14), autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(1.8)' }, 0.1)
      .from('.nf__zero', { scale: 0.3, rotation: -180, duration: 0.9, ease: 'back.out(1.6)' }, 0.2)
      .from('.nf__speech', { scale: 0, autoAlpha: 0, duration: 0.4, ease: 'back.out(2.4)' }, 0.8)
      .from('.nf__crumbs span', { x: -20, y: -10, autoAlpha: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, 0.7)
      .from('.nf h1, .nf p, .nf__path, .nf .hand', { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, 0.5);

    gsap.to('[data-face] .eye', { x: 6, duration: 0.4, repeat: -1, yoyo: true, repeatDelay: 2.4, ease: 'power2.inOut', delay: 2 });
  }
})();
