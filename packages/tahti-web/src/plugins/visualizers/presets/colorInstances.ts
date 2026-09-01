import * as THREE from 'three';

import { TAU } from '../shared';
import type { PresetScene, VisualizerPreset } from '../types';

const INSTANCE_COUNT = 500;

/** Instanced particles drifting along orbital paths, in the spirit of the
 * WebGPU "instance path" demo (built on the classic WebGLRenderer this app
 * already runs, not true WebGPU). Per-instance color tone is a gradient
 * across the channel's own accent/highlight palette, set once at build —
 * changing the gradient colors changes the tones here. The material's
 * overall tint then tracks the audio level's brightness (lightness) and
 * vividness (saturation) every frame, uniformly lighting up every instance
 * on a hit. */
export const colorInstancesPreset: VisualizerPreset = {
  id: 'COLOR_INSTANCES',
  description: 'Instanced particles on flowing paths, tuned to your palette.',
  build(scene, scheme): PresetScene {
    const geometry = new THREE.IcosahedronGeometry(0.05, 0);
    const material = new THREE.MeshBasicMaterial({ toneMapped: false });
    const mesh = new THREE.InstancedMesh(geometry, material, INSTANCE_COUNT);
    const dummy = new THREE.Object3D();
    const seeds = new Float32Array(INSTANCE_COUNT);
    const baseColor = new THREE.Color(scheme.accent);
    const altColor = new THREE.Color(scheme.highlight);
    const instanceColor = new THREE.Color();
    const baseHsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(baseHsl);

    for (let index = 0; index < INSTANCE_COUNT; index += 1) {
      seeds[index] = Math.random() * TAU;
      instanceColor.copy(baseColor).lerp(altColor, index / INSTANCE_COUNT);
      mesh.setColorAt(index, instanceColor);
    }
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    scene.add(mesh);

    return {
      update: (elapsed, level) => {
        for (let index = 0; index < INSTANCE_COUNT; index += 1) {
          const seed = seeds[index] ?? 0;
          const radius = 1.4 + (index % 40) * 0.06;
          const angle = seed + elapsed * (0.12 + level * 0.35);
          dummy.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 1.7 + seed) * 1.6,
            Math.sin(angle) * radius,
          );
          dummy.scale.setScalar(0.6 + level * 0.9);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        material.color.setHSL(
          baseHsl.h,
          Math.min(1, baseHsl.s + level * 0.4),
          Math.min(0.9, baseHsl.l + level * 0.35),
        );
      },
    };
  },
};
