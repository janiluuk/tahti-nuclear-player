const STORAGE_KEY = 'tahti_listener_fp';

export function listenerFingerprint(): string {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return existing;
    }
    const created = `fp_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return `fp_anon_${Date.now()}`;
  }
}
