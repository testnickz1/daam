import { storage } from '../storage/storage.js';
let ids = storage.read('favorites', (a) => Array.isArray(a) && a.every((x) => typeof x === 'string'), []);
const subs = new Set();
const emit = () => { storage.write('favorites', ids); subs.forEach((f) => f()); };
export const favorites = {
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  has: (id) => ids.includes(id), ids: () => [...ids], count: () => ids.length,
  toggle(id) { ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]; emit(); return ids.includes(id); },
};
