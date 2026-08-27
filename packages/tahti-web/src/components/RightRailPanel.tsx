import { Bell, Check, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  dismissNotification,
  fetchNotifications,
  type TahtiNotification,
} from '../api/notifications';
import { useLayoutStore } from '../stores/layoutStore';
import { ChannelChatPanel } from './ChannelChatPanel';

export function RightRailPanel({ isCollapsed }: { isCollapsed: boolean }) {
  const chatSlug = useLayoutStore((s) => s.chatSlug);
  const chatEnabled = useLayoutStore((s) => s.chatEnabled);
  const chatDisabledReason = useLayoutStore((s) => s.chatDisabledReason);
  const [tab, setTab] = useState<'chat' | 'notifications'>('chat');
  const [notifications, setNotifications] = useState<TahtiNotification[]>([]);
  const toggleRight = useLayoutStore((s) => s.toggleRight);

  useEffect(() => {
    void fetchNotifications().then((result) => {
      setNotifications(result.data.filter((item) => !item.readAt));
    });
  }, [isCollapsed, tab]);

  if (isCollapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-2 py-3">
        <button
          type="button"
          className={`text-foreground-secondary hover:text-foreground rounded-md p-1.5 ${tab === 'chat' ? 'bg-primary/15 text-primary' : ''}`}
          aria-label="Open chat"
          title="Open chat"
          onClick={() => {
            setTab('chat');
            toggleRight();
          }}
        >
          <MessageCircle size={18} />
        </button>
        <button
          type="button"
          className={`text-foreground-secondary hover:text-foreground relative rounded-md p-1.5 ${tab === 'notifications' ? 'bg-primary/15 text-primary' : ''}`}
          aria-label="Open notifications"
          title="Open notifications"
          onClick={() => {
            setTab('notifications');
            toggleRight();
          }}
        >
          <Bell size={18} />
          {notifications.length > 0 ? (
            <span className="bg-accent-red text-foreground absolute -top-1 -right-1 min-w-3 rounded-full px-1 text-center text-[9px] leading-3">
              {notifications.length}
            </span>
          ) : null}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="right-rail">
      <div className="border-border flex shrink-0 items-center gap-1 border-b px-2 py-1">
        <button
          type="button"
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold uppercase ${tab === 'chat' ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:text-foreground'}`}
          aria-selected={tab === 'chat'}
          onClick={() => setTab('chat')}
        >
          <MessageCircle size={13} />
          Chat
        </button>
        <button
          type="button"
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold uppercase ${tab === 'notifications' ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:text-foreground'}`}
          aria-selected={tab === 'notifications'}
          onClick={() => setTab('notifications')}
        >
          <Bell size={13} />
          Notifications
          {notifications.length > 0 ? (
            <span className="bg-accent-red text-foreground ml-0.5 rounded-full px-1.5 text-[9px]">
              {notifications.length}
            </span>
          ) : null}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'notifications' ? (
          <NotificationList
            notifications={notifications}
            onRead={(id) => {
              void dismissNotification(id);
              setNotifications((current) =>
                current.filter((item) => item.id !== id),
              );
            }}
          />
        ) : chatEnabled && chatSlug ? (
          <div className="flex h-full min-h-0 flex-col p-2">
            <ChannelChatPanel slug={chatSlug} rail />
          </div>
        ) : (
          <div className="text-foreground-secondary flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm">
            <MessageCircle size={40} className="opacity-40" />
            <p className="text-foreground font-semibold">Chat unavailable</p>
            <p className="text-xs opacity-70">
              {chatDisabledReason ?? 'Open a channel with chat enabled.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationList({
  notifications,
  onRead,
}: {
  notifications: TahtiNotification[];
  onRead: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="text-foreground-secondary flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm">
        <Check size={28} className="opacity-50" />
        <p>All caught up</p>
      </div>
    );
  }

  return (
    <ul className="flex h-full flex-col gap-2 overflow-y-auto p-2">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className="border-accent-purple/40 bg-accent-purple/10 rounded-md border-l-2 p-2 text-xs"
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{notification.title}</p>
              {notification.body ? (
                <p className="text-foreground-secondary mt-0.5">
                  {notification.body}
                </p>
              ) : null}
              <p className="text-foreground-secondary mt-1 text-[10px] opacity-70">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              className="text-foreground-secondary hover:text-foreground shrink-0"
              aria-label={`Mark ${notification.title} as seen`}
              title="Mark as seen"
              onClick={() => onRead(notification.id)}
            >
              <Check size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
