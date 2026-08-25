import * as THREE from 'three';

import type { PresetScene, VisualizerPreset } from '../types';

/** Also the fallback for an unrecognized preset string — see the registry
 * in `../index.ts`, matching the `?? 'AURORA'` default callers already use
 * (`ChannelView.tsx`, `ChannelDesigner.tsx`). */
export const auroraPreset: VisualizerPreset = {
  id: 'AURORA',
  description: 'Slow-moving colour bands, aurora-style.',
  build(scene, scheme): PresetScene {
    const group = new THREE.Group();
    const colors = [scheme.accent, scheme.highlight, scheme.muted];
    colors.forEach((color, index) => {
      const ribbon = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.4 + index * 0.38, 0.18, 180, 18, 2, 5),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ribbon.rotation.x = index * 0.8;
      group.add(ribbon);
    });
    scene.add(group);

    return {
      update: (elapsed, level) => {
        group.rotation.x = elapsed * 0.08;
        group.rotation.y = elapsed * 0.12;
        group.scale.setScalar(1 + level * 0.12);
      },
    };
  },
};
