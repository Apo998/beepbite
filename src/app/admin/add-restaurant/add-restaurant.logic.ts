import { BB } from '../../shared/ui';
import { ApiError } from '../../shared/api';
import { Admin } from '../../shared/admin';
(() => {
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const form = BB.$<HTMLFormElement>('[data-form]');
  const submit = BB.$<HTMLButtonElement>('[data-submit]');
  const field = (name: string): HTMLElement => BB.$(`[data-field="${name}"]`);
  const input = (name: string): HTMLInputElement => BB.$<HTMLInputElement>('input', field(name));

  const RULES: Record<string, (v: string) => string | null> = {
    name: v => (v ? null : 'Add the restaurant name.'),
    email: v => (!v ? 'Add the email they will sign in with.' : EMAIL.test(v) ? null : "That doesn't look like an email. Check for a typo."),
    password: v => (!v ? 'Add a temporary password, or tap "Make one".' : v.length < 8 ? 'Use at least 8 characters.' : null)
  };

  function setError(name: string, message: string | null): void {
    const f = field(name);
    const err = BB.$('.inline-error', f);
    f.classList.toggle('field--error', !!message);
    input(name).setAttribute('aria-invalid', String(!!message));
    err.hidden = !message;
    err.innerHTML = message ? `${BB.icon('alert')}<span>${message}</span>` : '';
  }
  function validate(): string | null {
    let first: string | null = null;
    Object.keys(RULES).forEach(name => {
      const msg = RULES[name](input(name).value.trim());
      setError(name, msg);
      if (msg && !first) first = name;
    });
    return first;
  }
  function shake(): void {
    if (BB.motion()) gsap.fromTo(form, { x: 0 }, { x: 8, duration: 0.07, repeat: 5, yoyo: true, ease: 'none', clearProps: 'x' });
  }
  function setLoading(on: boolean): void {
    submit.classList.toggle('is-loading', on);
    submit.setAttribute('aria-busy', String(on));
    BB.$$<HTMLInputElement>('input', form).forEach(i => { i.disabled = on; });
  }

  Object.keys(RULES).forEach(name => input(name).addEventListener('input', () => setError(name, null)));

  const WORDS = ['crispy', 'warm', 'golden', 'spicy', 'fresh', 'tasty', 'beep', 'bao', 'falafel', 'waffle', 'noodle', 'taco', 'pita', 'kunafa'];
  BB.$('[data-generate]').addEventListener('click', () => {
    const pick = (): string => WORDS[Math.floor(Math.random() * WORDS.length)];
    const pw = `${pick()}-${pick()}-${String(Math.floor(Math.random() * 90) + 10)}`;
    const p = input('password');
    p.value = pw;
    p.type = 'text';
    const toggle = BB.$('[data-password-toggle]', field('password'));
    toggle.setAttribute('aria-pressed', 'true');
    toggle.setAttribute('aria-label', 'Hide password');
    toggle.innerHTML = BB.icon('eye-off');
    setError('password', null);
    if (BB.motion()) gsap.fromTo(p, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
  });

  function emailTaken(): void {
    setError('email', 'This email already has an account. Use a different one for this restaurant.');
    shake();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const invalid = validate();
    if (invalid) { input(invalid).focus(); shake(); return; }
    setLoading(true);
    try {
      const r = await Admin.addRestaurant(input('name').value, input('email').value, input('password').value);
      setLoading(false);
      submit.innerHTML = `${BB.icon('check')}Created`;
      setTimeout(() => BB.go(`/admin/restaurants?created=${encodeURIComponent(r._id)}`), BB.motion() ? 500 : 0);
    } catch (err) {
      setLoading(false);
      if (err instanceof ApiError && err.status === 409) { emailTaken(); input('email').focus(); return; }
      Admin.failed(err);
      shake();
    }
  });
})();
