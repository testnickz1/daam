import { repo } from '../../data/repositories/index.js';
import { favorites } from '../../services/favoritesService.js';
import { productGrid, empty, errorState } from '../components/shared.js';
export async function favoritesPage() {
  const ids = favorites.ids(); if (!ids.length) return { title: 'Избранное', html: `<div class="wrap">${empty('♡', 'В избранном пока пусто', 'Нажимайте на сердечко у товаров, чтобы сохранить их здесь.', '#/catalog', 'Перейти к покупкам')}</div>` };
  const r = await repo.getProductsByIds(ids); if (!r.ok) return { title: 'Избранное', html: errorState(r.error.message) };
  return { title: 'Избранное', html: `<div class="wrap"><h2>Избранное <span style="font-size:15px;color:var(--tx2)">${r.data.length} шт.</span></h2>${productGrid(r.data)}</div>` };
}
