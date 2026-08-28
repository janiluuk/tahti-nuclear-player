import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { PageLoading } from '../../components/PageStates';
import { hasAccountRole } from '../../lib/accountRoles';
import { useAuthStore } from '../../stores/authStore';
import { useChannelSetupModalStore } from '../../stores/channelSetupModalStore';

export function StudioSetupChannelRedirect() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const open = useChannelSetupModalStore((state) => state.open);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!hasAccountRole(user, 'ARTIST') && !hasAccountRole(user, 'BOARD')) {
      void navigate({ to: '/' });
      return;
    }
    open();
    void navigate({ to: '/studio' });
  }, [hydrated, navigate, open, user]);

  return <PageLoading label="Opening channel setup…" />;
}
