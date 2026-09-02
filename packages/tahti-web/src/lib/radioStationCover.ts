import {
  fetchAdminInternetRadioPresets,
  patchAdminInternetRadioPreset,
} from '../api/admin';
import { isForceMock } from '../api/mode';
import type { AuthUser } from '../api/types';
import { uploadUserMediaFile } from '../api/user-media';
import { RADIO_STATIONS } from '../content/radioStations';
import { useListenerWidgetsStore } from '../stores/listenerWidgetsStore';
import { hasAccountRole } from './accountRoles';

export function canEditRadioStationCover(
  user: AuthUser | null | undefined,
): boolean {
  return hasAccountRole(user, 'BOARD');
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Could not read image'));
    reader.readAsDataURL(file);
  });
}

export async function uploadRadioCoverFile(
  file: File,
): Promise<{ ok: true; data: { url: string } } | { ok: false; error: string }> {
  if (isForceMock()) {
    try {
      const url = await fileToDataUrl(file);
      return { ok: true, data: { url } };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Could not read image',
      };
    }
  }
  return uploadUserMediaFile(file);
}

export async function persistRadioStationCover(input: {
  catalogStationId?: string;
  presetId?: string;
  stationName: string;
  logoUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const catalogStationId =
    input.catalogStationId ??
    RADIO_STATIONS.find((station) => station.name === input.stationName)?.id;
  let wroteLocal = false;
  if (catalogStationId) {
    useListenerWidgetsStore.getState().updateStation(catalogStationId, {
      logoUrl: input.logoUrl,
    });
    wroteLocal = true;
  }

  const presets = await fetchAdminInternetRadioPresets();
  const presetId =
    input.presetId ??
    presets.data.find((preset) => preset.name === input.stationName)?.id;
  if (!presetId) {
    return wroteLocal
      ? { ok: true }
      : { ok: false, error: 'Station not found' };
  }

  const result = await patchAdminInternetRadioPreset(presetId, {
    iconUrl: input.logoUrl,
  });
  if (!result.ok && !wroteLocal) {
    return result;
  }
  return { ok: true };
}
