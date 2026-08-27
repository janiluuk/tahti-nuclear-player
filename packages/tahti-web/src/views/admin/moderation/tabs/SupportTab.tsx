import { useEffect, useState } from 'react';

import { Badge, Button, Input } from '@nuclearplayer/ui';

import {
  fetchAdminSupportTicketDetail,
  fetchAdminSupportTickets,
  postAdminSupportTicketMessage,
  updateAdminSupportTicketStatus,
  type AdminSupportStatus,
  type AdminSupportTicket,
  type AdminSupportTicketDetail,
} from '../../../../api/admin';
import { PageLoading } from '../../../../components/PageStates';
import { StudioPanel } from '../../../../components/StudioPanel';

function statusBadge(status: AdminSupportStatus): {
  label: string;
  color: 'orange' | 'cyan' | 'green';
} {
  if (status === 'OPEN') {
    return { label: 'Open', color: 'orange' };
  }
  if (status === 'IN_PROGRESS') {
    return { label: 'In progress', color: 'cyan' };
  }
  return { label: 'Resolved', color: 'green' };
}

const FILTERS: { id: AdminSupportStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'OPEN', label: 'Open' },
  { id: 'IN_PROGRESS', label: 'In progress' },
  { id: 'RESOLVED', label: 'Resolved' },
];

function requesterLabel(t: {
  artistUsername: string | null;
  contactEmail: string | null;
}): string {
  return t.artistUsername ? `@${t.artistUsername}` : (t.contactEmail ?? '—');
}

/** Support tab — ticket list with search, a combined message/status-change
 * timeline per ticket, a reply composer, and an explicit Resolve action. See
 * AdminModerationView. Notes come pre-sorted oldest-first from the API
 * (tahti-org 02beac67); a board reply is `kind: 'MESSAGE'`, an automatic
 * transition record is `kind: 'STATUS_CHANGE'`. */
export function SupportTab() {
  const [filter, setFilter] = useState<AdminSupportStatus | 'all'>('OPEN');
  const [query, setQuery] = useState('');
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminSupportTicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const applyTicketPatch = (updated: AdminSupportTicketDetail) => {
    setDetail(updated);
    setTickets((current) =>
      current.map((row) =>
        row.id === updated.id ? { ...row, status: updated.status } : row,
      ),
    );
  };

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(
      () => {
        void fetchAdminSupportTickets({
          status: filter === 'all' ? undefined : filter,
          q: query.trim() || undefined,
        }).then((result) => {
          setTickets(result.data);
          setSelectedId((current) => {
            if (current && result.data.some((t) => t.id === current)) {
              return current;
            }
            return result.data[0]?.id ?? null;
          });
          setLoading(false);
        });
      },
      query ? 250 : 0,
    );
    return () => clearTimeout(handle);
  }, [filter, query]);

  useEffect(() => {
    setMsg(null);
    setReply('');
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    void fetchAdminSupportTicketDetail(selectedId).then((result) => {
      setDetail(result.data);
      setDetailLoading(false);
    });
  }, [selectedId]);

  const setStatus = (status: AdminSupportStatus) => {
    if (!detail || busy) {
      return;
    }
    setBusy(true);
    void updateAdminSupportTicketStatus(detail.id, status).then((r) => {
      setBusy(false);
      if (!r.ok) {
        setMsg(r.error);
        return;
      }
      applyTicketPatch(r.data);
    });
  };

  const sendReply = () => {
    const body = reply.trim();
    if (!detail || !body || busy) {
      return;
    }
    setBusy(true);
    void postAdminSupportTicketMessage(detail.id, body).then((r) => {
      setBusy(false);
      if (!r.ok) {
        setMsg(r.error);
        return;
      }
      applyTicketPatch(r.data);
      setReply('');
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-2" role="tablist">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              type="button"
              variant="text"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                filter === f.id
                  ? 'bg-primary text-foreground shadow-sm'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              {f.label}
            </Button>
          ))}
        </nav>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subject, message, requester…"
          size="sm"
          className="min-w-[16rem] flex-1"
          aria-label="Search support tickets"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[20rem_1fr]">
        <StudioPanel className="max-h-[32rem] overflow-y-auto p-0 sm:p-0">
          {loading ? (
            <PageLoading label="Loading support tickets…" />
          ) : tickets.length === 0 ? (
            <p className="text-foreground-secondary p-4 text-center text-sm">
              No tickets in this view.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {tickets.map((t) => {
                const badge = statusBadge(t.status);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={`w-full px-3 py-2.5 text-left text-sm ${
                        selectedId === t.id ? 'bg-background-secondary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 truncate font-medium">
                          {t.subject}
                        </span>
                        <Badge variant="pill" color={badge.color}>
                          {badge.label}
                        </Badge>
                      </div>
                      <div className="text-foreground-secondary truncate text-xs">
                        {requesterLabel(t)} · {t.category} ·{' '}
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </StudioPanel>

        <StudioPanel className="flex min-h-[24rem] flex-col p-0 sm:p-0">
          {!selectedId ? (
            <p className="text-foreground-secondary p-4 text-sm">
              Select a ticket.
            </p>
          ) : detailLoading || !detail ? (
            <PageLoading label="Loading ticket…" />
          ) : (
            <>
              <div className="border-border flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{detail.subject}</h3>
                    <Badge
                      variant="pill"
                      color={statusBadge(detail.status).color}
                    >
                      {statusBadge(detail.status).label}
                    </Badge>
                  </div>
                  <p className="text-foreground-secondary text-xs">
                    {requesterLabel(detail)} · {detail.category} ·{' '}
                    {new Date(detail.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {detail.status === 'OPEN' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => setStatus('IN_PROGRESS')}
                    >
                      Start progress
                    </Button>
                  )}
                  {detail.status !== 'RESOLVED' ? (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => setStatus('RESOLVED')}
                    >
                      Resolve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="text"
                      disabled={busy}
                      onClick={() => setStatus('OPEN')}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
                <div className="bg-background-secondary rounded-lg px-3 py-2">
                  <div className="text-foreground-secondary text-[10px] tracking-wide uppercase">
                    Original request
                  </div>
                  {detail.message}
                </div>
                {detail.notes.map((n) =>
                  n.kind === 'STATUS_CHANGE' ? (
                    <p
                      key={n.id}
                      className="text-foreground-secondary py-1 text-center text-xs"
                    >
                      {n.body} · {new Date(n.createdAt).toLocaleString()}
                    </p>
                  ) : (
                    <div
                      key={n.id}
                      className="bg-primary/10 max-w-[85%] rounded-lg px-3 py-2"
                    >
                      <div className="text-foreground-secondary text-[10px]">
                        {n.authorDisplayName ?? 'Board'} ·{' '}
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                      {n.body}
                    </div>
                  ),
                )}
              </div>

              <div className="border-border flex flex-col gap-2 border-t p-3">
                {msg && <p className="text-xs">{msg}</p>}
                <div className="flex gap-2">
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a reply…"
                    size="sm"
                    className="flex-1"
                    aria-label="Reply to ticket"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    disabled={busy || !reply.trim()}
                    onClick={sendReply}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </>
          )}
        </StudioPanel>
      </div>
    </div>
  );
}
