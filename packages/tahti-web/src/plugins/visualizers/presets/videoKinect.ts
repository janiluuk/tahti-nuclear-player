import * as THREE from 'three';

import type { PresetScene, VisualizerPreset } from '../types';

const GRID_W = 96;
const GRID_H = 96;
const CELL_SPACING = 0.05;

function samplePixels(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = GRID_W;
  canvas.height = GRID_H;
  const context = canvas.getContext('2d');
  const count = GRID_W * GRID_H;
  const colors = new Float32Array(count * 3);
  const depths = new Float32Array(count);
  if (!context) {
    return { colors, depths };
  }
  context.drawImage(image, 0, 0, GRID_W, GRID_H);
  const data = context.getImageData(0, 0, GRID_W, GRID_H).data;
  for (let index = 0; index < count; index += 1) {
    const r = (data[index * 4] ?? 0) / 255;
    const g = (data[index * 4 + 1] ?? 0) / 255;
    const b = (data[index * 4 + 2] ?? 0) / 255;
    colors[index * 3] = r;
    colors[index * 3 + 1] = g;
    colors[index * 3 + 2] = b;
    depths[index] = r * 0.299 + g * 0.587 + b * 0.114;
  }
  return { colors, depths };
}

/** A depth-cloud point scan in the spirit of the Kinect demo: each grid
 * point is pushed toward the camera by how bright the corresponding pixel
 * of the channel artwork is, colored from the artwork itself. Without
 * artwork it falls back to a plain randomized depth field so the preset
 * still renders something. */
export const videoKinectPreset: VisualizerPreset = {
  id: 'VIDEO_KINECT',
  description: 'A depth-cloud scan of the channel artwork.',
  build(scene, scheme, artworkUrl): PresetScene {
    const count = GRID_W * GRID_H;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const depths = new Float32Array(count);
    const fallback = new THREE.Color(scheme.accent);

    let index = 0;
    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        positions[index * 3] = (x - GRID_W / 2) * CELL_SPACING;
        positions[index * 3 + 1] = (GRID_H / 2 - y) * CELL_SPACING;
        positions[index * 3 + 2] = 0;
        colors[index * 3] = fallback.r;
        colors[index * 3 + 1] = fallback.g;
        colors[index * 3 + 2] = fallback.b;
        depths[index] = 0.35 + Math.random() * 0.3;
        index += 1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const positionAttr = geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute;
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;

    if (artworkUrl) {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const sampled = samplePixels(image);
        colorAttr.set(sampled.colors);
        colorAttr.needsUpdate = true;
        depths.set(sampled.depths);
      };
      image.src = artworkUrl;
    }

    return {
      update: (elapsed, level) => {
        for (let i = 0; i < count; i += 1) {
          positionAttr.setZ(i, (depths[i] ?? 0) * (0.6 + level * 1.8));
        }
        positionAttr.needsUpdate = true;
        points.rotation.y = Math.sin(elapsed * 0.15) * 0.35;
      },
    };
  },
};
