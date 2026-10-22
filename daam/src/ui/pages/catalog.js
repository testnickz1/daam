import { repo } from '../../data/repositories/index.js';
import { esc } from '../../domain/utils.js';
import { productGrid, empty, errorState } from '../components/shared.js';

const SORTS = [['popular', 'По популярности'], ['price-asc', 'Сначала дешёвые'], ['price-desc', 'Сначала дорогие']];
// Страница каталога: используется для /catalog, /category/:id и /search
export async function catalogPage({ params, args, mode }) {
  const f = { categoryId: mode === 'category' ? args[0] : params.get('cat') || '', query: params.get('q') || '', minPrice: params.get('min') || '', maxPrice: params.get('max') || '', onlyDiscount: params.get('discount') === '1', label: params.get('label') || '', sort: params.get('sort') || 'popular' };
  const [cats, res] = await Promise.all([repo.getCategories(), repo.getProducts(f)]);
  if (!cats.ok || !res.ok) return { title: 'Каталог', html: errorState(res.error?.message || cats.error?.message) };
  const cat = cats.data.find((c) => c.id === f.categoryId);
  const title = f.query ? `Результаты поиска: «${esc(f.query)}»` : cat ? cat.name : f.label === 'new' ? 'Новинки' : f.onlyDiscount ? 'Выгодные предложения' : 'Каталог';
  const form = `<form class="fl" data-filters aria-label="Фильтры"><input type="hidden" name="q" value="${esc(f.query)}"><input type="hidden" name="label" value="${esc(f.label)}">
  <label>Категория<select name="cat"><option value="">Все категории</option>${cats.data.map((c) => `<option value="${c.id}" ${c.id === f.categoryId ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
  <label>Цена от, сом<input name="min" type="number" min="0" value="${esc(f.minPrice)}"></label><label>Цена до, сом<input name="max" type="number" min="0" value="${esc(f.maxPrice)}"></label>
  <label class="opt"><input type="checkbox" name="discount" value="1" ${f.onlyDiscount ? 'checked' : ''}>Только со скидкой</label>
  <label>Сортировка<select name="sort">${SORTS.map(([v, t]) => `<option value="${v}" ${v === f.sort ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
  <a class="btn out" href="#/catalog">Сбросить фильтры</a></form>`;
  const body = res.data.length ? productGrid(res.data) : empty('🔎', 'Ничего не найдено', 'Измените запрос или сбросьте фильтры.', '#/catalog', 'Сбросить фильтры');
  return { title, html: `<div class="wrap"><nav class="crumbs"><a href="#/">Главная</a> / ${title}</nav><h2 style="margin-top:0">${title}<span style="font-size:15px;color:var(--tx2);font-weight:400" aria-live="polite">Найдено: ${res.data.length}</span></h2><div class="lay">${form}<div>${body}</div></div></div>` };
}
