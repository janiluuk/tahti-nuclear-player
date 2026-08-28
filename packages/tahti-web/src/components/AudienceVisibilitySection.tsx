import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchMyFanTiers, type FanTierRow } from '../api/fan-tiers';

export type TrackVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'STASH';

export function AudienceVisibilitySection({
  visibility,
  onVisibilityChange,
  tierIds,
  onTierIdsChange,
}: {
  visibility: TrackVisibility;
  onVisibilityChange: (visibility: TrackVisibility) => void;
  tierIds: string[];
  onTierIdsChange: (tierIds: string[]) => void;
}) {
  const [tiers, setTiers] = useState<FanTierRow[]>([]);

  useEffect(() => {
    void fetchMyFanTiers().then((result) => setTiers(result.data));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Audience
        <select
          aria-label="Audience"
          value={visibility}
          onChange={(event) =>
            onVisibilityChange(event.target.value as TrackVisibility)
          }
          className="border-border bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="PUBLIC">Public</option>
          <option value="UNLISTED">Not listed — direct link only</option>
          <option value="PRIVATE">Private — only you</option>
          <option value="STASH">Stash — selected tiers</option>
        </select>
      </label>
      {visibility === 'STASH' ? (
        <div className="border-border bg-background-secondary rounded-lg border p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Included fan tiers</p>
              <p className="text-foreground-secondary text-xs">
                Only selected subscribers can access this item.
              </p>
            </div>
            <Link to="/studio/revenue">
              <Button
                size="icon-sm"
                variant="secondary"
                aria-label="Add fan tier"
                title="Add fan tier"
              >
                <PlusIcon size={15} aria-hidden />
              </Button>
            </Link>
          </div>
          {tiers.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {tiers.map((tier) => (
                <label
                  key={tier.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={tierIds.includes(tier.id)}
                    onChange={(event) =>
                      onTierIdsChange(
                        event.target.checked
                          ? [...tierIds, tier.id]
                          : tierIds.filter((id) => id !== tier.id),
                      )
                    }
                  />
                  {tier.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-foreground-secondary mt-3 text-xs">
              No fan tiers yet. Add a tier to share this item with subscribers.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
