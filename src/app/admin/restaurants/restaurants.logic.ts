import { BB } from '../../shared/ui';
import { type RestaurantAccount } from '../../shared/data';
import { Admin } from '../../shared/admin';
(() => {
  const rowsEl = BB.$('[data-rows]');
  const emptyEl = BB.$('[data-empty]');
  const tableWrap = BB.$('[data-table-wrap]');
  const q = BB.$<HTMLInputElement>('[data-q]');
  const clear = BB.$('[data-clear]');
  const params = new URLSearchParams(location.search);
  const created = params.get('created');
  let sort: 'new' | 'az' = 'new';
  let all: RestaurantAccount[] = [];

  function renderStats(list: RestaurantAccount[]): void {
    const now = new Date();
    const month = now.toLocaleDateString('en-GB', { month: 'long' });
    const thisMonth = list.filter(r => { const d = new Date(r.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    BB.$('[data-total]').textContent = String(list.length);
    BB.$('[data-month]').textContent = String(thisMonth.length);
    BB.$('[data-month-label]').textContent = `joined in ${month}`;
    if (list[0]) {
      BB.$('[data-newest]').textContent = list[0].name;
      BB.$('[data-newest-date]').textContent = `newest partner · ${Admin.date(list[0].createdAt)}`;
    }
  }

  const row = (r: RestaurantAccount): string => `
    <tr class="${r._id === created ? 'is-new' : ''}" data-href="${Admin.href(r)}" data-row>
      <td><a class="row-link r-cell" href="${Admin.href(r)}">${Admin.tile(r)}<span>${BB.esc(r.name)}</span>${r._id === created ? '<span class="new-chip">New</span>' : ''}</a></td>
      <td>${BB.esc(r.email ?? '–')}</td>
      <td class="num">${Admin.date(r.createdAt)}</td>
      <td class="end">${BB.icon('chevron')}</td>
    </tr>`;

  function render(animate = true): void {
    const list = all;
    renderStats(list);
    BB.$$('[data-has-rows]').forEach(el => { el.hidden = !list.length; });
    const term = q.value.trim().toLowerCase();
    clear.hidden = !term;
    let shown = list.filter(r => !term || r.name.toLowerCase().includes(term) || (r.email ?? '').includes(term));
    if (sort === 'az') shown = [...shown].sort((a, b) => a.name.localeCompare(b.name));

    tableWrap.hidden = !shown.length;
    emptyEl.hidden = !!shown.length;
    BB.$('[data-results]').textContent = !list.length ? '' : term ? `${shown.length} of ${list.length} restaurants match “${q.value.trim()}”` : `${list.length} ${list.length === 1 ? 'restaurant' : 'restaurants'}`;
    rowsEl.innerHTML = shown.map(row).join('');

    if (!list.length) {
      emptyEl.innerHTML = `
        <div class="empty">
          ${BB.mascot()}
          <h3>No restaurants yet</h3>
          <p>Add the first counter and send them their sign-in email and password.</p>
          <a class="btn btn--primary" href="/admin/restaurants/new">${BB.icon('plus')}Add restaurant</a>
        </div>`;
    } else if (!shown.length) {
      emptyEl.innerHTML = `
        <div class="empty">
          <h3>No restaurant matches “${BB.esc(q.value.trim())}”</h3>
          <p>Check the spelling, or search by sign-in email instead.</p>
          <button class="btn" type="button" data-clear-2>${BB.icon('x')}Clear search</button>
        </div>`;
      emptyEl.querySelector('[data-clear-2]')?.addEventListener('click', () => { q.value = ''; render(); q.focus(); });
    }
    if (animate && BB.motion()) gsap.from(BB.$$('[data-row]', rowsEl), { y: 8, autoAlpha: 0, duration: 0.3, stagger: 0.04, ease: 'power3.out', clearProps: 'all' });
  }

  rowsEl.addEventListener('click', e => {
    const tr = (e.target as Element).closest<HTMLElement>('[data-row]');
    if (tr && !(e.target as Element).closest('a')) location.href = tr.dataset.href!;
  });
  q.addEventListener('input', () => render(false));
  BB.$('[data-search-form]').addEventListener('submit', e => e.preventDefault());
  clear.addEventListener('click', () => { q.value = ''; render(false); q.focus(); });
  BB.$$('[data-sort]').forEach(b => b.addEventListener('click', () => {
    sort = b.dataset.sort as 'new' | 'az';
    BB.$$('[data-sort]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    render();
  }));

  BB.setState('loading');
  Admin.restaurants.then(list => {
    all = Admin.sortNewest(list);
    BB.setState('default');
    render();
    const r = created ? all.find(x => x._id === created) : undefined;
    if (r) setTimeout(() => BB.toast(`${BB.esc(r.name)} is on BeepBite. They can sign in now.`, 'success'), 500);
  }, err => {
    BB.setState('default');
    render();
    Admin.failed(err);
  });
})();
