import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScreenAtlas } from '@tahti-web/components/ScreenAtlas';

const meta: Meta<typeof ScreenAtlas> = {
  title: 'Tahti/Misc/ScreenAtlas',
  component: ScreenAtlas,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Fully self-contained: reads its case data from `content/mapScreens` and
 * review notes from the persisted `useMapNotesStore`. The "Apply review"
 * button only appears in dev mode (`import.meta.env.DEV`) since it posts to
 * a Vite dev-server-only endpoint — it won't show in a static Storybook
 * build.
 */
export const Default: Story = {
  render: () => (
    <div className="p-6">
      <ScreenAtlas />
    </div>
  ),
};
