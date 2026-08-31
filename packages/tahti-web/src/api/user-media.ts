import type { FetchMeta } from './client';

const apiBase = () => {
  if (import.meta.env.VITE_TAHTI_API_URL?.startsWith('http')) {
    return import.meta.env.VITE_TAHTI_API_URL.replace(/\/$/, '');
  }
  return '/tahti-api';
};

export type UserMediaFile = {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
};

let mockMedia: UserMediaFile[] = [];

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`${path} → ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchUserMedia(): Promise<{
  data: UserMediaFile[];
  meta: FetchMeta;
}> {
  if (import.meta.env.VITE_FORCE_MOCK === '1') {
    return { data: [...mockMedia], meta: { source: 'mock' } };
  }
  try {
    const data = await requestJson<{ files: UserMediaFile[] }>('/api/me/media');
    return { data: data.files ?? [], meta: { source: 'api' } };
  } catch (error) {
    return {
      data: [],
      meta: {
        source: 'mock',
        reason: error instanceof Error ? error.message : 'Media unavailable',
      },
    };
  }
}

export async function uploadUserMediaFile(
  file: File,
): Promise<{ ok: true; data: UserMediaFile } | { ok: false; error: string }> {
  if (import.meta.env.VITE_FORCE_MOCK === '1') {
    const data: UserMediaFile = {
      id: `media-${Date.now()}-${file.name}`,
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      url: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    };
    mockMedia = [data, ...mockMedia];
    return { ok: true, data };
  }
  try {
    const contentType = ['image/jpeg', 'image/png', 'image/webp'].includes(
      file.type,
    )
      ? file.type
      : 'image/png';
    const prepared = await requestJson<{
      uploadKey: string;
      uploadUrl: string;
    }>('/api/me/media/prepare', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, contentType }),
    });
    const upload = await fetch(prepared.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
    });
    if (!upload.ok) {
      throw new Error(`Upload failed (${upload.status})`);
    }
    const data = await requestJson<UserMediaFile>('/api/me/media/complete', {
      method: 'POST',
      body: JSON.stringify({
        uploadKey: prepared.uploadKey,
        filename: file.name,
        contentType,
        sizeBytes: file.size,
      }),
    });
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Media upload failed',
    };
  }
}

export async function deleteUserMedia(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (import.meta.env.VITE_FORCE_MOCK === '1') {
    mockMedia = mockMedia.filter((file) => file.id !== id);
    return { ok: true };
  }
  try {
    await requestJson<void>(`/api/me/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Media deletion failed',
    };
  }
}
