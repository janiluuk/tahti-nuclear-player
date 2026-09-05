import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelPlaylistBlock } from '@tahti-web/components/ChannelPlaylistBlock';
import { ChannelPlaylistPicker } from '@tahti-web/components/ChannelPlaylistPicker';
import { useState } from 'react';

import { MOCK_USERS, withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta = {
  title: 'Tahti/Channel/Designer/Playlist',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    withTahtiRouter('/channel/northern-lights'),
    withMockAuth(MOCK_USERS.artist),
  ],
};

export default meta;
type Story = StoryObj;

/**
 * Channel page playlist widget. Missing states: empty playlist, private /
 * 404 load failure (use a bad slug), long titles wrapping under Cards.
 */
export const BlockTracklist: Story = {
  name: 'Block — Tracklist',
  render: () => (
    <div className="max-w-3xl">
      <ChannelPlaylistBlock
        playlistSlug="favorites-vault"
        display="tracklist"
      />
    </div>
  ),
};

export const BlockCards: Story = {
  name: 'Block — Cards',
  render: () => (
    <div className="max-w-3xl">
      <ChannelPlaylistBlock playlistSlug="favorites-vault" display="cards" />
    </div>
  ),
};

export const BlockEditing: Story = {
  name: 'Block — editing (compact title)',
  render: () => (
    <div className="max-w-3xl">
      <ChannelPlaylistBlock
        playlistSlug="favorites-vault"
        display="tracklist"
        editing
      />
    </div>
  ),
};

export const PickerAdd: Story = {
  name: 'Picker — Add playlist',
  render: () => {
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <ChannelPlaylistPicker
          usedSlugs={['favorites-vault']}
          onPick={(slug) => setPicked(slug)}
        />
        {picked ? (
          <p className="text-foreground-secondary text-xs">Picked: {picked}</p>
        ) : null}
      </div>
    );
  },
};

export const PickerSettings: Story = {
  name: 'Picker — settings (apply on change)',
  render: () => {
    const [slug, setSlug] = useState('favorites-vault');
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <ChannelPlaylistPicker
          initialSlug={slug}
          usedSlugs={[slug]}
          applyOnChange
          onPick={setSlug}
        />
        <p className="text-foreground-secondary text-xs">Current: {slug}</p>
      </div>
    );
  },
};
