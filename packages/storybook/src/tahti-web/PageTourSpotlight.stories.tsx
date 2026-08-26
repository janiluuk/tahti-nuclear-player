import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { PageTourSpotlight } from '@tahti-web/components/PageTourSpotlight';
import { useTourStore } from '@tahti-web/stores/tourStore';

import { withTahtiRouter } from './_lib/decorators';

/** PageTourSpotlight measures real DOM elements carrying `data-tour-id`
 * (normally the sidebar/top-bar nav items rendered elsewhere in AppShell)
 * and highlights them via `getBoundingClientRect`. In isolation there's no
 * real sidebar to target, so this story renders a handful of decoy nav-like
 * boxes bearing the same `data-tour-id`s the sidebar tour step list expects
 * (see lib/pageTour.ts) and opens the tour via `useTourStore`. */
function withTourOpen(): Decorator {
  return (Story) => {
    useTourStore.setState({ open: true, stepIndex: 0 });
    return <Story />;
  };
}

const DECOY_TOUR_IDS = [
  'nav-listen',
  'nav-radio',
  'nav-feed',
  'nav-discover',
  'nav-library',
];

function DecoySidebar() {
  return (
    <div className="flex w-48 flex-col gap-2 p-4">
      {DECOY_TOUR_IDS.map((id) => (
        <div
          key={id}
          data-tour-id={id}
          className="border-border bg-background-secondary rounded-lg border px-3 py-2 text-sm capitalize"
        >
          {id.replace('nav-', '')}
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof PageTourSpotlight> = {
  title: 'Tahti/Widgets/PageTourSpotlight',
  component: PageTourSpotlight,
  parameters: { layout: 'padded' },
  decorators: [withTahtiRouter('/'), withTourOpen()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <DecoySidebar />
      <PageTourSpotlight />
    </>
  ),
};
