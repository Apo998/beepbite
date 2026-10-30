import { BB } from '../../shared/ui';
import { type Role } from '../../shared/data';
import { Session } from '../../shared/session';
import { Auth } from '../../shared/auth';
(() => {
  type Face = 'happy' | 'smile' | 'sleepy' | 'hmm' | 'worried';
  interface Action { label: string; href: string; icon?: string; primary?: boolean }
  interface Moment {
    label: string; title: string; text: string; speech: string; face: Face;
    steps: string[]; next?: string; actions: Action[];
  }

  const params = new URLSearchParams(location.search);
  const auto = params.get('auto') === '1';
  const last = Session.last();
  const asked = params.get('role') as Role;
  let role: Role = asked in Auth.HOME ? asked : last?.role || 'CUSTOMER';

  const ROLE_TEXT: Record<Role, { loading: string; opening: string; place: string }> = {
    CUSTOMER: { loading: 'Loading your orders', opening: 'Opening your code', place: 'Getting your code ready…' },
    RESTAURANT: { loading: "Loading today's orders", opening: 'Opening the counter', place: last?.role === 'RESTAURANT' ? `Opening ${last.name}'s counter…` : 'Opening the counter…' },
    ADMIN: { loading: 'Loading restaurants', opening: 'Opening the admin panel', place: 'Opening the admin panel…' }
  };

  function moment(state: string): Moment {
    const first = last?.name.split(' ')[0] ?? 'there';
    const t = ROLE_TEXT[role];
    const home = Auth.HOME[role];
    const regName = (params.get('name') || '').split(' ')[0];
    const regEmail = params.get('email') || '';
    const toLogin = last ? `/login?email=${encodeURIComponent(last.email)}` : '/login';
    switch (state) {
      case 'signout': return {
        label: 'Signed out', title: 'See you soon.', face: 'smile', speech: 'Bye for now!',
        text: role === 'RESTAURANT' ? "You're signed out on this tablet. Today's orders are safe." : "You're signed out on this device. Your code and points are safe.",
        steps: ['Signed out', 'Cleared this device'], next: '/login',
        actions: [{ label: 'Sign in again', href: toLogin, primary: true }, { label: 'Back to home', href: '/' }]
      };
      case 'registered': return {
        label: 'Account created', title: regName ? `Welcome, ${regName}!` : 'Welcome!', face: 'happy', speech: 'Your code is ready',
        text: 'Your BeepBite code is made. Sign in once and it lives on your phone.',
        steps: ['Account created', 'Code made for you', 'Opening sign in'],
        next: `/login?state=registered&email=${encodeURIComponent(regEmail)}`,
        actions: [{ label: 'Sign in now', href: `/login?state=registered&email=${encodeURIComponent(regEmail)}`, primary: true, icon: 'arrow' }]
      };
      case 'expired': return {
        label: 'Session expired', title: 'You dozed off.', face: 'sleepy', speech: 'zzz…',
        text: 'For your safety we signed you out after a while. Sign in again to pick up where you left off.',
        steps: [],
        actions: [{ label: 'Sign in again', href: toLogin, primary: true }, { label: 'Back to home', href: '/' }]
      };
      case 'denied': return {
        label: 'Wrong account', title: "This page isn't for you.", face: 'hmm', speech: 'Hmm…',
        text: `You're signed in with a ${role.toLowerCase()} account, and this page belongs to a different kind of account.`,
        steps: [],
        actions: [{ label: 'Go to my home', href: home, primary: true, icon: 'home' }, { label: 'Use another account', href: '/login' }]
      };
      case 'error': return {
        label: "Couldn't connect", title: 'No beep came back.', face: 'worried', speech: 'beep? beep?',
        text: "We couldn't reach BeepBite just now. Check your connection and try again.",
        steps: [],
        actions: [{ label: 'Try again', href: `/auth/callback?state=signin&role=${role}&auto=1`, primary: true, icon: 'refresh' }, { label: 'Back to sign in', href: '/login' }]
      };
      default: return {
        label: 'Signed in', title: `Hi, ${first}.`, face: 'happy', speech: 'Beep! Welcome back',
        text: t.place, steps: ['Signed in', t.loading, t.opening], next: home,
        actions: [{ label: 'Continue', href: home, primary: true, icon: 'arrow' }]
      };
    }
  }

  const face = BB.$('.cb__face');
  const stepsEl = BB.$('[data-steps]');
  const progress = BB.$('[data-progress]');
  const goLine = BB.$('[data-go]');
  const actions = BB.$('[data-actions]');
  let timers: number[] = [];
  let tween: gsap.core.Tween | null = null;

  function clear(): void {
    timers.forEach(clearTimeout);
    timers = [];
    tween?.kill();
    tween = null;
  }

  function render(state: string): void {
    clear();
    if (state === 'signout' || state === 'expired') Session.clear();
    const m = moment(state);
    face.dataset.face = m.face;
    BB.$('[data-label]').textContent = m.label;
    BB.$('[data-title]').textContent = m.title;
    BB.$('[data-text]').textContent = m.text;
    BB.$('[data-speech]').textContent = m.speech;
    document.title = `${m.label} · BeepBite`;

    stepsEl.innerHTML = m.steps.map((s, i) =>
      `<li class="${i === m.steps.length - 1 && auto && m.next ? 'is-wait' : ''}">${BB.icon('check')}${s}</li>`).join('');

    const continuing = auto && !!m.next;
    progress.hidden = !continuing;
    goLine.hidden = !continuing;
    actions.hidden = continuing;
    actions.innerHTML = m.actions.map(a =>
      `<a class="btn ${a.primary ? 'btn--primary' : ''}" href="${a.href}" data-transition>${a.icon ? BB.icon(a.icon) : ''}${a.label}</a>`).join('');

    if (continuing && m.next) {
      const next = m.next;
      BB.$<HTMLAnchorElement>('[data-go-link]').href = next;
      const bar = BB.$('span', progress);
      const DURATION = 2.6;
      const finish = (): void => {
        stepsEl.querySelector('.is-wait')?.classList.remove('is-wait');
        timers.push(window.setTimeout(() => BB.go(next), 250));
      };
      if (BB.motion()) tween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: DURATION, ease: 'power1.inOut', onComplete: finish });
      else { bar.style.transform = 'scaleX(1)'; timers.push(window.setTimeout(finish, DURATION * 1000)); }
    }

    if (BB.motion()) {
      gsap.timeline()
        .fromTo(face, { scale: 0.6, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.8)' })
        .fromTo('[data-speech]', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2.2)' }, 0.3)
        .fromTo(['[data-label]', '[data-title]', '[data-text]'], { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, 0.15)
        .fromTo(stepsEl.children, { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, stagger: 0.35, ease: 'back.out(2)' }, 0.5)
        .fromTo(actions.children, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06 }, 0.6);

    }
  }

  const roleButtons = BB.$$('[data-role]');
  const markRole = (): void => roleButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.role === role)));
  roleButtons.forEach(b => b.addEventListener('click', () => {
    role = b.dataset.role as Role;
    markRole();
    render(document.body.dataset.state || 'signin');
  }));
  markRole();

  BB.onState(render);
})();
