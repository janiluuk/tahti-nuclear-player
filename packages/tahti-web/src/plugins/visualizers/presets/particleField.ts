import * as THREE from 'three';

import { createGlowTexture, TAU } from '../shared';
import type { PresetScene, VisualizerPreset } from '../types';

const PARTICLE_COUNT = 900;

export const particleFieldPreset: VisualizerPreset = {
  id: 'PARTICLE_FIELD',
  description: 'Drifting particles that pulse with the mix.',
  build(scene, scheme): PresetScene {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const radius = 1.2 + Math.random() * 4.8;
      const angle = Math.random() * TAU;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const texture = createGlowTexture(scheme.accent);
    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: scheme.highlight,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        size: 0.12,
      }),
    );
    scene.add(points);

    return {
      update: (elapsed, level) => {
        points.rotation.y = elapsed * (0.08 + level * 0.12);
        points.rotation.x = Math.sin(elapsed * 0.15) * 0.24;
        points.scale.setScalar(1 + level * 0.08);
      },
    };
  },
};
