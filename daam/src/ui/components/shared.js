import { esc, fmt } from '../../domain/utils.js';
import { cart } from '../../services/cartService.js';
import { favorites } from '../../services/favoritesService.js';

const LEAF = `<svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 8 6 14 8 21c2 6 9 8 14 4 4-3 5-9 2-14-1-2-4-6-8-8z" fill="#247A45"/><path d="M12 22c1-6 4-10 9-13" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
export const logo = (cls = '') => `<span class="logo ${cls}">${LEAF}<b>DAAM</b></span>`;

// Резервное изображение (если файл фото не найден)
export function placeholder(icon = '🌿') {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#E9F5E9'/><circle cx='200' cy='195' r='130' fill='#fff' opacity='.7'/><text x='200' y='250' font-size='160' text-anchor='middle'>${icon}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
}
export const img = (p, alt = true) => `<img src="${esc(p.image)}" data-fb="${placeholder(p.icon)}" alt="${alt ? esc(p.name) : ''}" loading="lazy" width="400" height="400">`;
const LBL = { hit: ['Хит', ''], new: ['Новинка', 'new'] };
export const tags = (p) => [...p.labels.filter((l) => l !== 'sale').map((l) => `<span class="tag ${LBL[l][1]}">${LBL[l][0]}</span>`), p.oldPrice ? `<span class="tag sale">Скидка</span>` : ''].join('');
export const price = (p) => `<div class="pr"><b>${fmt(p.price)}</b>${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s><span class="off">−${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ''}</div>`;

export function buyControl(p) {
  if (!p.inStock) return `<button class="btn ghost" disabled>Нет в наличии</button>`;
  const q = cart.qtyOf(p.id);
  return q
    ? `<div class="qty"><button data-act="dec" data-id="${p.id}" aria-label="Уменьшить количество">−</button><span aria-live="polite">${q} в корзине</span><button data-act="inc" data-id="${p.id}" aria-label="Увеличить количество">+</button></div>`
    : `<button class="btn" data-act="inc" data-id="${p.id}">В корзину</button>`;
}
export function favBtn(p) {
  const f = favorites.has(p.id);
  return `<button class="fav" data-act="fav" data-id="${p.id}" aria-pressed="${f}" aria-label="${f ? 'Убрать из избранного' : 'Добавить в избранное'}">${f ? '♥' : '♡'}</button>`;
}
// Единый компонент карточки товара — используется на всех страницах
export const productCard = (p) => `<article class="card"><a class="ph" href="#/product/${p.slug}" aria-label="${esc(p.name)}">${img(p, false)}<span class="tags">${tags(p)}</span></a>${favBtn(p)}<a class="nm" href="#/product/${p.slug}">${esc(p.name)}</a><div class="un">${esc(p.unit)}</div>${price(p)}${buyControl(p)}</article>`;
export const productGrid = (list) => `<div class="grid">${list.map(productCard).join('')}</div>`;
export const skeleton = (n = 6) => `<div class="grid">${'<div class="sk"></div>'.repeat(n)}</div>`;
export const empty = (icon, title, text, href, label) => `<div class="empty"><b>${icon}</b><h2>${title}</h2><p>${text}</p>${href ? `<a class="btn" href="${href}">${label}</a>` : ''}</div>`;
export const errorState = (msg) => empty('⚠️', 'Не удалось загрузить данные', esc(msg || 'Попробуйте обновить страницу.'), '#/', 'На главную');
export const section = (title, link, body) => `<section><h2>${title}${link ? `<a href="${link}">Смотреть все →</a>` : ''}</h2>${body}</section>`;
export function toast(msg) { const t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(() => (t.style.display = 'none'), 2400); }
