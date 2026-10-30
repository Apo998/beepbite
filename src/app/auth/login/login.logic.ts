import { BB } from '../../shared/ui';
import { MESSAGES } from '../../shared/data';
import { Api, ApiError } from '../../shared/api';
import { Session } from '../../shared/session';
import { Auth } from '../../shared/auth';
(() => {
  const form = BB.$<HTMLFormElement>('[data-form]');
  const errorAlert = BB.$('[data-alert-error]');
  const successAlert = BB.$('[data-alert-success]');

  const params = new URLSearchParams(location.search);
  if (params.get('email')) Auth.input('email').value = params.get('email')!;

  function showError(message: string): void {
    BB.$('span', errorAlert).textContent = message;
    errorAlert.hidden = false;
    successAlert.hidden = true;
    Auth.field('email').classList.add('field--error');
    Auth.field('password').classList.add('field--error');
    Auth.input('password').value = '';
    Auth.shake();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorAlert.hidden = true;
    const invalid = Auth.validate({ email: Auth.rules.email, password: Auth.rules.password });
    if (invalid) { Auth.input(invalid).focus(); Auth.shake(); return; }

    Auth.setLoading(true);
    // The backend stores emails in lowercase but matches sign-in emails exactly.
    const email = Auth.input('email').value.trim().toLowerCase();
    try {
      const user = Session.start(await Api.login(email, Auth.input('password').value));
      Auth.success(Auth.callback('signin', { role: user.role }), `Hi, ${BB.esc(user.name.split(' ')[0])}`);
    } catch (err) {
      Auth.setLoading(false);
      showError(err instanceof ApiError && err.status === 401 ? MESSAGES.invalidLogin.ui : Api.errorText(err));
      Auth.input('password').focus();
    }
  });

  ['email', 'password'].forEach(name => Auth.input(name).addEventListener('input', () => {
    Auth.setError(name, null);
    errorAlert.hidden = true;
  }));

  // Carry the typed email over to the reset form.
  BB.$<HTMLAnchorElement>('[data-forgot]').addEventListener('click', e => {
    const email = Auth.input('email').value.trim();
    if (email) (e.currentTarget as HTMLAnchorElement).href = `/forgot-password?email=${encodeURIComponent(email)}`;
  });

  const SUCCESS: Record<string, string> = {
    registered: MESSAGES.registered.ui,
    reset: 'Password updated. Sign in with your new password.'
  };
  BB.onState(state => {
    successAlert.hidden = !SUCCESS[state];
    if (SUCCESS[state]) BB.$('[data-success-text]').textContent = SUCCESS[state];
  });
})();
