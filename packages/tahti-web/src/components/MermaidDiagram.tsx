import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  chart: string;
  className?: string;
};

/**
 * Renders a Mermaid chart client-side (lazy-loads the mermaid package).
 */
export function MermaidDiagram({ chart, className }: Props) {
  const reactId = useId().replace(/:/g, '');
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);

    void (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'dark',
          fontFamily: 'inherit',
          flowchart: {
            nodeSpacing: 60,
            rankSpacing: 80,
            padding: 20,
            htmlLabels: true,
          },
        });
        const id = `mmd-${reactId}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, chart);
        if (cancelled || !hostRef.current) {
          return;
        }
        hostRef.current.innerHTML = svg;
        // Mermaid emits width="100%" with no height, which makes an SVG
        // (a replaced element) fill its container width and scale the
        // whole diagram down proportionally — CSS width:auto doesn't
        // override this, only explicit pixel dimensions do. Force the
        // diagram to its native size (from its own viewBox) so large
        // diagrams stay legible and scroll instead of shrinking to fit.
        const renderedSvg = hostRef.current.querySelector('svg');
        const viewBox = renderedSvg?.getAttribute('viewBox');
        if (renderedSvg && viewBox) {
          const parts = viewBox.split(/\s+/).map(Number);
          const w = parts[2];
          const h = parts[3];
          if (w && h) {
            renderedSvg.setAttribute('width', String(w));
            renderedSvg.setAttribute('height', String(h));
            renderedSvg.removeAttribute('style');
          }
        }
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Mermaid render failed',
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      if (hostRef.current) {
        hostRef.current.innerHTML = '';
      }
    };
  }, [chart, reactId]);

  return (
    <div className={className}>
      <div
        className="mb-2 flex items-center justify-end gap-1"
        aria-label="Diagram zoom controls"
      >
        <button
          type="button"
          className="border-border text-foreground-secondary hover:text-foreground rounded border px-2 py-1 text-xs"
          onClick={() => setZoom((current) => Math.max(0.6, current - 0.2))}
          aria-label="Zoom out diagram"
        >
          −
        </button>
        <button
          type="button"
          className="border-border text-foreground-secondary hover:text-foreground rounded border px-2 py-1 text-xs tabular-nums"
          onClick={() => setZoom(1)}
          aria-label="Reset diagram zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="border-border text-foreground-secondary hover:text-foreground rounded border px-2 py-1 text-xs"
          onClick={() => setZoom((current) => Math.min(2, current + 0.2))}
          aria-label="Zoom in diagram"
        >
          +
        </button>
      </div>
      {!ready && !error && (
        <p className="text-foreground-secondary text-sm">Rendering diagram…</p>
      )}
      {error && (
        <pre className="text-foreground-secondary border-border overflow-auto rounded border p-3 text-xs whitespace-pre-wrap">
          {error}
          {'\n\n'}
          {chart}
        </pre>
      )}
      <div className="mermaid-host max-h-[75vh] overflow-auto">
        <div
          ref={hostRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${100 / zoom}%`,
          }}
        />
      </div>
    </div>
  );
}
