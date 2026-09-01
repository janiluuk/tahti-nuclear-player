import { useEffect, useState } from 'react';

import { Button } from '@tahti-player/ui';

import {
  dismissNotification,
  fetchStickyNotifications,
  type TahtiNotification,
} from '../api/notifications';
import { resolveDashboardRedirect } from '../lib/prodPathRedirects';
import { useAuthStore } from '../stores/authStore';

function spaHref(url: string | null): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith('/dashboard')) {
    const rest = url.replace(/^\/dashboard\/?/, '');
    return resolveDashboardRedirect(rest);
  }
  return url;
}

function StickyItem({
  notification,
  onDismiss,
}: {
  notification: TahtiNotification;
  onDismiss: (id: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const href = spaHref(notification.url);

  async function handleDismiss() {
    setPending(true);
    try {
      await dismissNotification(notification.id);
      onDismiss(notification.id);
    } catch {
      setPending(false);
    }
  }

  const body = (
    <>
      <strong>{notification.title}</strong>
      {notification.body ? (
        <span className="text-foreground-secondary">
          {' '}
          — {notification.body}
        </span>
      ) : null}
    </>
  );

  return (
    <div
      role="alert"
      className="border-accent-yellow/50 bg-accent-yellow/10 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-sm"
    >
      <div className="min-w-0 flex-1">
        {href ? (
          <a href={href} className="hover:underline">
            {body}
          </a>
        ) : (
          body
        )}
      </div>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => void handleDismiss()}
      >
        Dismiss
      </Button>
    </div>
  );
}

/** Must-dismiss notifications (theme review lifecycle, admin tests). Fetched
 * separately from the ordinary bell so opening it cannot silently clear them. */
export function StickyNotificationBanner() {
  const userId = useAuthStore((s) => s.user?.id);
  const [items, setItems] = useState<TahtiNotification[]>([]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    let cancelled = false;
    void fetchStickyNotifications().then((res) => {
      if (!cancelled) {
        setItems(res.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId || items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 px-3 pt-2 md:px-6">
      {items.map((notification) => (
        <StickyItem
          key={notification.id}
          notification={notification}
          onDismiss={(id) =>
            setItems((prev) => prev.filter((item) => item.id !== id))
          }
        />
      ))}
    </div>
  );
}
