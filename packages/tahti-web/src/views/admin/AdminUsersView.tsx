import { Link } from '@tanstack/react-router';
import {
  ExternalLinkIcon,
  MessageSquareIcon,
  SaveIcon,
  SearchIcon,
  SendIcon,
  ShieldAlertIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchAdminUser,
  fetchAdminUsers,
  patchAdminUser,
  suspendAdminUser,
  unsuspendAdminUser,
  type AdminUserDetail,
  type AdminUserRow,
} from '../../api/admin';
import {
  fetchConversation,
  sendDm,
  startConversation,
  type ChatDm,
} from '../../api/messages';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const TIERS = ['', 'FREE', 'ARTIST', 'STUDIO'] as const;

export const AdminUsersView = () => {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState('');
  const [isMember, setIsMember] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editTier, setEditTier] = useState<'FREE' | 'ARTIST' | 'STUDIO'>(
    'FREE',
  );
  const [editMember, setEditMember] = useState(false);
  const [editBoard, setEditBoard] = useState(false);
  const [editMemberNumber, setEditMemberNumber] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatDm[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const [messageOpen, setMessageOpen] = useState(false);

  const syncDetail = (user: AdminUserDetail) => {
    setDetail(user);
    setEditTier(user.tier as 'FREE' | 'ARTIST' | 'STUDIO');
    setEditMember(user.isMember);
    setEditBoard(user.isBoard);
    setEditMemberNumber(user.memberNumber?.toString() ?? '');
    setUsers((current) =>
      current.map((row) =>
        row.id === user.id
          ? {
              ...row,
              tier: user.tier,
              isMember: user.isMember,
              isBoard: user.isBoard,
              memberNumber: user.memberNumber,
              suspendedAt: user.suspendedAt,
            }
          : row,
      ),
    );
  };

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      void fetchAdminUsers({ q: query, tier, isMember }).then((result) => {
        setUsers(result.data);
        setTotal(result.total);
        setSelectedId((current) => {
          if (current && result.data.some((user) => user.id === current)) {
            return current;
          }
          return result.data[0]?.id ?? null;
        });
        setLoading(false);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [query, tier, isMember]);

  useEffect(() => {
    setStatus(null);
    setMessageOpen(false);
    setConversationId(null);
    setMessages([]);
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    void fetchAdminUser(selectedId).then((result) => {
      if (result.data) {
        syncDetail(result.data);
      } else {
        setDetail(null);
      }
      setDetailLoading(false);
    });
  }, [selectedId]);

  const saveUser = async () => {
    if (!detail) {
      return;
    }
    setBusy(true);
    setStatus(null);
    const parsedMemberNumber = editMemberNumber.trim()
      ? Number(editMemberNumber)
      : null;
    if (
      parsedMemberNumber !== null &&
      (!Number.isInteger(parsedMemberNumber) || parsedMemberNumber <= 0)
    ) {
      setBusy(false);
      setStatus('Member number must be a positive whole number.');
      return;
    }
    const result = await patchAdminUser(detail.id, {
      tier: editTier,
      isMember: editMember,
      isBoard: editBoard,
      memberNumber: parsedMemberNumber,
    });
    setBusy(false);
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    syncDetail(result.data);
    setStatus('User details saved.');
  };

  const toggleSuspension = async () => {
    if (!detail) {
      return;
    }
    if (!detail.suspendedAt && !suspendReason.trim()) {
      setStatus('Add a reason before suspending this account.');
      return;
    }
    setBusy(true);
    setStatus(null);
    const result = detail.suspendedAt
      ? await unsuspendAdminUser(detail.id)
      : await suspendAdminUser(detail.id, suspendReason.trim());
    setBusy(false);
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    syncDetail(result.data);
    setSuspendReason('');
    setStatus(
      result.data.suspendedAt ? 'Account suspended.' : 'Account restored.',
    );
  };

  const openConversation = async () => {
    if (!detail) {
      return;
    }
    setBusy(true);
    setStatus(null);
    const started = await startConversation(detail.username);
    if (!started.ok) {
      setBusy(false);
      setStatus(started.error);
      return;
    }
    const thread = await fetchConversation(started.conversationId);
    setConversationId(started.conversationId);
    setMessages(thread.data?.messages ?? []);
    setMessageOpen(true);
    setBusy(false);
  };

  const sendMessage = async () => {
    if (!conversationId || !messageBody.trim()) {
      return;
    }
    setBusy(true);
    setStatus(null);
    const result = await sendDm(conversationId, messageBody.trim());
    setBusy(false);
    if (!result.ok) {
      setStatus(result.error);
      return;
    }
    setMessages((current) => [...current, result.data]);
    setMessageBody('');
  };

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/users" />
        <StudioPageHeader
          title="User management"
          subtitle={`${total} accounts · details, access, and communication`}
        />

        <div className="grid min-h-[36rem] gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <StudioPanel className="flex min-h-0 flex-col gap-3">
            <div className="relative">
              <SearchIcon
                size={15}
                aria-hidden
                className="text-foreground-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <Input
                aria-label="Search users"
                placeholder="Name, email, or username"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                aria-label="Filter by tier"
                value={tier}
                onChange={(event) => setTier(event.target.value)}
                className="border-border bg-background rounded-md border px-2 py-2 text-sm"
              >
                {TIERS.map((value) => (
                  <option key={value} value={value}>
                    {value || 'All tiers'}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by membership"
                value={isMember}
                onChange={(event) => setIsMember(event.target.value)}
                className="border-border bg-background rounded-md border px-2 py-2 text-sm"
              >
                <option value="">All accounts</option>
                <option value="true">Members</option>
                <option value="false">Non-members</option>
              </select>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-foreground-secondary p-3 text-sm">
                  Loading…
                </p>
              ) : users.length === 0 ? (
                <p className="text-foreground-secondary p-3 text-sm">
                  No users match these filters.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {users.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(user.id)}
                        aria-pressed={selectedId === user.id}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          selectedId === user.id
                            ? 'border-primary bg-primary/10'
                            : 'hover:border-border hover:bg-background-secondary border-transparent'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {user.displayName}
                          </span>
                          <span className="text-foreground-secondary shrink-0 text-[10px] font-semibold tracking-wide uppercase">
                            {user.tier}
                          </span>
                        </span>
                        <span className="text-foreground-secondary block truncate text-xs">
                          @{user.username}
                          {user.isBoard ? ' · board' : ''}
                          {user.suspendedAt ? ' · suspended' : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </StudioPanel>

          <div className="min-w-0">
            {detailLoading ? (
              <StudioPanel>
                <p className="text-foreground-secondary text-sm">
                  Loading user details…
                </p>
              </StudioPanel>
            ) : !detail ? (
              <StudioPanel className="flex min-h-72 items-center justify-center">
                <div className="text-center">
                  <UserRoundIcon
                    size={28}
                    aria-hidden
                    className="text-foreground-secondary mx-auto mb-2"
                  />
                  <p className="text-foreground-secondary text-sm">
                    Select a user to view and edit their account.
                  </p>
                </div>
              </StudioPanel>
            ) : (
              <div className="flex flex-col gap-4">
                <StudioPanel>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-2xl font-bold">
                          {detail.displayName}
                        </h2>
                        {detail.isBoard ? (
                          <span className="bg-accent-purple/15 text-accent-purple rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                            Board
                          </span>
                        ) : null}
                        {detail.suspendedAt ? (
                          <span className="bg-accent-red/15 text-accent-red rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                            Suspended
                          </span>
                        ) : null}
                      </div>
                      <p className="text-foreground-secondary text-sm">
                        @{detail.username} · {detail.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        aria-label={`Message ${detail.displayName}`}
                        title="Message user"
                        disabled={busy}
                        onClick={() => void openConversation()}
                      >
                        <MessageSquareIcon size={15} aria-hidden />
                      </Button>
                      <Link
                        to="/u/$username"
                        params={{ username: detail.username }}
                      >
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          aria-label={`View ${detail.displayName}'s profile`}
                          title="View profile"
                        >
                          <ExternalLinkIcon size={15} aria-hidden />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="bg-background-secondary rounded-lg p-3">
                      <dt className="text-foreground-secondary text-xs uppercase">
                        Engagement
                      </dt>
                      <dd className="font-display mt-1 text-xl font-bold">
                        {detail.engagementUnitsYtd}
                      </dd>
                      <dd className="text-foreground-secondary text-xs">
                        units YTD
                      </dd>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-3">
                      <dt className="text-foreground-secondary text-xs uppercase">
                        Fan subscriptions
                      </dt>
                      <dd className="font-display mt-1 text-xl font-bold">
                        {detail.fanSubscriptionsAsArtist}
                      </dd>
                      <dd className="text-foreground-secondary text-xs">
                        active
                      </dd>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-3">
                      <dt className="text-foreground-secondary text-xs uppercase">
                        Channel
                      </dt>
                      <dd className="mt-1 text-sm font-medium">
                        {detail.channel?.state ?? 'No channel'}
                      </dd>
                      <dd className="text-foreground-secondary text-xs">
                        {detail.channel
                          ? `${detail.channel.totalLiveHours.toFixed(1)} live hours`
                          : 'Listener account'}
                      </dd>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-3">
                      <dt className="text-foreground-secondary text-xs uppercase">
                        Payments
                      </dt>
                      <dd className="mt-1 text-sm font-medium">
                        {detail.stripeConnectChargesEnabled
                          ? 'Charges enabled'
                          : 'Not ready'}
                      </dd>
                    </div>
                  </dl>
                </StudioPanel>

                <div className="grid gap-4 xl:grid-cols-2">
                  <StudioPanel
                    title="Account details"
                    description="Edit access, membership, and governance roles."
                  >
                    <div className="flex flex-col gap-3">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-foreground-secondary text-xs uppercase">
                          Tier
                        </span>
                        <select
                          value={editTier}
                          onChange={(event) =>
                            setEditTier(
                              event.target.value as
                                | 'FREE'
                                | 'ARTIST'
                                | 'STUDIO',
                            )
                          }
                          className="border-border bg-background rounded-md border px-3 py-2"
                        >
                          {TIERS.filter(Boolean).map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Input
                        label="Member number"
                        inputMode="numeric"
                        value={editMemberNumber}
                        onChange={(event) =>
                          setEditMemberNumber(event.target.value)
                        }
                        placeholder="Not assigned"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editMember}
                          onChange={(event) =>
                            setEditMember(event.target.checked)
                          }
                        />
                        Association member
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editBoard}
                          onChange={(event) =>
                            setEditBoard(event.target.checked)
                          }
                        />
                        Board access
                      </label>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => void saveUser()}
                      >
                        <SaveIcon size={14} aria-hidden className="mr-1.5" />
                        Save account
                      </Button>
                    </div>
                  </StudioPanel>

                  <StudioPanel
                    title="Account access"
                    description={
                      detail.suspendedAt
                        ? `Suspended ${new Date(detail.suspendedAt).toLocaleString()}${
                            detail.suspendReason
                              ? ` · ${detail.suspendReason}`
                              : ''
                          }`
                        : 'Suspension blocks sign-in immediately and is audited.'
                    }
                  >
                    {!detail.suspendedAt ? (
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-foreground-secondary text-xs uppercase">
                          Suspension reason
                        </span>
                        <textarea
                          value={suspendReason}
                          onChange={(event) =>
                            setSuspendReason(event.target.value)
                          }
                          rows={4}
                          maxLength={500}
                          placeholder="Required before suspending"
                          className="border-border bg-background rounded-md border px-3 py-2"
                        />
                      </label>
                    ) : null}
                    <Button
                      size="sm"
                      variant={detail.suspendedAt ? 'secondary' : 'text'}
                      disabled={busy}
                      className={
                        detail.suspendedAt
                          ? 'mt-3'
                          : 'text-accent-red hover:text-accent-red mt-3'
                      }
                      onClick={() => void toggleSuspension()}
                    >
                      <ShieldAlertIcon
                        size={14}
                        aria-hidden
                        className="mr-1.5"
                      />
                      {detail.suspendedAt
                        ? 'Restore account'
                        : 'Suspend account'}
                    </Button>
                  </StudioPanel>
                </div>

                {messageOpen ? (
                  <StudioPanel
                    title={`Message ${detail.displayName}`}
                    description="This uses the same direct-message thread the user sees in My Library."
                  >
                    <div className="border-border bg-background flex max-h-64 min-h-36 flex-col gap-2 overflow-y-auto rounded-lg border p-3">
                      {messages.length === 0 ? (
                        <p className="text-foreground-secondary text-sm">
                          No messages yet. Start the conversation below.
                        </p>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                              message.isMine
                                ? 'bg-primary ml-auto'
                                : 'bg-background-secondary'
                            }`}
                          >
                            <div className="text-[10px] opacity-70">
                              {message.senderDisplayName}
                            </div>
                            {message.body}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Input
                        aria-label={`Message ${detail.displayName}`}
                        value={messageBody}
                        onChange={(event) => setMessageBody(event.target.value)}
                        placeholder="Write a message…"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            void sendMessage();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        disabled={busy || !messageBody.trim()}
                        aria-label="Send message"
                        onClick={() => void sendMessage()}
                      >
                        <SendIcon size={16} aria-hidden />
                      </Button>
                    </div>
                  </StudioPanel>
                ) : null}

                {status ? (
                  <p className="text-sm" role="status">
                    {status}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
};
