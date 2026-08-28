import { Link } from '@tanstack/react-router';
import {
  Bell,
  Cast,
  Compass,
  CreditCardIcon,
  Database,
  Download,
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
  Trash2,
  User,
  UserCircle2,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Input,
  PluginItem,
  SaveButton,
  Select,
  Tabs,
  Textarea,
  Toggle,
  type SelectOption,
} from '@nuclearplayer/ui';

import {
  fetchChannelMembers,
  fetchDiscoveryPrefs,
  fetchGreenRoomPrefs,
  fetchModerators,
  fetchNotificationPrefs,
  fetchSocialConnections,
  patchDiscoveryPrefs,
  patchGreenRoomPrefs,
  patchNotificationPrefs,
  patchSocialConnections,
  type ChannelMember,
  type DiscoveryPrefs,
  type GreenRoomPrefs,
  type ModeratorRow,
  type NotificationPrefs,
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
  requestAccountDeletion,
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
  fetchStorageUsage,
  patchMeProfile,
  patchProgramme,
  type ProfileFields,
  type ProgrammeView,
  type StorageUsage,
} from '../../api/studio-extras';
import type { FanSubscriptionRow, MembershipStatus } from '../../api/types';
import { ApiTokensPanel } from '../../components/ApiTokensPanel';
import { ChannelControlsWidget } from '../../components/ChannelControlsWidget';
import { ChannelDesigner } from '../../components/ChannelDesigner';
import { FanSubscriptionStats } from '../../components/FanSubscriptionStats';
import { FanTiersEditor } from '../../components/FanTiersEditor';
import { GenrePicker } from '../../components/GenrePicker';
import { PluginStorePanel } from '../../components/PluginStorePanel';
import { SecurityTotpPanel } from '../../components/SecurityTotpPanel';
import { SidebarBuildInfo } from '../../components/SidebarBuildInfo';
import { SocialLinkIcon } from '../../components/SocialLinkIcon';
import { ThemeEditor } from '../../components/ThemeEditor';
import { hasAccountRole } from '../../lib/accountRoles';
import { COUNTRIES, flagEmoji } from '../../lib/countries';
import {
  formatGenreTags,
  MAX_GENRES,
  normalizeGenresForPicker,
  parseGenreTags,
} from '../../lib/genres';
import { membershipStatusLabel } from '../../lib/membershipStatus';
import {
  multicastProviders,
  type MulticastProviderId,
} from '../../plugins/multicast';
import { useThemeStore } from '../../plugins/themes';
import { useAuthModalStore } from '../../stores/authModalStore';
import { useAuthStore } from '../../stores/authStore';
import { useChannelShareStore } from '../../stores/channelShareStore';
import { useSettingsModalStore } from '../../stores/settingsModalStore';
import { StudioBrandingPanel } from '../studio/StudioBrandingView';
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
    case 'audience':
      content = <MoneyPanel />;
      break;
    case 'themes':
      content = <ThemesPanel />;
      break;
    case 'plugin-store':
      content = <PluginStorePanel />;
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
  const [subscriptions, setSubscriptions] = useState<FanSubscriptionRow[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }
    void fetchMembership().then((r) => {
      setMembership(r.data);
    });
  }, [user]);

  useEffect(() => {
    void fetchMySubscriptions().then((r) => setSubscriptions(r.data));
  }, []);

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
      className="min-w-0"
      listClassName="flex-wrap"
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
          content: (
            <div className="flex flex-col gap-6">
              <SecurityTotpPanel />
              <ApiTokensPanel />
            </div>
          ),
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
          id: 'storage',
          label: tabLabel(Database, 'Storage'),
          content: <AccountStoragePanel />,
        },
        {
          id: 'notifications',
          label: tabLabel(Bell, 'Notifications & visibility'),
          content: <NotificationsVisibilityPanel />,
        },
        {
          id: 'subscriptions',
          label: tabLabel(Wallet, 'Your subs'),
          content: (
            <div className="flex flex-col gap-4">
              {subscriptions.length === 0 ? (
                <SettingsHint>
                  No fan subscriptions on this account.
                </SettingsHint>
              ) : (
                <ul className="flex flex-col gap-2">
                  {subscriptions.map((subscription) => (
                    <li
                      key={subscription.id}
                      className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <Link
                          to="/u/$username"
                          params={{ username: subscription.artist.username }}
                          onClick={closeSettings}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {subscription.artist.displayName}
                        </Link>
                        <p className="text-foreground-secondary text-xs">
                          {subscription.tierName},{' '}
                          {euros(subscription.amountCents)}/mo,{' '}
                          {subscription.state}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        },
        {
          id: 'privacy',
          label: tabLabel(Shield, 'Privacy & data'),
          content: <PrivacyDataPanel username={user.username} />,
        },
      ]}
    />
  );
}

function formatStorageBytes(bytes: number | null): string {
  if (bytes == null || !Number.isFinite(bytes)) {
    return '—';
  }
  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  }
  if (bytes >= 1024 ** 2) {
    return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function AccountStoragePanel() {
  const [storage, setStorage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    void fetchStorageUsage().then((result) => setStorage(result.data));
  }, []);

  if (!storage) {
    return <SettingsHint>Loading storage usage…</SettingsHint>;
  }

  const usedPercent = storage.quotaBytes
    ? Math.min(100, (storage.usedBytes / storage.quotaBytes) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Database size={19} aria-hidden />
        </div>
        <div>
          <h2 className="font-semibold">Your storage</h2>
          <p className="text-foreground-secondary mt-1 text-sm">
            Audio, images, releases, and other files saved to your account.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SettingsInfo
          label="Used"
          value={formatStorageBytes(storage.usedBytes)}
        />
        <SettingsInfo
          label="Quota"
          value={
            storage.unlimited
              ? 'Unlimited'
              : formatStorageBytes(storage.quotaBytes)
          }
        />
      </div>
      {!storage.unlimited && storage.quotaBytes ? (
        <div className="flex flex-col gap-2">
          <div className="bg-background-secondary h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-[width]"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="text-foreground-secondary text-xs">
            {Math.round(usedPercent)}% of your available storage is in use.
          </p>
        </div>
      ) : null}
      <SettingsHint>
        Membership accounts receive expanded storage according to the current
        Tahti storage policy.
      </SettingsHint>
    </div>
  );
}

function PrivacyDataPanel({ username }: { username: string }) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submitDeletionRequest = () => {
    if (!reason.trim()) {
      return;
    }
    setPending(true);
    setMessage(null);
    void requestAccountDeletion(reason.trim()).then((result) => {
      setPending(false);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setReason('');
      setMessage(
        `Deletion request submitted (ticket ${result.ticketId}). The Tahti team will follow up by email.`,
      );
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-semibold">Your data</h2>
        <p className="text-foreground-secondary mt-1 text-sm">
          Download a copy of your account data or request deletion under GDPR.
          Deletion requests are reviewed manually.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href="/tahti-api/api/me/data-export.json"
          className="border-border hover:border-primary flex items-center gap-3 rounded-lg border p-3 transition-colors"
        >
          <Download size={17} aria-hidden />
          <span>
            <span className="block text-sm font-semibold">Data export</span>
            <span className="text-foreground-secondary block text-xs">
              Full account JSON download
            </span>
          </span>
        </a>
        <a
          href="/tahti-api/api/me/press-kit.json"
          className="border-border hover:border-primary flex items-center gap-3 rounded-lg border p-3 transition-colors"
        >
          <Download size={17} aria-hidden />
          <span>
            <span className="block text-sm font-semibold">Press kit</span>
            <span className="text-foreground-secondary block text-xs">
              Your artist metadata as JSON
            </span>
          </span>
        </a>
      </div>
      <div className="border-accent-red/40 bg-accent-red/5 flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Trash2 size={17} className="text-accent-red" aria-hidden />
          <h2 className="font-semibold">Request account deletion</h2>
        </div>
        <p className="text-foreground-secondary text-sm">
          This starts a manual review. Your uploads and account data are removed
          according to the retention periods in the privacy policy.
        </p>
        <Textarea
          value={reason}
          rows={3}
          maxLength={2000}
          placeholder="Tell us briefly why you want to delete the account."
          aria-label="Reason for deletion request"
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            className="text-accent-red"
            disabled={pending || !reason.trim()}
            onClick={submitDeletionRequest}
          >
            <Trash2 size={15} aria-hidden className="mr-1.5" />
            {pending ? 'Submitting…' : 'Submit request'}
          </Button>
          {message ? (
            <p className="text-foreground-secondary text-xs" role="status">
              {message}
            </p>
          ) : null}
        </div>
      </div>
      <Link
        to="/privacy"
        className="text-foreground-secondary text-xs hover:underline"
      >
        Read the full privacy policy for @{username}
      </Link>
    </div>
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
      <div className="w-fit min-w-40">
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
      </div>
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
  const refreshAuth = useAuthStore((s) => s.refresh);
  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [social, setSocial] = useState<SocialConnections | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [socialMsg, setSocialMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetchMeProfile(),
      fetchChannelMembers(),
      fetchSocialConnections(),
    ]).then(([p, m, s]) => {
      setProfile(p.data);
      setMembers(m.data);
      setSocial(s.data);
    });
  }, []);

  const saveArtistInfo = () => {
    if (!profile) {
      return;
    }
    setBusy(true);
    void patchMeProfile({
      displayName: profile.displayName.trim(),
      bio: profile.bio?.trim() || null,
      fullBio: profile.fullBio?.trim() || null,
      tipJarUrl: profile.tipJarUrl?.trim() || null,
      pronouns: profile.pronouns?.trim() || null,
      chatEnabled: profile.chatEnabled,
      showFollowers: profile.showFollowers,
      showFollowing: profile.showFollowing,
      artistKind: profile.artistKind ?? 'SINGLE',
      countryCode: profile.countryCode,
      defaultLocation: profile.defaultLocation?.trim() || null,
    }).then((result) => {
      setBusy(false);
      setMsg(result.ok ? 'Artist info saved.' : result.error);
      if (result.ok) {
        setProfile(result.data);
        void refreshAuth();
        toast.success('Artist info saved.');
      } else {
        toast.error(result.error);
      }
    });
  };

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
          id: 'identity',
          label: tabLabel(UserCircle2, 'Identity'),
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
              <PronounsField profile={profile} setProfile={setProfile} />
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
              <div className="flex justify-end">
                <SaveButton
                  saving={busy}
                  label="Save identity"
                  onClick={saveArtistInfo}
                />
              </div>
              {msg && <SettingsHint>{msg}</SettingsHint>}
            </div>
          ),
        },
        {
          id: 'story',
          label: tabLabel(UserCircle2, 'Story'),
          content: !profile ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-1">
                <span className="text-foreground text-sm font-semibold">
                  Short bio
                </span>
                <textarea
                  className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                  rows={4}
                  value={profile.bio ?? ''}
                  onChange={(event) =>
                    setProfile({ ...profile, bio: event.target.value })
                  }
                  placeholder="The concise introduction shown on your profile."
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-foreground text-sm font-semibold">
                  Your story
                </span>
                <textarea
                  className="border-border bg-background rounded-md border px-3 py-2 text-sm"
                  rows={8}
                  value={profile.fullBio ?? ''}
                  onChange={(event) =>
                    setProfile({ ...profile, fullBio: event.target.value })
                  }
                  placeholder="Share your history, influences, milestones, and what listeners should know."
                />
              </label>
              <div className="flex justify-end">
                <SaveButton
                  saving={busy}
                  label="Save story"
                  onClick={saveArtistInfo}
                />
              </div>
              {msg && <SettingsHint>{msg}</SettingsHint>}
            </div>
          ),
        },
        {
          id: 'people',
          label: tabLabel(Users, 'People'),
          content: (
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-foreground text-sm font-semibold">
                  Project type
                </span>
                <span className="text-foreground-secondary text-xs">
                  Tell listeners whether this profile represents one artist or a
                  collective.
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
                      aria-pressed={(profile?.artistKind ?? 'SINGLE') === kind}
                      onClick={() =>
                        profile && setProfile({ ...profile, artistKind: kind })
                      }
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        (profile?.artistKind ?? 'SINGLE') === kind
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </label>
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="text-foreground text-sm font-semibold">
                    Members and credits
                  </h3>
                  <p className="text-foreground-secondary mt-1 text-xs">
                    People shown alongside this project on its public artist
                    page.
                  </p>
                </div>
                {members.length === 0 ? (
                  <SettingsHint>No members listed.</SettingsHint>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {members.map((member) => (
                      <li
                        key={member.id}
                        className="border-border flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span>
                          {member.displayName} (@{member.username})
                        </span>
                        <span className="text-foreground-secondary text-xs uppercase">
                          {member.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex justify-end">
                <SaveButton
                  saving={busy}
                  label="Save people settings"
                  onClick={saveArtistInfo}
                />
              </div>
              {msg && <SettingsHint>{msg}</SettingsHint>}
            </div>
          ),
        },
        {
          id: 'connections',
          label: tabLabel(Share2, 'Connections'),
          content: !social ? (
            <SettingsHint>Loading…</SettingsHint>
          ) : (
            <div className="flex flex-col gap-6">
              <SettingsHint>
                Add the places listeners can find you. These links appear as
                branded buttons on your public artist profile.
              </SettingsHint>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ['website', 'Website'],
                    ['instagram', 'Instagram'],
                    ['bandcamp', 'Bandcamp'],
                    ['soundcloud', 'SoundCloud'],
                    ['youtube', 'YouTube'],
                    ['hearthisAt', 'hearthis.at'],
                    ['mixcloud', 'Mixcloud'],
                    ['twitch', 'Twitch'],
                    ['kick', 'Kick'],
                    ['spotify', 'Spotify'],
                    ['discord', 'Discord'],
                    ['tiktok', 'TikTok'],
                    ['twitter', 'X / Twitter'],
                    ['facebook', 'Facebook'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
                      <SocialLinkIcon label={label} url={social[key]} />
                      {label}
                    </span>
                    <Input
                      aria-label={label}
                      value={social[key]}
                      placeholder={`https://…/${label.toLowerCase()}`}
                      onChange={(e) =>
                        setSocial({ ...social, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <SaveButton
                  label="Save social links"
                  onClick={() => {
                    if (!social) {
                      return;
                    }
                    const { showConnections, ...connectionValues } = social;
                    void Promise.all([
                      patchSocialConnections(connectionValues),
                      patchMeProfile({
                        socialLinks: {
                          ...connectionValues,
                          showConnections: String(showConnections),
                        },
                      }),
                    ]).then(([connectionsResult, profileResult]) => {
                      const error = !connectionsResult.ok
                        ? connectionsResult.error
                        : !profileResult.ok
                          ? profileResult.error
                          : null;
                      setSocialMsg(error ?? 'Connections saved.');
                      if (!error && connectionsResult.ok) {
                        setSocial({
                          ...connectionsResult.data,
                          showConnections,
                        });
                        toast.success('Connections saved.');
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
          id: 'branding',
          label: tabLabel(Paintbrush, 'Branding'),
          content: <StudioBrandingPanel section="branding" />,
        },
        {
          id: 'gallery',
          label: tabLabel(ImageIcon, 'Gallery'),
          content: <StudioBrandingPanel section="gallery" />,
        },
        {
          id: 'presskit',
          label: tabLabel(ImageIcon, 'Press kit'),
          content: <StudioBrandingPanel section="press-kit" />,
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
  const shareEnabled = useChannelShareStore(
    (state) => state.enabledByChannel[channel?.slug ?? ''] !== false,
  );
  const setShareEnabled = useChannelShareStore((state) => state.setEnabled);

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
              <ChannelControlsWidget
                sections={[
                  {
                    id: 'channel-design',
                    title: 'Channel appearance',
                    children: (
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
                    ),
                  },
                ]}
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
                label="Show share button on my channel and Go Live"
                description="Let listeners and collaborators copy or share your live channel link."
                value={shareEnabled}
                onChange={(value) => {
                  if (channel?.slug) {
                    setShareEnabled(channel.slug, value);
                  }
                }}
              />
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

export type BroadcastSection = 'radio' | 'green-room' | 'multistream';

export function BroadcastPanel({
  section,
}: {
  section?: BroadcastSection;
} = {}) {
  const closeSettings = useSettingsModalStore((s) => s.close);
  const [programme, setProgramme] = useState<ProgrammeView | null>(null);
  const [green, setGreen] = useState<GreenRoomPrefs | null>(null);
  const [mods, setMods] = useState<ModeratorRow[]>([]);
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [newProvider, setNewProvider] = useState<MulticastProviderId>('TWITCH');
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newRtmpUrl, setNewRtmpUrl] = useState('');
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

  const items = [
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
          <SettingsHint>Chat moderators for your live channel.</SettingsHint>
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
            View the current team here. Manage invitations and permissions from
            your account on tahti.live.
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
            Mirror shows to Twitch, YouTube, etc. Paste each platform’s stream
            key.
          </SettingsHint>
          <div className="flex flex-col gap-3">
            {multicastProviders.map((provider) => {
              const destination = targets.find(
                (target) => target.provider === provider.id,
              );
              if (!destination) {
                return (
                  <PluginItem
                    key={provider.id}
                    icon={<Cast size={22} aria-hidden />}
                    name={provider.label}
                    author="Multicast"
                    description="Not configured — add the provider credentials to enable it."
                    disabled
                    warning
                    warningText="Configure this destination before activating it."
                    rightAccessory={
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setNewProvider(provider.id)}
                      >
                        Configure
                      </Button>
                    }
                    labels={{ by: 'via' }}
                  />
                );
              }
              return (
                <PluginItem
                  key={destination.id}
                  icon={<Cast size={22} aria-hidden />}
                  name={destination.label || provider.label}
                  author={provider.label}
                  description={`${destination.rtmpUrl} · key ···${destination.keyLast4 ?? 'hidden'}`}
                  disabled={!destination.enabled}
                  labels={{ by: 'via' }}
                  rightAccessory={
                    <Toggle
                      checked={destination.enabled}
                      onChange={(checked) => {
                        void patchRtmpTarget(destination.id, {
                          enabled: checked,
                        }).then(reloadTargets);
                      }}
                      aria-label={`Toggle ${destination.label || provider.label}`}
                    />
                  }
                  onRemove={() => {
                    void deleteRtmpTarget(destination.id).then(reloadTargets);
                  }}
                />
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Select
              label="Provider"
              value={newProvider}
              onValueChange={(value) =>
                setNewProvider(value as MulticastProviderId)
              }
              options={multicastProviders.map((provider) => ({
                id: provider.id,
                label: provider.label,
              }))}
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
            {newProvider === 'CUSTOM' && (
              <Input
                label="RTMP address"
                value={newRtmpUrl}
                onChange={(e) => setNewRtmpUrl(e.target.value)}
                placeholder="rtmp://example.com/live"
              />
            )}
            <Button
              size="sm"
              disabled={
                !newKey.trim() ||
                (newProvider === 'CUSTOM' && !newRtmpUrl.trim())
              }
              onClick={() => {
                void createRtmpTarget({
                  provider: newProvider,
                  streamKey: newKey.trim(),
                  label: newLabel.trim() || undefined,
                  rtmpUrl: newRtmpUrl.trim() || undefined,
                }).then((r) => {
                  if (!r.ok) {
                    setMsg(r.error);
                  } else {
                    setNewKey('');
                    setNewLabel('');
                    setNewRtmpUrl('');
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
  ];

  if (section) {
    return (
      <div className="flex flex-col gap-6">
        {items.find((item) => item.id === section)?.content}
      </div>
    );
  }

  return <Tabs items={items} />;
}

export function MoneyPanel() {
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

  const set = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!prefs) {
      return;
    }
    const previous = prefs[key];
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    const result = await patchNotificationPrefs({ [key]: value });
    if (!result.ok) {
      setPrefs({ ...next, [key]: previous });
      toast.error(result.error);
      return;
    }
    setPrefs(result.data);
    toast.success('Notification preference saved.');
  };

  if (!prefs) {
    return <SettingsHint>Loading…</SettingsHint>;
  }

  const toggle = (key: keyof NotificationPrefs, value: boolean) => {
    void set(key, value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-background-secondary/30 rounded-xl border p-4">
        <h3 className="font-display text-base font-bold">Money moves</h3>
        <p className="text-foreground-secondary mt-1 text-sm">
          When fan subscriptions arrive or payouts complete.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <SettingsToggle
            label="Email me"
            value={prefs.notifyMoneyMovesEmail}
            onChange={(value) => toggle('notifyMoneyMovesEmail', value)}
          />
          <SettingsToggle
            label="In-app"
            value={prefs.notifyMoneyMovesInApp}
            onChange={(value) => toggle('notifyMoneyMovesInApp', value)}
          />
        </div>
        <p className="border-border bg-background mt-4 rounded-lg border px-3 py-2 text-xs">
          Tahti · @aurora_fi subscribed (€5/mo)
        </p>
      </div>
      <div className="border-border bg-background-secondary/30 rounded-xl border p-4">
        <h3 className="font-display text-base font-bold">Listener actions</h3>
        <p className="text-foreground-secondary mt-1 text-sm">
          A daily email digest of new chat messages, comments, and broadcast
          feedback.
        </p>
        <div className="mt-4">
          <SettingsToggle
            label="Email digest, daily"
            value={prefs.notifyListenerActivityEmail}
            onChange={(value) => toggle('notifyListenerActivityEmail', value)}
          />
        </div>
        <p className="border-border bg-background mt-4 rounded-lg border px-3 py-2 text-xs">
          Tahti · 3 new chat messages, 1 new comment on Drift EP
        </p>
      </div>
      <div className="border-border bg-background-secondary/30 rounded-xl border p-4">
        <h3 className="font-display text-base font-bold">Weekly recap</h3>
        <p className="text-foreground-secondary mt-1 text-sm">
          A Sunday summary of your activity and audience.
        </p>
        <div className="mt-4">
          <SettingsToggle
            label="Email me"
            value={prefs.notifyWeeklyRecapEmail}
            onChange={(value) => toggle('notifyWeeklyRecapEmail', value)}
          />
        </div>
        <p className="border-border bg-background mt-4 rounded-lg border px-3 py-2 text-xs">
          Tahti · 1,247 plays · 89 downloads · €115 this week
        </p>
      </div>
    </div>
  );
}

function NotificationsVisibilityPanel() {
  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [savingKey, setSavingKey] = useState<keyof ProfileFields | null>(null);

  useEffect(() => {
    void fetchMeProfile().then((result) => setProfile(result.data));
  }, []);

  const updateVisibility = (
    key:
      | 'showJoinDate'
      | 'showFollowers'
      | 'showFollowing'
      | 'showDailyListeners'
      | 'chatEnabled',
    value: boolean,
  ) => {
    if (!profile) {
      return;
    }
    const previous = profile[key] ?? true;
    setProfile({ ...profile, [key]: value });
    setSavingKey(key);
    void patchMeProfile({ [key]: value }).then((result) => {
      setSavingKey(null);
      if (!result.ok) {
        setProfile({ ...profile, [key]: previous });
        toast.error(result.error);
        return;
      }
      setProfile(result.data);
      toast.success('Visibility setting saved.');
    });
  };

  const updateConnectionsVisibility = (value: boolean) => {
    if (!profile) {
      return;
    }
    const previous = profile.socialLinks;
    setProfile({
      ...profile,
      socialLinks: { ...(previous ?? {}), showConnections: String(value) },
    });
    setSavingKey('chatEnabled');
    void patchMeProfile({
      socialLinks: { ...(previous ?? {}), showConnections: String(value) },
    }).then((result) => {
      setSavingKey(null);
      if (!result.ok) {
        setProfile({ ...profile, socialLinks: previous });
        toast.error(result.error);
        return;
      }
      setProfile(result.data);
      toast.success('Visibility setting saved.');
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight">
          Visibility
        </h2>
        <p className="text-foreground-secondary mt-1 text-sm">
          Choose what appears publicly on your profile and channel.
        </p>
      </div>
      {!profile ? (
        <SettingsHint>Loading…</SettingsHint>
      ) : (
        <div className="flex flex-col gap-5">
          <SettingsToggle
            label="Show join date on my profile"
            value={profile.showJoinDate ?? true}
            onChange={(value) => updateVisibility('showJoinDate', value)}
          />
          <SettingsToggle
            label="Show my followers on my profile"
            value={profile.showFollowers ?? true}
            onChange={(value) => updateVisibility('showFollowers', value)}
          />
          <SettingsToggle
            label="Show who I follow on my profile"
            value={profile.showFollowing ?? true}
            onChange={(value) => updateVisibility('showFollowing', value)}
          />
          <SettingsToggle
            label="Show today’s listener count in my chat"
            value={profile.showDailyListeners ?? true}
            onChange={(value) => updateVisibility('showDailyListeners', value)}
          />
          <SettingsToggle
            label="Enable live chat on my channel"
            value={profile.chatEnabled}
            onChange={(value) => updateVisibility('chatEnabled', value)}
          />
          <SettingsToggle
            label="Show my connections on my artist profile"
            value={profile.socialLinks?.showConnections !== 'false'}
            onChange={updateConnectionsVisibility}
          />
        </div>
      )}
      <div className="border-border border-t pt-5">
        <h2 className="font-display text-lg font-bold tracking-tight">
          Notifications
        </h2>
        <p className="text-foreground-secondary mt-1 mb-5 text-sm">
          Choose which activity reaches you by email or in the app.
        </p>
        <NotificationsPanel />
      </div>
      {savingKey ? (
        <p className="text-foreground-secondary text-xs" role="status">
          Saving visibility…
        </p>
      ) : null}
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

      <Tabs
        items={[
          {
            id: 'browse',
            label: 'Browse',
            content: (
              <div className="flex flex-col gap-6">
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
              </div>
            ),
          },
          {
            id: 'editor',
            label: 'Editor',
            content: <ThemeEditor />,
          },
          {
            id: 'import',
            label: 'Import JSON',
            content: (
              <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
                <h3 className="font-bold">Import a theme</h3>
                <SettingsHint>
                  Paste a theme JSON (matches @nuclearplayer/themes'
                  AdvancedThemeSchema — version, name, and vars / dark CSS
                  variable overrides) to add it without a code change.
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
            ),
          },
        ]}
      />
    </div>
  );
}
