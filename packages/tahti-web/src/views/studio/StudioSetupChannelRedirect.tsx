import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { PageLoading } from '../../components/PageStates';
import { useChannelSetupModalStore } from '../../stores/channelSetupModalStore';

export function StudioSetupChannelRedirect() {
  const navigate = useNavigate();
  const open = useChannelSetupModalStore((state) => state.open);

  useEffect(() => {
    open();
    void navigate({ to: '/studio' });
  }, [navigate, open]);

  return <PageLoading label="Opening channel setup…" />;
}
