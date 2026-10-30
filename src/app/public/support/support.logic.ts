import { BB } from '../../shared/ui';
import { Api, ApiError } from '../../shared/api';
import { Auth } from '../../shared/auth';
import { Session } from '../../shared/session';
import { type SupportTopic } from '../../shared/data';
(() => {
  const form = BB.$<HTMLFormElement>('[data-form]');
  const sent = BB.$('[data-alert-success]');
  const errorAlert = BB.$('[data-alert-error]');
  const again = BB.$<HTMLButtonElement>('[data-again]');
  const message = Auth.input('message');
  const count = BB.$('[data-count]');
  const TOPICS: SupportTopic[] = ['account', 'orders', 'points', 'restaurants', 'other'];
  const UNAVAILABLE = "Our message form isn't available right now. Email us at support@beepbite.net instead.";

  // Signed in: fill in who's writing and point the header back to the app.
  const user = Session.user();
  if (user) {
    const top = BB.$<HTMLAnchorElement>('[data-top-link]');
    top.href = Auth.HOME[user.role];
    top.textContent = 'Back to BeepBite';
    Auth.input('name').value = user.name;
    Auth.input('email').value = user.email;
  }
  const topic = new URLSearchParams(location.search).get('topic') as SupportTopic | null;
  if (topic && TOPICS.includes(topic)) Auth.input('topic').value = topic;

  const rules = {
    name: Auth.rules.name,
    email: Auth.rules.email,
    topic: (v: string): string | null => (v ? null : 'Pick what your message is about.'),
    message: (v: string): string | null => (!v ? 'Write your message.' : v.length < 10 ? 'Tell us a little more (at least 10 characters).' : null)
  };

  const showCount = (): void => { count.textContent = `${message.value.length} / ${message.maxLength}`; };

  function showError(text: string): void {
    BB.$('[data-error-text]').textContent = text;
    errorAlert.hidden = false;
    Auth.shake();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorAlert.hidden = true;
    const invalid = Auth.validate(rules);
    if (invalid) { Auth.input(invalid).focus(); Auth.shake(); return; }

    const name = Auth.input('name').value.trim();
    const email = Auth.input('email').value.trim().toLowerCase();
    Auth.setLoading(true);
    try {
      await Api.support(name, email, Auth.input('topic').value as SupportTopic, message.value.trim());
      Auth.setLoading(false);
      form.hidden = true;
      BB.$('[data-success-text]').textContent = `Thanks for reaching out, ${name.split(' ')[0]}. Our answer will beep into ${email} soon.`;
      sent.hidden = false;
      again.hidden = false;
      if (BB.motion()) gsap.from(sent, { y: 10, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' });
    } catch (err) {
      Auth.setLoading(false);
      showError(err instanceof ApiError && err.status === 503 ? UNAVAILABLE : Api.errorText(err));
    }
  });

  again.addEventListener('click', () => {
    message.value = '';
    showCount();
    sent.hidden = true;
    again.hidden = true;
    form.hidden = false;
    message.focus();
  });

  Object.keys(rules).forEach(name => Auth.input(name).addEventListener('input', () => { Auth.setError(name, null); errorAlert.hidden = true; }));
  message.addEventListener('input', showCount);
  showCount();

  if (BB.motion()) {
    gsap.from('[data-head] > *', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' });
    gsap.from('[data-side]', { y: 28, autoAlpha: 0, duration: 0.7, stagger: 0.1, delay: 0.25, ease: 'power3.out' });
  }
})();
