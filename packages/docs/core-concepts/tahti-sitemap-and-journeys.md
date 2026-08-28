---
description: Sitemap and role-based user journeys for Tahti listener, artist, and governing workflows.
---

# Tahti sitemap and user journeys

This page is the route-level map for the Tahti client. It shows the shared listener shell, the artist Studio workspace, and the governing-person administration surface. The governing role means a board or moderator account with the permissions needed for the relevant queue; ordinary listeners and artists do not receive those controls.

## Sitemap

```mermaid
flowchart TD
  Root[Tahti]
  Root --> Listen[Listen]
  Root --> Library[Library]
  Root --> Artist[Artist channel]
  Root --> Studio[Studio]
  Root --> Settings[Settings]
  Root --> Community[Community]
  Root --> Help[Help and public information]

  Listen --> Home[Home]
  Listen --> Radio[Radio]
  Listen --> Discover[Discover]
  Listen --> Feed[Your feed]
  Listen --> Messages[Messages]
  Listen --> Chat[Channel chat]

  Library --> Sounds[All sounds]
  Library --> Collections[Collections]
  Library --> Recordings[Recordings]
  Library --> History[History]
  Library --> Favourites[Favourites]
  Library --> Smartlinks[Smartlinks]

  Artist --> Profile[Public profile]
  Artist --> PublicContent[Public sounds and releases]
  Artist --> Subscribe[Subscribe and audience]
  Artist --> ArtistChat[Artist chat]

  Studio --> StudioHome[Overview]
  Studio --> StudioLibrary[Library]
  Studio --> Perform[Perform]
  Studio --> Manage[Manage]
  StudioLibrary --> StudioSounds[Sounds]
  StudioLibrary --> StudioCollections[Collections and playlists]
  StudioLibrary --> StudioRecordings[Recordings]
  StudioLibrary --> Upload[Upload]
  StudioLibrary --> Editor[Audio editor]
  StudioLibrary --> Stash[Stash]
  Perform --> GoLive[Go live and pre-flight]
  Perform --> Schedule[Schedule and analytics]
  Perform --> Events[Events and venues]
  Perform --> Shows[Shows and episodes]
  Manage --> Channel[Channel]
  Manage --> RadioManage[Radio and 24/7]
  Manage --> GreenRoom[Green room]
  Manage --> Multicast[Multicast]
  Manage --> Selects[Tahti Selects]
  Manage --> Moderation[Channel moderation]
  Manage --> Governance[Artist governance]

  Settings --> Account[Account and security]
  Settings --> ArtistSettings[Artist identity and branding]
  Settings --> ChannelSettings[Channel and discovery]
  Settings --> Audience[Audience and tiers]
  Settings --> Addons[Add-ons]
  Settings --> Themes[Themes and visualizers]

  Community --> PublicGovernance[Governance proposals]
  Community --> PublicHelp[Help center]
  Help --> Status[Platform status]
  Help --> About[About and legal pages]

  Admin[Governance person] --> AdminOverview[Admin overview]
  Admin --> AdminModeration[Moderation queues]
  Admin --> AdminLogs[Logs and recent audit]
  Admin --> AdminStreams[Stream manager]
  Admin --> AdminUsers[Users and roles]
  Admin --> AdminRadio[Radio and announcements]
  Admin --> AdminGovernance[Governance, grants and AGM]
  Admin --> AdminWidgets[Widget catalogue]
  Admin --> AdminOps[Storage, vendors and localization]
```

The top-level shell stays available while moving between listener, artist, settings, chat, messages, notifications, and history. Studio and Admin add a contextual left menu; the current top section determines which submenu is visible.

## Listener journey

