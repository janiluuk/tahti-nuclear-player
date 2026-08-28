# @nuclearplayer/tahti-web

Tahti’s listen, artist studio and administration client. It combines the Nuclear Player experience with publishing, broadcasting, community and platform-management tools.

The screenshots below are a guided tour of the current product. They were captured from the populated mock environment with the privileged board account, so the guide shows the full navigation and representative content without exposing production data. The capture script is [`scripts/capture-readme-guide.mjs`](./scripts/capture-readme-guide.mjs), and the complete manifest is [`docs/readme-shots/manifest.json`](./docs/readme-shots/manifest.json).

## What Tahti is for

- **Listen:** discover channels, releases, collections and community posts; play live radio and on-demand audio.
- **Publish:** upload sounds and clips, build releases and collections, edit metadata, create smartlinks and prepare distribution.
- **Broadcast:** schedule shows, run pre-flight and live controls, manage 24/7 rotations, recordings and stream destinations.
- **Connect:** maintain an artist profile, audience tiers, subscriptions, announcements, chat and governance participation.
- **Operate:** give administrators moderation queues, stream controls, audit logs, platform status, localization and widget management.

## View guide

Every image is a full-page route capture. The narration describes the job the view supports and the key navigation context to look for.

### Listener and account

| View               | Screenshot                                                        | What you can do                                                                                          |
| ------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Listener home      | ![Listener home](./docs/readme-shots/listen-home.png)             | Start with a mixed home feed of stations and content, then continue playback from the persistent player. |
| Radio directory    | ![Radio directory](./docs/readme-shots/listen-radio.png)          | Browse live channels, inspect their status and open a channel without leaving the listener area.         |
| Discover           | ![Discover](./docs/readme-shots/listen-discover.png)              | Explore new tracks, artists and collections through the discovery catalogue.                             |
| Your feed          | ![Your feed](./docs/readme-shots/listen-feed.png)                 | Read followed-artist updates and play tracks shared in the feed.                                         |
| All sounds         | ![All sounds](./docs/readme-shots/library-all-sounds.png)         | Search and filter personal audio, inspect source and upload metadata, and start playback.                |
| Collections        | ![Collections](./docs/readme-shots/library-collections.png)       | Open a collection or playlist and organize longer-form catalogue content.                                |
| Recordings         | ![Recordings](./docs/readme-shots/library-recordings.png)         | Review recordings from broadcasts and shows.                                                             |
| History            | ![History](./docs/readme-shots/library-history.png)               | Return to recently played items and keep listening context in one place.                                 |
| Favourites         | ![Favourites](./docs/readme-shots/library-favorites.png)          | Revisit loved tracks from the library.                                                                   |
| Smartlinks         | ![Smartlinks](./docs/readme-shots/library-smartlinks.png)         | Create and monitor shareable release links.                                                              |
| Messages           | ![Messages](./docs/readme-shots/listener-messages.png)            | Open conversations directly from the top bar and identify the active thread.                             |
| Account            | ![Account settings](./docs/readme-shots/settings-account.png)     | Manage account details, security, privacy, notifications and sessions.                                   |
| Artist settings    | ![Artist settings](./docs/readme-shots/settings-artist.png)       | Edit identity, branding, gallery, press material and connected profiles.                                 |
| Channel settings   | ![Channel settings](./docs/readme-shots/settings-channel.png)     | Configure channel-facing details and discovery visibility.                                               |
| Broadcast settings | ![Broadcast settings](./docs/readme-shots/settings-broadcast.png) | Configure broadcast defaults, green room behavior and destinations.                                      |
| Audience settings  | ![Audience settings](./docs/readme-shots/settings-audience.png)   | Manage fan tiers, subscriptions and grants.                                                              |
| Themes             | ![Themes](./docs/readme-shots/settings-themes.png)                | Choose the application appearance and visualizer preferences.                                            |
| Add-ons            | ![Add-ons](./docs/readme-shots/settings-addons.png)               | Configure integrations, player extensions and import/export providers.                                   |
| What’s new         | ![What’s new](./docs/readme-shots/settings-whats-new.png)         | Read release notes and product announcements.                                                            |

### Public channel and community

| View                          | Screenshot                                                       | What you can do                                                                               |
| ----------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Artist channel / Aurora       | ![Artist channel](./docs/readme-shots/public-channel-aurora.png) | Visit a public artist channel with identity, catalogue, chat and the Aurora visual treatment. |
| Radio channel / Reactive Grid | ![Radio channel](./docs/readme-shots/public-radio-grid.png)      | Listen to a live station with a distinct Reactive Grid visualizer preset.                     |
| Artist profile                | ![Artist profile](./docs/readme-shots/public-artist.png)         | Read the artist story and people section, browse public content and follow the artist.        |
| Governance                    | ![Governance](./docs/readme-shots/governance.png)                | Read proposals, participate in votes and follow community discussion context.                 |
| Help center                   | ![Help center](./docs/readme-shots/help-center.png)              | Find clear product guidance and essential background information.                             |
| Platform status               | ![Platform status](./docs/readme-shots/platform-status.png)      | Check the health of Tahti services and operational signals.                                   |

