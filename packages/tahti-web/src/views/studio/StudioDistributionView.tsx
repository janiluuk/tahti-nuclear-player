import { Link } from '@tanstack/react-router';
import {
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge, Button, Input, SaveButton, Tabs } from '@nuclearplayer/ui';

import {
  fetchAllRoyalties,
  fetchReleaseCatalog,
  fetchReleaseExportJson,
  fetchReleaseRoyalties,
  fetchRevelatorBilling,
  fetchSpotifyArtistProfile,
  linkSpotifyArtistProfile,
  parseCredits,
  patchReleaseCatalog,
  payAndSubmitToRevelator,
  unlinkSpotifyArtistProfile,
} from '../../api/distribution';
import { fetchStudioReleases } from '../../api/studio';
import type {
  ReleaseCatalog,
  ReleaseChecklistItem,
  ReleaseCredit,
  ReleaseCreditRole,
  RevelatorBillingStatus,
  RevelatorRoyaltyReportRow,
  SpotifyArtistProfile,
  StudioRelease,
} from '../../api/studio-types';
import { RELEASE_CREDIT_ROLES } from '../../api/studio-types';
import { PageLoading } from '../../components/PageStates';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { Eyebrow } from '../../components/tahti/Eyebrow';

const MUSICBRAINZ_SUBMIT_URL = 'https://musicbrainz.org/release/add';
const DISCOGS_SUBMIT_URL = 'https://www.discogs.com/search/';

const MUSICBRAINZ_GUIDE_STEPS = [
  'Export JSON (or copy UPC, ISRC, credits, P/C-lines).',
  'Open MusicBrainz “Add release” and choose the release type.',
  'Enter title, artist credit, and date — match your Tahti release.',
  'Add medium and tracklist; paste ISRCs from your export when you have them.',
  'Add label, catalog number, and barcode if applicable.',
  'Save, then copy the release MBID back into Tahti.',
] as const;

const DISCOGS_GUIDE_STEPS = [
  'Export JSON (or copy title, label, barcode, and credits).',
  'Search Discogs first — only add if the release is missing.',
  'Submit a new release with title, label, format, country, and date.',
  'Add the tracklist in order with durations from your export.',
  'Add barcode and catalog number if applicable, then submit for review.',
  'Copy the release URL or numeric ID back into Tahti.',
] as const;

const POST_RELEASE_CLAIM_LINKS = [
  {
    id: 'spotify',
    label: 'Spotify for Artists',
    url: 'https://artists.spotify.com/',
  },
  {
    id: 'apple',
    label: 'Apple Music for Artists',
    url: 'https://artists.apple.com/',
  },
  {
    id: 'youtube',
    label: 'YouTube Official Artist Channel',
    url: 'https://www.youtube.com/artist',
  },
] as const;

const COLLECTING_SOCIETY_POINTERS = [
  {
    id: 'teosto',
    region: 'Finland',
    label: 'Teosto',
    url: 'https://www.teosto.fi/en/',
    hint: 'Works and performers for public performance royalties.',
  },
  {
    id: 'gramex',
    region: 'Finland',
    label: 'Gramex',
    url: 'https://www.gramex.fi/en/',
    hint: 'Neighbouring rights for recordings.',
  },
  {
    id: 'prs',
    region: 'UK',
    label: 'PRS for Music',
    url: 'https://www.prsformusic.com/',
    hint: 'UK composition performance rights.',
  },
  {
    id: 'ascap',
    region: 'USA',
    label: 'ASCAP',
    url: 'https://www.ascap.com/',
    hint: 'US PRO for songwriters and publishers.',
  },
] as const;

