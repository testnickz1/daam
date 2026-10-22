import { storage } from '../storage/storage.js';
import { cart } from './cartService.js';
import { config } from '../config/index.js';
import { api } from '../api/client.js';
import { ok, fail, guard } from '../domain/models.js';

export function validateOrderForm(f) {
  const e = {};
  if ((f.name || '').trim().length < 2) e.name = 'Введите имя (минимум 2 символа)';
  if (!/^\+?[\d\s()-]{9,}$/.test((f.phone || '').trim())) e.phone = 'Введите корректный телефон';
  if (f.method === 'delivery') {
    if ((f.city || '').trim().length < 2) e.city = 'Укажите город';
    if ((f.street || '').trim().length < 3) e.street = 'Укажите улицу и номер дома';
  }
  return e;
}
const loadOrders = () => storage.read('orders', Array.isArray, []);

export async function placeOrder(form) {
  return guard(async () => {
    const errors = validateOrderForm(form);
    if (Object.keys(errors).length) return fail('VALIDATION', 'Проверьте поля формы', errors);
    const s = await cart.getSummary(form.method); if (!s.ok) return s;
    if (!s.data.lines.length) return fail('EMPTY_CART', 'Корзина пуста');
    const order = {
      number: 'DAAM-' + Date.now().toString(36).toUpperCase().slice(-6), createdAt: new Date().toISOString(), method: form.method, payment: form.payment,
      customer: { name: form.name.trim(), phone: form.phone.trim(), city: form.city?.trim() || '', street: form.street?.trim() || '', apartment: form.apartment?.trim() || '', comment: form.comment?.trim() || '' },
      items: s.data.lines.map((l) => ({ productId: l.product.id, name: l.product.name, price: l.product.price, qty: l.qty })),
      subtotal: s.data.subtotal, delivery: s.data.delivery, total: s.data.total, demo: config.dataSource === 'mock',
    };
    if (config.dataSource === 'api') { const r = await api.post('/orders', order); if (!r.ok) return r; }
    else storage.write('orders', [...loadOrders(), order]);   // демо: заказ хранится только в этом браузере
    cart.clear();
    return ok(order);
  });
}
export const getOrderByNumber = (n) => loadOrders().find((o) => o.number === n) ?? null;
