import { repo } from '../../data/repositories/index.js';
import { productGrid, section, errorState } from '../components/shared.js';

export async function homePage() {
  const [cats, pop, nw, deals, ready, healthy] = await Promise.all([repo.getCategories(), repo.getPopularProducts(6), repo.getNewProducts(6), repo.getDiscountedProducts(6), repo.getProductsByCategory('ready'), repo.getProductsByCategory('snacks')]);
  if (![cats, pop, nw, deals, ready, healthy].every((r) => r.ok)) return { title: 'DAAM', html: errorState('Каталог временно недоступен') };
  const html = `
  <div class="wrap"><section class="hero"><div><h1>Вкусное начинается здесь</h1><p>Свежие продукты на каждый день — всё любимое в одном месте.</p>
    <div class="cta"><a class="btn" href="#/catalog">Перейти в каталог</a><a class="btn out" href="#/catalog?label=new">Смотреть новинки</a></div></div>
    <div class="mosaic" aria-hidden="true"><span>🥑</span><span>🥛</span><span>🍞</span><span>🍅</span><span>🧀</span><span>🍓</span></div></section>
  ${section('Категории', '#/catalog', `<div class="cats">${cats.data.map((c) => `<a href="#/category/${c.id}"><b>${c.icon}</b>${c.name}</a>`).join('')}</div>`)}
  ${section('Популярные товары', '#/catalog?sort=popular', productGrid(pop.data))}
  ${section('Новинки', '#/catalog?label=new', productGrid(nw.data))}
  ${section('Выгодные предложения', '#/catalog?discount=1', productGrid(deals.data))}
  ${section('Готовая еда', '#/category/ready', productGrid(ready.data.slice(0, 6)))}
  ${section('Полезные продукты', '#/category/snacks', productGrid(healthy.data.slice(0, 6)))}
  <h2>Преимущества DAAM</h2><div class="adv"><div><b>🥬</b><h3>Свежие продукты</h3>Ассортимент на каждый день.</div><div><b>✅</b><h3>Контроль качества</h3>Принципы контроля будут описаны с реальными поставщиками.</div><div><b>🚚</b><h3>Удобная доставка</h3>Курьером или самовывоз.</div></div>
  <h2>Доставка</h2><div class="box">Доставка по городу — 150 сом, бесплатно от 2 000 сом (демонстрационные условия). <a href="#/delivery" style="color:var(--g);font-weight:600">Подробнее →</a></div>
  <div class="news"><h2 style="margin:0 0 10px">Новости и специальные предложения</h2><form id="news" novalidate><input type="email" name="email" placeholder="Ваш email" aria-label="Email"><button class="btn">Подписаться</button></form><div class="er" id="news-er" role="alert"></div></div></div>`;
  return { title: 'Главная', html };
}
