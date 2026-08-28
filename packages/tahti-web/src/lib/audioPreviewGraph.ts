import { useEffect, useRef } from 'react';

import type { EditList } from '../api/studio-types';
import { AUDIO_FX_PLUGINS, useAudioFxStore } from '../plugins/audio-fx';

type Graph = { ctx: AudioContext; source: MediaElementAudioSourceNode };

function getAudioContextCtor() {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

/**
 * Wires the pro editor's <audio> element through a live Web Audio graph
 * matching the current EditList's EQ/Compressor/Limiter/gain settings, so
 * preview playback is actually processed through the plugin chain -- not
 * just raw playback next to controls that only apply on render.
 *
 * The limiter here is a fast high-ratio DynamicsCompressorNode, not a true
 * brickwall limiter -- close enough for an audible preview; the real
 * ffmpeg render path is still the source of truth for the exported file.
 */
export function useAudioPreviewGraph(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  editList: EditList | null,
) {
  const graphRef = useRef<Graph | null>(null);
  const chainNodesRef = useRef<AudioNode[]>([]);
  const enabledPluginIds = useAudioFxStore((state) => state.enabledPluginIds);

  function ensureGraph(): Graph | null {
    const audio = audioRef.current;
    if (graphRef.current || !audio) {
      return graphRef.current;
    }
    const Ctx = getAudioContextCtor();
    if (!Ctx) {
      return null;
    }
    try {
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(audio);
      graphRef.current = { ctx, source };
    } catch {
      // createMediaElementSource can only run once per element -- a race
      // (e.g. StrictMode double-invoke) leaves graphRef already set.
    }
    return graphRef.current;
  }

  // Resume the context on every play — browsers create AudioContext
  // suspended until a user gesture, and the chain-rebuild effect below can
  // run before any gesture has happened (e.g. editList loading on mount).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const onPlay = () => {
      const graph = ensureGraph();
      if (graph && graph.ctx.state === 'suspended') {
        void graph.ctx.resume().catch(() => undefined);
      }
    };
    audio.addEventListener('play', onPlay);
    return () => audio.removeEventListener('play', onPlay);
  }, [audioRef]);

  useEffect(() => {
    if (!editList) {
      return;
    }
    const graph = ensureGraph();
    if (!graph) {
      return;
    }
    const { ctx, source } = graph;

    source.disconnect();
    for (const node of chainNodesRef.current) {
      node.disconnect();
    }
    chainNodesRef.current = [];

    let last: AudioNode = source;
    const connect = (node: AudioNode) => {
      last.connect(node);
      last = node;
      chainNodesRef.current.push(node);
    };

    // Follows the user's own drag-ordered chain instead of a fixed
    // sequence -- reordering plugins in the UI actually changes what you
    // hear, not just their display order. loudnorm isn't representable
    // as a single real-time node (it needs a full-pass loudness
    // analysis), so it stays render/export-only, same as the doc note
    // on this hook already says for the limiter approximation.
    //
    // Each plugin owns its own node-building logic (src/plugins/audio-fx)
    // -- adding a plugin means adding it to that registry, not a branch
    // here.
    for (const id of editList.pluginChain ?? []) {
      if (!enabledPluginIds.includes(id)) {
        continue;
      }
      const plugin = AUDIO_FX_PLUGINS[id];
      if (!plugin?.isEnabled(editList)) {
        continue;
      }
      for (const node of plugin.buildPreviewNodes(ctx, editList)) {
        connect(node);
      }
    }

    const gain = ctx.createGain();
    gain.gain.value = Math.pow(10, editList.gainDb / 20);
    connect(gain);

    last.connect(ctx.destination);
  }, [editList, enabledPluginIds]);
}
