import type { Meta, StoryObj } from '@storybook/react-vite';
import { SecurityTotpPanel } from '@tahti-web/components/SecurityTotpPanel';

const meta: Meta<typeof SecurityTotpPanel> = {
  title: 'Tahti/Misc/SecurityTotpPanel',
  component: SecurityTotpPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Self-fetches `fetchTotpStatus`, which under `VITE_FORCE_MOCK` starts out
 * `enabled: false` (backed by a module-level mock flag, not a prop) — so
 * this always mounts into the "Disabled" state. Click through "Enable 2FA"
 * → enter any 6-digit code → "Confirm" in the canvas to see the QR/secret
 * step and the backup-codes reveal live; there's no prop to jump straight
 * to the "Enabled" state from a story.
 */
export const Default: Story = {};
