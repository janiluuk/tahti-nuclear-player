import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FanPayoutStats } from '@tahti-web/api/revenue';
import { FanSubscriptionStats } from '@tahti-web/components/FanSubscriptionStats';
import { mergeRevenueOrders } from '@tahti-web/lib/revenueOrders';

const mockStats: FanPayoutStats = {
  activeSubscribers: 26,
  thisMonthNetCents: 12840,
  paidYtdNetCents: 84120,
  pending: 3,
  failed: 1,
  paidLast30Days: 24,
  recent: [
    {
      id: 'payout-1',
      state: 'PAID',
      tierName: 'Supporter',
      grossCents: 500,
      netToArtistCents: 420,
      paidAt: '2026-08-01T00:00:00.000Z',
      createdAt: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 'payout-2',
      state: 'PAID',
      tierName: 'Superfan',
      grossCents: 1500,
      netToArtistCents: 1260,
      paidAt: '2026-07-28T00:00:00.000Z',
      createdAt: '2026-07-28T00:00:00.000Z',
    },
    {
      id: 'payout-3',
      state: 'FAILED',
      tierName: 'Supporter',
      grossCents: 500,
      netToArtistCents: 0,
      paidAt: null,
      createdAt: '2026-07-20T00:00:00.000Z',
    },
  ],
};

const emptyStats: FanPayoutStats = {
  activeSubscribers: 0,
  thisMonthNetCents: 0,
  paidYtdNetCents: 0,
  pending: 0,
  failed: 0,
  paidLast30Days: 0,
  recent: [],
};

const meta: Meta<typeof FanSubscriptionStats> = {
  title: 'Tahti/Studio/FanSubscriptionStats',
  component: FanSubscriptionStats,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stats: mockStats,
    orders: mergeRevenueOrders(mockStats.recent, []),
    exportUrl: '/export/subscribers.csv',
  },
};

export const NoExport: Story = {
  args: {
    stats: mockStats,
    orders: mergeRevenueOrders(mockStats.recent, []),
  },
};

export const Empty: Story = {
  args: {
    stats: emptyStats,
    orders: [],
  },
};
