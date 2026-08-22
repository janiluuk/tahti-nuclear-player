import { FC, useEffect, useRef } from 'react';
import * as THREE from 'three';

import { cn } from '../../lib/cn';
import { usePlayerStore } from '../../stores/playerStore';

type VisualizerScheme = {
  accent: string;
  highlight: string;
  bg: string;
  text: string;
  muted: string;
};

type VisualizerSettings = {
  speed: number;
  intensity: number;
};

export type ThreeVisualizerProps = {
  preset: string;
  scheme: VisualizerScheme;
  settings: VisualizerSettings;
  className?: string;
  artworkUrl?: string | null;
};

type PresetScene = {
  update: (elapsed: number, level: number) => void;
};

const CAMERA_DISTANCE = 8;
const CAMERA_FOV = 55;
const MAX_PIXEL_RATIO = 2;
const FREQUENCY_SAMPLE_COUNT = 96;
const BAR_COUNT = 48;
const PARTICLE_COUNT = 900;
const CLOUD_COUNT = 32;
const FLARE_COUNT = 18;
const TANGLE_POINT_COUNT = 260;
const RIPPLE_SEGMENTS = 72;
const TAU = Math.PI * 2;

function readLevel(analyser: AnalyserNode | null, frequencyData: Uint8Array) {
  if (!analyser) {
    return 0.22;
  }

  analyser.getByteFrequencyData(frequencyData as Uint8Array<ArrayBuffer>);
  const sampleCount = Math.min(FREQUENCY_SAMPLE_COUNT, frequencyData.length);
  let total = 0;

  for (let index = 0; index < sampleCount; index += 1) {
    total += frequencyData[index] ?? 0;
  }

  return Math.min(1, total / (sampleCount * 180));
}

function createGlowTexture(color: string) {
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

function createBars(scene: THREE.Scene, scheme: VisualizerScheme): PresetScene {
  const group = new THREE.Group();
  const bars = Array.from({ length: BAR_COUNT }, (_, index) => {
    const material = new THREE.MeshStandardMaterial({
      color: index % 2 === 0 ? scheme.accent : scheme.highlight,
      emissive: index % 2 === 0 ? scheme.accent : scheme.highlight,
      emissiveIntensity: 0.25,
      roughness: 0.35,
    });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1, 0.12), material);
    bar.position.x = (index - BAR_COUNT / 2) * 0.16;
    group.add(bar);
    return bar;
  });
  scene.add(group);

  return {
    update: (elapsed, level) => {
      bars.forEach((bar, index) => {
        const wave = Math.sin(elapsed * 2.4 + index * 0.34) * 0.5 + 0.5;
        const height = 0.15 + wave * (0.8 + level * 2.8);
        bar.scale.y += (height - bar.scale.y) * 0.14;
        bar.position.y = (bar.scale.y - 1) / 2;
      });
      group.rotation.y = Math.sin(elapsed * 0.18) * 0.18;
    },
  };
}

function createParticles(
  scene: THREE.Scene,
  scheme: VisualizerScheme,
): PresetScene {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const radius = 1.2 + Math.random() * 4.8;
    const angle = Math.random() * TAU;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const texture = createGlowTexture(scheme.accent);
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: scheme.highlight,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      size: 0.12,
    }),
  );
  scene.add(points);

  return {
    update: (elapsed, level) => {
      points.rotation.y = elapsed * (0.08 + level * 0.12);
      points.rotation.x = Math.sin(elapsed * 0.15) * 0.24;
      points.scale.setScalar(1 + level * 0.08);
    },
  };
}

function createAurora(
  scene: THREE.Scene,
  scheme: VisualizerScheme,
): PresetScene {
  const group = new THREE.Group();
  const colors = [scheme.accent, scheme.highlight, scheme.muted];
  colors.forEach((color, index) => {
    const ribbon = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.4 + index * 0.38, 0.18, 180, 18, 2, 5),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    ribbon.rotation.x = index * 0.8;
    group.add(ribbon);
  });
  scene.add(group);

  return {
    update: (elapsed, level) => {
      group.rotation.x = elapsed * 0.08;
      group.rotation.y = elapsed * 0.12;
      group.scale.setScalar(1 + level * 0.12);
    },
  };
}

function createGrid(scene: THREE.Scene, scheme: VisualizerScheme): PresetScene {
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
}

function createClouds(
  scene: THREE.Scene,
  scheme: VisualizerScheme,
): PresetScene {
  const texture = createGlowTexture(scheme.highlight);
  const group = new THREE.Group();
  const clouds = Array.from({ length: CLOUD_COUNT }, (_, index) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color: index % 2 === 0 ? scheme.accent : scheme.highlight,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    sprite.position.set(
      (Math.random() - 0.5) * 9,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 4,
    );
    const size = 1 + Math.random() * 2.8;
    sprite.scale.set(size * 1.8, size, 1);
    group.add(sprite);
    return sprite;
  });
  scene.add(group);

  return {
    update: (elapsed, level) => {
      clouds.forEach((cloud, index) => {
        cloud.position.x += 0.002 + (index % 4) * 0.0007;
        if (cloud.position.x > 5.5) {
          cloud.position.x = -5.5;
        }
        const material = cloud.material as THREE.SpriteMaterial;
        material.opacity = 0.12 + level * 0.26;
      });
      group.rotation.z = Math.sin(elapsed * 0.08) * 0.08;
    },
  };
}

