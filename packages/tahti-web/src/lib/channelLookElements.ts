import {
  CHANNEL_PAGE_ITEM_META,
  type ChannelPageItemType,
} from './channelPageLayout';

export type ChannelLookElementId =
  | 'header'
  | 'player'
  | 'background'
  | 'actions'
  | 'archive'
  | 'about'
  | 'links'
  | 'subscribe'
  | 'stats'
  | 'events';

export type ChannelLookElement = {
  id: ChannelLookElementId;
  label: string;
  hint: string;
  layoutType: ChannelPageItemType | null;
  canDisable: boolean;
};

/** Real visitor-facing pieces that can be styled (or shown/hidden) in the
 * channel designer. Overlay styling lives under Player — not its own row. */
export const CHANNEL_LOOK_ELEMENTS: readonly ChannelLookElement[] = [
  {
    id: 'header',
    label: 'Header',
    hint: 'Artist identity, badge, and backdrop treatment.',
    layoutType: null,
    canDisable: false,
  },
  {
    id: 'player',
    label: 'Player',
    hint: 'Live stage, visualizer, gradient, and now-playing overlay.',
    layoutType: 'hero',
    canDisable: true,
  },
  {
    id: 'background',
    label: 'Background',
    hint: 'Page colors behind the channel, separate from the header.',
    layoutType: null,
    canDisable: false,
  },
  {
    id: 'actions',
    label: CHANNEL_PAGE_ITEM_META.actions.label,
    hint: CHANNEL_PAGE_ITEM_META.actions.hint,
    layoutType: 'actions',
    canDisable: true,
  },
  {
    id: 'archive',
    label: CHANNEL_PAGE_ITEM_META.archive.label,
    hint: CHANNEL_PAGE_ITEM_META.archive.hint,
    layoutType: 'archive',
    canDisable: true,
  },
  {
    id: 'about',
    label: CHANNEL_PAGE_ITEM_META.about.label,
    hint: CHANNEL_PAGE_ITEM_META.about.hint,
    layoutType: 'about',
    canDisable: true,
  },
  {
    id: 'links',
    label: CHANNEL_PAGE_ITEM_META.links.label,
    hint: CHANNEL_PAGE_ITEM_META.links.hint,
    layoutType: 'links',
    canDisable: true,
  },
  {
    id: 'subscribe',
    label: CHANNEL_PAGE_ITEM_META.subscribe.label,
    hint: CHANNEL_PAGE_ITEM_META.subscribe.hint,
    layoutType: 'subscribe',
    canDisable: true,
  },
  {
    id: 'stats',
    label: CHANNEL_PAGE_ITEM_META.stats.label,
    hint: CHANNEL_PAGE_ITEM_META.stats.hint,
    layoutType: 'stats',
    canDisable: true,
  },
  {
    id: 'events',
    label: CHANNEL_PAGE_ITEM_META.events.label,
    hint: CHANNEL_PAGE_ITEM_META.events.hint,
    layoutType: 'events',
    canDisable: true,
  },
];

export function isChannelLookElementId(
  value: string | null | undefined,
): value is ChannelLookElementId {
  return CHANNEL_LOOK_ELEMENTS.some((element) => element.id === value);
}

export function adjacentLookElementId(
  currentId: string,
  direction: -1 | 1,
): ChannelLookElementId {
  const ids = CHANNEL_LOOK_ELEMENTS.map((element) => element.id);
  const index = ids.indexOf(currentId as ChannelLookElementId);
  const from = index < 0 ? 0 : index;
  const next = (from + direction + ids.length) % ids.length;
  return ids[next] ?? 'header';
}
