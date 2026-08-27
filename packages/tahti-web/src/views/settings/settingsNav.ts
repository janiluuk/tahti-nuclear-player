import type { LucideIcon } from 'lucide-react';
import {
  BlocksIcon,
  Link2,
  Paintbrush,
  Palette,
  Radio,
  Sparkles,
  User,
  UserCircle2,
} from 'lucide-react';

export type SettingsSectionId =
  | 'account'
  | 'artist'
  | 'channel'
  | 'broadcast'
  | 'themes'
  | 'plugin-store'
  | 'connections'
  | 'whats-new';

export type SettingsNavItem = {
  id: SettingsSectionId;
  label: string;
  description: string;
  Icon: LucideIcon;
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'account',
    label: 'Account',
    description: 'Session, security, membership, notifications',
    Icon: User,
  },
  {
    id: 'artist',
    label: 'Artist',
    description: 'Profile, social links, members, press kit',
    Icon: UserCircle2,
  },
  {
    id: 'channel',
    label: 'Channel & design',
    description: 'Look, discovery, username',
    Icon: Paintbrush,
  },
  {
    id: 'broadcast',
    label: 'Broadcast',
    description: 'Radio, green room, mods, multistream',
    Icon: Radio,
  },
  {
    id: 'themes',
    label: 'Themes',
    description: 'App appearance',
    Icon: Palette,
  },
  {
    id: 'plugin-store',
    label: 'Add-ons',
    description:
      'Themes, visualizers, radio, embeds, discovery, channel widgets, export, import, multicast, fingerprinting, audio plugins — one browser',
    Icon: BlocksIcon,
  },
  {
    id: 'connections',
    label: 'Connections',
    description: 'Import sources and export destinations',
    Icon: Link2,
  },
  {
    id: 'whats-new',
    label: "What's new",
    description: 'Product announcements',
    Icon: Sparkles,
  },
];

/** Sections visible without signing in (prefs + announcements). Import &
 * export links into Studio/Sources, which all require an account, so it
 * stays sign-in-only rather than showing dead-end links while signed out. */
export const PUBLIC_SETTINGS_SECTION_IDS: readonly SettingsSectionId[] = [
  'themes',
  'plugin-store',
  'whats-new',
];

export const DEFAULT_PUBLIC_SETTINGS_SECTION: SettingsSectionId = 'themes';

export function isPublicSettingsSection(id: SettingsSectionId): boolean {
  return PUBLIC_SETTINGS_SECTION_IDS.includes(id);
}

export function settingsNavForAuth(signedIn: boolean): SettingsNavItem[] {
  if (signedIn) {
    return SETTINGS_NAV;
  }
  return SETTINGS_NAV.filter((item) => isPublicSettingsSection(item.id));
}

export function isSettingsSectionId(
  value: string | undefined,
): value is SettingsSectionId {
  return Boolean(value && SETTINGS_NAV.some((n) => n.id === value));
}