function euros(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

function statusColor(
  status: string | null,
): 'green' | 'yellow' | 'red' | 'secondary' {
  if (status === 'delivered' || status === 'live' || status === 'submitted') {
    return 'green';
  }
  if (status === 'pending') {
    return 'yellow';
  }
  if (status === 'failed') {
    return 'red';
  }
  return 'secondary';
}

function SpotifyProfilePanel() {
  const [configured, setConfigured] = useState(true);
  const [profile, setProfile] = useState<SpotifyArtistProfile | null>(null);
  const [artistUrl, setArtistUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetchSpotifyArtistProfile().then((r) => {
      setConfigured(r.data.configured);
      setProfile(r.data.profile);
    });
  }, []);

  if (!configured) {
    return (
      <StudioPanel title="Spotify artist profile">
        <p className="text-foreground-secondary text-sm">
          Spotify import needs a platform API key that hasn&apos;t been set up
          yet.
        </p>
      </StudioPanel>
    );
  }

  return (
    <StudioPanel
      title="Spotify artist profile"
      description="Link your Spotify artist page so “Your tracks” auto-loads when adding tracks to a collection."
    >
      {profile ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">
            Linked{profile.name ? `: ${profile.name}` : ''}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              if (!confirm('Remove your linked Spotify artist profile?')) {
                return;
              }
              setBusy(true);
              setMsg(null);
              void unlinkSpotifyArtistProfile().then((r) => {
                setBusy(false);
                if (!r.ok) {
                  setMsg(r.error);
                  return;
                }
                setProfile(null);
              });
            }}
          >
            <XIcon size={14} aria-hidden className="mr-1.5" />
            Remove
          </Button>
        </div>
      ) : (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!artistUrl.trim()) {
              return;
            }
            setBusy(true);
            setMsg(null);
            void linkSpotifyArtistProfile(artistUrl.trim()).then((r) => {
              setBusy(false);
              if (!r.ok) {
                setMsg(r.error);
                return;
              }
              setProfile(r.data.profile);
              setArtistUrl('');
            });
          }}
        >
          <Input
            value={artistUrl}
            onChange={(e) => setArtistUrl(e.target.value)}
            placeholder="https://open.spotify.com/artist/…"
            className="min-w-[16rem] flex-1"
          />
          <Button size="sm" type="submit" disabled={busy}>
            {busy ? 'Linking…' : 'Link'}
          </Button>
        </form>
      )}
      {msg && <p className="text-foreground-secondary mt-2 text-xs">{msg}</p>}
    </StudioPanel>
  );
}

type CatalogForm = {
  upc: string;
  musicbrainzReleaseId: string;
  musicbrainzArtistId: string;
  discogsReleaseId: string;
  pLine: string;
  cLine: string;
  labelImprint: string;
};

function catalogToForm(catalog: ReleaseCatalog): CatalogForm {
  return {
    upc: catalog.upc ?? '',
    musicbrainzReleaseId: catalog.musicbrainzReleaseId ?? '',
    musicbrainzArtistId: catalog.musicbrainzArtistId ?? '',
    discogsReleaseId: catalog.discogsReleaseId ?? '',
    pLine: catalog.pLine ?? '',
    cLine: catalog.cLine ?? '',
    labelImprint: catalog.labelImprint ?? '',
  };
}

