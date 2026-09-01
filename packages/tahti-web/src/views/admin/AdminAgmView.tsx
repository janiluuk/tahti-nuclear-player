import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchAdminAgmMotions,
  fetchAdminGovernanceDocuments,
  fetchAdminGovernanceMeetings,
  type AdminMotion,
} from '../../api/admin';
import type { GovernanceDocument, GovernanceMeeting } from '../../api/types';
import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const DEFAULT_AGENDA = [
  'Call to order',
  'Quorum check',
  'Adoption of agenda',
  'Review of previous minutes',
  'Board report',
  'Financial report',
  'Motions',
  'Election of board (if applicable)',
  'Any other business',
  'Close',
];

function AgendaBuilder() {
  const [items, setItems] = useState<string[]>(DEFAULT_AGENDA);
  const [copied, setCopied] = useState(false);

  return (
    <StudioPanel
      title="Agenda builder"
      action={
        <Button
          size="sm"
          onClick={() => {
            const text = items
              .filter(Boolean)
              .map((item, i) => `${i + 1}. ${item}`)
              .join('\n');
            void navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? 'Copied ✓' : 'Copy agenda'}
        </Button>
      }
    >
      <ol className="grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-foreground-secondary w-5 shrink-0 text-right text-xs">
              {i + 1}.
            </span>
            <Input
              value={item}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((it, idx) => (idx === i ? e.target.value : it)),
                )
              }
              className="h-8 flex-1 text-sm"
            />
            <div className="flex shrink-0 gap-0.5">
              <Button
                size="icon-sm"
                variant="text"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() =>
                  setItems((prev) => {
                    const next = [...prev];
                    [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                    return next;
                  })
                }
              >
                ↑
              </Button>
              <Button
                size="icon-sm"
                variant="text"
                aria-label="Move down"
                disabled={i === items.length - 1}
                onClick={() =>
                  setItems((prev) => {
                    const next = [...prev];
                    [next[i], next[i + 1]] = [next[i + 1]!, next[i]!];
                    return next;
                  })
                }
              >
                ↓
              </Button>
              <Button
                size="icon-sm"
                variant="text"
                aria-label="Remove item"
                onClick={() =>
                  setItems((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                ×
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        size="icon-sm"
        variant="secondary"
        className="mt-3"
        onClick={() => setItems((prev) => [...prev, ''])}
        aria-label="Add agenda item"
        title="Add agenda item"
      >
        <PlusIcon size={16} aria-hidden />
      </Button>
    </StudioPanel>
  );
}

function motionStateLabel(state: AdminMotion['state']): string {
  return state.charAt(0) + state.slice(1).toLowerCase();
}

export function AdminAgmView() {
  const [motions, setMotions] = useState<AdminMotion[]>([]);
  const [meetings, setMeetings] = useState<GovernanceMeeting[]>([]);
  const [documents, setDocuments] = useState<GovernanceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      fetchAdminAgmMotions(),
      fetchAdminGovernanceMeetings(),
      fetchAdminGovernanceDocuments(),
    ]).then(([motionsResult, meetingsResult, documentsResult]) => {
      setMotions(motionsResult.data);
      setMeetings(meetingsResult.data);
      setDocuments(documentsResult.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminGate>
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/agm">
          <div className="flex max-w-4xl flex-col gap-6">
            <StudioPageHeader
              title="Annual General Meeting"
              subtitle="AGM planning tools — agenda, motions, member notice, and minutes."
            />

            <AgendaBuilder />

            <StudioPanel title="Meeting records">
              {meetings.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No persisted meeting records yet. Create the meeting record
                  before publishing notice or minutes.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {meetings.map((meeting) => (
                    <li
                      key={meeting.id}
                      className="py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="font-medium">{meeting.title}</span>
                        <span className="text-foreground-secondary text-xs">
                          {meeting.state}
                        </span>
                      </div>
                      <p className="text-foreground-secondary mt-1 text-xs">
                        {meeting.scheduledAt
                          ? new Date(meeting.scheduledAt).toLocaleString()
                          : 'Date not scheduled'}{' '}
                        · {meeting.presentCount}/
                        {meeting.eligibleMemberCount ?? '—'} present
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>

            <StudioPanel title="Motions & proposals">
              {loading ? (
                <PageLoading label="Loading motions…" />
              ) : motions.length === 0 ? (
                <p className="text-foreground-secondary py-4 text-center text-sm">
                  No open or draft motions.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {motions.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{m.title}</div>
                        <div className="text-foreground-secondary text-xs">
                          {m.advisory ? 'Advisory' : 'Binding'} ·{' '}
                          {motionStateLabel(m.state)} · {m.totalVotes} votes
                        </div>
                      </div>
                      <div className="text-foreground-secondary text-xs">
                        Opens {new Date(m.openAt).toLocaleDateString('fi-FI')} ·
                        Closes {new Date(m.closeAt).toLocaleDateString('fi-FI')}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-foreground-secondary mt-3 text-xs">
                All AGM decisions are advisory until bylaws authorise
                asynchronous binding votes. Formal binding resolutions are
                recorded as board resolutions.
              </p>
            </StudioPanel>

            <details className="border-border bg-background-secondary/40 rounded-xl border p-5 shadow-sm sm:p-6">
              <summary className="cursor-pointer text-sm font-medium">
                Member notification requirements
              </summary>
              <div className="mt-3 flex flex-col gap-3 text-sm">
                <p className="text-foreground-secondary text-xs">
                  Finnish association law (yhdistyslaki 24 §) requires written
                  notice to all members at least seven days before the AGM. The
                  notice must state the date, venue, and agenda.
                </p>
                <ul className="text-foreground-secondary list-disc space-y-1 pl-5 text-xs">
                  <li>Date, time, and venue (physical or remote link)</li>
                  <li>Agenda (use the builder above)</li>
                  <li>Any proposed bylaw changes in full</li>
                  <li>Deadline for member motions</li>
                  <li>Instructions for remote participation</li>
                </ul>
              </div>
            </details>

            <StudioPanel title="Minutes & records">
              <p className="text-foreground-secondary text-sm">
                Keep the meeting record connected to the board&apos;s formal
                records and member register.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/tahti-api/api/admin/members/export.csv">
                  <Button size="sm" variant="secondary">
                    Export member register
                  </Button>
                </a>
                <a href="/admin/logs">
                  <Button size="sm" variant="secondary">
                    Open audit log
                  </Button>
                </a>
                <a href="/admin/governance">
                  <Button size="sm" variant="secondary">
                    Governance tools
                  </Button>
                </a>
              </div>
              <div className="border-border mt-4 border-t pt-3">
                <h3 className="text-sm font-semibold">Published documents</h3>
                {documents.filter((document) => document.publishedAt).length ===
                0 ? (
                  <p className="text-foreground-secondary mt-1 text-xs">
                    No published governance documents yet.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1 text-xs">
                    {documents
                      .filter((document) => document.publishedAt)
                      .map((document) => (
                        <li key={document.id}>
                          {document.downloadUrl || document.externalUrl ? (
                            <a
                              href={
                                document.downloadUrl ??
                                document.externalUrl ??
                                undefined
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="underline-offset-2 hover:underline"
                            >
                              {document.title}
                            </a>
                          ) : (
                            document.title
                          )}{' '}
                          · v{document.version}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </StudioPanel>
          </div>
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
