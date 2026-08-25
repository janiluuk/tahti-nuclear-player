import * as THREE from 'three';

import { TAU } from '../shared';
import type { PresetScene, VisualizerPreset } from '../types';

const TANGLE_POINT_COUNT = 260;

export const lineTanglePreset: VisualizerPreset = {
  id: 'LINE_TANGLE',
  description: 'Generative tangled line art.',
  build(scene, scheme): PresetScene {
    const points: THREE.Vector3[] = [];
    for (let index = 0; index < TANGLE_POINT_COUNT; index += 1) {
      const angle = (index / TANGLE_POINT_COUNT) * TAU * 7;
      const radius = 1.5 + Math.sin(index * 0.47) * 1.2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.61) * 2.2,
          Math.sin(angle) * radius,
        ),
      );
    }
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: scheme.highlight,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(line);

    return {
      update: (elapsed, level) => {
        line.rotation.x = elapsed * 0.11;
        line.rotation.y = elapsed * 0.17;
        line.scale.setScalar(1 + level * 0.2);
      },
    };
  },
};
