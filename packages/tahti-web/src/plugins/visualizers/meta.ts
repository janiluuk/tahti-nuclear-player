import {
  AudioLines,
  CircleDot,
  Cloud,
  Droplets,
  Flashlight,
  Grid3x3,
  Grip,
  Layers,
  ScanEye,
  Slash,
  Sparkles,
  Spline,
  Square,
  Sun,
  Waves,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';

import type { VisualPreset } from '../../api/channel-design';

export type VisualizerMetadata = {
  description: string;
  Icon: LucideIcon;
};

/** Single source of truth for visualizer display copy and icons. */
export const VISUALIZER_METADATA: Record<VisualPreset, VisualizerMetadata> = {
  MINIMAL: {
    description: 'No animated background — solid color only.',
    Icon: Slash,
  },
  WATER_RIPPLE: {
    description: 'Concentric ripples reacting to the beat.',
    Icon: Droplets,
  },
  WAVEFORM_BARS: {
    description: 'Classic frequency bars across the bottom.',
    Icon: AudioLines,
  },
  PARTICLE_FIELD: {
    description: 'Drifting particles that pulse with the beat.',
    Icon: Sparkles,
  },
  AURORA: { description: 'Flowing aurora-style color bands.', Icon: Waves },
  REACTIVE_GRID: {
    description: 'Pulsing grid lines that react to the mix.',
    Icon: Grid3x3,
  },
  CLOUDSCAPE: { description: 'Slow-moving cloud gradients.', Icon: Cloud },
  LINE_TANGLE: {
    description: 'Tangled line art that reacts to levels.',
    Icon: Spline,
  },
  BACKDROP_BOX: {
    description: 'Boxed grid backdrop, subtle motion.',
    Icon: Square,
  },
  LENS_FLARES: {
    description: 'Soft lens-flare glints over the artwork.',
    Icon: Sun,
  },
  IES_SPOTLIGHT: {
    description: 'Spotlight-style beam sweep.',
    Icon: Flashlight,
  },
  INTERACTIVE_POINTS: {
    description: 'A point grid that ripples outward with the beat.',
    Icon: Grip,
  },
  FAT_LINES: {
    description: 'Thick ribbon lines that bounce with the beat.',
    Icon: Waypoints,
  },
  VIDEO_KINECT: {
    description: 'A depth-cloud scan of the channel artwork.',
    Icon: ScanEye,
  },
  BACKDROP_AREA: {
    description: 'A glowing backdrop with camera kicks on the beat.',
    Icon: Layers,
  },
  COLOR_INSTANCES: {
    description: 'Instanced particles on flowing paths, tuned to your palette.',
    Icon: CircleDot,
  },
};

export function visualizerMetadata(id: string): VisualizerMetadata {
  return VISUALIZER_METADATA[id as VisualPreset] ?? VISUALIZER_METADATA.AURORA;
}
