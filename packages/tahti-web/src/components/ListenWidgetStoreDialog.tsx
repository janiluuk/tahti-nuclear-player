import { Blocks, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button, Dialog } from '@tahti-player/ui';

import { DiscoWidgetManagerPanel } from './disco-widgets/DiscoWidgetManagerPanel';

export function ListenWidgetStoreDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => setIsOpen(true)}
        aria-label="Add Listen widgets"
        title="Add Listen widgets"
      >
        <Plus size={17} aria-hidden />
        <Blocks size={15} aria-hidden />
      </Button>
      <Dialog.Root isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Title>Add Listen widgets</Dialog.Title>
        <Dialog.Description>
          Add widgets from the Tahti add-on store, then configure their order
          and visibility below.
        </Dialog.Description>
        <DiscoWidgetManagerPanel scope="LISTENER" compact />
      </Dialog.Root>
    </>
  );
}
