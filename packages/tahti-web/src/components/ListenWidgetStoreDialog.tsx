import { Blocks, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button, Dialog, Tooltip } from '@tahti-player/ui';

import { DiscoWidgetManagerPanel } from './disco-widgets/DiscoWidgetManagerPanel';
import { ListenAddonsPanel } from './ListenAddonsPanel';

export function ListenWidgetStoreDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip content="Add Listen widgets" side="top">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setIsOpen(true)}
          aria-label="Add Listen widgets"
        >
          <Plus size={17} aria-hidden />
          <Blocks size={15} aria-hidden />
        </Button>
      </Tooltip>
      <Dialog.Root
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="max-w-2xl"
      >
        <Dialog.Title>Add Listen widgets</Dialog.Title>
        <Dialog.Description>
          Install the same Listen add-ons as Settings → Add-ons, then configure
          visibility and order.
        </Dialog.Description>
        <div className="mt-4 flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Listen add-ons
            </h3>
            <ListenAddonsPanel initialTab="available" compact />
          </section>
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Discovery widgets
            </h3>
            <DiscoWidgetManagerPanel scope="LISTENER" compact />
          </section>
        </div>
      </Dialog.Root>
    </>
  );
}
