import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Box, Button, Tabs, ViewShell } from '@tahti-player/ui';

import { fetchMembership, fetchMySubscriptions } from '../api/client';
import type { FanSubscriptionRow, MembershipStatus } from '../api/types';
import { MembershipStatusPanel } from '../components/MembershipStatusPanel';
import { PageLoading } from '../components/PageStates';
import { useAuthStore } from '../stores/authStore';

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function AccountView() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [subs, setSubs] = useState<FanSubscriptionRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setMembership(null);
      setSubs([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void Promise.all([fetchMembership(), fetchMySubscriptions()]).then(
      ([m, s]) => {
        if (cancelled) {
          return;
        }
        setMembership(m.data);
        setSubs(s.data);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <ViewShell
        title="Account"
        subtitle="Membership and subscriptions."
        classes={{ root: 'px-0 pt-0 mx-auto max-w-md' }}
      >
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </ViewShell>
    );
  }

  return (
    <ViewShell
      title="Account"
      subtitle="Membership and subscriptions."
      classes={{ root: 'px-0 pt-0 mx-auto max-w-3xl' }}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link to="/settings/$section" params={{ section: 'account' }}>
          <Button size="sm" variant="secondary">
            Account settings
          </Button>
        </Link>
        <Button size="sm" variant="text" onClick={() => void logout()}>
          Log out
        </Button>
      </div>

      {loading && <PageLoading label="Loading account…" />}

      <Box
        variant="tertiary"
        className="h-auto w-auto flex-wrap items-center justify-between gap-3 rounded-xl"
      >
        <div>
          <h2 className="font-display font-bold">Membership and security</h2>
          <p className="text-foreground-secondary text-sm">
            Manage cooperative membership, password recovery, and two-factor
            authentication here in Tahti.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!loading && !membership?.isMember ? (
            <Link to="/signup/payment">
              <Button size="sm">Become a member</Button>
            </Link>
          ) : null}
          <Link to="/forgot-password">
            <Button size="sm" variant="secondary">
              Reset password
            </Button>
          </Link>
          <Link to="/settings/$section" params={{ section: 'account' }}>
            <Button size="sm" variant="secondary">
              Security
            </Button>
          </Link>
        </div>
      </Box>

      <Tabs
        listClassName="border-border border-b pb-3"
        panelClassName="pt-2"
        items={[
          {
            id: 'membership',
            label: 'Membership',
            content: !membership ? (
              <p className="text-foreground-secondary text-sm">
                Membership details are unavailable right now.
              </p>
            ) : (
              <MembershipStatusPanel
                membership={membership}
                userEmail={user.email}
                onChange={() =>
                  void fetchMembership().then((m) => setMembership(m.data))
                }
              />
            ),
          },
          {
            id: 'subscriptions',
            label: 'Fan subscriptions',
            content:
              subs.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No fan subscriptions on this account. Support an artist from
                  their profile.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {subs.map((subscription) => (
                    <li
                      key={subscription.id}
                      className="border-border bg-background-secondary/40 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm"
                    >
                      <div>
                        <Link
                          to="/u/$username"
                          params={{ username: subscription.artist.username }}
                          className="font-medium hover:underline"
                        >
                          {subscription.artist.displayName}
                        </Link>
                        <p className="text-foreground-secondary text-xs">
                          {subscription.tierName},{' '}
                          {euros(subscription.amountCents)}/mo,{' '}
                          {subscription.state}
                          {subscription.currentPeriodEnd
                            ? `, until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                            : ''}
                        </p>
                      </div>
                      <Link
                        to="/subscribe/$username"
                        params={{ username: subscription.artist.username }}
                      >
                        <Button size="sm" variant="text">
                          Tiers
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              ),
          },
        ]}
      />
    </ViewShell>
  );
}
