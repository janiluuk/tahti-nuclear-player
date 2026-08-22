import { CheckCircle2Icon, ExternalLinkIcon, UploadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  exportTrack,
  fetchTrackExportStatus,
  type TrackExportStatus,
} from '../api/sources';
import { EXPORT_TARGETS } from '../lib/exportTargets';

const MIXCLOUD_TARGET = EXPORT_TARGETS.find(
  (target) => target.id === 'mixcloud' && target.supportsTracks,
);

export function TrackExportPanel({ archiveItemId }: { archiveItemId: string }) {
  const [status, setStatus] = useState<TrackExportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchTrackExportStatus(archiveItemId, 'mixcloud').then((result) => {
      if (!cancelled) {
        setStatus(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [archiveItemId]);

  if (!MIXCLOUD_TARGET) {
    return null;
  }

  const alreadyExported = status != null;

  return (
    <section className="border-border mt-4 border-t pt-3">
      <div className="text-foreground-secondary mb-2 flex items-center gap-1.5 text-xs tracking-wide uppercase">
        <UploadIcon size={13} aria-hidden />
        Export
      </div>
      <div className="border-border flex items-center gap-3 rounded-lg border px-3 py-2">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black/80"
          style={{ background: MIXCLOUD_TARGET.color }}
          aria-hidden
        >
          M
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{MIXCLOUD_TARGET.label}</p>
          <p className="text-foreground-secondary text-xs">
            {loading
              ? 'Checking export status…'
              : status
                ? `Already added · ${status.status.toLowerCase()}`
                : 'Send this item to your connected account.'}
          </p>
        </div>
        {status?.url ? (
          <a href={status.url} target="_blank" rel="noreferrer">
            <Button
              size="icon-sm"
              variant="secondary"
              aria-label="Open Mixcloud export"
              title="Open Mixcloud export"
            >
              <ExternalLinkIcon size={15} />
            </Button>
          </a>
        ) : alreadyExported ? (
          <CheckCircle2Icon
            size={18}
            className="text-primary"
            aria-label="Export added"
          />
        ) : (
          <Button
            size="sm"
            variant="secondary"
            disabled={loading || exporting}
            onClick={() => {
              setExporting(true);
              setError(null);
              void exportTrack(archiveItemId, 'mixcloud').then((result) => {
                setExporting(false);
                if (result.ok) {
                  setStatus(result.status);
                } else {
                  setError(result.error);
                }
              });
            }}
          >
            <UploadIcon size={14} className="mr-1.5" aria-hidden />
            {exporting ? 'Adding…' : 'Export'}
          </Button>
        )}
      </div>
      {error && <p className="text-accent-red mt-2 text-xs">{error}</p>}
    </section>
  );
}
