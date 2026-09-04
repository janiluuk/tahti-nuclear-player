# ViewShell batch — next 10 (2026-09-04)

**Status:** done.
**Deploy:** push + `pnpm deploy:tahti-storybook` (or `gh workflow run "Deploy storybook"`) so storybook.tahti.live matches current stories.

1. Feed — `Feed` / Posts and releases from artists you follow (embedded feed unchanged)
2. Favorites — `Favorites` / Channels, radio, and tracks (embedded unchanged)
3. Account — `Account` / Membership and subscriptions (settings / logout in children)
4. Messages — `Messages` / Direct messages
5. Status — `Status` / Health of Tahti services
6. Studio Home — `Studio` / greeting as subtitle; role badges as children
7. Studio Stats — `Stats` / Audience and broadcasts; FilterChips in children; section Tabs outside
8. Studio Playlists — `Playlists` / Archive tracks and releases; New playlist icon + Tooltip in children (editor SaveButton in children)
9. Studio Upload — `Upload` / Add music from a file or source
10. Library — Overview or tab name / short catalog subtitle; Library section Tabs outside ViewShell

Also landed with this pass:

- Studio Shows — `Shows` / Episodes, slots, and series; New show + Tooltip in children
- Admin Users, Streams, Content, Selects, Status — short title/subtitle; Admin tabs outside

**Next:** remaining Studio (Stash, Recordings, Events, Channel, …) and remaining Admin — see `viewshell-page-headers.md` and `viewshell-next-15.md`.
