import { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon } from 'lucide-react';

import { Alert } from '@tahti-player/ui';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    tone: {
      control: { type: 'select' },
      options: ['neutral', 'info', 'warning', 'success', 'error'],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof Alert>;

export const Neutral: Story = {
  args: {
    tone: 'neutral',
    children: 'Still processing — this can take a minute for longer files.',
  },
};

export const Info: Story = {
  args: {
    tone: 'info',
    icon: <InfoIcon size={16} aria-hidden />,
    children: 'Changes here apply to every listener immediately.',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    icon: <AlertTriangleIcon size={16} aria-hidden />,
    title: 'Stripe is not connected',
    children:
      'Fan-sub payouts cannot reach you until Connect shows payments ready.',
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    icon: <CheckCircle2Icon size={16} aria-hidden />,
    children: 'Payout details saved.',
  },
};

export const Error: Story = {
  args: {
    tone: 'error',
    children:
      'Could not reach the logging backend. It may be down, or this environment can’t reach it on the LAN.',
  },
};

export const AllTones: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <Alert tone="neutral">Neutral status message.</Alert>
      <Alert tone="info">Informational message.</Alert>
      <Alert tone="warning">Warning message.</Alert>
      <Alert tone="success">Success message.</Alert>
      <Alert tone="error">Error message.</Alert>
    </div>
  ),
};
