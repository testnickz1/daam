import { repo } from '../../data/repositories/index.js';
import { esc } from '../../domain/utils.js';
import { img, tags, price, buyControl, favBtn, productGrid, section, empty } from '../components/shared.js';

export async function productPage({ args }) {
  const r = await repo.getProductBySlug(args[0]);
  if (!r.ok) return { title: 'Товар не найден', html: `<div class="wrap">${empty('🤷', 'Товар не найден', 'Возможно, ссылка устарела.', '#/catalog', 'В каталог')}</div>` };
  const p = r.data, [rel, cat] = await Promise.all([repo.getRelatedProducts(p.id, 4), repo.getCategoryById(p.categoryId)]);
  const html = `<div class="wrap"><nav class="crumbs"><a href="#/">Главная</a> / <a href="#/category/${p.categoryId}">${cat.ok ? cat.data.name : 'Каталог'}</a> / ${esc(p.name)}</nav>
  <div class="pd"><div class="ph" style="position:relative">${img(p)}<span class="tags">${tags(p)}</span></div>
  <div><h1 style="margin-top:0">${esc(p.name)}</h1><div class="un">${esc(p.unit)}</div>${price(p)}<p>${p.inStock ? '✅ В наличии (демо)' : '⛔ Нет в наличии'}</p>
  <div style="display:flex;gap:10px;align-items:center;max-width:360px">${buyControl(p)}<div style="position:relative;width:44px;height:44px">${favBtn(p).replace('top:14px', '')}</div></div>
  <h3>Описание</h3><p>${esc(p.description)}</p><h3>Характеристики</h3><table class="specs">${Object.entries(p.specs).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div></div>
  ${rel.ok && rel.data.length ? section('Похожие товары', '', productGrid(rel.data)) : ''}</div>`;
  return { title: p.name, html };
}
