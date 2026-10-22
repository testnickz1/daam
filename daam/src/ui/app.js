import { config } from '../config/index.js';
import { repo } from '../data/repositories/index.js';
import { cart } from '../services/cartService.js';
import { favorites } from '../services/favoritesService.js';
import { placeOrder } from '../services/orderService.js';
import { storage } from '../storage/storage.js';
import { debounce, esc, fmt } from '../domain/utils.js';
import { logo, toast } from './components/shared.js';
import { render, parseHash } from './router.js';

const root = document.getElementById('root');
const cats = (await repo.getCategories()).data ?? [];
const city = storage.read('city', (c) => typeof c === 'string', config.cities[0]);
root.innerHTML = `<a class="skip" href="#main">К содержимому</a>
<header class="hdr"><div class="wrap"><a href="#/" aria-label="DAAM — на главную">${logo()}</a>
<button class="btn" data-act="catmenu" aria-expanded="false" aria-controls="catmenu">☰ Каталог</button>
<select class="city hide-m" id="city" aria-label="Город доставки">${config.cities.map((c) => `<option ${c === city ? 'selected' : ''}>${c}</option>`).join('')}</select>
<form class="srch" id="search" role="search" autocomplete="off"><input id="q" name="q" placeholder="Найти продукты" aria-label="Поиск по товарам"><button class="x" type="button" id="qx" aria-label="Очистить запрос" hidden>×</button><div class="sug" id="sug" hidden></div></form>
<a class="ib hide-m" href="#/favorites" aria-label="Избранное">♡<span class="bdg" id="fb"></span></a>
<button class="ib hide-m" data-act="profile" aria-label="Профиль">👤</button>
<a class="ib" href="#/cart" aria-label="Корзина">🛒<span class="bdg" id="cb"></span></a></div>
<div class="catmenu" id="catmenu" hidden><div class="wrap">${cats.map((c) => `<a href="#/category/${c.id}">${c.icon} ${c.name}</a>`).join('')}</div></div></header>
<main id="main" tabindex="-1"></main>
<footer class="ftr"><div class="wrap"><div>${logo()}<p>Вкусное начинается здесь.</p></div><div><b>Магазин</b><a href="#/about">О магазине</a><a href="#/delivery">Доставка и оплата</a><a href="#/contacts">Контакты</a><a href="#/privacy">Политика конфиденциальности</a></div><div><b>Категории</b>${cats.slice(0, 5).map((c) => `<a href="#/category/${c.id}">${c.name}</a>`).join('')}</div></div></footer>
<nav class="bn" aria-label="Нижняя навигация"><a href="#/"><i>🏠</i>Главная</a><a href="#/catalog"><i>🥦</i>Каталог</a><a href="#/cart"><i>🛒</i>Корзина<span class="bdg" id="cb2" style="right:20%"></span></a><a href="#/favorites"><i>♡</i>Избранное</a><button data-act="profile"><i>👤</i>Профиль</button></nav><div id="toast" role="status" aria-live="polite"></div>`;
const outlet = document.getElementById('main'), $ = (id) => document.getElementById(id);
const badges = () => { $('cb').textContent = $('cb2').textContent = cart.count() || ''; $('fb').textContent = favorites.count() || ''; };
badges(); cart.subscribe(badges); favorites.subscribe(badges);

// Fallback-картинки
document.addEventListener('error', (e) => { const i = e.target; if (i.tagName === 'IMG' && i.dataset.fb && !i.dataset.done) { i.dataset.done = 1; i.src = i.dataset.fb; } }, true);

