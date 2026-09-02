import { Input, Select } from '@tahti-player/ui';

import {
  TEXT_OVERLAY_ALIGN_LABELS,
  TEXT_OVERLAY_ALIGNMENTS,
  TEXT_OVERLAY_MODE_LABELS,
  TEXT_OVERLAY_MODES,
  type TextOverlayAlign,
  type TextOverlayMode,
} from '../api/channel-design';

export type TextOverlayDraft = {
  mode: TextOverlayMode | string;
  text: string;
  align: TextOverlayAlign | string;
};

const MODE_OPTIONS = TEXT_OVERLAY_MODES.map((id) => ({
  id,
  label: TEXT_OVERLAY_MODE_LABELS[id],
}));

const ALIGN_OPTIONS = TEXT_OVERLAY_ALIGNMENTS.map((id) => ({
  id,
  label: TEXT_OVERLAY_ALIGN_LABELS[id],
}));

/** Effect + text + alignment picker shared by the channel page's Text
 * overlay block and the player stage's Overlay tab — adapted from
 * tahti-org's channel editor (channel-text-layer-panel.tsx) to this repo's
 * UI kit. Controlled: the canvas block re-renders live as the artist types
 * (see ChannelTextOverlayView), the surrounding designer's own Save button
 * persists the result. */
export function ChannelTextOverlayEditor({
  value,
  onChange,
}: {
  value: TextOverlayDraft;
  onChange: (next: TextOverlayDraft) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Text effect"
        options={MODE_OPTIONS}
        value={value.mode}
        onValueChange={(mode) => onChange({ ...value, mode })}
      />
      {value.mode !== 'NONE' && (
        <>
          <Input
            label="Your text"
            description="Short headline or tagline (max 120 characters)."
            size="sm"
            value={value.text}
            maxLength={120}
            placeholder="New album out now — listen live"
            onChange={(e) => onChange({ ...value, text: e.target.value })}
          />
          <Select
            label="Alignment"
            options={ALIGN_OPTIONS}
            value={value.align}
            onValueChange={(align) => onChange({ ...value, align })}
          />
        </>
      )}
    </div>
  );
}
