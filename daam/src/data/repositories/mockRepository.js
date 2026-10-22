// Временная реализация на локальных данных. Контракт совпадает с apiRepository.
import { ok, fail, guard } from '../../domain/models.js';
import { norm } from '../../domain/utils.js';
import { PRODUCTS } from '../mock/products.js';
import { CATEGORIES } from '../mock/categories.js';

const delay = (ms = 60) => new Promise((r) => setTimeout(r, ms)); // имитация сетевой задержки
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? '';
const SORTS = { popular: (a, b) => b.popularity - a.popularity, 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price };

function applyFilters(list, f = {}) {
  const tokens = norm(f.query).split(/\s+/).filter(Boolean);
  return list
    .filter((p) => !f.categoryId || p.categoryId === f.categoryId)
    .filter((p) => !f.label || p.labels.includes(f.label))
    .filter((p) => !f.onlyDiscount || p.oldPrice)
    .filter((p) => f.minPrice == null || f.minPrice === '' || p.price >= Number(f.minPrice))
    .filter((p) => f.maxPrice == null || f.maxPrice === '' || p.price <= Number(f.maxPrice))
    .filter((p) => { const hay = norm(p.name + ' ' + catName(p.categoryId)); return tokens.every((t) => hay.includes(t)); })
    .sort(SORTS[f.sort] ?? SORTS.popular);
}

export const mockRepository = {
  getProducts: (filters) => guard(async () => { await delay(); return ok(applyFilters(PRODUCTS, filters)); }),
  getProductById: (id) => guard(async () => { await delay(); const p = PRODUCTS.find((x) => x.id === id); return p ? ok(p) : fail('NOT_FOUND', 'Товар не найден'); }),
  getProductBySlug: (slug) => guard(async () => { await delay(); const p = PRODUCTS.find((x) => x.slug === slug); return p ? ok(p) : fail('NOT_FOUND', 'Товар не найден'); }),
  getProductsByIds: (ids) => guard(async () => { await delay(20); return ok(PRODUCTS.filter((p) => ids.includes(p.id))); }),
  getProductsByCategory: (categoryId) => mockRepository.getProducts({ categoryId }),
  searchProducts: (query, limit) => guard(async () => { const r = applyFilters(PRODUCTS, { query }); return ok(limit ? r.slice(0, limit) : r); }),
  getPopularProducts: (limit = 6) => guard(async () => { await delay(); return ok(applyFilters(PRODUCTS, { sort: 'popular' }).filter((p) => p.popular).slice(0, limit)); }),
  getNewProducts: (limit = 6) => guard(async () => { await delay(); return ok(PRODUCTS.filter((p) => p.labels.includes('new')).slice(0, limit)); }),
  getDiscountedProducts: (limit = 6) => guard(async () => { await delay(); return ok(PRODUCTS.filter((p) => p.oldPrice).slice(0, limit)); }),
  getRelatedProducts: (id, limit = 4) => guard(async () => {
    await delay(); const base = PRODUCTS.find((p) => p.id === id); if (!base) return ok([]);
    const same = PRODUCTS.filter((p) => p.categoryId === base.categoryId && p.id !== id).sort(SORTS.popular);
    const rest = PRODUCTS.filter((p) => p.categoryId !== base.categoryId && p.popular);
    return ok([...same, ...rest].slice(0, limit));
  }),
  getCategories: () => guard(async () => { await delay(20); return ok(CATEGORIES); }),
  getCategoryById: (id) => guard(async () => { const c = CATEGORIES.find((x) => x.id === id); return c ? ok(c) : fail('NOT_FOUND', 'Категория не найдена'); }),
};
