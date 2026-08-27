import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, Dialog } from '@nuclearplayer/ui';

import { provisionChannel } from '../api/channel-provision';
import { useAuthStore } from '../stores/authStore';
import { useChannelSetupModalStore } from '../stores/channelSetupModalStore';

export function ChannelSetupDialog() {
  const isOpen = useChannelSetupModalStore((state) => state.isOpen);
  const close = useChannelSetupModalStore((state) => state.close);
  const user = useAuthStore((state) => state.user);
  const refresh = useAuthStore((state) => state.refresh);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.channel && isOpen) {
      close();
    }
  }, [close, isOpen, user?.channel]);

  const createChannel = async () => {
    setBusy(true);
    setError(null);
    const result = await provisionChannel();
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    await refresh();
    setBusy(false);
    close();
    toast.success('Channel created.');
  };

  if (user?.channel) {
    return null;
  }

  return (
    <Dialog.Root isOpen={isOpen} onClose={close} className="max-w-lg">
      <Dialog.Title>Create your channel</Dialog.Title>
      <Dialog.Description>
        Create {user?.username ?? 'your-name'}.tahti.live to unlock
        broadcasting, uploads, and your public channel designer.
      </Dialog.Description>
      {error ? (
        <p className="text-accent-red mt-4 text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <Dialog.Actions>
        <Button variant="text" size="sm" onClick={close} disabled={busy}>
          Cancel
        </Button>
        <Button onClick={() => void createChannel()} disabled={busy || !user}>
          {!busy ? <PlusIcon size={14} aria-hidden className="mr-1.5" /> : null}
          {busy
            ? 'Creating…'
            : `Create ${user?.username ?? 'your-name'}.tahti.live`}
        </Button>
      </Dialog.Actions>
    </Dialog.Root>
  );
}
