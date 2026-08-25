import { Link } from '@tanstack/react-router';
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  Bell,
  Cast,
  Compass,
  CreditCardIcon,
  Gift,
  Globe,
  Image as ImageIcon,
  Landmark,
  Lock,
  LogInIcon,
  LogOutIcon,
  Mic,
  Paintbrush,
  Radio as RadioIcon,
  Share2,
  Shield,
  SunMoon,
  Tag,
  User,
  UserCircle2,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import {
  Button,
  Card,
  CardGrid,
  Input,
  PluginItem,
  PluginStoreItem,
  SaveButton,
  Select,
  Tabs,
  Toggle,
  type SelectOption,
} from '@nuclearplayer/ui';

import { submitRadioStationSuggestion } from '../../api/admin';
import {
  fetchChannelMembers,
  fetchDiscoveryPrefs,
  fetchGreenRoomPrefs,
  fetchModerators,
  fetchNotificationPrefs,
  fetchPressKitMeta,
  fetchSocialConnections,
  patchDiscoveryPrefs,
  patchGreenRoomPrefs,
  patchNotificationPrefs,
  patchPressKitBio,
  patchSocialConnections,
  type ChannelMember,
  type DiscoveryPrefs,
  type GreenRoomPrefs,
  type ModeratorRow,
  type NotificationPrefs,
  type PressKitMeta,
  type SocialConnections,
} from '../../api/artist-settings';
import {
  createRtmpTarget,
  deleteRtmpTarget,
  fetchRtmpTargets,
  patchRtmpTarget,
  type RtmpTarget,
} from '../../api/broadcast';
import {
  checkSlugAvailable,
  setCustomDomain,
  updateChannelSlug,
  verifyCustomDomain,
} from '../../api/channel-design';
import {
  fetchMembership,
  fetchMySubscriptions,
  startMembershipCheckout,
} from '../../api/client';
import {
  fanSubscriberExportUrl,
  fetchFanConnectPortal,
  fetchFanConnectStatus,
  fetchFanPayoutStats,
  fetchGrantEstimate,
  fetchMyGrants,
  startFanConnectOnboard,
  type FanConnectStatus,
  type FanPayoutStats,
  type GrantEstimate,
  type GrantRow,
} from '../../api/revenue';
import {
  fetchMeProfile,
  fetchProgramme,
  patchMeProfile,
  patchProgramme,
  type ProfileFields,
  type ProgrammeView,
} from '../../api/studio-extras';
import type { FanSubscriptionRow, MembershipStatus } from '../../api/types';
import { ChannelDesigner } from '../../components/ChannelDesigner';
import { DiscoWidgetManagerPanel } from '../../components/disco-widgets/DiscoWidgetManagerPanel';
import { FanSubscriptionStats } from '../../components/FanSubscriptionStats';
import { FanTiersEditor } from '../../components/FanTiersEditor';
import { GenrePicker } from '../../components/GenrePicker';
import { ListenerWidgetEmbed } from '../../components/ListenerWidgetEmbed';
import { PluginStorePanel } from '../../components/PluginStorePanel';
import { SecurityTotpPanel } from '../../components/SecurityTotpPanel';
import { SidebarBuildInfo } from '../../components/SidebarBuildInfo';
import { LISTENER_WIDGET_TYPES } from '../../content/listenerWidgets';
import {
  RADIO_STATIONS,
  radioStationPlayable,
} from '../../content/radioStations';
import { hasAccountRole } from '../../lib/accountRoles';
import { COUNTRIES, flagEmoji } from '../../lib/countries';
import {
  formatGenreTags,
  MAX_GENRES,
  normalizeGenresForPicker,
  parseGenreTags,
} from '../../lib/genres';
import { membershipStatusLabel } from '../../lib/membershipStatus';
import { EXPORT_TARGETS } from '../../plugins/export';
import { useThemeStore } from '../../plugins/themes';
import { useAuthModalStore } from '../../stores/authModalStore';
import { useAuthStore } from '../../stores/authStore';
import { useListenerWidgetsStore } from '../../stores/listenerWidgetsStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsModalStore } from '../../stores/settingsModalStore';
import { WhatsNewPanel } from '../WhatsNewView';
import { SettingsHint, SettingsInfo, SettingsToggle } from './SettingsFields';
import { SETTINGS_NAV, type SettingsSectionId } from './settingsNav';

const PRONOUN_OPTIONS: SelectOption[] = [
  { id: 'she/her', label: 'she/her' },
  { id: 'he/him', label: 'he/him' },
  { id: 'they/them', label: 'they/them' },
  { id: 'she/they', label: 'she/they' },
  { id: 'he/they', label: 'he/they' },
  { id: 'other', label: 'Other' },
];
const PRONOUN_PRESET_IDS = new Set(
  PRONOUN_OPTIONS.map((o) => o.id).filter((id) => id !== 'other'),
);

function euros(cents: number | string): string {
  const n = typeof cents === 'string' ? Number(cents) : cents;
  if (!Number.isFinite(n)) {
    return '—';
  }
  return `€${(n / 100).toFixed(n % 100 === 0 ? 0 : 2)}`;
}

function tabLabel(Icon: LucideIcon, label: string) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon size={14} />
      {label}
    </span>
  );
}

export function SettingsSectionBody({
  section,
}: {
  section: SettingsSectionId;
}) {
  let content: ReactNode;

  switch (section) {
    case 'account':
      content = <AccountPanel />;
      break;
    case 'artist':
      content = <ArtistPanel />;
      break;
    case 'channel':
      content = <ChannelPanel />;
      break;
    case 'broadcast':
      content = <BroadcastPanel />;
      break;
    case 'money':
      content = <MoneyPanel />;
      break;
    case 'themes':
      content = <ThemesPanel />;
      break;
    case 'widgets':
      content = <WidgetsPanel />;
      break;
    case 'plugin-store':
      content = <PluginStorePanel />;
      break;
    case 'connections':
      content = <ConnectionsPanel />;
      break;
    case 'whats-new':
      content = <WhatsNewPanel />;
      break;
    default:
      return null;
  }

  const navItem = SETTINGS_NAV.find((item) => item.id === section);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {navItem?.label}
        </h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          {navItem?.description}
        </p>
      </header>
      {content}
    </div>
  );
}

type ServiceEntry = {
  id: string;
  label: string;
  note: string;
  color: string;
  to: string;
};

