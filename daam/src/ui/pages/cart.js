import { cart } from '../../services/cartService.js';
import { esc, fmt } from '../../domain/utils.js';
import { config } from '../../config/index.js';
import { img, empty, errorState, buyControl } from '../components/shared.js';

export async function cartPage() {
  const r = await cart.getSummary(); if (!r.ok) return { title: 'Корзина', html: errorState(r.error.message) };
  const s = r.data;
  if (!s.lines.length) return { title: 'Корзина', html: `<div class="wrap">${empty('🛒', 'Корзина пуста', 'Добавьте продукты из каталога.', '#/catalog', 'Перейти к покупкам')}</div>` };
  const lines = s.lines.map(({ product: p, qty }) => `<div class="line"><a class="ph" href="#/product/${p.slug}">${img(p, false)}</a><div><a class="nm" href="#/product/${p.slug}">${esc(p.name)}</a><div class="un">${esc(p.unit)} · ${fmt(p.price)}</div><button class="btn out" style="min-height:32px;padding:2px 10px;font-size:13px;margin-top:4px" data-act="remove" data-id="${p.id}">Удалить</button></div><div><b>${fmt(p.price * qty)}</b></div><div class="qty">${buyControl(p).match(/<div class="qty">([\s\S]*)<\/div>/)[1] ? `<button data-act="dec" data-id="${p.id}" aria-label="Уменьшить">−</button><span>${qty}</span><button data-act="inc" data-id="${p.id}" aria-label="Увеличить">+</button>` : ''}</div></div>`).join('');
  const left = config.delivery.freeFrom - s.subtotal;
  return { title: 'Корзина', html: `<div class="wrap"><h2>Корзина <button class="btn out" data-act="clear" style="font-size:14px;min-height:36px">Очистить корзину</button></h2><div class="two"><div class="box">${lines}</div>
  <aside class="box"><div class="sumr"><span>Товары (${s.count})</span><span>${fmt(s.subtotal)}</span></div>${s.savings ? `<div class="sumr" style="color:var(--sale)"><span>Экономия</span><span>${fmt(s.savings)}</span></div>` : ''}
  <div class="sumr"><span>Доставка</span><span>${s.delivery ? fmt(s.delivery) : 'бесплатно'}</span></div><div class="sumr t"><span>Итого</span><span>${fmt(s.total)}</span></div>
  ${left > 0 ? `<p class="un">До бесплатной доставки: ${fmt(left)}</p>` : ''}<a class="btn" style="width:100%" href="#/checkout">Оформить заказ</a></aside></div></div>` };
}
