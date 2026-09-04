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
 *
 * Atlas PNGs live under `packages/tahti-web/public/map/nuclear/` and are
 * refreshed with `scripts/capture-map-screens.mjs`. Last full recapture:
 * 2026-09-04. Coverage includes Listen tabs (Feed / Favorites / History),
 * Help hub + keyboard-shortcuts, Settings modal (Themes, Add-ons, Account,
 * Audience — About was removed from the footer), and the three governance
 * contexts (`/governance`, `/studio/governance`, `/admin/governance` +
 * `/admin/agm`).
 */
export const Default: Story = {
  render: () => (
    <div className="p-6">
      <ScreenAtlas />
    </div>
  ),
};
