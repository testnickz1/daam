import { storage } from '../storage/storage.js';
import { repo } from '../data/repositories/index.js';
import { ok } from '../domain/models.js';
import { config } from '../config/index.js';

// В корзине хранятся только id и количество; цены всегда берутся через слой данных.
let items = storage.read('cart', (a) => Array.isArray(a) && a.every((i) => typeof i.id === 'string' && Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 99), []);
const subs = new Set();
const emit = () => { storage.write('cart', items); subs.forEach((f) => f()); };

export function calcTotals(lines, method = 'delivery') {
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const savings = lines.reduce((s, l) => s + ((l.product.oldPrice ?? l.product.price) - l.product.price) * l.qty, 0);
  const { fee, freeFrom } = config.delivery;
  const delivery = method === 'pickup' || subtotal === 0 || subtotal >= freeFrom ? 0 : fee;
  return { subtotal, savings, delivery, total: subtotal + delivery, count: lines.reduce((s, l) => s + l.qty, 0) };
}
export const cart = {
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  qtyOf: (id) => items.find((i) => i.id === id)?.qty ?? 0,
  count: () => items.reduce((s, i) => s + i.qty, 0),
  ids: () => items.map((i) => i.id),
  setQty(id, qty) {
    qty = Math.max(0, Math.min(99, Math.floor(qty)));
    items = qty === 0 ? items.filter((i) => i.id !== id) : items.some((i) => i.id === id) ? items.map((i) => (i.id === id ? { ...i, qty } : i)) : [...items, { id, qty }];
    emit();
  },
  add(id, n = 1) { this.setQty(id, this.qtyOf(id) + n); },
  remove(id) { this.setQty(id, 0); },
  clear() { items = []; emit(); },
  async getSummary(method = 'delivery') {
    const r = await repo.getProductsByIds(this.ids()); if (!r.ok) return r;
    const map = new Map(r.data.map((p) => [p.id, p]));
    const lines = items.filter((i) => map.has(i.id) && map.get(i.id).inStock).map((i) => ({ product: map.get(i.id), qty: i.qty }));
    if (lines.length !== items.length) { items = lines.map((l) => ({ id: l.product.id, qty: l.qty })); emit(); } // убираем устаревшие позиции
    return ok({ lines, ...calcTotals(lines, method) });
  },
};
