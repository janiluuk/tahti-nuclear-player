import * as THREE from 'three';

import type { PresetScene, VisualizerPreset } from '../types';

export const reactiveGridPreset: VisualizerPreset = {
  id: 'REACTIVE_GRID',
  description: 'A grid that flexes with the low end.',
  build(scene, scheme): PresetScene {
    const grid = new THREE.GridHelper(18, 36, scheme.highlight, scheme.accent);
    grid.rotation.x = Math.PI / 2.7;
    grid.position.y = -1.4;
    const material = grid.material as THREE.Material;
    material.transparent = true;
    material.opacity = 0.58;
    scene.add(grid);

    return {
      update: (elapsed, level) => {
        grid.position.z = (elapsed * 0.9) % 0.5;
        grid.scale.y = 1 + level * 0.35;
        material.opacity = 0.35 + level * 0.45;
      },
    };
  },
};
