export const Storage = {
  set(key: string, value: string) {
    try { sessionStorage.setItem(key, value); } catch {}
  },
  get(key: string): string | null {
    try { return sessionStorage.getItem(key); } catch { return null; }
  },
  remove(key: string) {
    try { sessionStorage.removeItem(key); } catch {}
  }
};

export const Local = {
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch {}
  },
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  remove(key: string) {
    try { localStorage.removeItem(key); } catch {}
  }
};
