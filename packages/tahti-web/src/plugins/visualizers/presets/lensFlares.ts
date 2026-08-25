import * as THREE from 'three';

import { createGlowTexture, TAU } from '../shared';
import type { PresetScene, VisualizerPreset } from '../types';

const FLARE_COUNT = 18;

export const lensFlaresPreset: VisualizerPreset = {
  id: 'LENS_FLARES',
  description: 'Cinematic flares timed to peaks.',
  build(scene, scheme): PresetScene {
    const accentTexture = createGlowTexture(scheme.accent);
    const highlightTexture = createGlowTexture(scheme.highlight);
    const group = new THREE.Group();
    const flares = Array.from({ length: FLARE_COUNT }, (_, index) => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: index % 2 === 0 ? accentTexture : highlightTexture,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const angle = (index / FLARE_COUNT) * TAU;
      sprite.userData.angle = angle;
      group.add(sprite);
      return sprite;
    });
    scene.add(group);

    return {
      update: (elapsed, level) => {
        flares.forEach((flare, index) => {
          const angle = flare.userData.angle as number;
          const drift = elapsed * (0.35 + (index % 5) * 0.08);
          flare.position.set(
            Math.cos(angle + drift) * (2.4 + Math.sin(drift * 1.7)),
            Math.sin(angle * 1.7 - drift) * 2.3,
            Math.sin(angle + drift) * 1.5,
          );
          const size = 0.45 + level * 1.5 + (index % 3) * 0.18;
          flare.scale.set(size, size, 1);
        });
      },
    };
  },
};
