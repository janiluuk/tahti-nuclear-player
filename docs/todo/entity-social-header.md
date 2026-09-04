# Entity social header (public entities)

**Status:** executed (0.0.65).

## Public surfaces

| Surface | Notes |
| --- | --- |
| Artist | done |
| Collection / playlist | same `CollectionView` |
| Channel | when designer hero is off |
| Radio show | done |
| Venue | done |
| Smart link / release | done |
| Subscribe | done |
| Track listen page | immersive player (not this header) |

Storybook: `Tahti/Page/EntitySocialHeader`.

## Admin / Studio KPIs (not social chips)

Large number panels restored (no StatChip KPI strips):

- Admin Dashboard, Content, Storage disk cards
- Studio Home, Stats overview, Channel radio stats, Schedule analytics
- Fan subscription summary, Track insights, Admin user followers

`StatChip` remains only inside `EntitySocialHeader` and live stream
status cells in `StreamManagerPanel`.