function ReleaseOpsPanel({ release }: { release: StudioRelease }) {
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState<ReleaseCatalog | null>(null);
  const [form, setForm] = useState<CatalogForm | null>(null);
  const [credits, setCredits] = useState<ReleaseCredit[]>([]);
  const [checklist, setChecklist] = useState<ReleaseChecklistItem[]>([]);
  const [billing, setBilling] = useState<RevelatorBillingStatus | null>(null);
  const [royalties, setRoyalties] = useState<RevelatorRoyaltyReportRow[]>([]);
  const [royaltiesLoaded, setRoyaltiesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const revelatorStatus =
    catalog?.revelatorStatus ?? release.revelatorStatus ?? null;
  const revelatorId = catalog?.revelatorId ?? release.revelatorId ?? null;
  const canSubmit = !revelatorStatus || revelatorStatus === 'failed';
  const showRoyalties =
    revelatorStatus === 'submitted' ||
    revelatorStatus === 'delivered' ||
    revelatorStatus === 'pending';

  const loadOps = () => {
    setLoading(true);
    void Promise.all([
      fetchReleaseCatalog(release.id),
      fetchRevelatorBilling(release.id),
    ]).then(([c, b]) => {
      if (c.data) {
        setCatalog(c.data);
        setForm(catalogToForm(c.data));
        setCredits(parseCredits(c.data.credits));
        setChecklist(c.data.checklist);
      }
      setBilling(b.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    loadOps();
  }, [open, release.id]);

  useEffect(() => {
    if (!open || !showRoyalties || royaltiesLoaded) {
      return;
    }
    void fetchReleaseRoyalties(release.id).then((r) => {
      setRoyalties(r.data);
      setRoyaltiesLoaded(true);
    });
  }, [open, showRoyalties, royaltiesLoaded, release.id]);

  const doneCount = checklist.filter((c) => c.done).length;

  const saveCatalog = () => {
    if (!form) {
      return;
    }
    setBusy(true);
    setMsg(null);
    const trimmedCredits = credits
      .map((c) => {
        const handle = c.artistUsername?.trim().replace(/^@/, '').toLowerCase();
        return {
          role: c.role,
          name: c.name.trim(),
          ...(handle && /^[a-z0-9_-]{2,32}$/.test(handle)
            ? { artistUsername: handle }
            : {}),
        };
      })
      .filter((c) => c.name.length > 0);

    void patchReleaseCatalog(release.id, {
      upc: form.upc.trim() || null,
      musicbrainzReleaseId: form.musicbrainzReleaseId.trim() || null,
      musicbrainzArtistId: form.musicbrainzArtistId.trim() || null,
      discogsReleaseId: form.discogsReleaseId.trim() || null,
      pLine: form.pLine.trim() || null,
      cLine: form.cLine.trim() || null,
      labelImprint: form.labelImprint.trim() || null,
      credits: trimmedCredits,
    }).then((r) => {
      setBusy(false);
      if (!r.ok) {
        setMsg(r.error);
        return;
      }
      setCatalog(r.data);
      setForm(catalogToForm(r.data));
      setCredits(parseCredits(r.data.credits));
      setChecklist(r.data.checklist);
      setMsg('Catalog saved.');
    });
  };

  const runExport = async (
    mode: 'download' | 'musicbrainz' | 'discogs',
  ): Promise<void> => {
    setBusy(true);
    setMsg(null);
    const res = await fetchReleaseExportJson(release.id);
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    if (mode === 'download') {
      const blob = new Blob([res.json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `release-${release.smartLinkSlug}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Exported JSON.');
      return;
    }
    try {
      const pack = JSON.parse(res.json) as {
        musicbrainzPrefill?: string;
        discogsPrefill?: string;
      };
      const text =
        mode === 'musicbrainz' ? pack.musicbrainzPrefill : pack.discogsPrefill;
      if (!text) {
        setMsg(`Export missing ${mode} prefill`);
        return;
      }
      await navigator.clipboard.writeText(text);
      setMsg(
        mode === 'musicbrainz'
          ? 'MusicBrainz prefill copied.'
          : 'Discogs prefill copied.',
      );
    } catch {
      setMsg('Could not read export pack');
    }
  };

  const catalogTab = (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-1 text-xs">
        {checklist.map((step) => (
          <li key={step.id}>
            <span className="mr-1.5">{step.done ? '✓' : '○'}</span>
            <strong>{step.label}</strong>
            {step.hint && (
              <span className="text-foreground-secondary"> — {step.hint}</span>
            )}
          </li>
        ))}
      </ul>

      <div className="grid gap-2 sm:grid-cols-2">
        {(
          [
            ['UPC / EAN', 'upc'],
            ['MusicBrainz release MBID', 'musicbrainzReleaseId'],
            ['MusicBrainz artist MBID', 'musicbrainzArtistId'],
            ['Discogs release ID', 'discogsReleaseId'],
            ['P-line', 'pLine'],
            ['C-line', 'cLine'],
            ['Label imprint', 'labelImprint'],
          ] as const
        ).map(([label, key]) => (
          <label key={key} className="flex flex-col gap-1 text-xs">
            <span className="text-foreground-secondary">{label}</span>
            <Input
              value={form?.[key] ?? ''}
              disabled={busy}
              onChange={(e) =>
                setForm((previous) =>
                  previous ? { ...previous, [key]: e.target.value } : previous,
                )
              }
            />
          </label>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium">Credits & roles</p>
        {credits.length === 0 && (
          <p className="text-foreground-secondary mb-2 text-xs">
            No credits yet — add writers, performers, producers, etc.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {credits.map((credit, index) => (
            <li
              key={index}
              className="grid gap-2 sm:grid-cols-[8rem_1fr_8rem_auto]"
            >
              <select
                className="border-border bg-background rounded-md border px-2 py-1.5 text-xs"
                value={credit.role}
                disabled={busy}
                aria-label="Credit role"
                onChange={(e) => {
                  const next = [...credits];
                  next[index] = {
                    ...credit,
                    role: e.target.value as ReleaseCreditRole,
                  };
                  setCredits(next);
                }}
              >
                {RELEASE_CREDIT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <Input
                value={credit.name}
                placeholder="Name"
                disabled={busy}
                aria-label="Credit name"
                onChange={(e) => {
                  const next = [...credits];
                  next[index] = { ...credit, name: e.target.value };
                  setCredits(next);
                }}
              />
              <Input
                value={credit.artistUsername ? `@${credit.artistUsername}` : ''}
                placeholder="@username"
                disabled={busy}
                maxLength={33}
                aria-label="Tahti username"
                onChange={(e) => {
                  const raw = e.target.value
                    .trim()
                    .replace(/^@/, '')
                    .toLowerCase();
                  const next = [...credits];
                  next[index] = {
                    ...credit,
                    artistUsername: raw.length > 0 ? raw : undefined,
                  };
                  setCredits(next);
                }}
              />
              <Button
                size="icon-sm"
                variant="text"
                disabled={busy}
                aria-label={`Remove credit ${credit.name || index + 1}`}
                onClick={() =>
                  setCredits(credits.filter((_, i) => i !== index))
                }
              >
                <Trash2Icon size={14} aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          variant="secondary"
          className="mt-2"
          disabled={busy}
          onClick={() => setCredits([...credits, { role: 'writer', name: '' }])}
        >
          <PlusIcon size={14} aria-hidden className="mr-1.5" />
          Add credit
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <SaveButton saving={busy} label="Save catalog" onClick={saveCatalog} />
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => void runExport('download')}
        >
          <DownloadIcon size={14} aria-hidden className="mr-1.5" />
          Export JSON
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => void runExport('musicbrainz')}
        >
          <CopyIcon size={14} aria-hidden className="mr-1.5" />
          Copy MusicBrainz prefill
        </Button>
        <a
          href={MUSICBRAINZ_SUBMIT_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground-secondary hover:text-foreground inline-flex items-center gap-1 text-xs underline underline-offset-2"
        >
          Add on MusicBrainz
          <ExternalLinkIcon size={12} aria-hidden />
        </a>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => void runExport('discogs')}
        >
          <CopyIcon size={14} aria-hidden className="mr-1.5" />
          Copy Discogs prefill
        </Button>
        <a
          href={DISCOGS_SUBMIT_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground-secondary hover:text-foreground inline-flex items-center gap-1 text-xs underline underline-offset-2"
        >
          Search on Discogs
          <ExternalLinkIcon size={12} aria-hidden />
        </a>
      </div>
      {msg && <p className="text-xs">{msg}</p>}
    </div>
  );

  const deliveryTab = (
    <div className="flex flex-col gap-3">
      <p className="text-foreground-secondary text-xs">
        Submits catalog metadata to Revelator (Spotify, Apple, etc.). Requires
        UPC or ISRC on every track.
      </p>
      {revelatorStatus && (
        <p className="text-xs">
          Status: <strong>{revelatorStatus}</strong>
          {revelatorId && (
            <span className="text-foreground-secondary">
              {' '}
              · id {revelatorId}
            </span>
          )}
        </p>
      )}
      {billing && !billing.paid && (
        <p className="text-foreground-secondary text-xs">
          {billing.feeCents === 0 && billing.studioIncludedRemaining != null
            ? `Studio included slot (${billing.studioIncludedRemaining} left this year)`
            : `Distribution fee: ${euros(billing.feeCents)}`}
        </p>
      )}
      {billing?.paid && (
        <p className="text-foreground-secondary text-xs">
          {billing.waived
            ? 'Fee waived (Studio included)'
            : `Distribution fee paid${
                billing.distributionPaidAt
                  ? ` on ${new Date(billing.distributionPaidAt).toLocaleDateString()}`
                  : ''
              }`}
        </p>
      )}
      <Button
        size="sm"
        className="self-start"
        disabled={busy || !canSubmit}
        onClick={() => {
          setBusy(true);
          setMsg(null);
          void payAndSubmitToRevelator(release.id).then((r) => {
            setBusy(false);
            if (!r.ok) {
              setMsg(r.error);
              return;
            }
            if ('checkoutUrl' in r) {
              window.location.href = r.checkoutUrl;
              return;
            }
            setMsg('Submitted to Revelator.');
            setCatalog((prev) =>
              prev
                ? { ...prev, revelatorStatus: r.data.revelatorStatus }
                : prev,
            );
            setBilling((prev) => (prev ? { ...prev, paid: true } : prev));
            loadOps();
          });
        }}
      >
        {!busy && <SendIcon size={14} aria-hidden className="mr-1.5" />}
        {busy
          ? 'Submitting…'
          : billing && !billing.paid && billing.feeCents > 0
            ? `Pay ${euros(billing.feeCents)} & submit`
            : 'Submit to Revelator'}
      </Button>

      {showRoyalties && (
        <div className="border-border border-t pt-3">
          <p className="mb-1 text-xs font-medium">Royalty reports</p>
          {!royaltiesLoaded ? (
            <PageLoading label="Loading…" />
          ) : royalties.length === 0 ? (
            <p className="text-foreground-secondary text-xs">
              No reports yet — synced monthly after DSP delivery.
            </p>
          ) : (
            <ul className="divide-border divide-y text-xs">
              {royalties.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-1.5"
                >
                  <span>{row.periodStart.slice(0, 7)}</span>
                  <span className="text-foreground-secondary">
                    {row.streams != null
                      ? `${row.streams.toLocaleString()} streams · `
                      : ''}
                    {euros(row.amountCents)} {row.currency}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {msg && <p className="text-xs">{msg}</p>}
    </div>
  );

  const guidesTab = (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <p className="mb-1 font-medium">MusicBrainz</p>
        <ol className="text-foreground-secondary list-inside list-decimal">
          {MUSICBRAINZ_GUIDE_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <div>
        <p className="mb-1 font-medium">Discogs</p>
        <ol className="text-foreground-secondary list-inside list-decimal">
          {DISCOGS_GUIDE_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <div>
        <p className="mb-1 font-medium">Post-release claim links</p>
        <ul className="list-inside list-disc">
          {POST_RELEASE_CLAIM_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 font-medium">Collecting societies</p>
        <ul className="list-inside list-disc">
          {COLLECTING_SOCIETY_POINTERS.map((society) => (
            <li key={society.id}>
              <a
                href={society.url}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {society.label}
              </a>
              <span className="text-foreground-secondary">
                {' '}
                ({society.region}) — {society.hint}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <StudioPanel className="text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{release.title}</p>
          <p className="text-foreground-secondary text-xs">
            {release.type} · {release.state} ·{' '}
            {release._count?.tracks ?? release.tracks?.length ?? 0} tracks
            {release.upc ? ` · UPC ${release.upc}` : ''}
            {' · '}
            <Link
              to="/r/$slug"
              params={{ slug: release.smartLinkSlug }}
              className="underline"
            >
              /r/{release.smartLinkSlug}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="pill" color={statusColor(revelatorStatus)}>
            {revelatorStatus ?? 'not submitted'}
          </Badge>
          <Button size="sm" variant="secondary" onClick={() => setOpen(!open)}>
            {open ? 'Hide' : 'Release ops'} ({doneCount || '—'}/
            {checklist.length || 5})
          </Button>
        </div>
      </div>

      {open &&
        (loading || !form ? (
          <PageLoading label="Loading…" />
        ) : (
          <Tabs
            className="mt-4"
            listClassName="border-border border-b pb-2"
            panelClassName="pt-4"
            items={[
              {
                id: 'catalog',
                label: 'Catalog & credits',
                content: catalogTab,
              },
              {
                id: 'delivery',
                label: 'Delivery & royalties',
                content: deliveryTab,
              },
              { id: 'guides', label: 'Guides', content: guidesTab },
            ]}
          />
        ))}
    </StudioPanel>
  );
}

export function StudioDistributionView() {
  const [releases, setReleases] = useState<StudioRelease[]>([]);
  const [allRoyalties, setAllRoyalties] = useState<RevelatorRoyaltyReportRow[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([fetchStudioReleases(), fetchAllRoyalties()]).then(
      ([rel, roy]) => {
        setReleases(rel.data.releases ?? []);
        setAllRoyalties(roy.data ?? []);
        setLoading(false);
      },
    );
  }, []);

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/distribution" />
        <StudioPageHeader
          title="Distribution"
          subtitle="DSP delivery & catalog metadata — submit releases to Revelator, track UPC/ISRC/MusicBrainz identifiers, and review royalty reports."
        />

        <SpotifyProfilePanel />

        <section className="flex flex-col gap-3">
          <h2>
            <Eyebrow>Releases</Eyebrow>
          </h2>
          {loading ? (
            <PageLoading label="Loading…" />
          ) : releases.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No releases yet — create one under{' '}
              <Link to="/studio/releases" className="underline">
                Releases
              </Link>{' '}
              first.
            </p>
          ) : (
            releases.map((release) => (
              <ReleaseOpsPanel key={release.id} release={release} />
            ))
          )}
        </section>

        {allRoyalties.length > 0 && (
          <StudioPanel title="All royalty reports">
            <ul className="divide-border divide-y text-sm">
              {allRoyalties.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{row.releaseTitle}</div>
                    <div className="text-foreground-secondary text-xs">
                      {row.periodStart} – {row.periodEnd}
                    </div>
                  </div>
                  <div className="text-foreground-secondary text-xs">
                    {row.streams != null
                      ? `${row.streams.toLocaleString()} streams · `
                      : ''}
                    {euros(row.amountCents)} {row.currency}
                  </div>
                </li>
              ))}
            </ul>
          </StudioPanel>
        )}
      </div>
    </StudioGate>
  );
}
