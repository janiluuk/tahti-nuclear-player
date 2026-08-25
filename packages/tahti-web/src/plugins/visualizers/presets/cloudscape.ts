import * as THREE from 'three';

import { createGlowTexture } from '../shared';
import type { PresetScene, VisualizerPreset } from '../types';

const CLOUD_COUNT = 32;

export const cloudscapePreset: VisualizerPreset = {
  id: 'CLOUDSCAPE',
  description: 'Soft volumetric clouds, gentle motion.',
  build(scene, scheme): PresetScene {
    const texture = createGlowTexture(scheme.highlight);
    const group = new THREE.Group();
    const clouds = Array.from({ length: CLOUD_COUNT }, (_, index) => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          color: index % 2 === 0 ? scheme.accent : scheme.highlight,
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      sprite.position.set(
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4,
      );
      const size = 1 + Math.random() * 2.8;
      sprite.scale.set(size * 1.8, size, 1);
      group.add(sprite);
      return sprite;
    });
    scene.add(group);

    return {
      update: (elapsed, level) => {
        clouds.forEach((cloud, index) => {
          cloud.position.x += 0.002 + (index % 4) * 0.0007;
          if (cloud.position.x > 5.5) {
            cloud.position.x = -5.5;
          }
          const material = cloud.material as THREE.SpriteMaterial;
          material.opacity = 0.12 + level * 0.26;
        });
        group.rotation.z = Math.sin(elapsed * 0.08) * 0.08;
      },
    };
  },
};
