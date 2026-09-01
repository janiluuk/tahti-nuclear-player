import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import { TAU } from '../shared';
import type { PresetScene, VisualizerPreset } from '../types';

const LINE_COUNT = 3;
const POINTS_PER_LINE = 200;

function buildLinePoints(offset: number): number[] {
  const points: number[] = [];
  for (let index = 0; index < POINTS_PER_LINE; index += 1) {
    const t = (index / POINTS_PER_LINE) * TAU * 2;
    const radius = 2.4 + Math.sin(t * 1.3 + offset) * 0.6;
    points.push(
      Math.cos(t) * radius,
      Math.sin(t * 2 + offset) * 1.2,
      Math.sin(t) * radius,
    );
  }
  return points;
}

/** Thick "fat lines" (real pixel-width geometry via Line2/LineMaterial,
 * unlike LINE_TANGLE's thin THREE.Line) drifting slowly, bouncing with the
 * beat. LineMaterial needs the viewport size to compute width — captured
 * once at build time rather than tracked via a resize listener, since
 * presets have no dispose hook to remove one on preset switch. */
export const fatLinesPreset: VisualizerPreset = {
  id: 'FAT_LINES',
  description: 'Thick ribbon lines that bounce with the beat.',
  build(scene, scheme): PresetScene {
    const colors = [scheme.accent, scheme.highlight, scheme.text];
    const lines = Array.from({ length: LINE_COUNT }, (_, index) => {
      const geometry = new LineGeometry();
      geometry.setPositions(buildLinePoints(index * 2.1));
      const material = new LineMaterial({
        color: new THREE.Color(colors[index % colors.length]).getHex(),
        linewidth: 4,
        transparent: true,
        opacity: 0.85,
      });
      material.resolution.set(window.innerWidth, window.innerHeight);
      const line = new Line2(geometry, material);
      line.computeLineDistances();
      scene.add(line);
      return line;
    });

    return {
      update: (elapsed, level) => {
        lines.forEach((line, index) => {
          line.rotation.y = elapsed * (0.05 + index * 0.02);
          line.rotation.x = Math.sin(elapsed * 0.2 + index) * 0.15;
          line.position.y =
            Math.sin(elapsed * 1.6 + index * 1.4) * (0.15 + level * 0.5);
          line.scale.setScalar(1 + level * 0.12);
        });
      },
    };
  },
};