function createLineTangle(
  scene: THREE.Scene,
  scheme: VisualizerScheme,
): PresetScene {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index < TANGLE_POINT_COUNT; index += 1) {
    const angle = (index / TANGLE_POINT_COUNT) * TAU * 7;
    const radius = 1.5 + Math.sin(index * 0.47) * 1.2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle * 0.61) * 2.2,
        Math.sin(angle) * radius,
      ),
    );
  }
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color: scheme.highlight,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(line);

  return {
    update: (elapsed, level) => {
      line.rotation.x = elapsed * 0.11;
      line.rotation.y = elapsed * 0.17;
      line.scale.setScalar(1 + level * 0.2);
    },
  };
}

function createBackdropBox(
  scene: THREE.Scene,
  scheme: VisualizerScheme,
): PresetScene {
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
}

function createFlares(
  scene: THREE.Scene,
  scheme: VisualizerScheme,
): PresetScene {
  const accentTexture = createGlowTexture(scheme.accent);
  const highlightTexture = createGlowTexture(scheme.highlight);
  const group = new THREE.Group();
  const flares = Array.from({ length: FLARE_COUNT }, (_, index) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: index % 2 === 0 ? accentTexture : highlightTexture,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const angle = (index / FLARE_COUNT) * TAU;
    sprite.userData.angle = angle;
    group.add(sprite);
    return sprite;
  });
  scene.add(group);

  return {
    update: (elapsed, level) => {
      flares.forEach((flare, index) => {
        const angle = flare.userData.angle as number;
        const drift = elapsed * (0.35 + (index % 5) * 0.08);
        flare.position.set(
          Math.cos(angle + drift) * (2.4 + Math.sin(drift * 1.7)),
          Math.sin(angle * 1.7 - drift) * 2.3,
          Math.sin(angle + drift) * 1.5,
        );
        const size = 0.45 + level * 1.5 + (index % 3) * 0.18;
        flare.scale.set(size, size, 1);
      });
    },
  };
}

function createSpotlights(
  scene: THREE.Scene,
  scheme: VisualizerScheme,
): PresetScene {
  const group = new THREE.Group();
  const beams = Array.from({ length: 5 }, (_, index) => {
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
}

function createRipple(
  scene: THREE.Scene,
  scheme: VisualizerScheme,
  artworkUrl?: string | null,
): PresetScene {
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
}

function createPresetScene(
  scene: THREE.Scene,
  preset: string,
  scheme: VisualizerScheme,
  artworkUrl?: string | null,
) {
  switch (preset) {
    case 'WATER_RIPPLE':
      return createRipple(scene, scheme, artworkUrl);
    case 'WAVEFORM_BARS':
      return createBars(scene, scheme);
    case 'PARTICLE_FIELD':
      return createParticles(scene, scheme);
    case 'REACTIVE_GRID':
      return createGrid(scene, scheme);
    case 'CLOUDSCAPE':
      return createClouds(scene, scheme);
    case 'LINE_TANGLE':
      return createLineTangle(scene, scheme);
    case 'BACKDROP_BOX':
      return createBackdropBox(scene, scheme);
    case 'LENS_FLARES':
      return createFlares(scene, scheme);
    case 'IES_SPOTLIGHT':
      return createSpotlights(scene, scheme);
    default:
      return createAurora(scene, scheme);
  }
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) {
      return;
    }
    object.geometry.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) {
          value.dispose();
        }
      });
      material.dispose();
    });
  });
}

export const ThreeVisualizer: FC<ThreeVisualizerProps> = ({
  preset,
  scheme,
  settings,
  className,
  artworkUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyser = usePlayerStore((state) => state.analyser);
  const status = usePlayerStore((state) => state.status);
  const playing = status === 'playing' || status === 'loading';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(scheme.bg, 0.055);
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
    camera.position.z = CAMERA_DISTANCE;
    scene.add(new THREE.AmbientLight(scheme.text, 0.7));
    const pointLight = new THREE.PointLight(scheme.highlight, 3, 30);
    pointLight.position.set(3, 4, 6);
    scene.add(pointLight);

    const presetScene = createPresetScene(scene, preset, scheme, artworkUrl);
    const frequencyData = new Uint8Array(
      new ArrayBuffer(analyser?.frequencyBinCount ?? 128),
    );
    const clock = new THREE.Clock();
    let animationFrame = 0;

    const draw = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const level = playing ? readLevel(analyser, frequencyData) : 0.2;
      const elapsed = clock.getElapsedTime() * settings.speed;
      presetScene.update(elapsed, level * settings.intensity);
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      disposeScene(scene);
      renderer.dispose();
    };
  }, [analyser, artworkUrl, playing, preset, scheme, settings]);

  return (
    <div
      className={cn('overflow-hidden', className)}
      data-visualizer-engine="three"
      data-visualizer-preset={preset}
      aria-hidden
      style={{
        background: scheme.bg,
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};
