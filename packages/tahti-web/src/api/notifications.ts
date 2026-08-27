import {
  allowMockFallback,
  apiErrorMeta,
  failMeta,
  isForceMock,
  type FetchMeta,
} from './mode';

const forceMock = isForceMock;

const apiBase = () => {
  if (import.meta.env.VITE_TAHTI_API_URL?.startsWith('http')) {
    return import.meta.env.VITE_TAHTI_API_URL.replace(/\/$/, '');
  }
  return '/tahti-api';
};

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; status: number }> {
  const { headers: initHeaders, ...rest } = init ?? {};
  const res = await fetch(`${apiBase()}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...initHeaders,
    },
  });
  if (!res.ok) {
    let detail = `${path} → ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      if (body.error || body.message) {
        detail = body.error ?? body.message ?? detail;
      }
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  if (res.status === 204) {
    return { data: undefined as T, status: res.status };
  }
  return { data: (await res.json()) as T, status: res.status };
}

export type TahtiNotification = {
  id: string;
  type: string;
  actor: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  title: string;
  body: string | null;
  url: string | null;
  readAt: string | null;
  sticky: boolean;
  createdAt: string;
};

function emptyMeta(err: unknown): FetchMeta {
  return allowMockFallback() ? failMeta(err) : apiErrorMeta(err);
}

export async function fetchStickyNotifications(): Promise<{
  data: TahtiNotification[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return { data: [], meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' } };
  }
  try {
    const { data } = await requestJson<{
      notifications: TahtiNotification[];
    }>('/api/me/notifications?stickyOnly=true');
    return { data: data.notifications, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: emptyMeta(err) };
  }
}

export async function fetchNotifications(): Promise<{
  data: TahtiNotification[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: [
        {
          id: 'notification-mock-1',
          type: 'FAN',
          actor: {
            username: 'midnight-cartography',
            displayName: 'Midnight Cartography',
            avatarUrl: null,
          },
          title: 'New fan',
          body: 'Midnight Cartography started following your channel.',
          url: '/u/midnight-cartography',
          readAt: null,
          sticky: false,
          createdAt: new Date(Date.now() - 15 * 60_000).toISOString(),
        },
        {
          id: 'notification-mock-2',
          type: 'EVENT',
          actor: null,
          title: 'Your event is coming up',
          body: 'Album release show starts tomorrow at 18:00.',
          url: '/studio/events',
          readAt: null,
          sticky: false,
          createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
        },
      ],
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<{
      notifications: TahtiNotification[];
    }>('/api/me/notifications?limit=20');
    return { data: data.notifications, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: emptyMeta(err) };
  }
}

export async function dismissNotification(id: string): Promise<void> {
  if (forceMock()) {
    return;
  }
  await requestJson<void>(
    `/api/me/notifications/${encodeURIComponent(id)}/read`,
    { method: 'PATCH' },
  );
}