### Artist studio

| View                      | Screenshot                                                         | What you can do                                                          |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Studio overview           | ![Studio overview](./docs/readme-shots/studio-overview.png)        | See upcoming shows, governance attention and useful next actions.        |
| Stats / Overview          | ![Stats overview](./docs/readme-shots/studio-stats-overview.png)   | Get a high-level view of catalogue, audience and broadcast performance.  |
| Stats / Plays & listeners | ![Plays and listeners](./docs/readme-shots/studio-stats-plays.png) | Compare listening activity and audience numbers over selectable periods. |
| Stats / Top lists         | ![Top lists](./docs/readme-shots/studio-stats-top-lists.png)       | Inspect strongest tracks, content types and listener locations.          |
| Posts                     | ![Posts](./docs/readme-shots/studio-posts.png)                     | Publish artist updates and manage newsletter communication.              |
| Distribution              | ![Distribution](./docs/readme-shots/studio-distribution.png)       | Prepare catalogue delivery and follow destination requirements.          |
| Insights                  | ![Insights](./docs/readme-shots/studio-insights.png)               | Review insight summaries for the catalogue.                              |
| Audience                  | ![Audience](./docs/readme-shots/studio-audience.png)               | Manage audience relationships, tiers and supporter features.             |
| Sounds                    | ![Sounds](./docs/readme-shots/studio-sounds.png)                   | Filter, sort and play sound content, then open the full editor/player.   |
| Clips                     | ![Clips](./docs/readme-shots/studio-clips.png)                     | Keep short clips and radio announcements in their own content type.      |
| Collections               | ![Studio collections](./docs/readme-shots/studio-collections.png)  | Create and browse albums, EPs, podcasts, playlists and sets.             |
| Releases                  | ![Releases](./docs/readme-shots/studio-releases.png)               | Manage artwork, metadata, tracks and shop links.                         |
| Recordings                | ![Studio recordings](./docs/readme-shots/studio-recordings.png)    | Turn broadcasts into polished, publishable recordings.                   |
| Upload                    | ![Upload](./docs/readme-shots/studio-upload.png)                   | Bring in local audio or use configured import providers.                 |
| Audio editor              | ![Audio editor](./docs/readme-shots/studio-editor.png)             | Start a session or open existing material from the library.              |
| Stash                     | ![Stash](./docs/readme-shots/studio-stash.png)                     | Keep private working material out of the public catalogue.               |
| Go live                   | ![Go live](./docs/readme-shots/studio-go-live.png)                 | Run pre-flight, control live playback and edit the rotation.             |
| Schedule                  | ![Schedule](./docs/readme-shots/studio-schedule.png)               | Plan broadcasts, book shows and reach schedule analytics.                |
| Events                    | ![Events](./docs/readme-shots/studio-events.png)                   | Browse upcoming and past events with venue and ticket context.           |
| New event                 | ![New event](./docs/readme-shots/studio-event-new.png)             | Create an event and connect it to a venue and show.                      |
| Venues                    | ![Venues](./docs/readme-shots/studio-venues.png)                   | Browse the venue directory or prepare a new venue entry.                 |
| Shows                     | ![Shows](./docs/readme-shots/studio-shows.png)                     | Manage one-off shows and continuing series.                              |
| Show detail               | ![Show detail](./docs/readme-shots/studio-show-detail.png)         | Edit show metadata, episodes and recordings.                             |
| Manage / Channel          | ![Manage channel](./docs/readme-shots/studio-channel.png)          | Maintain channel data and reach setup when needed.                       |
| Manage / Radio            | ![Manage radio](./docs/readme-shots/studio-radio.png)              | Monitor stream statistics and curate the 24/7 rotation.                  |
| Manage / Green room       | ![Green room](./docs/readme-shots/studio-green-room.png)           | Configure the preparation area for broadcasts.                           |
| Manage / Multicast        | ![Multicast](./docs/readme-shots/studio-multicast.png)             | Activate configured destinations and configure incomplete ones.          |
| Manage / Tahti Selects    | ![Tahti Selects](./docs/readme-shots/studio-selects.png)           | Curate tracks for the platform-wide selection.                           |
| Manage / Moderation       | ![Studio moderation](./docs/readme-shots/studio-moderation.png)    | Assign channel moderators and review channel-level work.                 |

### Administration