// Действия кнопок
const closeMenu = () => { $('catmenu').hidden = true; document.querySelector('[data-act=catmenu]').setAttribute('aria-expanded', 'false'); };
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t) { if (!e.target.closest('#catmenu')) closeMenu(); if (!e.target.closest('#search')) $('sug').hidden = true; return; }
  const { act, id } = t.dataset;
  if (act === 'catmenu') { const h = $('catmenu').hidden; $('catmenu').hidden = !h; t.setAttribute('aria-expanded', String(h)); return; }
  if (act === 'profile') return toast('Личный кабинет появится после подключения backend (демо)');
  if (act === 'inc') { if (!cart.qtyOf(id)) toast('Добавлено в корзину'); cart.add(id); }
  if (act === 'dec') cart.setQty(id, cart.qtyOf(id) - 1);
  if (act === 'remove') { cart.remove(id); toast('Товар удалён'); }
  if (act === 'clear') { if (!confirm('Очистить корзину?')) return; cart.clear(); }
  if (act === 'fav') toast(favorites.toggle(id) ? 'Добавлено в избранное' : 'Убрано из избранного');
  render(outlet, { refresh: true });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); $('sug').hidden = true; } });
window.addEventListener('hashchange', () => { closeMenu(); $('sug').hidden = true; render(outlet); });
$('city').addEventListener('change', (e) => storage.write('city', e.target.value));

// Поиск: подсказки в реальном времени и страница результатов
const q = $('q'), sug = $('sug');
const showSug = debounce(async () => {
  const v = q.value.trim(); $('qx').hidden = !v; if (v.length < 2) { sug.hidden = true; return; }
  const r = await repo.searchProducts(v, 6); if (q.value.trim() !== v) return;
  sug.innerHTML = r.ok && r.data.length ? r.data.map((p) => `<a href="#/product/${p.slug}"><span>${esc(p.name)}</span><span>${fmt(p.price)}</span></a>`).join('') + `<a href="#/search?q=${encodeURIComponent(v)}"><b>Все результаты →</b></a>` : `<a href="#/search?q=${encodeURIComponent(v)}">Ничего не найдено по запросу «${esc(v)}»</a>`;
  sug.hidden = false;
});
q.addEventListener('input', showSug);
$('qx').addEventListener('click', () => { q.value = ''; $('qx').hidden = true; sug.hidden = true; q.focus(); });
$('search').addEventListener('submit', (e) => { e.preventDefault(); const v = q.value.trim(); if (v) location.hash = '#/search?q=' + encodeURIComponent(v); sug.hidden = true; });

// Фильтры каталога (работают совместно)
document.addEventListener('change', (e) => {
  const f = e.target.closest('form[data-filters]'); if (f) {
    const p = new URLSearchParams(); new FormData(f).forEach((v, k) => v && p.set(k, v)); location.hash = '#/catalog?' + p;
  }
  if (e.target.name === 'method' && $('addr')) { // переключение доставка/самовывоз
    const d = e.target.value === 'delivery', fee = d ? +$('s-del').dataset.fee : 0;
    $('addr').hidden = !d; $('s-del').textContent = fee ? fmt(fee) : 'бесплатно'; $('s-tot').textContent = fmt(+$('s-tot').dataset.sub + fee);
  }
});
document.addEventListener('submit', async (e) => {
  const f = e.target;
  if (f.id === 'news') {
    e.preventDefault(); const v = f.email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(v)) { $('news-er').textContent = 'Введите корректный email'; return; }
    storage.write('subscribers', [...storage.read('subscribers', Array.isArray, []), v]); f.reset(); $('news-er').textContent = ''; toast('Вы подписаны (демо: сохранено только в браузере)');
  }
  if (f.id === 'checkout') {
    e.preventDefault(); const d = Object.fromEntries(new FormData(f)); const btn = $('submit'); btn.disabled = true; btn.textContent = 'Оформляем…';
    ['name', 'phone', 'city', 'street'].forEach((n) => { const el = $('e-' + n); if (el) el.textContent = ''; f[n]?.removeAttribute('aria-invalid'); });
    const r = await placeOrder(d); btn.disabled = false; btn.textContent = 'Подтвердить заказ';
    if (r.ok) { storage.write('city', d.city || city); location.hash = '#/success/' + r.data.number; return; }
    if (r.error.details) Object.entries(r.error.details).forEach(([n, m]) => { $('e-' + n).textContent = m; f[n].setAttribute('aria-invalid', 'true'); f[n].focus(); });
    else $('form-er').textContent = r.error.message;
  }
});
render(outlet);
