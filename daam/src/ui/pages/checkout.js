import { cart } from '../../services/cartService.js';
import { config } from '../../config/index.js';
import { storage } from '../../storage/storage.js';
import { esc, fmt } from '../../domain/utils.js';
import { empty, errorState } from '../components/shared.js';

const fld = (n, label, type = 'text', req = true, extra = '') => `<div class="fld"><label for="f-${n}">${label}${req ? ' *' : ''}</label><input id="f-${n}" name="${n}" type="${type}" ${extra} aria-describedby="e-${n}"><div class="er" id="e-${n}" role="alert"></div></div>`;
export async function checkoutPage() {
  const r = await cart.getSummary(); if (!r.ok) return { title: 'Оформление', html: errorState(r.error.message) };
  const s = r.data; if (!s.lines.length) return { title: 'Оформление', html: `<div class="wrap">${empty('🛒', 'Корзина пуста', 'Сначала добавьте товары.', '#/catalog', 'В каталог')}</div>` };
  const city = storage.read('city', (c) => typeof c === 'string', config.cities[0]);
  const fee = s.subtotal >= config.delivery.freeFrom ? 0 : config.delivery.fee;
  return { title: 'Оформление заказа', html: `<div class="wrap"><h2>Оформление заказа</h2><div class="notice">Демонстрационный режим: заказ сохранится только в вашем браузере и <b>не будет отправлен</b> продавцу. Оплата не производится.</div>
  <form id="checkout" class="two" novalidate><div class="box"><h3 style="margin-top:0">Получение</h3>
  <label class="opt"><input type="radio" name="method" value="delivery" checked>Доставка (${fee ? fmt(fee) : 'бесплатно'})</label><label class="opt"><input type="radio" name="method" value="pickup">Самовывоз (бесплатно, точка не задана — демо)</label>
  <h3>Контакты</h3><div class="rowf">${fld('name', 'Имя', 'text', true, 'autocomplete="name"')}${fld('phone', 'Телефон', 'tel', true, 'autocomplete="tel" placeholder="+996…"')}</div>
  <div id="addr"><h3>Адрес</h3>${fld('city', 'Город', 'text', true, `value="${esc(city)}"`)}${fld('street', 'Улица и номер дома')}${fld('apartment', 'Квартира', 'text', false)}</div>
  <div class="fld"><label for="f-comment">Комментарий</label><textarea id="f-comment" name="comment" rows="3"></textarea></div>
  <h3>Оплата</h3><label class="opt"><input type="radio" name="payment" value="cash" checked>Наличными при получении</label><label class="opt"><input type="radio" name="payment" value="card">Картой при получении</label></div>
  <aside class="box"><h3 style="margin-top:0">Ваш заказ</h3>${s.lines.map((l) => `<div class="sumr"><span>${esc(l.product.name)} × ${l.qty}</span><span>${fmt(l.product.price * l.qty)}</span></div>`).join('')}
  <div class="sumr"><span>Товаров: ${s.count}</span><span>${fmt(s.subtotal)}</span></div><div class="sumr"><span>Доставка</span><span id="s-del" data-fee="${fee}">${fee ? fmt(fee) : 'бесплатно'}</span></div>
  <div class="sumr t"><span>Итого</span><span id="s-tot" data-sub="${s.subtotal}">${fmt(s.subtotal + fee)}</span></div><div class="er" id="form-er" role="alert"></div><button class="btn" style="width:100%" id="submit">Подтвердить заказ</button></aside></form></div>` };
}
