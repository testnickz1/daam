// API-клиент для будущего backend. Сейчас используется только при config.dataSource === 'api'.
import { config } from '../config/index.js';
import { ok, fail } from '../domain/models.js';

export async function request(method, path, body) {
  try {
    const res = await fetch(config.apiBaseUrl + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) return fail('HTTP_' + res.status, 'Сервер вернул ошибку');
    return ok(await res.json());
  } catch { return fail('NETWORK', 'Нет соединения с сервером'); }
}
export const api = { get: (p) => request('GET', p), post: (p, b) => request('POST', p, b) };
export const qs = (o) => { const p = new URLSearchParams(); Object.entries(o || {}).forEach(([k, v]) => v != null && v !== '' && p.set(k, v)); const s = p.toString(); return s ? '?' + s : ''; };
