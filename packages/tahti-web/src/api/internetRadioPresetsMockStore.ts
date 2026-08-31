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

let presets: MockInternetRadioPreset[] = [
  {
    id: 'preset-radio-helsinki',
    name: 'Radio Helsinki',
    genre: 'World',
    description: null,
    iconUrl: 'https://www.streamurl.link/logos/JoiOnv3Q9An.webp',
    programmingUrl: null,
    streamUrl: null,
    enabled: false,
  },
];

export function listMockInternetRadioPresets(): MockInternetRadioPreset[] {
  return presets;
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
  return updated;
}

export function deleteMockInternetRadioPreset(id: string): void {
  presets = presets.filter((p) => p.id !== id);
}
