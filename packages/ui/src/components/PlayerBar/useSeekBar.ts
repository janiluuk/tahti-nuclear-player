import { KeyboardEvent, MouseEvent, useCallback, useMemo, useRef } from 'react';

type UseSeekBarParams = {
  progress: number;
  isLoading?: boolean;
  onSeek?: (percent: number) => void;
};

const ARROW_STEP_PERCENT = 2;
const PAGE_STEP_PERCENT = 10;

export const useSeekBar = ({
  progress,
  isLoading = false,
  onSeek,
}: UseSeekBarParams) => {
  const clamped = useMemo(
    () => Math.max(0, Math.min(100, progress)),
    [progress],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractive = Boolean(onSeek) && !isLoading;

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isInteractive) {
        return;
      }
      const target = containerRef.current;
      if (!target) {
        return;
      }
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;
      const clampedPercent = Math.max(0, Math.min(100, percent));
      onSeek?.(clampedPercent);
    },
    [isInteractive, onSeek],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isInteractive) {
        return;
      }
      const deltas: Record<string, number> = {
        ArrowRight: ARROW_STEP_PERCENT,
        ArrowUp: ARROW_STEP_PERCENT,
        ArrowLeft: -ARROW_STEP_PERCENT,
        ArrowDown: -ARROW_STEP_PERCENT,
        PageUp: PAGE_STEP_PERCENT,
        PageDown: -PAGE_STEP_PERCENT,
      };
      const delta = deltas[e.key];
      if (typeof delta === 'number') {
        e.preventDefault();
        onSeek?.(Math.max(0, Math.min(100, clamped + delta)));
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        onSeek?.(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        onSeek?.(100);
      }
    },
    [isInteractive, clamped, onSeek],
  );

  return {
    clamped,
    containerRef,
    handleClick,
    handleKeyDown,
    isInteractive,
  } as const;
};

export type UseSeekBarReturn = ReturnType<typeof useSeekBar>;
