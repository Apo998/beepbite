import { BB } from '../../shared/ui';
import { MESSAGES } from '../../shared/data';
import { Api, ApiError } from '../../shared/api';
import { Auth } from '../../shared/auth';
(() => {
  const form = BB.$<HTMLFormElement>('[data-form]');
  const RULES = { name: Auth.rules.name, email: Auth.rules.email, password: Auth.rules.newPassword };

  function emailTaken(): void {
    Auth.setError('email', `${MESSAGES.emailExists.ui} <a href="/login?email=${encodeURIComponent(Auth.input('email').value.trim())}" data-transition>Sign in instead</a>`);
    Auth.shake();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const invalid = Auth.validate(RULES);
    if (invalid) { Auth.input(invalid).focus(); Auth.shake(); return; }

    Auth.setLoading(true);
    const name = Auth.input('name').value.trim();
    const email = Auth.input('email').value.trim().toLowerCase();
    try {
      await Api.register(name, email, Auth.input('password').value);
      Auth.success(Auth.callback('registered', { email, name }), 'Account created');
    } catch (err) {
      Auth.setLoading(false);
      if (err instanceof ApiError && err.status === 409) { emailTaken(); Auth.input('email').focus(); return; }
      BB.toast(BB.esc(Api.errorText(err)), 'error');
      Auth.shake();
    }
  });

  Object.keys(RULES).forEach(name => Auth.input(name).addEventListener('input', () => Auth.setError(name, null)));
})();