| View                      | Screenshot                                                             | What you can do                                                  |
| ------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Overview                  | ![Admin overview](./docs/readme-shots/admin-overview.png)              | Triage needs-action items and inspect operational signals.       |
| Status                    | ![Admin status](./docs/readme-shots/admin-status.png)                  | Combine platform health with administrative status information.  |
| Logs / Activity           | ![Admin activity](./docs/readme-shots/admin-logs.png)                  | Review operational activity in chronological context.            |
| Logs / Containers         | ![Container logs](./docs/readme-shots/admin-logs-containers.png)       | Inspect service and container output.                            |
| Logs / Recent audit       | ![Recent audit](./docs/readme-shots/admin-logs-audit.png)              | Review privileged actions with actor and subject context.        |
| Moderation / Support      | ![Support](./docs/readme-shots/admin-moderation.png)                   | Work the support queue and acknowledge items needing a response. |
| Moderation / Beta         | ![Beta applications](./docs/readme-shots/admin-moderation-beta.png)    | Review beta applications by status.                              |
| Moderation / Radio        | ![Radio submissions](./docs/readme-shots/admin-moderation-radio.png)   | Review and decide on Tahti Radio submissions.                    |
| Moderation / Reports      | ![Content reports](./docs/readme-shots/admin-moderation-reports.png)   | Triage reports and record resulting action.                      |
| Moderation / Features     | ![Feature requests](./docs/readme-shots/admin-moderation-features.png) | Track requests through planning and delivery states.             |
| Moderation / Missed shows | ![Missed shows](./docs/readme-shots/admin-moderation-missed.png)       | Resolve missed broadcast follow-up.                              |
| Users                     | ![Admin users](./docs/readme-shots/admin-users.png)                    | Manage accounts, roles and membership state.                     |
| Radio                     | ![Admin radio](./docs/readme-shots/admin-radio.png)                    | Maintain radio station configuration and programming.            |
| Posts                     | ![Admin posts](./docs/readme-shots/admin-news.png)                     | Publish generic platform news.                                   |
| Streams                   | ![Admin streams](./docs/readme-shots/admin-streams.png)                | Monitor streams, listeners and stream controls.                  |
| Top lists                 | ![Admin top lists](./docs/readme-shots/admin-top-lists.png)            | Explore platform-wide listening rankings.                        |
| Announcements             | ![Announcements](./docs/readme-shots/admin-announcements.png)          | Manage public and pinned announcements.                          |
| Storage                   | ![Storage](./docs/readme-shots/admin-storage.png)                      | Review storage totals and account usage.                         |
| Storage / Files           | ![Stored files](./docs/readme-shots/admin-storage-files.png)           | Inspect stored files.                                            |
| Financial                 | ![Financial](./docs/readme-shots/admin-financial.png)                  | Review platform financial summaries.                             |
| Governance                | ![Admin governance](./docs/readme-shots/admin-governance.png)          | Review proposals, votes, discussions and comments.               |
| Grants                    | ![Grants](./docs/readme-shots/admin-grants.png)                        | Manage grant cycles and awards.                                  |
| AGM                       | ![AGM](./docs/readme-shots/admin-agm.png)                              | Prepare annual meeting material and decisions.                   |
| Vendors                   | ![Vendors](./docs/readme-shots/admin-vendors.png)                      | Manage vendors and external integrations.                        |
| Widgets                   | ![Widgets](./docs/readme-shots/admin-widgets.png)                      | Browse, add, configure and remove discovery widgets.             |
| Localization              | ![Localization](./docs/readme-shots/admin-i18n.png)                    | Maintain translated product content.                             |
| Tahti Selects             | ![Admin Selects](./docs/readme-shots/admin-selects.png)                | Curate the platform-wide selection.                              |

## Running locally

```bash
pnpm dev
pnpm storybook
pnpm --filter @nuclearplayer/tahti-web type-check
pnpm --filter @nuclearplayer/tahti-web lint
```

Refresh the guide against the mock app with:

```bash
README_GUIDE_BASE_URL=http://127.0.0.1:5190 node packages/tahti-web/scripts/capture-readme-guide.mjs
```

The capture uses deterministic mock content and reduced motion for stable documentation images. It intentionally includes two public channel views so the guide demonstrates more than one visualizer preset.

## Documentation and architecture

The application is a Vite/React client in a pnpm monorepo. Shared Nuclear components live in `packages/ui`; the Tahti web client lives in `packages/tahti-web`; plugin contracts and player services live in the surrounding packages. Product planning and implementation notes are kept in [`WORKPLAN.md`](./WORKPLAN.md) and [`UI-REDESIGN-WORKLOG.md`](./UI-REDESIGN-WORKLOG.md).

The API contract is documented in [`docs/API-REFERENCE.md`](./docs/API-REFERENCE.md). It is checked against `../tahti/openapi.json` so route and contract changes in the sibling API trigger a documentation review.