```mermaid
flowchart LR
  Start([Open Tahti]) --> Browse[Browse Home, Radio or Discover]
  Browse --> Channel[Open a channel]
  Browse --> Track[Open a track or release]
  Channel --> Play[Play live or on-demand audio]
  Track --> Queue[Add one item or a collection to the queue]
  Play --> Love[Love, follow or open chat]
  Queue --> Player[Use the persistent player]
  Love --> Feed[Read updates in Your feed]
  Feed --> Play
  Player --> History[Find it later in History]
  Start --> Library[Open Library]
  Library --> Collections[Open collections and recordings]
  Collections --> Player
  Start --> Messages[Open Messages]
  Messages --> Conversation[Continue a conversation]
```

A listener can discover public content, play tracks and live channels, queue individual items or whole collections, love and follow artists, join channel chat, read the feed, revisit history, and message other users. Signed-out users can browse public content but do not see the personalized feed or private account surfaces.

## Artist journey

```mermaid
flowchart LR
  Artist([Artist signs in]) --> Studio[Open Studio overview]
  Studio --> Create[Create channel if none exists]
  Studio --> Publish[Library]
  Publish --> Upload[Upload sound or clip]
  Upload --> Edit[Edit metadata, artwork and privacy]
  Edit --> Collection[Build collection or release]
  Collection --> Public[Publish to public catalogue]
  Studio --> Broadcast[Perform]
  Broadcast --> Schedule[Schedule or book a show]
  Broadcast --> Live[Go live with pre-flight]
  Live --> Rotation[Manage rotation and 24/7 radio]
  Live --> Recording[Polish and publish recording]
  Studio --> Manage[Manage]
  Manage --> Design[Configure channel and visualizer]
  Manage --> Destinations[Configure multicast destinations]
  Manage --> Audience[Grow audience with posts, tiers and subscriptions]
  Studio --> Insights[Review stats and insights]
  Insights --> Improve[Use results to improve catalogue and programming]
  Improve --> Publish
```

An artist creates or configures a channel, uploads and edits content, organizes it into collections or releases, then publishes it. The same Studio workspace supports schedule planning, live pre-flight, rotation programming, recordings, channel design, multicast, audience tools, posts, governance input, and performance insights.

## Governing-person journey

```mermaid
flowchart LR
  Board([Board or moderator signs in]) --> Overview[Admin overview]
  Overview --> NeedsAction[Review needs-action cards]
  NeedsAction --> Queue[Open the relevant moderation queue]
  Queue --> Support[Support]
  Queue --> Reports[Content reports]
  Queue --> RadioSubmissions[Radio submissions]
  Queue --> MissedShows[Missed shows]
  Queue --> FeatureRequests[Feature requests]
  Queue --> Beta[Beta applications]
  Queue --> Decide[Approve, reject, acknowledge or inspect detail]
  Decide --> Audit[Recent audit log]
  Overview --> Streams[Open stream manager]
  Streams --> Monitor[See current programming, listeners and peaks]
  Monitor --> Control[Inspect or control an active stream]
  Board --> Governance[Governance]
  Governance --> Votes[Review votes, discussions and comments]
  Governance --> Grants[Run or inspect grant cycles]
  Governance --> AGM[Prepare AGM decisions]
  Board --> Operations[Radio, announcements, users, widgets and vendors]
  Operations --> Logs[Record operational changes in audit logs]
```

A governing person starts from the Admin overview, processes actionable queues, records decisions in the audit trail, monitors streams, and maintains the platform’s governance and operational systems. Administrative routes are permission-gated; a direct URL does not grant board access.

## Journey boundaries

| Role | Can do | Cannot do without a higher role |
| --- | --- | --- |
| Listener | Browse, play, queue, love, follow, chat, message, manage personal account | Edit artist catalogue, control streams, moderate users, govern platform decisions |
| Artist | Everything a listener can do plus publish, broadcast, schedule, configure a channel, manage audience and review own insights | Review board-only queues, manage other users, operate platform-wide governance |
| Governing person | Board/moderator operations, moderation decisions, stream oversight, governance administration | Edit another artist’s private content unless the relevant administrative permission explicitly allows it |

For implementation parity, use the client router and the sibling Tahti API routes as the source of truth. A new journey is complete only when its route, API counterpart, permission check, loading state, empty state, error state, and audit behavior are all represented.
