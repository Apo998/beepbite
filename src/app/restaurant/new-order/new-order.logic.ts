import { BB } from '../../shared/ui';
import { MESSAGES } from '../../shared/data';
import { ApiError } from '../../shared/api';
import { Resto } from '../../shared/restaurant';
(() => {
  type Scan = 'idle' | 'scanning' | 'found' | 'failed';
  // A customer's code is their qrToken: a UUID, checked by the backend with @IsUUID().
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const box = BB.$('[data-scan-box]');
  const viewfinder = BB.$('[data-viewfinder]');
  const vfMsg = BB.$('[data-vf-msg]');
  const amountEl = BB.$('[data-amount]');
  const createBtn = BB.$<HTMLButtonElement>('[data-create]');
  const hint = BB.$('[data-hint]');
  const success = BB.$('[data-success]');
  const codeInput = BB.$<HTMLInputElement>('#code');

  let scan: Scan = 'idle';
  let token = '';
  let amount = '';
  let busy = false;
  let camera: (() => void) | null = null;

  const pretty = (t: string): string => {
    const short = t.replace(/-/g, '').slice(0, 8).toUpperCase();
    return `${short.slice(0, 4)} ${short.slice(4)}`;
  };

  function setScan(s: Scan, fail?: { title: string; text: string }): void {
    scan = s;
    box.dataset.scan = s;
    BB.$('[data-rescan]').hidden = s !== 'found' && s !== 'failed';
    vfMsg.textContent = s === 'scanning' ? "Point the camera at the customer's code" : "Tap to scan the customer's code";
    BB.$('[data-found-code]').textContent = s === 'found' ? pretty(token) : '';
    if (fail) {
      BB.$('[data-fail-title]').textContent = fail.title;
      BB.$('[data-fail-msg]').textContent = fail.text;
    }
    viewfinder.setAttribute('aria-label', s === 'found' ? `Code scanned: ${pretty(token)}` : 'Camera. Tap to scan');
    if (BB.motion() && (s === 'found' || s === 'failed')) {
      gsap.from(BB.$(`.viewfinder__result[data-for="${s}"]`, box).children, { scale: 0.6, autoAlpha: 0, duration: 0.45, stagger: 0.06, ease: 'back.out(2)' });
    }
    if (s === 'found') BB.beep();
    update();
  }

  function accept(raw: string): void {
    const t = raw.trim();
    if (UUID.test(t)) { token = t.toLowerCase(); setScan('found'); return; }
    token = '';
    setScan('failed', { title: 'Not a BeepBite code', text: "That isn't a customer code. Ask the customer to show their BeepBite code." });
  }

  function stopCamera(): void {
    camera?.();
    camera = null;
  }

  async function startScan(): Promise<void> {
    if (scan === 'found' || scan === 'scanning') return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setScan('failed', { title: 'No camera', text: "This device can't open a camera here. Type the code below." });
      return;
    }
    setScan('scanning');
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const { default: jsQR } = await import('jsqr');
      const video = document.createElement('video');
      video.className = 'viewfinder__video';
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      viewfinder.prepend(video);
      await video.play();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      let timer = 0;
      const tracks = stream.getTracks();
      camera = () => { clearTimeout(timer); tracks.forEach(t => t.stop()); video.remove(); };
      const tick = (): void => {
        if (video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const hit = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });
          if (hit) { stopCamera(); accept(hit.data); return; }
        }
        timer = window.setTimeout(tick, 150);
      };
      tick();
    } catch {
      stream?.getTracks().forEach(t => t.stop());
      stopCamera();
      setScan('failed', { title: 'Camera unavailable', text: "We couldn't open the camera. Allow camera access, or type the code below." });
    }
  }
  viewfinder.addEventListener('click', () => { void startScan(); });
  BB.$('[data-rescan]').addEventListener('click', () => { stopCamera(); codeInput.value = ''; token = ''; setScan('idle'); });

  BB.$<HTMLFormElement>('[data-manual]').addEventListener('submit', e => {
    e.preventDefault();
    const typed = codeInput.value.trim();
    if (!typed) { codeInput.focus(); return; }
    stopCamera();
    accept(typed);
  });

  function press(key: string): void {
    if (key === 'back') amount = amount.slice(0, -1);
    else if (key === '.') { if (!amount.includes('.')) amount = (amount || '0') + '.'; }
    else {
      const [whole, dec] = amount.split('.');
      if (dec !== undefined && dec.length >= 2) return;
      if (dec === undefined && whole.length >= 4) return;
      amount = amount === '0' ? key : amount + key;
    }
    update();
    if (BB.motion()) gsap.fromTo(amountEl, { scale: 0.96 }, { scale: 1, duration: 0.2, ease: 'back.out(3)' });
  }
  BB.$('[data-keypad]').addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-key]');
    if (b?.dataset.key) press(b.dataset.key);
  });
  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement || !success.hidden) return;
    if (/^[0-9.]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('back');
    else if (e.key === 'Enter' && !createBtn.disabled) createBtn.click();
  });

  const value = (): number => Number(amount || 0);

  function update(): void {
    const v = value();
    amountEl.textContent = amount ? (amount.includes('.') ? amount : v.toFixed(2)) : '0.00';
    amountEl.parentElement!.classList.toggle('is-empty', !amount);
    // The backend rejects amounts under 1 (schema min: 1).
    const ok = scan === 'found' && v >= 1;
    createBtn.disabled = !ok || busy;
    hint.classList.toggle('is-ok', ok);
    hint.classList.toggle('is-error', scan === 'found' && !!amount && v < 1);
    hint.innerHTML = scan !== 'found' ? "Scan the customer's code first."
      : !amount ? 'Now type what they paid.'
      : v < 1 ? `${BB.icon('alert', 'icon--sm')}The amount must be at least 1.00.`
      : `${BB.icon('check', 'icon--sm')}Creates a new order as Preparing.`;
  }

  function showSuccess(n: number): void {
    BB.$('[data-new-num]').innerHTML = `<small>#</small>${n}`;
    BB.$('[data-ok-title]').textContent = `Tell them: number ${n}`;
    BB.openLayer(success);
    if (!BB.motion()) return;
    gsap.timeline({ delay: 0.15 })
      .fromTo('[data-new-num]', { scale: 0.3, rotation: -12 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
      .fromTo(BB.$$('.burst', success), { scale: 0.5, autoAlpha: 0.9 }, { scale: 3.6, autoAlpha: 0, duration: 1, stagger: 0.16, ease: 'power2.out' }, 0);
  }

  createBtn.addEventListener('click', async () => {
    if (busy || scan !== 'found') return;
    busy = true;
    createBtn.classList.add('is-loading');
    update();
    try {
      const o = await Resto.create(token, Math.round(value() * 100) / 100);
      Resto.renderRail();
      showSuccess(o.orderId);
    } catch (err) {
      if (err instanceof ApiError && err.message === MESSAGES.customerNotFound.api) {
        setScan('failed', { title: 'Code not found', text: MESSAGES.customerNotFound.ui });
      } else Resto.failed(err);
    } finally {
      busy = false;
      createBtn.classList.remove('is-loading');
      update();
    }
  });

  function resetForm(): void {
    amount = '';
    token = '';
    codeInput.value = '';
    setScan('idle');
  }
  BB.$('[data-again]').addEventListener('click', () => { BB.closeLayer(success); resetForm(); });

  resetForm();
})();
