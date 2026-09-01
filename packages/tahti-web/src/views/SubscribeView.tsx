import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@tahti-player/ui';

import {
  fetchFanTiers,
  startFanSubscribe,
  type FetchMeta,
} from '../api/client';
import type { FanTiersResponse } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';

function formatEur(cents: number) {
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}/mo`;
}

export function SubscribeView({ username }: { username: string }) {
  const [data, setData] = useState<FanTiersResponse | null>(null);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchFanTiers(username).then((res) => {
      if (cancelled) {
        return;
      }
      setData(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return <PageLoading label="Loading tiers…" />;
  }

  if (!data) {
    return (
      <PageEmpty
        title="Artist not found"
        description="This artist may have been removed or is not available."
      />
    );
  }

  return (
    <PageFrame maxWidth="3xl">
      <PageHeader
        title={`Subscribe to ${data.artist.displayName}`}
        subtitle={`@${data.artist.username}`}
        back={
          <Link
            to="/u/$username"
            params={{ username }}
            className="text-foreground-secondary text-xs hover:underline"
          >
            ← @{username}
          </Link>
        }
        meta={
          <>
            {data.artist.bio && (
              <p className="text-foreground max-w-2xl text-sm whitespace-pre-wrap">
                {data.artist.bio}
              </p>
            )}
            {!data.paymentsReady && (
              <p className="text-foreground-secondary text-xs">
                Payments not ready on this artist yet.
              </p>
            )}
          </>
        }
      />

      {!user && (
        <p className="border-border bg-background-secondary rounded-lg border px-3 py-2 text-sm">
          Sign in to start Stripe Checkout.{' '}
          <button
            type="button"
            className="underline-offset-2 hover:underline"
            onClick={() => useAuthModalStore.getState().open('login')}
          >
            Login
          </button>{' '}
          or{' '}
          <button
            type="button"
            className="underline-offset-2 hover:underline"
            onClick={() => useAuthModalStore.getState().open('join')}
          >
            Join
          </button>
          . Tier cards still load anonymously.
        </p>
      )}

      {note && <p className="text-foreground-secondary text-sm">{note}</p>}

      {data.tiers.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No active fan tiers yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.tiers.map((tier) => (
            <div
              key={tier.id}
              className="border-border bg-background flex flex-col gap-3 rounded-lg border p-4"
            >
              <div>
                <div className="font-display text-lg font-bold">
                  {tier.name}
                </div>
                <div className="text-primary text-sm font-semibold">
                  {formatEur(tier.amountCents)}
                </div>
              </div>
              {tier.description && (
                <p className="text-foreground-secondary text-sm">
                  {tier.description}
                </p>
              )}
              {tier.perks && tier.perks.length > 0 && (
                <ul className="text-foreground-secondary list-inside list-disc text-xs">
                  {tier.perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              <Button
                size="sm"
                disabled={busyTier === tier.id}
                onClick={() => {
                  if (!user) {
                    setNote(
                      'Log in first, then Subscribe opens Stripe Checkout (or redirects).',
                    );
                    return;
                  }
                  setBusyTier(tier.id);
                  setNote(null);
                  void startFanSubscribe(username, tier.id).then((res) => {
                    setBusyTier(null);
                    if (!res.ok) {
                      setNote(res.error);
                      return;
                    }
                    if ('checkoutUrl' in res) {
                      setNote('Redirecting to Stripe Checkout…');
                      window.location.assign(res.checkoutUrl);
                      return;
                    }
                    setNote(res.message);
                  });
                }}
              >
                {busyTier === tier.id ? 'Starting…' : 'Subscribe'}
              </Button>
              {!data.paymentsReady && meta?.source !== 'mock' && (
                <p className="text-foreground-secondary text-[10px]">
                  Artist Connect may not accept charges yet — checkout can 503.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </PageFrame>
  );
}
