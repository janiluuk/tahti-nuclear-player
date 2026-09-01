import * as THREE from 'three';

import { createGlowTexture } from '../shared';
import type { PresetScene, VisualizerPreset } from '../types';

const GRID_SIZE = 44;
const SPACING = 0.22;

/** A flat grid of points — like the classic "interactive points" demo, but
 * driven by the mix instead of a mouse: a ripple travels outward from the
 * center in sync with `level`, so every point still "responds", just to
 * sound rather than a cursor. */
export const interactivePointsPreset: VisualizerPreset = {
  id: 'INTERACTIVE_POINTS',
  description: 'A point grid that ripples outward with the beat.',
  build(scene, scheme): PresetScene {
    const count = GRID_SIZE * GRID_SIZE;
    const positions = new Float32Array(count * 3);
    const radialDistance = new Float32Array(count);

    let index = 0;
    for (let x = 0; x < GRID_SIZE; x += 1) {
      for (let z = 0; z < GRID_SIZE; z += 1) {
        const px = (x - GRID_SIZE / 2) * SPACING;
        const pz = (z - GRID_SIZE / 2) * SPACING;
        positions[index * 3] = px;
        positions[index * 3 + 1] = 0;
        positions[index * 3 + 2] = pz;
        radialDistance[index] = Math.sqrt(px * px + pz * pz);
        index += 1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: scheme.highlight,
      map: createGlowTexture(scheme.accent),
      size: 0.09,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    points.rotation.x = -0.55;
    scene.add(points);

    const positionAttr = geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute;

    return {
      update: (elapsed, level) => {
        for (let i = 0; i < count; i += 1) {
          const distance = radialDistance[i] ?? 0;
          const wave =
            Math.sin(distance * 3.1 - elapsed * 2.4) * (0.12 + level * 0.55);
          positionAttr.setY(i, wave);
        }
        positionAttr.needsUpdate = true;
        points.rotation.y = elapsed * 0.05;
        material.size = 0.08 + level * 0.09;
      },
    };
  },
};