// Mirrors SOURCE_DEFS (api/sources.ts) minus upload/stash/broadcast/radio,
// which aren't external services to import *from*.
const IMPORT_SERVICES: ServiceEntry[] = [
  {
    id: 'bandcamp',
    label: 'Bandcamp',
    note: 'Connect and import albums into your catalog.',
    color: 'var(--accent-cyan)',
    to: '/sources/bandcamp',
  },
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    note: 'OAuth connect, queue server-side import to your archive.',
    color: 'var(--accent-orange)',
    to: '/sources/soundcloud',
  },
  {
    id: 'google-drive',
    label: 'Google Drive',
    note: 'Import audio files via cloud-import jobs.',
    color: 'var(--accent-blue)',
    to: '/sources/google-drive',
  },
  {
    id: 'mixcloud',
    label: 'Mixcloud',
    note: 'Rescue mixes into your archive, or publish back out.',
    color: 'var(--accent-purple)',
    to: '/sources/mixcloud',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    note: 'Search tracks to add into mixed-source collections.',
    color: 'var(--accent-green)',
    to: '/sources/spotify',
  },
  {
    id: 'hearthis',
    label: 'hearthis.at',
    note: 'Add your username, then import tracks, sets, and collections.',
    color: 'var(--accent-yellow)',
    to: '/sources/hearthis',
  },
  {
    id: 'url',
    label: 'URL / DSP paste',
    note: 'Paste a link from any DSP to seed a smart-link target.',
    color: 'var(--accent-yellow)',
    to: '/sources/url',
  },
];

