import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input, ViewShell } from '@tahti-player/ui';

import { fetchDirectory } from '../api/client';
import { ChannelChatPanel } from '../components/ChannelChatPanel';
import { useLayoutStore } from '../stores/layoutStore';

export function ChatView({ slug }: { slug?: string }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(slug ?? 'northern-lights');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const setChatContext = useLayoutStore((s) => s.setChatContext);
  const openChatRail = useLayoutStore((s) => s.openChatRail);

  useEffect(() => {
    if (!slug) {
      return;
    }
    setChatContext({ slug, enabled: true, autoOpen: true });
  }, [slug, setChatContext]);

  useEffect(() => {
    if (slug) {
      return;
    }
    void fetchDirectory().then(({ data }) => {
      setSuggestions(data.items.map((i) => i.slug));
    });
  }, [slug]);

  if (!slug) {
    return (
      <ViewShell
        title="Chat"
        classes={{
          root: 'px-0 pt-0 mx-auto max-w-lg',
          scrollableArea: 'gap-6',
        }}
      >
        <Input
          label="Channel slug"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button
          onClick={() => {
            const s = draft.trim();
            if (s) {
              void navigate({ to: '/chat/$slug', params: { slug: s } });
            }
          }}
        >
          Open chat
        </Button>
        <div className="flex flex-wrap gap-2 text-sm">
          {suggestions.map((s) => (
            <Link
              key={s}
              to="/chat/$slug"
              params={{ slug: s }}
              className="text-foreground-secondary underline-offset-2 hover:underline"
            >
              {s}
            </Link>
          ))}
        </div>
      </ViewShell>
    );
  }

  return (
    <ViewShell
      title="Chat"
      subtitle={slug}
      classes={{
        root: 'px-0 pt-0 mx-auto max-w-lg',
        scrollableArea: 'gap-6',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/chat"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Chat picker
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/channel/$slug"
            params={{ slug }}
            className="text-foreground-secondary text-sm underline-offset-2 hover:underline"
          >
            Open channel
          </Link>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openChatRail(slug)}
          >
            Open chat rail
          </Button>
        </div>
      </div>
      <ChannelChatPanel slug={slug} />
    </ViewShell>
  );
}
