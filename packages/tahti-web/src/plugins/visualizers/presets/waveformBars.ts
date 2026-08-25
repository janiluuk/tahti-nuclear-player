import * as THREE from 'three';

import type { PresetScene, VisualizerPreset } from '../types';

const BAR_COUNT = 48;

export const waveformBarsPreset: VisualizerPreset = {
  id: 'WAVEFORM_BARS',
  description: 'Classic vertical bar spectrum.',
  build(scene, scheme): PresetScene {
    const group = new THREE.Group();
    const bars = Array.from({ length: BAR_COUNT }, (_, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? scheme.accent : scheme.highlight,
        emissive: index % 2 === 0 ? scheme.accent : scheme.highlight,
        emissiveIntensity: 0.25,
        roughness: 0.35,
      });
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1, 0.12),
        material,
      );
      bar.position.x = (index - BAR_COUNT / 2) * 0.16;
      group.add(bar);
      return bar;
    });
    scene.add(group);

    return {
      update: (elapsed, level) => {
        bars.forEach((bar, index) => {
          const wave = Math.sin(elapsed * 2.4 + index * 0.34) * 0.5 + 0.5;
          const height = 0.15 + wave * (0.8 + level * 2.8);
          bar.scale.y += (height - bar.scale.y) * 0.14;
          bar.position.y = (bar.scale.y - 1) / 2;
        });
        group.rotation.y = Math.sin(elapsed * 0.18) * 0.18;
      },
    };
  },
};
