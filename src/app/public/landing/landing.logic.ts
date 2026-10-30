import { BB } from '../../shared/ui';

(() => {
  interface LenisInstance {
    on(event: 'scroll', fn: () => void): void;
    raf(time: number): void;
    scrollTo(target: Element, options: { offset: number }): void;
    destroy(): void;
  }
  type LenisCtor = new (options: { lerp: number }) => LenisInstance;

  const header = BB.$('[data-header]');
  const menuBtn = BB.$('[data-menu]');
  menuBtn.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  BB.$$('#site-nav a').forEach(a => a.addEventListener('click', () => {
    header.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  const faqItems = BB.$$<HTMLDetailsElement>('.faq details');

  if (typeof gsap === 'undefined') return; 

  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  const mm = gsap.matchMedia();

  BB.$$('[data-nav-dark]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 72px', end: 'bottom 72px',
      onToggle: self => header.classList.toggle('is-dark', self.isActive)
    });
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {

    let lenis: LenisInstance | undefined;
    const Lenis = (window as unknown as { Lenis?: LenisCtor }).Lenis;
    if (Lenis) {
      const l = new Lenis({ lerp: 0.1 });
      lenis = l;
      l.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => l.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      BB.$$<HTMLAnchorElement>('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href')!);
        if (!target) return;
        e.preventDefault();
        l.scrollTo(target, { offset: -84 });
      }));
    }

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('[data-arcs] path', { drawSVG: '0%', duration: 1.4, stagger: 0.06, ease: 'power2.inOut' }, 0)
      .from('[data-hero-tag]', { y: 20, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.7)' }, 0.2)
      .from('[data-banner]', { xPercent: -30, rotation: -14, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' }, 0.9)
      .from('.hero__lead, .hero__ctas, .hero__note', { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.0)
      .from('.showcase', { y: 80, autoAlpha: 0, duration: 1 }, 1.1);

    BB.$$('[data-split]').forEach(el => {
      const isHero = el.id === 'hero-title';
      SplitText.create(el, {
        type: 'words', autoSplit: true,
        onSplit(self: SplitText) {
          return gsap.from(self.words, {
            yPercent: 60, rotation: () => gsap.utils.random(-12, 12), scale: 0.6, autoAlpha: 0,
            duration: 0.7, ease: 'back.out(1.8)', stagger: 0.07, delay: isHero ? 0.35 : 0,
            scrollTrigger: isHero ? undefined : { trigger: el, start: 'top 85%', once: true }
          });
        }
      });
    });

    gsap.to('.hero .deco--tr', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero .deco--bl', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    const mascot = BB.$('[data-mascot]');
    const blink: gsap.core.Tween = gsap.to(BB.$$('.eye', mascot), {
      scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08, yoyo: true, repeat: 1, repeatDelay: 0.05, delay: 2,
      onComplete: () => { blink.delay(gsap.utils.random(2, 5)).restart(true); }
    });
    mascot.addEventListener('mouseenter', () => gsap.fromTo(mascot, { rotation: 0 }, { rotation: 10, duration: 0.15, yoyo: true, repeat: 3, ease: 'sine.inOut' }));

    BB.$$('.hl').forEach(m => {
      gsap.from(m, { backgroundSize: '0% .45em', duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: m, start: 'top 85%', once: true } });
    });

    gsap.to('[data-spin]', { rotation: 360, duration: 18, ease: 'none', repeat: -1 });

    mm.add('(min-width: 761px)', () => {
      const cards = BB.$$('.step');
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, { scale: 0.93, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true } });
      });
    });

    BB.$$('[data-float]').forEach(el => {
      gsap.to(el, { y: Number(el.dataset.float), ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    const counter = BB.$('[data-count]');
    const pts = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: '.points', start: 'top 70%', once: true } })
      .from('[data-coin]', { scale: 0.6, rotation: -40, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.7)' })
      .to(pts, { v: Number(counter.dataset.count), duration: 1.6, ease: 'power2.out', onUpdate: () => { counter.textContent = String(Math.round(pts.v)); } }, 0.2)
      .from('[data-plus]', { scale: 0, autoAlpha: 0, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.2 }, 0.6);

    faqItems.forEach(d => {
      const summary = BB.$('summary', d);
      const body = BB.$('.faq__a', d);
      summary.addEventListener('click', e => {
        e.preventDefault();
        if (d.open) {
          gsap.to(body, { height: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height' }); } });
        } else {
          d.open = true;
          gsap.from(body, { height: 0, duration: 0.45, ease: 'power3.out', clearProps: 'height' });
        }
      });
    });

    mm.add('(pointer: fine)', () => {
      const cur = BB.$('[data-beep-cursor]');
      gsap.set(cur, { xPercent: 20, yPercent: 60, scale: 0.6 });
      const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
      const yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
      const move = (e: MouseEvent): void => { xTo(e.clientX); yTo(e.clientY); };
      window.addEventListener('mousemove', move);
      BB.$$('[data-cursor]').forEach(btn => {
        btn.addEventListener('mouseenter', () => gsap.to(cur, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }));
        btn.addEventListener('mouseleave', () => gsap.to(cur, { autoAlpha: 0, scale: 0.6, duration: 0.2 }));
      });
      return () => window.removeEventListener('mousemove', move);
    });

    return () => { lenis?.destroy(); };
  });
})();
