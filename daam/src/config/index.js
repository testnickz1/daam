// Единая конфигурация. Для перехода на backend: dataSource -> 'api' и укажите apiBaseUrl.
export const config = {
  dataSource: 'mock',            // 'mock' | 'api'
  apiBaseUrl: '/api',
  currency: 'сом',
  delivery: { fee: 150, freeFrom: 2000, minOrder: 0 },   // демонстрационные правила
  cities: ['Бишкек', 'Кант', 'Ош', 'Каракол'],            // демонстрационный список
};
