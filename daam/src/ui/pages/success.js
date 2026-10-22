import { getOrderByNumber } from '../../services/orderService.js';
import { esc, fmt } from '../../domain/utils.js';
import { empty } from '../components/shared.js';
export async function successPage({ args }) {
  const o = getOrderByNumber(args[0]); if (!o) return { title: 'Заказ', html: `<div class="wrap">${empty('📦', 'Заказ не найден', 'Он мог быть создан в другом браузере.', '#/', 'На главную')}</div>` };
  return { title: 'Заказ оформлен', html: `<div class="wrap" style="max-width:720px"><div class="empty"><b>🎉</b><h2>Заказ ${esc(o.number)} оформлен</h2></div><div class="notice"><b>Это демонстрационный заказ.</b> Он сохранён только в вашем браузере и не отправлен продавцу. Оплата не списывалась.</div>
  <div class="box">${o.items.map((i) => `<div class="sumr"><span>${esc(i.name)} × ${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`).join('')}<div class="sumr"><span>Доставка</span><span>${o.delivery ? fmt(o.delivery) : 'бесплатно'}</span></div><div class="sumr t"><span>Итого</span><span>${fmt(o.total)}</span></div>
  <p>${o.method === 'pickup' ? 'Самовывоз' : `Доставка: ${esc(o.customer.city)}, ${esc(o.customer.street)}${o.customer.apartment ? ', кв. ' + esc(o.customer.apartment) : ''}`}<br>Оплата: ${o.payment === 'cash' ? 'наличными' : 'картой'} при получении<br>Получатель: ${esc(o.customer.name)}, ${esc(o.customer.phone)}</p></div><p style="text-align:center"><a class="btn" href="#/catalog">Продолжить покупки</a></p></div>` };
}
