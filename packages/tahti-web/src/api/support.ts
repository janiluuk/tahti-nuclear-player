import { isForceMock } from './mode';

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
  return { data: (await res.json()) as T, status: res.status };
}

export type SupportCategory =
  | 'ENGAGEMENT_DISPUTE'
  | 'TECHNICAL'
  | 'FINANCIAL'
  | 'OTHER';

export async function submitSupportContact(input: {
  subject: string;
  message: string;
  category?: SupportCategory;
  /** Required when the caller isn't logged in. */
  contactEmail?: string;
}): Promise<{ ok: true; ticketId: string } | { ok: false; error: string }> {
  if (forceMock()) {
    return { ok: true, ticketId: `mock-${Date.now()}` };
  }
  try {
    const { data } = await requestJson<{ ok: true; ticketId: string }>(
      '/api/support/contact',
      {
        method: 'POST',
        body: JSON.stringify({
          subject: input.subject,
          message: input.message,
          category: input.category ?? 'OTHER',
          contactEmail: input.contactEmail,
        }),
      },
    );
    return data;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not send message',
    };
  }
}
