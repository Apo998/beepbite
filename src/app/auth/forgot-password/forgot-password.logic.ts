import { BB } from '../../shared/ui';
import { Api, ApiError } from '../../shared/api';
import { Auth } from '../../shared/auth';
(() => {
  const form = BB.$<HTMLFormElement>('[data-form]');
  const sent = BB.$('[data-alert-success]');
  const errorAlert = BB.$('[data-alert-error]');

  const params = new URLSearchParams(location.search);
  if (params.get('email')) Auth.input('email').value = params.get('email')!;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorAlert.hidden = true;
    const invalid = Auth.validate({ email: Auth.rules.email });
    if (invalid) { Auth.input(invalid).focus(); Auth.shake(); return; }

    Auth.setLoading(true);
    try {
      // The answer is the same whether or not the email has an account.
      await Api.forgotPassword(Auth.input('email').value.trim().toLowerCase());
      Auth.setLoading(false);
      form.hidden = true;
      sent.hidden = false;
      if (BB.motion()) gsap.from(sent, { y: 10, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' });
    } catch (err) {
      Auth.setLoading(false);
      BB.$('span', errorAlert).textContent = err instanceof ApiError && err.status === 503
        ? "Password reset isn't available right now. Contact support@beepbite.net."
        : Api.errorText(err);
      errorAlert.hidden = false;
      Auth.shake();
    }
  });

  Auth.input('email').addEventListener('input', () => { Auth.setError('email', null); errorAlert.hidden = true; });
})();
