import { Link, useRouterState } from '@tanstack/react-router';
import {
  BookOpenIcon,
  CalendarIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquareIcon,
  RadioIcon,
  SettingsIcon,
  UploadIcon,
  UserIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { fetchConversations, type ConversationSummary } from '../api/messages';
import { cn } from '../lib/cn';
import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { GlobalSearch } from './GlobalSearch';
import { RadioBookingCalendar } from './RadioBookingCalendar';
import { ScheduleDialog } from './ScheduleDialog';
import { TahtiLogoLink } from './TahtiLogo';
import { UploadTrackDialog } from './UploadTrackDialog';

type AppTopNavProps = {
  /** Show hamburger for mobile left drawer. */
  showMenuButton?: boolean;
  onOpenMenu?: () => void;
};

const iconBtnClass =
  'text-foreground-secondary hover:text-foreground hover:bg-background-secondary inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:border-border';

/**
 * Production-parity top bar (StudioTopNav / ChannelHeader chrome):
 * logo left, icon actions right, labels only inside the user dropdown.
 */
export function AppTopNav({ showMenuButton, onOpenMenu }: AppTopNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openAuth = useAuthModalStore((s) => s.open);
  const openSettings = useSettingsModalStore((s) => s.open);
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const hasChannel = Boolean(user?.channel?.slug);
  const isLive = user?.channel?.state === 'LIVE';
  const displayName = user?.displayName?.trim() || user?.username || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!broadcastOpen && !messagesOpen) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setBroadcastOpen(false);
        setMessagesOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setBroadcastOpen(false);
        setMessagesOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [broadcastOpen, messagesOpen]);

  useEffect(() => {
    if (!messagesOpen) {
      return;
    }
    void fetchConversations().then((result) => setConversations(result.data));
  }, [messagesOpen]);

  useEffect(() => {
    setOpen(false);
    setBroadcastOpen(false);
    setMessagesOpen(false);
  }, [pathname]);

  return (
    <header className="border-border bg-background sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 overflow-hidden border-b px-2 sm:px-3 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {showMenuButton ? (
          <button
            type="button"
            className={iconBtnClass}
            aria-label="Open menu"
            onClick={onOpenMenu}
          >
            <MenuIcon size={18} />
          </button>
        ) : null}
        <TahtiLogoLink />
      </div>

      <div className="hidden min-w-0 flex-1 justify-center px-4 sm:flex">
        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-1" ref={popupRef}>
        <button
          type="button"
          className={cn(
            'hidden sm:inline-flex',
            iconBtnClass,
            scheduleOpen && 'border-primary bg-primary/15 text-primary',
          )}
          aria-label="Schedule"
          title="Schedule"
          data-tour-id="topbar-schedule"
          onClick={() => setScheduleOpen(true)}
        >
          <CalendarIcon size={16} />
        </button>

        {user && hasChannel ? (
          <>
            <div className="relative hidden sm:block">
              <button
                type="button"
                className={cn(
                  iconBtnClass,
                  (broadcastOpen || pathname.startsWith('/studio/go-live')) &&
                    'border-primary bg-primary/15 text-primary',
                )}
                aria-label="Broadcast status"
                aria-haspopup="menu"
                aria-expanded={broadcastOpen}
                title="Broadcast status"
                data-tour-id="topbar-golive"
                onClick={() => {
                  setBroadcastOpen((current) => !current);
                  setMessagesOpen(false);
                }}
              >
                <RadioIcon size={16} />
              </button>
              {broadcastOpen ? (
                <div
                  className="border-border bg-background absolute top-[calc(100%+6px)] right-0 z-40 min-w-52 rounded-lg border p-2 shadow-lg"
                  role="menu"
                >
                  <div className="flex items-center gap-2 px-2 py-2 text-sm font-semibold">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        isLive
                          ? 'bg-accent-green'
                          : 'bg-foreground-secondary/40',
                      )}
                      aria-hidden
                    />
                    {isLive ? 'Live now' : 'Broadcast offline'}
                  </div>
                  <Link
                    to="/studio/go-live"
                    role="menuitem"
                    onClick={() => setBroadcastOpen(false)}
                    className="hover:bg-background-secondary flex items-center gap-2 rounded-md px-2 py-2 text-xs"
                  >
                    <RadioIcon size={14} aria-hidden />
                    Open broadcast studio
                  </Link>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className={cn('hidden sm:inline-flex', iconBtnClass)}
              aria-label="Upload"
              title="Upload"
              data-tour-id="topbar-upload"
              onClick={() => setUploadOpen(true)}
            >
              <UploadIcon size={16} />
            </button>
            <button
              type="button"
              className={cn(
                'hidden sm:inline-flex',
                iconBtnClass,
                bookOpen && 'border-primary bg-primary/15 text-primary',
              )}
              aria-label="Book show"
              title="Book show"
              data-tour-id="topbar-book"
              onClick={() => setBookOpen(true)}
            >
              <BookOpenIcon size={16} />
            </button>
          </>
        ) : null}

        {user ? (
          <div className="relative">
            <button
              type="button"
              className={cn(
                iconBtnClass,
                (messagesOpen || pathname.startsWith('/messages')) &&
                  'border-primary bg-primary/15 text-primary',
              )}
              aria-label="Messages"
              aria-haspopup="menu"
              aria-expanded={messagesOpen}
              title="Messages"
              data-tour-id="topbar-messages"
              onClick={() => {
                setMessagesOpen((current) => !current);
                setBroadcastOpen(false);
              }}
            >
              <MessageSquareIcon size={16} />
              {conversations.reduce(
                (total, conversation) => total + conversation.unreadCount,
                0,
              ) > 0 ? (
                <span className="bg-accent-red text-background absolute -top-1 -right-1 min-w-4 rounded-full px-1 text-center text-[9px] font-bold">
                  {Math.min(
                    9,
                    conversations.reduce(
                      (total, conversation) => total + conversation.unreadCount,
                      0,
                    ),
                  )}
                </span>
              ) : null}
            </button>
            {messagesOpen ? (
              <div
                className="border-border bg-background absolute top-[calc(100%+6px)] right-0 z-40 w-72 rounded-lg border p-2 shadow-lg"
                role="menu"
              >
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-sm font-semibold">Messages</span>
                  <Link
                    to="/messages"
                    role="menuitem"
                    onClick={() => setMessagesOpen(false)}
                    className="text-accent-cyan text-xs hover:underline"
                  >
                    Open all
                  </Link>
                </div>
                {conversations.length === 0 ? (
                  <p className="text-foreground-secondary px-2 py-3 text-xs">
                    No messages yet.
                  </p>
                ) : (
                  conversations.slice(0, 5).map((conversation) => (
                    <Link
                      key={conversation.id}
                      to="/messages/$id"
                      params={{ id: conversation.id }}
                      role="menuitem"
                      onClick={() => setMessagesOpen(false)}
                      className={cn(
                        'hover:bg-background-secondary flex gap-2 rounded-md px-2 py-2 text-xs',
                        conversation.unreadCount > 0 && 'bg-accent-purple/10',
                      )}
                    >
                      <span className="bg-primary/20 text-primary flex size-7 shrink-0 items-center justify-center rounded-full font-semibold">
                        {conversation.otherUser.displayName
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2 font-medium">
                          <span className="truncate">
                            {conversation.otherUser.displayName}
                          </span>
                          {conversation.unreadCount > 0 ? (
                            <span className="text-accent-red">
                              {conversation.unreadCount}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-foreground-secondary block truncate">
                          {conversation.lastMessage?.body ?? 'No messages yet'}
                        </span>
                      </span>
                    </Link>
                  ))
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              data-tour-id="topbar-account"
              className={cn(
                'hover:bg-background-secondary inline-flex items-center gap-1.5 rounded-lg border px-1.5 py-1 transition-colors',
                open
                  ? 'border-border bg-background-secondary'
                  : 'border-border/60',
              )}
              aria-label={`Signed in as ${displayName}`}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {isLive ? (
                <span
                  className="bg-primary size-1.5 shrink-0 rounded-full"
                  aria-hidden
                />
              ) : null}
              <span
                className="bg-primary/20 text-primary font-display flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                aria-hidden
              >
                {initial}
              </span>
              <span
                className="text-foreground-secondary text-[10px]"
                aria-hidden
              >
                {open ? '▴' : '▾'}
              </span>
            </button>

            {open ? (
              <div
                className="border-border bg-background absolute top-[calc(100%+6px)] right-0 z-40 flex min-w-[11.5rem] flex-col gap-0.5 rounded-lg border p-1.5 shadow-lg"
                role="menu"
              >
                <div className="text-foreground-secondary truncate px-2.5 py-1.5 text-[11px]">
                  {displayName}
                  {user.username ? (
                    <span className="block truncate opacity-80">
                      @{user.username}
                    </span>
                  ) : null}
                </div>
                <div className="bg-border mx-1 my-0.5 h-px" role="separator" />

                {hasChannel ? (
                  <>
                    <Link
                      to="/studio"
                      className="hover:bg-background-secondary flex items-center gap-2 rounded-md px-2.5 py-2 text-xs"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboardIcon size={14} />
                      Artist panel
                    </Link>
                    <Link
                      to="/u/$username"
                      params={{ username: user.username }}
                      className="hover:bg-background-secondary flex items-center gap-2 rounded-md px-2.5 py-2 text-xs"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <UserIcon size={14} />
                      My channel
                    </Link>
                  </>
                ) : null}

                <button
                  type="button"
                  className="hover:bg-background-secondary flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    openSettings('account');
                  }}
                >
                  <SettingsIcon size={14} />
                  Settings
                </button>
                <a
                  href="https://tahti.live"
                  className="hover:bg-background-secondary flex items-center gap-2 rounded-md px-2.5 py-2 text-xs"
                  role="menuitem"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <ExternalLinkIcon size={14} />
                  tahti.live
                </a>

                <div className="bg-border mx-1 my-0.5 h-px" role="separator" />
                <button
                  type="button"
                  className="text-accent-red hover:bg-background-secondary flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                >
                  <LogOutIcon size={14} />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            className={iconBtnClass}
            aria-label="Log in"
            title="Log in"
            data-tour-id="topbar-login"
            onClick={() => openAuth('login')}
          >
            <LogInIcon size={16} />
          </button>
        )}
      </div>
      <UploadTrackDialog
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
      <ScheduleDialog
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onBook={() => {
          setScheduleOpen(false);
          setBookOpen(true);
        }}
      />
      <RadioBookingCalendar
        isOpen={bookOpen}
        onClose={() => setBookOpen(false)}
        scope="mine"
      />
    </header>
  );
}
