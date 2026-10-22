// Единственный модуль, который обращается к localStorage. Данные версионируются и валидируются.
const NS = 'daam:', VERSION = 1;
export const storage = {
  read(key, validate, fallback) {
    try {
      const raw = localStorage.getItem(NS + key); if (!raw) return fallback;
      const o = JSON.parse(raw);
      return o && o.v === VERSION && validate(o.data) ? o.data : fallback; // повреждённые/устаревшие данные игнорируются
    } catch { return fallback; }
  },
  write(key, data) { try { localStorage.setItem(NS + key, JSON.stringify({ v: VERSION, data })); return true; } catch { return false; } },
  remove(key) { try { localStorage.removeItem(NS + key); } catch { /* ignore */ } },
};
