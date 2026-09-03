import { Button, Dialog } from '@tahti-player/ui';

type Props = {
  isOpen: boolean;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Confirms before clearing the play queue — shared by the playerbar's
 * collapsed queue strip and the sidebar queue panel, so clearing always
 * asks first regardless of which surface it's triggered from. */
export function ClearQueueConfirmDialog({
  isOpen,
  count,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onCancel}>
      <Dialog.Title>Clear queue?</Dialog.Title>
      <Dialog.Description>
        This removes all {count} {count === 1 ? 'track' : 'tracks'} from your
        play queue. This can&apos;t be undone.
      </Dialog.Description>
      <Dialog.Actions>
        <Dialog.Close>Cancel</Dialog.Close>
        <Button intent="danger" onClick={onConfirm}>
          Clear queue
        </Button>
      </Dialog.Actions>
    </Dialog.Root>
  );
}
