import { Link } from '@tanstack/react-router';

import type { InsightsKind } from '../../api/track-insights';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader } from '../../components/StudioPanel';
import { TrackInsightsPanel } from '../../components/TrackInsightsPanel';

export function StudioTrackInsightsView({
  kind,
  id,
}: {
  kind: InsightsKind;
  id: string;
}) {
  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/stats" />
        <Link
          to={kind === 'sound' ? '/studio/sounds' : '/studio/releases'}
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← {kind === 'sound' ? 'Music' : 'Releases'}
        </Link>

        <StudioPageHeader
          title="Track insights"
          subtitle="Plays, downloads, and listener geography for this track."
        />
        <TrackInsightsPanel kind={kind} id={id} />
      </div>
    </StudioGate>
  );
}
