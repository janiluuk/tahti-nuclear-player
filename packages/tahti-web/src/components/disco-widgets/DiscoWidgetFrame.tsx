import { useEffect, useRef, useState } from 'react';

import {
  DISCO_WIDGET_MESSAGE_SOURCE,
  isWidgetToHostMessage,
  type HostToWidgetMessage,
} from '../../lib/disco-widget-protocol';

export type DiscoWidgetFrameProps = {
  sandboxUrl: string;
  name: string;
  context: unknown;
  config: unknown;
};

const DEFAULT_HEIGHT_PX = 96;
const MAX_HEIGHT_PX = 2000;

function isSameOriginPath(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}

/** Renders one widget inside a sandboxed, cookieless iframe and speaks the
 * disco-widget postMessage protocol to it. This is the only place widget
 * code ever runs — never in the host page's own JS realm. */
export function DiscoWidgetFrame({
  sandboxUrl,
  name,
  context,
  config,
}: DiscoWidgetFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(DEFAULT_HEIGHT_PX);
  const contextRef = useRef(context);
  contextRef.current = context;
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow || event.source !== frameWindow) {
        return;
      }
      if (!isWidgetToHostMessage(event.data)) {
        return;
      }

      if (event.data.type === 'ready') {
        const init: HostToWidgetMessage = {
          source: DISCO_WIDGET_MESSAGE_SOURCE,
          type: 'init',
          context: contextRef.current,
          config: configRef.current,
        };
        frameWindow.postMessage(init, '*');
      } else if (event.data.type === 'resize') {
        setHeight(
          Math.min(
            Math.max(event.data.height, DEFAULT_HEIGHT_PX),
            MAX_HEIGHT_PX,
          ),
        );
      } else if (event.data.type === 'open-link') {
        if (isSameOriginPath(event.data.url)) {
          window.open(event.data.url, '_blank', 'noopener,noreferrer');
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={sandboxUrl}
      title={name}
      sandbox="allow-scripts"
      className="block w-full border-0"
      style={{ height }}
    />
  );
}