// The DSP set a Tahti release actually reaches (same list the public smart
// link page buttons use). Spotify/Apple/Tidal/Deezer/Amazon/YouTube go out
// through one Revelator submission; Bandcamp/SoundCloud/Mixcloud are
// reached by connecting them as a source instead.
function ServiceRow({ service }: { service: ServiceEntry }) {
  const closeSettings = useSettingsModalStore((s) => s.close);
  return (
    <li className="border-border flex items-center gap-3 rounded-lg border px-3 py-2">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black/80"
        style={{ background: service.color }}
        aria-hidden
      >
        {service.label.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{service.label}</div>
        <div className="text-foreground-secondary truncate text-xs">
          {service.note}
        </div>
      </div>
      <Link to={service.to} onClick={closeSettings}>
        <Button size="sm" variant="secondary">
          Open
        </Button>
      </Link>
    </li>
  );
}

/** Where a release's audience actually comes from and goes to — the
 * services you can pull music in from, and the services a release
 * distributes out to. Replaces the old desktop-only MCP docs, which
 * described a capability this web SPA can't offer (see chat history:
 * MCP needs Tauri IPC into a local process, not reachable from here). */
function ImportExportPanel() {
  return (
    <div className="flex flex-col gap-6 text-sm">
      <section className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 font-medium">
          <ArrowDownToLineIcon size={14} aria-hidden />
          Import music
        </h3>
        <ul className="flex flex-col gap-2">
          {IMPORT_SERVICES.map((s) => (
            <ServiceRow key={`import-${s.id}`} service={s} />
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 font-medium">
          <ArrowUpFromLineIcon size={14} aria-hidden />
          Export music
        </h3>
        <ul className="flex flex-col gap-2">
          {EXPORT_TARGETS.map((s) => (
            <ServiceRow key={`export-${s.id}`} service={s} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function MembershipCheckoutButton({
  onActivated,
}: {
  onActivated?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setMsg(null);
          void startMembershipCheckout().then((res) => {
            setBusy(false);
            if (!res.ok) {
              setMsg(res.error);
              return;
            }
            if ('checkoutUrl' in res && res.checkoutUrl) {
              window.location.assign(res.checkoutUrl);
              return;
            }
            if ('activated' in res && res.activated) {
              setMsg(
                res.memberNumber != null
                  ? `Membership activated — member #${res.memberNumber}.`
                  : 'Membership activated.',
              );
              onActivated?.();
            }
          });
        }}
      >
        <CreditCardIcon size={15} aria-hidden className="mr-1.5" />
        {busy ? 'Starting…' : 'Pay €40 / year'}
      </Button>
      {msg && <p className="text-xs">{msg}</p>}
    </div>
  );
}

function AccountPanel() {
  const user = useAuthStore((s) => s.user);
  const isBoard = useAuthStore((s) => hasAccountRole(s.user, 'BOARD'));
  const logout = useAuthStore((s) => s.logout);
  const closeSettings = useSettingsModalStore((s) => s.close);
  const [membership, setMembership] = useState<MembershipStatus | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    void fetchMembership().then((r) => {
      setMembership(r.data);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <SettingsHint>Sign in to manage membership and security.</SettingsHint>
        <Button
          size="sm"
          onClick={() => useAuthModalStore.getState().open('login')}
        >
          <LogInIcon size={15} aria-hidden className="mr-1.5" />
          Log in
        </Button>
      </div>
    );
  }

  return (
    <Tabs
      items={[
        {
          id: 'session',
          label: tabLabel(User, 'Session'),
          content: (
            <div className="flex flex-col gap-6">
              <SettingsInfo label="Signed in as" value={`@${user.username}`} />
              <SettingsInfo label="Display name" value={user.displayName} />
              {user.email && <SettingsInfo label="Email" value={user.email} />}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="text" onClick={() => void logout()}>
                  <LogOutIcon size={15} aria-hidden className="mr-1.5" />
                  Log out
                </Button>
              </div>
              {isBoard && <SidebarBuildInfo />}
            </div>
          ),
        },
        {
          id: 'security',
          label: tabLabel(Lock, 'Security'),
          content: <SecurityTotpPanel />,
        },
        {
          id: 'membership',
          label: tabLabel(Wallet, 'Membership'),
          content: (
            <div className="flex flex-col gap-4">
              {!membership ? (
                <SettingsHint>Could not load membership.</SettingsHint>
              ) : (
                <div className="flex flex-col gap-4">
                  <SettingsInfo
                    label="Status"
                    value={membershipStatusLabel(membership)}
                  />
                  <SettingsInfo
                    label="Member"
                    value={membership.isMember ? 'Yes' : 'No'}
                  />
                  {membership.memberNumber != null && (
                    <SettingsInfo
                      label="Member #"
                      value={String(membership.memberNumber)}
                    />
                  )}
                  {membership.tier && (
                    <SettingsInfo label="Tier" value={membership.tier} />
                  )}
                  {typeof membership.priceCents === 'number' && (
                    <SettingsInfo
                      label="Dues"
                      value={`${euros(membership.priceCents)} / year`}
                    />
                  )}
                  {membership.renewalDueAt && (
                    <SettingsInfo
                      label="Renewal"
                      value={new Date(
                        membership.renewalDueAt,
                      ).toLocaleDateString()}
                    />
                  )}
                  {!membership.isMember && (
                    <div className="flex flex-col gap-2">
                      <p className="text-foreground-secondary text-xs">
                        Tahti ry membership is €40/year — cooperative vote,
                        FLAC, and stash.
                      </p>
                      <MembershipCheckoutButton
                        onActivated={() => {
                          void fetchMembership().then((r) => {
                            setMembership(r.data);
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              <Link to="/governance" onClick={closeSettings}>
                <Button size="sm" variant="secondary">
                  <Landmark size={15} aria-hidden className="mr-1.5" />
                  Governance
                </Button>
              </Link>
            </div>
          ),
        },
        {
          id: 'notifications',
          label: tabLabel(Bell, 'Notifications'),
          content: <NotificationsPanel />,
        },
      ]}
    />
  );
}

/** Optional pronouns dropdown — common options plus a free-text "Other". */
function PronounsField({
  profile,
  setProfile,
}: {
  profile: ProfileFields;
  setProfile: (p: ProfileFields) => void;
}) {
  const current = profile.pronouns ?? '';
  const isCustom = current !== '' && !PRONOUN_PRESET_IDS.has(current);
  const [showCustomInput, setShowCustomInput] = useState(isCustom);

  return (
    <div className="flex flex-col gap-2">
      <Select
        label="Pronouns"
        value={showCustomInput ? 'other' : current}
        onValueChange={(id) => {
          if (id === 'other') {
            setShowCustomInput(true);
            return;
          }
          setShowCustomInput(false);
          setProfile({ ...profile, pronouns: id });
        }}
        placeholder="Not set"
        options={PRONOUN_OPTIONS}
      />
      {showCustomInput && (
        <Input
          label="Custom pronouns"
          value={isCustom ? current : ''}
          onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
        />
      )}
    </div>
  );
}

function ArtistPanel() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [press, setPress] = useState<PressKitMeta | null>(null);
  const [social, setSocial] = useState<SocialConnections | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [socialMsg, setSocialMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetchMeProfile(),
      fetchChannelMembers(),
      fetchPressKitMeta(),
      fetchSocialConnections(),
    ]).then(([p, m, k, s]) => {
      setProfile(p.data);
      setMembers(m.data);
      setPress(k.data);
      setSocial(s.data);
    });
  }, []);

  if (!user) {
    return (
      <SettingsHint>
        <button
          type="button"
          className="underline-offset-2 hover:underline"
          onClick={() => useAuthModalStore.getState().open('login')}
        >
          Sign in
        </button>{' '}
        to edit artist profile.
      </SettingsHint>
    );
  }

  return (
    <Tabs
      items={[
        {
          id: 'profile',
          label: tabLabel(UserCircle2, 'Profile'),
          content: !profile ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-6">
              <Input
                label="Display name"
                value={profile.displayName}
                onChange={(e) =>
                  setProfile({ ...profile, displayName: e.target.value })
                }
              />
              <label className="flex flex-col gap-1">
                <span className="text-foreground text-sm font-semibold">
                  Bio
                </span>
                <textarea
                  className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                  rows={4}
                  value={profile.bio ?? ''}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              </label>
              <PronounsField profile={profile} setProfile={setProfile} />
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground text-sm font-semibold">
                  I am a…
                </span>
                <div className="flex gap-2">
                  {(
                    [
                      ['SINGLE', 'Solo artist'],
                      ['COLLECTIVE', 'Band / collective'],
                    ] as const
                  ).map(([kind, label]) => (
                    <button
                      key={kind}
                      type="button"
                      aria-pressed={(profile.artistKind ?? 'SINGLE') === kind}
                      onClick={() =>
                        setProfile({ ...profile, artistKind: kind })
                      }
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        (profile.artistKind ?? 'SINGLE') === kind
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground text-sm font-semibold">
                  Country
                </span>
                <select
                  value={profile.countryCode ?? ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      countryCode: e.target.value || null,
                    })
                  }
                  className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Prefer not to say</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {flagEmoji(c.code)} {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="City / location"
                value={profile.defaultLocation ?? ''}
                onChange={(e) =>
                  setProfile({ ...profile, defaultLocation: e.target.value })
                }
                description="Optional — shown on your public profile"
              />
              <Input
                label="Tip jar URL"
                value={profile.tipJarUrl ?? ''}
                onChange={(e) =>
                  setProfile({ ...profile, tipJarUrl: e.target.value })
                }
              />
              <SettingsToggle
                label="Public channel chat"
                description="Allow listeners to chat on your live channel."
                value={profile.chatEnabled}
                onChange={(v) => setProfile({ ...profile, chatEnabled: v })}
              />
              <SettingsToggle
                label="Show followers"
                description="Follower count is visible on your public profile."
                value={profile.showFollowers ?? true}
                onChange={(v) => setProfile({ ...profile, showFollowers: v })}
              />
              <SettingsToggle
                label="Show following"
                description="Who you follow is visible on your public profile."
                value={profile.showFollowing ?? true}
                onChange={(v) => setProfile({ ...profile, showFollowing: v })}
              />
              <div className="flex justify-end">
                <SaveButton
                  saving={busy}
                  label="Save artist info"
                  onClick={() => {
                    setBusy(true);
                    void patchMeProfile({
                      displayName: profile.displayName.trim(),
                      bio: profile.bio?.trim() || null,
                      tipJarUrl: profile.tipJarUrl?.trim() || null,
                      pronouns: profile.pronouns?.trim() || null,
                      chatEnabled: profile.chatEnabled,
                      showFollowers: profile.showFollowers,
                      showFollowing: profile.showFollowing,
                      artistKind: profile.artistKind,
                      countryCode: profile.countryCode,
                      defaultLocation: profile.defaultLocation?.trim() || null,
                    }).then((r) => {
                      setBusy(false);
                      setMsg(r.ok ? 'Artist info saved.' : r.error);
                      if (r.ok) {
                        setProfile(r.data);
                      }
                    });
                  }}
                />
              </div>
              {msg && <SettingsHint>{msg}</SettingsHint>}
            </div>
          ),
        },
        {
          id: 'social',
          label: tabLabel(Share2, 'Social links'),
          content: !social ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-6">
              {(
                [
                  ['website', 'Website'],
                  ['instagram', 'Instagram'],
                  ['bandcamp', 'Bandcamp'],
                  ['soundcloud', 'SoundCloud'],
                  ['youtube', 'YouTube'],
                  ['discord', 'Discord'],
                ] as const
              ).map(([key, label]) => (
                <Input
                  key={key}
                  label={label}
                  value={social[key]}
                  onChange={(e) =>
                    setSocial({ ...social, [key]: e.target.value })
                  }
                />
              ))}
              <div className="flex justify-end">
                <SaveButton
                  label="Save connections"
                  onClick={() => {
                    if (!social) {
                      return;
                    }
                    void patchSocialConnections(social).then((r) => {
                      setSocialMsg(r.ok ? 'Connections saved.' : r.error);
                      if (r.ok) {
                        setSocial(r.data);
                      }
                    });
                  }}
                />
              </div>
              {socialMsg && <SettingsHint>{socialMsg}</SettingsHint>}
            </div>
          ),
        },
        {
          id: 'members',
          label: tabLabel(Users, 'Members'),
          content: (
            <div className="flex flex-col gap-4">
              <SettingsHint>
                Collective or band members who share access to this channel.
              </SettingsHint>
              {members.length === 0 ? (
                <SettingsHint>No members listed.</SettingsHint>
              ) : (
                <ul className="flex flex-col gap-2">
                  {members.map((m) => (
                    <li
                      key={m.id}
                      className="border-border flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>
                        {m.displayName} (@{m.username})
                      </span>
                      <span className="text-foreground-secondary text-xs uppercase">
                        {m.role}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        },
        {
          id: 'presskit',
          label: tabLabel(ImageIcon, 'Press kit'),
          content: !press ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-1">
                <span className="text-foreground text-sm font-semibold">
                  Short bio
                </span>
                <textarea
                  className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  value={press.bioShort}
                  onChange={(e) =>
                    setPress({ ...press, bioShort: e.target.value })
                  }
                />
              </label>
              <SettingsInfo
                label="Press assets"
                value={`${press.photoCount} photos${press.hasZip ? ', ZIP ready' : ''}`}
              />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <SettingsHint>
                  The download bundles your gallery images and biography into a
                  single press kit.
                </SettingsHint>
                {press.downloadPath && (
                  <a
                    href={`https://tahti.live${press.downloadPath}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="secondary">
                      Download ZIP
                    </Button>
                  </a>
                )}
                <SaveButton
                  label="Save press bio"
                  onClick={() => {
                    void patchPressKitBio(press.bioShort).then((r) => {
                      setMsg(r.ok ? 'Press kit bio saved.' : r.error);
                      if (r.ok) {
                        setPress(r.data);
                      }
                    });
                  }}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}

function ChannelPanel() {
  const user = useAuthStore((s) => s.user);
  const closeSettings = useSettingsModalStore((s) => s.close);
  const channel = user?.channel;
  const [discovery, setDiscovery] = useState<DiscoveryPrefs | null>(null);
  const [slug, setSlug] = useState(channel?.slug ?? '');
  const [domain, setDomain] = useState('');
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void fetchDiscoveryPrefs().then((r) => setDiscovery(r.data));
    setSlug(channel?.slug ?? user?.username ?? '');
  }, [channel?.slug, user?.username]);

  if (!user) {
    return (
      <SettingsHint>
        Sign in with a channel to edit design and discovery.
      </SettingsHint>
    );
  }

  return (
    <Tabs
      items={[
        {
          id: 'appearance',
          label: tabLabel(Paintbrush, 'Appearance'),
          content: (
            <div className="flex flex-col gap-4">
              <SettingsHint>
                Live preview of presets and accents. Owners can also open Design
                on{' '}
                <Link
                  to="/u/$username"
                  params={{ username: user.username }}
                  onClick={closeSettings}
                  className="underline-offset-2 hover:underline"
                >
                  their public profile
                </Link>
                .
              </SettingsHint>
              <ChannelDesigner
                displayName={user.displayName}
                username={user.username}
                channelSlug={channel?.slug}
                avatarUrl={user.avatarUrl}
                // This modal is a global overlay that can stay open over the
                // owner's own live channel page (which may already be
                // running a live ChannelVisualizer) — skip the extra WebGL
                // context here rather than risk two at once (see 7a8060d7).
                livePreview={false}
                compact
              />
            </div>
          ),
        },
        {
          id: 'discovery',
          label: tabLabel(Compass, 'Discovery'),
          content: !discovery ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-6">
              <SettingsToggle
                label="List in Listen directory"
                value={discovery.listedInDirectory}
                onChange={(v) => {
                  const next = { ...discovery, listedInDirectory: v };
                  setDiscovery(next);
                  void patchDiscoveryPrefs({ listedInDirectory: v });
                }}
              />
              <SettingsToggle
                label="Allow Tahti Radio pickup"
                value={discovery.allowRadioPickup}
                onChange={(v) => {
                  const next = { ...discovery, allowRadioPickup: v };
                  setDiscovery(next);
                  void patchDiscoveryPrefs({ allowRadioPickup: v });
                }}
              />
              <SettingsToggle
                label="Featured on Listen home"
                description="Subject to editorial / algorithmic placement."
                value={discovery.showOnListenHome}
                onChange={(v) => {
                  const next = { ...discovery, showOnListenHome: v };
                  setDiscovery(next);
                  void patchDiscoveryPrefs({ showOnListenHome: v });
                }}
              />
              <label className="flex flex-col gap-2">
                <span className="text-foreground text-sm font-semibold">
                  Genres
                </span>
                <span className="text-foreground-secondary text-sm select-none">
                  Up to {MAX_GENRES} — helps listeners find you.
                </span>
                <GenrePicker
                  value={normalizeGenresForPicker(
                    parseGenreTags(discovery.genreTags),
                  )}
                  onChange={(genres) => {
                    const genreTags = formatGenreTags(genres);
                    setDiscovery({ ...discovery, genreTags });
                    void patchDiscoveryPrefs({ genreTags });
                  }}
                />
              </label>
              <SettingsToggle
                label="Show favourites"
                description="Your favourited tracks and channels are visible on your public profile."
                value={discovery.showFavorites}
                onChange={(v) => {
                  const next = { ...discovery, showFavorites: v };
                  setDiscovery(next);
                  void patchDiscoveryPrefs({ showFavorites: v });
                }}
              />
              <SettingsToggle
                label="Announce releases"
                description="Followers get a notification (and optional email) when you publish a release."
                value={discovery.announceReleases}
                onChange={(v) => {
                  const next = { ...discovery, announceReleases: v };
                  setDiscovery(next);
                  void patchDiscoveryPrefs({ announceReleases: v });
                }}
              />
            </div>
          ),
        },
        {
          id: 'domain',
          label: tabLabel(Globe, 'Username & domain'),
          content: (
            <div className="flex flex-col gap-6">
              <Input
                label="Channel slug / username"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void checkSlugAvailable(slug.trim()).then((r) => {
                      setNote(
                        r.available
                          ? 'Available'
                          : `Not available${r.reason ? ` (${r.reason})` : ''}`,
                      );
                    });
                  }}
                >
                  Check availability
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    void updateChannelSlug(slug.trim()).then((r) => {
                      setNote(r.ok ? `Renamed to ${r.slug}` : r.error);
                    });
                  }}
                >
                  Rename
                </Button>
              </div>
              <Input
                label="Custom domain"
                description={
                  channel?.customDomain
                    ? `Current: ${channel.customDomain}${channel.customDomainVerified ? ' (verified)' : ' (pending)'}`
                    : 'Requires membership. Add DNS TXT then verify.'
                }
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="music.example.com"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    void setCustomDomain(domain.trim()).then((r) => {
                      if (!r.ok) {
                        setNote(r.error);
                      } else {
                        setNote(
                          `Add TXT ${r.txtHost} = ${r.txtRecord}, then Verify.`,
                        );
                      }
                    });
                  }}
                >
                  Set domain
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void verifyCustomDomain().then((r) => {
                      setNote(
                        r.ok
                          ? r.verified
                            ? 'Verified!'
                            : 'Not verified yet'
                          : r.error,
                      );
                    });
                  }}
                >
                  Verify DNS
                </Button>
              </div>
              {note && <SettingsHint>{note}</SettingsHint>}
            </div>
          ),
        },
      ]}
    />
  );
}

function BroadcastPanel() {
  const closeSettings = useSettingsModalStore((s) => s.close);
  const [programme, setProgramme] = useState<ProgrammeView | null>(null);
  const [green, setGreen] = useState<GreenRoomPrefs | null>(null);
  const [mods, setMods] = useState<ModeratorRow[]>([]);
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [newProvider, setNewProvider] = useState('TWITCH');
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const reloadTargets = () => {
    void fetchRtmpTargets().then((r) => setTargets(r.data));
  };

  useEffect(() => {
    void Promise.all([
      fetchProgramme(),
      fetchGreenRoomPrefs(),
      fetchModerators(),
    ]).then(([p, g, m]) => {
      setProgramme(p.data);
      setGreen(g.data);
      setMods(m.data);
    });
    reloadTargets();
  }, []);

  return (
    <Tabs
      items={[
        {
          id: 'radio',
          label: tabLabel(RadioIcon, 'Radio'),
          content: !programme ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-6">
              <SettingsToggle
                label="Announcements enabled"
                description="Allow platform/radio announcements on your channel programme."
                value={programme.announcementsEnabled}
                onChange={(v) => {
                  const next = { ...programme, announcementsEnabled: v };
                  setProgramme(next);
                  void patchProgramme({ announcementsEnabled: v });
                }}
              />
              <SettingsToggle
                label="Fallback / autoplay when offline"
                value={programme.fallbackEnabled}
                onChange={(v) => {
                  const next = { ...programme, fallbackEnabled: v };
                  setProgramme(next);
                  void patchProgramme({ fallbackEnabled: v });
                }}
              />
              <SettingsToggle
                label="Auto-enroll new archive into fallback"
                value={programme.fallbackAutoEnroll}
                onChange={(v) => {
                  const next = { ...programme, fallbackAutoEnroll: v };
                  setProgramme(next);
                  void patchProgramme({ fallbackAutoEnroll: v });
                }}
              />
              <Link to="/studio/schedule" onClick={closeSettings}>
                <Button size="sm" variant="secondary">
                  Open schedule / programme
                </Button>
              </Link>
            </div>
          ),
        },
        {
          id: 'green-room',
          label: tabLabel(Mic, 'Green room'),
          content: !green ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground text-sm font-semibold">
                  Who can join
                </span>
                <div className="flex gap-2">
                  {(
                    [
                      ['everyone', 'Everyone'],
                      ['subscribers', 'Subscribers only'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={green.access === value}
                      onClick={() => {
                        setGreen({ ...green, access: value });
                        void patchGreenRoomPrefs({ access: value });
                      }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        green.access === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-foreground-secondary text-xs">
                  Anyone signed in, or only listeners with an active fan
                  subscription to you.
                </span>
              </label>
              <Input
                label="Default show title"
                value={green.defaultTitle}
                onChange={(e) =>
                  setGreen({ ...green, defaultTitle: e.target.value })
                }
                onBlur={() =>
                  void patchGreenRoomPrefs({
                    defaultTitle: green.defaultTitle,
                  })
                }
              />
              <Input
                label="Default note"
                value={green.defaultNote}
                onChange={(e) =>
                  setGreen({ ...green, defaultNote: e.target.value })
                }
                onBlur={() =>
                  void patchGreenRoomPrefs({ defaultNote: green.defaultNote })
                }
              />
              <SettingsToggle
                label="Auto-announce when going live"
                value={green.autoAnnounce}
                onChange={(v) => {
                  setGreen({ ...green, autoAnnounce: v });
                  void patchGreenRoomPrefs({ autoAnnounce: v });
                }}
              />
              <SettingsToggle
                label="Hold music while waiting for signal"
                value={green.holdMusicEnabled}
                onChange={(v) => {
                  setGreen({ ...green, holdMusicEnabled: v });
                  void patchGreenRoomPrefs({ holdMusicEnabled: v });
                }}
              />
              <Link to="/studio/go-live" onClick={closeSettings}>
                <Button size="sm" variant="secondary">
                  Go Live
                </Button>
              </Link>
            </div>
          ),
        },
        {
          id: 'moderators',
          label: tabLabel(Shield, 'Moderators'),
          content: (
            <div className="flex flex-col gap-4">
              <SettingsHint>
                Chat moderators for your live channel.
              </SettingsHint>
              {mods.length === 0 ? (
                <SettingsHint>No moderators yet.</SettingsHint>
              ) : (
                <ul className="flex flex-col gap-2">
                  {mods.map((m) => (
                    <li
                      key={m.id}
                      className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <span>
                        {m.displayName} (@{m.username})
                      </span>
                      <span className="text-foreground-secondary text-xs">
                        {m.canTimeout ? 'timeout' : ''}
                        {m.canTimeout && m.canDelete ? ', ' : ''}
                        {m.canDelete ? 'delete' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <SettingsHint>
                View the current team here. Manage invitations and permissions
                from your account on tahti.live.
              </SettingsHint>
            </div>
          ),
        },
        {
          id: 'multistream',
          label: tabLabel(Cast, 'Multistream'),
          content: (
            <div className="flex flex-col gap-4">
              <SettingsHint>
                Mirror shows to Twitch, YouTube, etc. Paste each platform’s
                stream key.
              </SettingsHint>
              {targets.length === 0 ? (
                <SettingsHint>No destinations yet.</SettingsHint>
              ) : (
                <div className="flex flex-col gap-3">
                  {targets.map((t) => (
                    <PluginItem
                      key={t.id}
                      icon={<Cast size={22} aria-hidden />}
                      name={t.label || t.provider}
                      author={t.provider}
                      description={
                        t.keyLast4
                          ? `${t.rtmpUrl} · key ···${t.keyLast4}`
                          : t.rtmpUrl
                      }
                      disabled={!t.enabled}
                      labels={{ by: 'via' }}
                      rightAccessory={
                        <Toggle
                          checked={t.enabled}
                          onChange={(checked) => {
                            void patchRtmpTarget(t.id, {
                              enabled: checked,
                            }).then(reloadTargets);
                          }}
                          aria-label={`Toggle ${t.label || t.provider}`}
                        />
                      }
                      onRemove={() => {
                        void deleteRtmpTarget(t.id).then(reloadTargets);
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Input
                  label="Provider"
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                />
                <Input
                  label="Label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <Input
                  label="Stream key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={!newKey.trim()}
                  onClick={() => {
                    void createRtmpTarget({
                      provider: newProvider.trim(),
                      streamKey: newKey.trim(),
                      label: newLabel.trim() || undefined,
                    }).then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                      } else {
                        setNewKey('');
                        setNewLabel('');
                        reloadTargets();
                      }
                    });
                  }}
                >
                  Add
                </Button>
              </div>
              {msg && <SettingsHint>{msg}</SettingsHint>}
            </div>
          ),
        },
      ]}
    />
  );
}

function MoneyPanel() {
  const user = useAuthStore((s) => s.user);
  const closeSettings = useSettingsModalStore((s) => s.close);
  const [connect, setConnect] = useState<FanConnectStatus | null>(null);
  const [fanPayouts, setFanPayouts] = useState<FanPayoutStats | null>(null);
  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [estimate, setEstimate] = useState<GrantEstimate | null>(null);
  const [subs, setSubs] = useState<FanSubscriptionRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetchFanConnectStatus(),
      fetchFanPayoutStats(),
      fetchMyGrants(),
      fetchGrantEstimate(),
      user
        ? fetchMySubscriptions()
        : Promise.resolve({ data: [] as FanSubscriptionRow[] }),
    ]).then(([c, payouts, g, e, s]) => {
      setConnect(c.data);
      setFanPayouts(payouts.data);
      setGrants(g.data);
      setEstimate(e.data);
      setSubs(s.data);
    });
  }, [user]);

  return (
    <Tabs
      items={[
        {
          id: 'fan-tiers',
          label: tabLabel(Tag, 'Fan tiers'),
          content: <FanTiersEditor />,
        },
        {
          id: 'fan-subs',
          label: tabLabel(Landmark, 'Fan subs'),
          content: !connect ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-4">
              {fanPayouts ? (
                <FanSubscriptionStats
                  stats={fanPayouts}
                  exportUrl={fanSubscriberExportUrl()}
                />
              ) : null}
              <SettingsInfo
                label="Payments ready"
                value={connect.paymentsReady ? 'Yes' : 'Not yet'}
              />
              <SettingsInfo
                label="Charges enabled"
                value={connect.chargesEnabled ? 'Yes' : 'No'}
              />
              {connect.accountId && (
                <SettingsInfo
                  label="Connect account"
                  value={connect.accountId}
                />
              )}
              <div className="flex flex-wrap gap-2">
                {!connect.paymentsReady && (
                  <Button
                    size="sm"
                    onClick={() => {
                      void startFanConnectOnboard().then((r) => {
                        if (!r.ok) {
                          setMsg(r.error);
                          return;
                        }
                        if ('mockActivated' in r) {
                          setMsg(r.message);
                          void fetchFanConnectStatus().then((x) =>
                            setConnect(x.data),
                          );
                          return;
                        }
                        window.open(r.url, '_blank', 'noopener,noreferrer');
                      });
                    }}
                  >
                    Start / resume onboarding
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void fetchFanConnectPortal().then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                        return;
                      }
                      if ('mockActivated' in r) {
                        setMsg(r.message);
                        return;
                      }
                      window.open(r.url, '_blank', 'noopener,noreferrer');
                    });
                  }}
                >
                  Stripe portal
                </Button>
                <Link to="/studio/revenue" onClick={closeSettings}>
                  <Button size="sm" variant="text">
                    Studio revenue
                  </Button>
                </Link>
              </div>
              {msg && <SettingsHint>{msg}</SettingsHint>}
            </div>
          ),
        },
        {
          id: 'grants',
          label: tabLabel(Gift, 'Grants'),
          content: (
            <div className="flex flex-col gap-4">
              {estimate && (
                <SettingsInfo
                  label={`Estimate ${estimate.year}`}
                  value={`${euros(estimate.estimateCents)} (${estimate.units} units)`}
                  description={
                    estimate.eligible ? 'Eligible' : 'Not currently eligible'
                  }
                />
              )}
              {grants.length === 0 ? (
                <SettingsHint>No grant rows yet.</SettingsHint>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {grants.map((g) => (
                    <li
                      key={`${g.forYear}-${g.state}`}
                      className="border-border rounded-md border px-3 py-2"
                    >
                      {g.forYear}: {euros(g.amountCents)} — {g.state}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        },
        {
          id: 'subscriptions',
          label: tabLabel(Wallet, 'Your subs'),
          content: (
            <div className="flex flex-col gap-4">
              {!user ? (
                <SettingsHint>
                  Sign in to see subscriptions you pay for.
                </SettingsHint>
              ) : subs.length === 0 ? (
                <SettingsHint>
                  No fan subscriptions on this account.
                </SettingsHint>
              ) : (
                <ul className="flex flex-col gap-2">
                  {subs.map((s) => (
                    <li
                      key={s.id}
                      className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <Link
                          to="/u/$username"
                          params={{ username: s.artist.username }}
                          onClick={closeSettings}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {s.artist.displayName}
                        </Link>
                        <p className="text-foreground-secondary text-xs">
                          {s.tierName}, {euros(s.amountCents)}/mo, {s.state}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        },
      ]}
    />
  );
}

function NotificationsPanel() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    void fetchNotificationPrefs().then((r) => setPrefs(r.data));
  }, []);

  const set = (key: keyof NotificationPrefs, value: boolean) => {
    if (!prefs) {
      return;
    }
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    void patchNotificationPrefs({ [key]: value });
  };

  if (!prefs) {
    return <SettingsHint>Loading…</SettingsHint>;
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsToggle
        label="Email: new fan subscriber"
        value={prefs.emailFanSub}
        onChange={(v) => set('emailFanSub', v)}
      />
      <SettingsToggle
        label="Email: comments"
        value={prefs.emailComment}
        onChange={(v) => set('emailComment', v)}
      />
      <SettingsToggle
        label="Email: mentions"
        value={prefs.emailMention}
        onChange={(v) => set('emailMention', v)}
      />
      <SettingsToggle
        label="Email: broadcast reminders"
        value={prefs.emailBroadcastReminder}
        onChange={(v) => set('emailBroadcastReminder', v)}
      />
      <SettingsToggle
        label="Push: when you go live (followers)"
        value={prefs.pushLiveStart}
        onChange={(v) => set('pushLiveStart', v)}
      />
      <SettingsToggle
        label="Weekly digest"
        value={prefs.digestWeekly}
        onChange={(v) => set('digestWeekly', v)}
      />
    </div>
  );
}

/** App-store-style listener widgets: SoundCloud/YouTube embeds (paste a
 * URL, plays via that platform's own player) and a curated internet radio
 * station catalog (tunes into the main player bar). All local to this
 * browser — see stores/listenerWidgetsStore.ts. */
function WidgetsPanel() {
  const installedTypeIds = useListenerWidgetsStore((s) => s.installedTypeIds);
  const instances = useListenerWidgetsStore((s) => s.instances);
  const enabledStationIds = useListenerWidgetsStore((s) => s.enabledStationIds);
  const installType = useListenerWidgetsStore((s) => s.installType);
  const uninstallType = useListenerWidgetsStore((s) => s.uninstallType);
  const addInstance = useListenerWidgetsStore((s) => s.addInstance);
  const removeInstance = useListenerWidgetsStore((s) => s.removeInstance);
  const toggleStation = useListenerWidgetsStore((s) => s.toggleStation);
  const play = usePlayerStore((s) => s.play);
  const user = useAuthStore((s) => s.user);
  const signedIn = Boolean(user);
  const hasChannel = Boolean(user?.channel);

  const [inputByType, setInputByType] = useState<Record<string, string>>({});
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestLogoUrl, setSuggestLogoUrl] = useState('');
  const [suggestLanguage, setSuggestLanguage] = useState('');
  const [suggestBitrate, setSuggestBitrate] = useState('');
  const [suggestStreamUrl, setSuggestStreamUrl] = useState('');
  const [suggestBusy, setSuggestBusy] = useState(false);
  const [suggestMsg, setSuggestMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {signedIn ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            Disco-widgets
          </h2>
          <DiscoWidgetManagerPanel
            scope="LISTENER"
            description="Sandboxed add-ons on your Listen page — only you see what you enable here."
          />
        </div>
      ) : (
        <p className="text-foreground-secondary text-sm">
          Sign in to install Disco-widgets on your Listen page.
        </p>
      )}
      {hasChannel ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            Channel Disco-widgets
          </h2>
          <DiscoWidgetManagerPanel
            scope="ARTIST"
            description="Widgets on your public channel and artist page. Listeners see these when they visit you."
          />
        </div>
      ) : null}
      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
          Embed widgets
        </h2>
        <div className="flex flex-col gap-3">
          {LISTENER_WIDGET_TYPES.map((type) => {
            const isInstalled = installedTypeIds.includes(type.id);
            const typeInstances = instances.filter((i) => i.typeId === type.id);
            return (
              <div key={type.id} className="flex flex-col gap-2">
                <PluginStoreItem
                  name={type.name}
                  author={type.author}
                  description={type.description}
                  category={type.category}
                  isInstalled={isInstalled}
                  onInstall={() => installType(type.id)}
                />
                {isInstalled && (
                  <div className="border-border ml-2 flex flex-col gap-3 border-l pl-4">
                    {typeInstances.map((instance) => (
                      <ListenerWidgetEmbed
                        key={instance.id}
                        instance={instance}
                        onRemove={() => removeInstance(instance.id)}
                      />
                    ))}
                    <form
                      className="flex flex-wrap items-end gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = (inputByType[type.id] ?? '').trim();
                        if (!input) {
                          return;
                        }
                        addInstance(type.id, input, type.name);
                        setInputByType((prev) => ({ ...prev, [type.id]: '' }));
                      }}
                    >
                      <Input
                        label={`Add a ${type.name} link`}
                        value={inputByType[type.id] ?? ''}
                        onChange={(e) =>
                          setInputByType((prev) => ({
                            ...prev,
                            [type.id]: e.target.value,
                          }))
                        }
                        placeholder={type.placeholder}
                        className="min-w-[18rem] flex-1"
                      />
                      <Button size="sm" type="submit">
                        Add
                      </Button>
                    </form>
                    <div className="flex items-center justify-between">
                      <p className="text-foreground-secondary text-xs">
                        {type.helpText}
                      </p>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => uninstallType(type.id)}
                      >
                        Uninstall
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Internet radio
          </h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSuggestOpen((v) => !v)}
          >
            {suggestOpen ? 'Cancel' : 'Suggest a station'}
          </Button>
        </div>

        {suggestOpen && (
          <form
            className="border-border bg-background-secondary/40 mb-4 flex flex-col gap-3 rounded-lg border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSuggestBusy(true);
              setSuggestMsg(null);
              void submitRadioStationSuggestion({
                name: suggestName.trim(),
                logoUrl: suggestLogoUrl.trim(),
                language: suggestLanguage.trim(),
                bitrateKbps: suggestBitrate.trim(),
                streamUrl: suggestStreamUrl.trim(),
              }).then((r) => {
                setSuggestBusy(false);
                if (!r.ok) {
                  setSuggestMsg(r.error);
                  return;
                }
                setSuggestMsg('Thanks — sent to the Tahti team for review.');
                setSuggestName('');
                setSuggestLogoUrl('');
                setSuggestLanguage('');
                setSuggestBitrate('');
                setSuggestStreamUrl('');
              });
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Station name"
                value={suggestName}
                onChange={(e) => setSuggestName(e.target.value)}
                required
              />
              <Input
                label="Language"
                value={suggestLanguage}
                onChange={(e) => setSuggestLanguage(e.target.value)}
                placeholder="Finnish"
              />
              <Input
                label="Bitrate (kbps)"
                value={suggestBitrate}
                onChange={(e) => setSuggestBitrate(e.target.value)}
                placeholder="128"
              />
              <Input
                label="Logo URL"
                value={suggestLogoUrl}
                onChange={(e) => setSuggestLogoUrl(e.target.value)}
                placeholder="https://…"
              />
              <Input
                label="Stream URL"
                value={suggestStreamUrl}
                onChange={(e) => setSuggestStreamUrl(e.target.value)}
                placeholder="https://stream.example.fi/station.mp3"
                className="sm:col-span-2"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                type="submit"
                disabled={
                  suggestBusy || !suggestName.trim() || !suggestStreamUrl.trim()
                }
              >
                {suggestBusy ? 'Sending…' : 'Send for review'}
              </Button>
              {suggestMsg && (
                <p className="text-foreground-secondary text-xs">
                  {suggestMsg}
                </p>
              )}
            </div>
          </form>
        )}

        <CardGrid>
          {RADIO_STATIONS.map((station) => (
            <Card
              key={station.id}
              src={station.logoUrl}
              title={station.name}
              subtitle={`${station.language} · ${station.bitrateKbps}kbps ${station.codec}`}
              favorited={enabledStationIds.includes(station.id)}
              onFavorite={() => toggleStation(station.id)}
              playLabel={station.streamUrl ? 'Play' : 'Stream pending'}
              playDisabled={!station.streamUrl}
              onPlay={
                station.streamUrl
                  ? () =>
                      play(
                        radioStationPlayable({
                          ...station,
                          streamUrl: station.streamUrl!,
                        }),
                      )
                  : undefined
              }
            />
          ))}
        </CardGrid>
      </div>
    </div>
  );
}

const THEME_MODE_OPTIONS = [
  { id: 'light' as const, label: 'Light' },
  { id: 'dark' as const, label: 'Dark' },
  { id: 'dynamic' as const, label: 'Dynamic' },
];

function ThemesPanel() {
  const {
    themes,
    customThemes,
    themeId,
    colorMode,
    setTheme,
    setColorMode,
    importCustomTheme,
    removeCustomTheme,
  } = useThemeStore();
  const [themeJson, setThemeJson] = useState('');
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const customEntries = Object.entries(customThemes);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SettingsHint>
          Choose a palette and the light, dark, or time-of-day appearance that
          suits you.
        </SettingsHint>
        <div className="flex items-center gap-3">
          {THEME_MODE_OPTIONS.map((mode) => (
            <Button
              key={mode.id}
              size="sm"
              variant={colorMode === mode.id ? undefined : 'text'}
              onClick={() => setColorMode(mode.id)}
            >
              {mode.id === 'dynamic' && <SunMoon size={14} />}
              {mode.label}
            </Button>
          ))}
        </div>
        {colorMode === 'dynamic' && (
          <p className="text-foreground-secondary text-xs">
            Dark from 7pm to 7am, light the rest of the day.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {themes.map((theme) => {
          const active = theme.id === themeId;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className={
                active
                  ? 'border-border bg-primary rounded-lg border p-4 text-left'
                  : 'border-border bg-background hover:bg-background-secondary rounded-lg border p-4 text-left'
              }
            >
              <div className="mb-3 flex gap-2">
                {theme.palette.map((color) => (
                  <span
                    key={color}
                    className="border-border size-8 rounded-md border"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <div className="font-bold">{theme.name}</div>
              <div className="text-foreground-secondary text-xs">
                {theme.id}
              </div>
            </button>
          );
        })}
      </div>

      {customEntries.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-foreground-secondary text-xs uppercase">
            Your imported themes
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {customEntries.map(([id, theme]) => {
              const active = id === themeId;
              return (
                <div
                  key={id}
                  className={
                    active
                      ? 'border-border bg-primary rounded-lg border p-4'
                      : 'border-border bg-background hover:bg-background-secondary rounded-lg border p-4'
                  }
                >
                  <button
                    type="button"
                    onClick={() => setTheme(id)}
                    className="w-full text-left"
                  >
                    {theme.palette && (
                      <div className="mb-3 flex gap-2">
                        {theme.palette.map((color, i) => (
                          <span
                            key={`${color}-${i}`}
                            className="border-border size-8 rounded-md border"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="font-bold">{theme.name}</div>
                    {theme.author && (
                      <div className="text-foreground-secondary text-xs">
                        by {theme.author}
                      </div>
                    )}
                  </button>
                  <Button
                    size="sm"
                    variant="text"
                    className="mt-2"
                    onClick={() => removeCustomTheme(id)}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="font-bold">Import a theme</h3>
        <SettingsHint>
          Paste a theme JSON (matches @nuclearplayer/themes' AdvancedThemeSchema
          — version, name, and vars / dark CSS variable overrides) to add it
          without a code change.
        </SettingsHint>
        <textarea
          className="border-border bg-background text-foreground rounded-md border px-3 py-2 font-mono text-xs"
          rows={6}
          value={themeJson}
          onChange={(e) => setThemeJson(e.target.value)}
          placeholder={
            '{\n  "version": 1,\n  "name": "My theme",\n  "vars": { "primary": "oklch(0.7 0.15 250)" }\n}'
          }
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={!themeJson.trim()}
            onClick={() => {
              let parsed: unknown;
              try {
                parsed = JSON.parse(themeJson);
              } catch {
                setImportMsg('Not valid JSON.');
                return;
              }
              const result = importCustomTheme(parsed);
              if (!result.ok) {
                setImportMsg(result.error);
              } else {
                setImportMsg(null);
                setThemeJson('');
              }
            }}
          >
            Import & apply
          </Button>
          {importMsg && (
            <span className="text-accent-red text-xs">{importMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ConnectionsPanel() {
  const closeSettings = useSettingsModalStore((s) => s.close);
  return (
    <div className="flex flex-col gap-6">
      <SettingsHint>
        Manage where music comes from and where finished music can be sent.
        Social links live under Artist → Social links.
      </SettingsHint>
      <Link to="/sources" onClick={closeSettings}>
        <Button size="sm">Open Sources</Button>
      </Link>
      <ImportExportPanel />
    </div>
  );
}
