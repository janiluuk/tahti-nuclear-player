/** Shared mock state for internet radio presets — used by both the admin
 * management API (admin.ts) and the public Listen-page feed (client.ts) so
 * toggling a preset "enabled" in the admin mock UI is actually reflected on
 * the Listen page while testing in VITE_FORCE_MOCK mode. */

export type MockInternetRadioPreset = {
  id: string;
  name: string;
  genre: string | null;
  description: string | null;
  iconUrl: string | null;
  programmingUrl: string | null;
  streamUrl: string | null;
  enabled: boolean;
};

const STORAGE_KEY = 'tahti-web-internet-radio-presets';

const INITIAL_PRESETS: MockInternetRadioPreset[] = [
  {
    id: 'preset-radio-helsinki',
    name: 'Radio Helsinki',
    genre: 'World',
    description: null,
    iconUrl: '/radio-logos/radio-helsinki.png',
    programmingUrl: null,
    streamUrl: null,
    enabled: false,
  },
];

function cloneInitialPresets(): MockInternetRadioPreset[] {
  return INITIAL_PRESETS.map((preset) => ({ ...preset }));
}

function readStoredPresets(): MockInternetRadioPreset[] | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed.filter((item): item is MockInternetRadioPreset => {
      return (
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as MockInternetRadioPreset).id === 'string' &&
        typeof (item as MockInternetRadioPreset).name === 'string'
      );
    });
  } catch {
    return null;
  }
}

function persistPresets(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

let presets: MockInternetRadioPreset[] =
  readStoredPresets() ?? cloneInitialPresets();

export function listMockInternetRadioPresets(): MockInternetRadioPreset[] {
  return presets;
}

export function resetMockInternetRadioPresets(): void {
  presets = cloneInitialPresets();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function listEnabledMockInternetRadioPresets(): MockInternetRadioPreset[] {
  return presets.filter((p) => p.enabled);
}

export function createMockInternetRadioPreset(
  input: Omit<MockInternetRadioPreset, 'id' | 'enabled'> & {
    enabled?: boolean;
  },
): MockInternetRadioPreset {
  const preset: MockInternetRadioPreset = {
    id: `preset-${Date.now()}`,
    enabled: false,
    ...input,
  };
  presets = [preset, ...presets];
  persistPresets();
  return preset;
}

export function patchMockInternetRadioPreset(
  id: string,
  patch: Partial<Omit<MockInternetRadioPreset, 'id'>>,
): MockInternetRadioPreset | null {
  const existing = presets.find((p) => p.id === id);
  if (!existing) {
    return null;
  }
  const updated = { ...existing, ...patch };
  presets = presets.map((p) => (p.id === id ? updated : p));
  persistPresets();
  return updated;
}

export function deleteMockInternetRadioPreset(id: string): void {
  presets = presets.filter((p) => p.id !== id);
  persistPresets();
}
