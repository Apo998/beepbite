import { BB } from '../../shared/ui';
import { Api, ApiError } from '../../shared/api';
import { Auth } from '../../shared/auth';
(() => {
  const form = BB.$<HTMLFormElement>('[data-form]');
  const errorAlert = BB.$('[data-alert-error]');
  const token = new URLSearchParams(location.search).get('token') || '';
  const EXPIRED = 'This reset link is invalid or has expired. Send yourself a new one.';

  function showError(message: string): void {
    BB.$('[data-error-text]').textContent = message;
    errorAlert.hidden = false;
    Auth.shake();
  }

  if (!token) {
    form.hidden = true;
    showError(EXPIRED);
    return;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorAlert.hidden = true;
    const invalid = Auth.validate({ password: Auth.rules.newPassword });
    if (invalid) { Auth.input(invalid).focus(); Auth.shake(); return; }

    Auth.setLoading(true);
    try {
      await Api.resetPassword(token, Auth.input('password').value);
      Auth.success('/login?state=reset', 'Password saved');
    } catch (err) {
      Auth.setLoading(false);
      // 400: expired, already used, or tampered with.
      showError(err instanceof ApiError && err.status === 400 ? EXPIRED : Api.errorText(err));
    }
  });

  Auth.input('password').addEventListener('input', () => { Auth.setError('password', null); errorAlert.hidden = true; });
})();
