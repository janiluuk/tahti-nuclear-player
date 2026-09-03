import { useEffect } from 'react';

import { useAuthStore } from '../stores/authStore';
import {
  startNotificationInboxPolling,
  useNotificationInboxStore,
} from '../stores/notificationInboxStore';

export function NotificationToasts() {
  const userId = useAuthStore((s) => s.user?.id);
  const reset = useNotificationInboxStore((s) => s.reset);

  useEffect(() => {
    if (!userId) {
      reset();
      return;
    }
    return startNotificationInboxPolling();
  }, [reset, userId]);

  return null;
}
