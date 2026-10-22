// Проверка слоя данных и сервисов в Node (без браузера): npm test
const mem = {}; globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; }, removeItem: (k) => { delete mem[k]; } };
mem['daam:cart'] = '{broken'; // повреждённые данные не должны ронять приложение
const { repo } = await import('../src/data/repositories/index.js');
const { cart } = await import('../src/services/cartService.js');
const { placeOrder, getOrderByNumber } = await import('../src/services/orderService.js');
const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } console.log('ok  ', m); };
const all = (await repo.getProducts()).data;
assert(all.length >= 60, `каталог: ${all.length} товаров`);
assert(new Set(all.map((p) => p.slug)).size === all.length, 'slug уникальны');
assert((await repo.searchProducts('МОЛОКО')).data.length >= 1, 'поиск без учёта регистра');
assert((await repo.getProducts({ categoryId: 'dairy', onlyDiscount: true, minPrice: 100 })).data.every((p) => p.oldPrice && p.price >= 100), 'фильтры работают совместно');
assert(cart.count() === 0, 'повреждённое хранилище → пустая корзина');
cart.add('p001', 2); cart.add('p006');
let s = (await cart.getSummary()).data; assert(s.subtotal === 190 * 2 + 110 && s.delivery === 150, 'сумма и доставка');
assert((await cart.getSummary('pickup')).data.delivery === 0, 'самовывоз без доставки');
const bad = await placeOrder({ name: '', phone: '1', method: 'delivery', payment: 'cash' });
assert(!bad.ok && bad.error.details.name && bad.error.details.phone, 'валидация формы');
const res = await placeOrder({ name: 'Айдар', phone: '+996 555 000 000', city: 'Бишкек', street: 'Демо 1', method: 'delivery', payment: 'cash' });
assert(res.ok && getOrderByNumber(res.data.number)?.demo === true && cart.count() === 0, 'заказ создан локально, корзина очищена');
console.log('Все проверки пройдены');
