import * as THREE from 'three';

import type { PresetScene, VisualizerPreset } from '../types';

const BEAM_COUNT = 5;

export const iesSpotlightPreset: VisualizerPreset = {
  id: 'IES_SPOTLIGHT',
  description: 'A studio spotlight sweep.',
  build(scene, scheme): PresetScene {
    const group = new THREE.Group();
    const beams = Array.from({ length: BEAM_COUNT }, (_, index) => {
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 6, 48, 1, true),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? scheme.accent : scheme.highlight,
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      beam.position.x = (index - 2) * 1.8;
      beam.position.y = 1.5;
      beam.rotation.z = Math.PI;
      group.add(beam);
      return beam;
    });
    scene.add(group);

    return {
      update: (elapsed, level) => {
        beams.forEach((beam, index) => {
          beam.rotation.x = Math.sin(elapsed * 0.7 + index) * 0.28;
          beam.rotation.z = Math.PI + Math.cos(elapsed * 0.55 + index) * 0.2;
          const material = beam.material as THREE.MeshBasicMaterial;
          material.opacity = 0.07 + level * 0.18;
        });
      },
    };
  },
};
