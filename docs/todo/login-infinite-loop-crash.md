# Post-login crash on beta.tahti.live (React error #185)

**Status:** Reproduced, root cause not yet isolated. Not fixed.

## Symptom

Logging into `beta.tahti.live` (Studio or `/onboarding`) with a real account
crashes the whole app to a generic "Something went wrong!" screen shortly
after login completes.

## Confirmed facts

- Backend/API is not at fault: `POST /api/auth/login` returns 200, the
  session cookie is set correctly (`Domain=.tahti.live`, `HttpOnly`,
  `Secure`, `SameSite=Lax`), and every subsequent `/api/me/*` / `/api/auth/me`
  call the app makes returns 200. All confirmed via direct browser network
  inspection during a live repro.
- The crash is `Error: Minified React error #185` — "Maximum update depth
  exceeded" (an infinite `setState` loop), not an unhandled exception.
  Decoder: https://reactjs.org/docs/error-decoder.html?invariant=185
- Reproduces identically by navigating straight to `/onboarding` while
  authenticated (no need to go through `/studio` first) — isolates the loop
  to `OnboardingView` and/or `AppShell` (which wraps every route and is
  always mounted alongside it), not to Studio-specific code.
- `AppShell.tsx` has a "first sign-in of the session" effect
  (`useEffect(() => { if (!hasSeenOnboarding(userId)) navigate({to:
  '/onboarding'}) }, [userId, pathname, navigate])`) that fires right after
  login for any browser/account combo that's never set the
  `tahti-web-onboarded:<userId>` localStorage flag — which is every real
  login from a fresh browser, since that flag was only ever set by users who
  have already completed onboarding *since this flag scheme shipped*. This
  is very likely why the crash is showing up now for existing users who
  never went through the (new) onboarding flow before.
- Does **NOT** reproduce with `VITE_FORCE_MOCK=1` — a full local dev pass
  through `/onboarding` with mock `fetchMeProfile`/`fetchDiscoveryPrefs`
  data renders fine, no loop. This means it's either data-shape-dependent
  (something in the real profile/discovery response the mock doesn't
  replicate) or timing-dependent (mock resolves near-instantly; real network
  round-trips are slow enough to hit a race the mock never hits).
- Local repro against the *real* API is blocked by the session cookie's
  `Domain=.tahti.live` scope — `localhost` can never receive it, so
  `/api/auth/me` always 401s locally regardless of a valid login, and the
  auth store's `refresh()` nulls the seeded user back out. Did not attempt a
  `/etc/hosts` subdomain-spoofing workaround to get a real cookie on a local
  build — flagged as the next step if this needs a from-scratch repro.

## Where I looked (ruled out, no loop found)

`ViewShell`, `StudioGate`, `StudioHomeView`, `channelSetupModalStore`,
`useStripeConfigured`, `useIsMobile`/`useIsCompactDesktop`, `Tabs`,
`Select`, `GenrePicker`, `CreatableCombobox`, `PageHeader`, `PageStates`,
`QueuePanel`, `SidebarQueuePanel`, `RightRailPanel`, `PageTourSpotlight`
(tour-store gated, not auto-triggered) — none show an obvious unguarded
`setState` loop on static read-through.

## Most likely area, unconfirmed

`AppShell.tsx` and `packages/ui/.../QueuePanel/QueuePanel.tsx` both got
touched by two back-to-back, seemingly-independent commits right before
this was reported:

- `d1864c0e4` "Playerbar/sidebar queue redesign, revision-picker audit,
  NewsWidget" (mine, this session)
- `88a4ada4c` "Move player-bar queue to the right rail with waveform seek"
  (concurrent Cursor session, landed immediately after)

Both touch `AppShell.tsx`'s queue-open state and `SidebarQueuePanel.tsx` /
`QueuePanel.tsx`. No smoking gun found in either diff on inspection, but
two sessions modifying the same queue-state wiring within minutes of each
other is the most likely place for a genuine behavioral regression to have
slipped in un-noticed by either session's own verification pass.

## Suggested next step

Get a *real* authenticated repro with an unminified build — either the
`/etc/hosts` subdomain-spoof approach (map some `*.tahti.live` name to
`127.0.0.1`, serve local dev over HTTPS so the `Secure` cookie is accepted),
or temporarily deploy a source-mapped build to get a decoded stack trace
from the live crash, then read the actual component/hook named in the
trace instead of guessing further from source.
