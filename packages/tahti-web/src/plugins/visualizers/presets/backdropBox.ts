import * as THREE from 'three';

import type { PresetScene, VisualizerPreset } from '../types';

export const backdropBoxPreset: VisualizerPreset = {
  id: 'BACKDROP_BOX',
  description: 'A framed backdrop panel behind your stream.',
  build(scene, scheme): PresetScene {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 3.5, 3.5),
      new THREE.MeshPhysicalMaterial({
        color: scheme.accent,
        emissive: scheme.highlight,
        emissiveIntensity: 0.16,
        transparent: true,
        opacity: 0.38,
        roughness: 0.05,
        metalness: 0.18,
        wireframe: true,
      }),
    );
    scene.add(box);

    return {
      update: (elapsed, level) => {
        box.rotation.x = elapsed * 0.18;
        box.rotation.y = elapsed * 0.25;
        box.scale.setScalar(0.9 + level * 0.28);
      },
    };
  },
};
