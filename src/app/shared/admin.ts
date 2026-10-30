import { BB } from './ui';
import { type Restaurant, type RestaurantAccount } from './data';
import { Api } from './api';
import { Session } from './session';
export namespace Admin {
  export const user = Session.last()!;

  export const addRestaurant = (name: string, email: string, password: string): Promise<Restaurant> =>
    Api.createRestaurant(name.trim(), email.trim().toLowerCase(), password);

  export const sortNewest = <T extends Restaurant>(list: T[]): T[] => [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const TILES: [string, string][] = [
    ['var(--color-tomato)', 'var(--color-crust)'],
    ['var(--color-butter)', 'var(--color-ink)'],
    ['var(--color-pan-teal)', 'var(--color-crust)']
  ];
  export const initials = (name: string): string =>
    name.replace(/&/g, '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  export function tile(r: Restaurant, cls = ''): string {
    const sum = [...r.name].reduce((n, c) => n + c.charCodeAt(0), 0);
    const [bg, ink] = TILES[sum % TILES.length];
    return `<span class="r-tile ${cls}" style="--tile:${bg};--tile-ink:${ink}" aria-hidden="true">${BB.esc(initials(r.name))}</span>`;
  }
  export const href = (r: Restaurant): string => `/admin/restaurants/${encodeURIComponent(r._id)}`;
  export const date = (d: string): string => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  export function renderSidebar(count?: number): void {
    BB.$$('[data-sidebar]').forEach(side => {
      const current = side.dataset.sidebar;
      side.innerHTML = `
        <div class="sidebar__brand">
          <a class="brand brand--sm" href="/admin/restaurants" aria-label="BeepBite admin">${BB.logo()}beepbite</a>
          <span class="sidebar__role">Admin</span>
        </div>
        <nav class="sidebar__nav" aria-label="Main">
          <span class="label">Partners</span>
          <a href="/admin/restaurants"${current === 'list' ? ' aria-current="page"' : ''}>${BB.icon('store')}Restaurants${count === undefined ? '' : `<span class="sidebar__count">${count}</span>`}</a>
          <a href="/admin/restaurants/new"${current === 'add' ? ' aria-current="page"' : ''}>${BB.icon('plus')}Add restaurant</a>
        </nav>
        <div class="sidebar__foot">
          <span class="hand">four teeth. always four.</span>
          <small>BeepBite admin</small>
        </div>`;
    });
  }
  renderSidebar();
  // Restaurants with their sign-in emails (GET /restaurant/accounts).
  export const restaurants: Promise<RestaurantAccount[]> = Api.restaurantAccounts();
  restaurants.then(list => renderSidebar(list.length), () => {});

  BB.$$('[data-account]').forEach(box => {
    box.innerHTML = `
      <button class="account-menu__btn" type="button" aria-haspopup="true" aria-expanded="false" data-account-btn>
        <span class="account-menu__avatar">${BB.esc(initials(user.name))}</span>
        <span class="account-menu__who"><b>${BB.esc(user.name)}</b><small>Admin</small></span>
        ${BB.icon('chevron', 'icon--sm')}
      </button>
      <div class="account-menu__list" role="menu" hidden data-account-list>
        <div class="account-menu__head"><b>${BB.esc(user.name)}</b>${BB.esc(user.email)}</div>
        <a role="menuitem" href="/">${BB.icon('home')}View the website</a>
        <a role="menuitem" class="is-danger" href="/auth/callback?state=signout&amp;auto=1&amp;role=ADMIN" data-transition>${BB.icon('logout')}Sign out</a>
      </div>`;
    const btn = BB.$('[data-account-btn]', box);
    const list = BB.$('[data-account-list]', box);
    const set = (open: boolean): void => {
      list.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open && BB.motion()) gsap.from(list, { y: -8, autoAlpha: 0, duration: 0.2, ease: 'power3.out' });
    };
    btn.addEventListener('click', () => set(list.hidden));
    document.addEventListener('click', e => { if (!box.contains(e.target as Node)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  });

  export function failed(err: unknown): void {
    BB.toast(BB.esc(Api.errorText(err)), 'error');
  }
}
