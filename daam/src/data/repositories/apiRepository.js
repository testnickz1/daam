// Заготовка под будущий backend. Эндпоинты ориентировочные — согласуйте с реальным API.
import { api, qs } from '../../api/client.js';
export const apiRepository = {
  getProducts: (f) => api.get('/products' + qs(f)),
  getProductById: (id) => api.get('/products/' + encodeURIComponent(id)),
  getProductBySlug: (slug) => api.get('/products/by-slug/' + encodeURIComponent(slug)),
  getProductsByIds: (ids) => api.get('/products' + qs({ ids: ids.join(',') })),
  getProductsByCategory: (categoryId) => api.get('/products' + qs({ categoryId })),
  searchProducts: (query, limit) => api.get('/products/search' + qs({ q: query, limit })),
  getPopularProducts: (limit) => api.get('/products/popular' + qs({ limit })),
  getNewProducts: (limit) => api.get('/products/new' + qs({ limit })),
  getDiscountedProducts: (limit) => api.get('/products/discounted' + qs({ limit })),
  getRelatedProducts: (id, limit) => api.get(`/products/${encodeURIComponent(id)}/related` + qs({ limit })),
  getCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get('/categories/' + encodeURIComponent(id)),
};
