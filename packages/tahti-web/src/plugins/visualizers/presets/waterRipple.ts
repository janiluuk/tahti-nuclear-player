import * as THREE from 'three';

import type { PresetScene, VisualizerPreset } from '../types';

const RIPPLE_SEGMENTS = 72;

export const waterRipplePreset: VisualizerPreset = {
  id: 'WATER_RIPPLE',
  description: 'Concentric ripples reacting to the beat.',
  build(scene, scheme, artworkUrl): PresetScene {
    const geometry = new THREE.PlaneGeometry(
      11,
      7,
      RIPPLE_SEGMENTS,
      RIPPLE_SEGMENTS,
    );
    const material = new THREE.MeshStandardMaterial({
      color: artworkUrl ? '#ffffff' : scheme.accent,
      emissive: scheme.highlight,
      emissiveIntensity: 0.08,
      roughness: 0.38,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });
    if (artworkUrl) {
      new THREE.TextureLoader().load(artworkUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
      });
    }
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -0.58;
    scene.add(plane);
    const position = geometry.getAttribute('position') as THREE.BufferAttribute;

    return {
      update: (elapsed, level) => {
        for (let index = 0; index < position.count; index += 1) {
          const horizontal = position.getX(index);
          const vertical = position.getY(index);
          position.setZ(
            index,
            Math.sin(horizontal * 1.7 + elapsed * 1.4) * 0.1 +
              Math.cos(vertical * 2.1 + elapsed) * (0.08 + level * 0.2),
          );
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();
      },
    };
  },
};
