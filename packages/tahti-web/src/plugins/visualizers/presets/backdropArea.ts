import * as THREE from 'three';

import { createGlowTexture } from '../shared';
import type { PresetScene, VisualizerPreset } from '../types';

const BASE_CAMERA_POSITION = new THREE.Vector3(0, 0, 8);
/** A level rise bigger than this in one frame counts as a beat "onset". */
const BEAT_RISE_THRESHOLD = 0.14;

/** A soft glowing area-light-style backdrop panel over a faint reflective
 * floor, in the spirit of the WebGPU backdrop-area demo (built on the
 * classic WebGLRenderer this app already runs, not true WebGPU/TSL). When
 * audio-reactive, a rough onset detector (a level spike against its own
 * rolling average) nudges the shared camera along a random axis on every
 * beat, then eases back to center. */
export const backdropAreaPreset: VisualizerPreset = {
  id: 'BACKDROP_AREA',
  description: 'A glowing backdrop with camera kicks on the beat.',
  build(scene, scheme, _artworkUrl, camera): PresetScene {
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: scheme.highlight,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const glowPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 5),
      glowMaterial,
    );
    glowPanel.position.set(0, 1.2, -4);
    scene.add(glowPanel);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: scheme.bg,
      metalness: 0.6,
      roughness: 0.25,
      emissive: scheme.accent,
      emissiveIntensity: 0.06,
    });
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      floorMaterial,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.4;
    scene.add(floor);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture(scheme.accent),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    sprite.scale.setScalar(6);
    sprite.position.set(0, 1.2, -3.9);
    scene.add(sprite);

    let smoothedLevel = 0;
    const kick = new THREE.Vector3();
    const kickVelocity = new THREE.Vector3();

    return {
      update: (elapsed, level) => {
        const rise = level - smoothedLevel;
        smoothedLevel = smoothedLevel * 0.85 + level * 0.15;
        if (rise > BEAT_RISE_THRESHOLD) {
          kickVelocity.set(
            (Math.random() - 0.5) * 0.6,
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.3,
          );
        }
        kickVelocity.multiplyScalar(0.88);
        kick.addScaledVector(kickVelocity, 0.1);
        kick.multiplyScalar(0.9);

        if (camera) {
          camera.position.set(
            BASE_CAMERA_POSITION.x + kick.x,
            BASE_CAMERA_POSITION.y + kick.y,
            BASE_CAMERA_POSITION.z + kick.z,
          );
          camera.lookAt(0, 0.4, -2);
        }
        glowMaterial.opacity = 0.22 + level * 0.35;
        sprite.scale.setScalar(5 + level * 2.4);
        floor.rotation.z = Math.sin(elapsed * 0.1) * 0.02;
      },
    };
  },
};
