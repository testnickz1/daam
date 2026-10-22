import { homePage } from './pages/home.js';
import { catalogPage } from './pages/catalog.js';
import { productPage } from './pages/product.js';
import { favoritesPage } from './pages/favorites.js';
import { cartPage } from './pages/cart.js';
import { checkoutPage } from './pages/checkout.js';
import { successPage } from './pages/success.js';
import { infoPage, notFoundPage } from './pages/info.js';
import { skeleton, errorState } from './components/shared.js';

const ROUTES = [
  [/^\/?$/, homePage], [/^\/catalog$/, (c) => catalogPage({ ...c, mode: 'catalog' })], [/^\/category\/([\w-]+)$/, (c) => catalogPage({ ...c, mode: 'category' })],
  [/^\/search$/, (c) => catalogPage({ ...c, mode: 'search' })], [/^\/product\/([\w-]+)$/, productPage], [/^\/favorites$/, favoritesPage], [/^\/cart$/, cartPage],
  [/^\/checkout$/, checkoutPage], [/^\/success\/([\w-]+)$/, successPage], [/^\/(about|delivery|contacts|privacy)$/, infoPage],
];
let token = 0;
export function parseHash() { const [path, qs = ''] = (location.hash.slice(1) || '/').split('?'); return { path, params: new URLSearchParams(qs) }; }
export async function render(outlet, { refresh = false } = {}) {
  const my = ++token, { path, params } = parseHash(), y = scrollY;
  if (!refresh) outlet.innerHTML = `<div class="wrap" style="padding-top:20px">${skeleton()}</div>`;
  let view;
  try {
    const hit = ROUTES.map(([re, fn]) => [path.match(re), fn]).find(([m]) => m);
    view = hit ? await hit[1]({ params, args: hit[0].slice(1) }) : await notFoundPage();
  } catch (e) { console.error(e); view = { title: 'Ошибка', html: errorState('Произошла непредвиденная ошибка') }; }
  if (my !== token) return; // устаревший рендер
  outlet.innerHTML = view.html; document.title = view.title + ' — DAAM';
  refresh ? scrollTo(0, y) : scrollTo(0, 0);
}
