import * as THREE from 'three';
import { describe, expect, it } from 'vitest';

import type { VisualizerScheme } from '../types';
import { waveformBarsPreset } from './waveformBars';

const scheme: VisualizerScheme = {
  accent: '#22D3EE',
  highlight: '#A78BFA',
  bg: '#0B1220',
  text: '#F8FAFC',
  muted: '#64748B',
};

describe('waveformBarsPreset', () => {
  it('adds one bar mesh per configured bar to the scene', () => {
    const scene = new THREE.Scene();
    waveformBarsPreset.build(scene, scheme);

    const group = scene.children[0] as THREE.Group;
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children).toHaveLength(48);
    expect(group.children.every((bar) => bar instanceof THREE.Mesh)).toBe(true);
  });

  it('update() eases bar height toward the current audio level without throwing', () => {
    const scene = new THREE.Scene();
    const preset = waveformBarsPreset.build(scene, scheme);
    const group = scene.children[0] as THREE.Group;
    const firstBar = group.children[0] as THREE.Mesh;
    const initialScaleY = firstBar.scale.y;

    expect(() => preset.update(0, 1)).not.toThrow();
    expect(firstBar.scale.y).not.toBe(initialScaleY);
  });
});
