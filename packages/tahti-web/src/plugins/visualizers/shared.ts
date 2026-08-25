import * as THREE from 'three';

export const TAU = Math.PI * 2;

/** Radial-gradient sprite/point texture shared by every preset that draws
 * glowing points or sprites (particles, clouds, flares). */
export function createGlowTexture(color: string) {
  const textureSize = 128;
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  const context = canvas.getContext('2d');

  if (context) {
    const gradient = context.createRadialGradient(
      textureSize / 2,
      textureSize / 2,
      0,
      textureSize / 2,
      textureSize / 2,
      textureSize / 2,
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.18, color);
    gradient.addColorStop(1, 'transparent');
    context.fillStyle = gradient;
    context.fillRect(0, 0, textureSize, textureSize);
  }

  return new THREE.CanvasTexture(canvas);
}
