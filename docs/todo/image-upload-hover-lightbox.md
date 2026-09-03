# Image upload widgets — hover delete + preview modal

Status: planned (worklog only). Depends on shared upload primitives
(`RoundImageUploadButton`, `BackdropUploadButton`, `ImageUploadField`,
`RadioStationCover`, branding/avatar slots, collection slideshow, gallery).

## Goal

Every upload surface that already has an image set (avatars, backdrops,
covers, logos, slideshow frames, etc.) must support:

1. **Hover delete** — hovering the set image shows an **X** in a corner.
   Clicking X opens a confirm dialog, then clears that image (and persists
   if the parent already persists other edits).
2. **Hover / click preview modal** — hovering (or clicking) a set image
   opens a modal with a **large preview**. If the slot is a slideshow /
   multi-image gallery, show the slideshow frames as a strip below the
   large image. From that modal the user can **change** or **delete** the
   current image (or individual slideshow frames).

Empty slots keep today’s behavior: placeholder + click-to-upload (or
gallery picker when multiple images are allowed). Do not show X or the
preview modal when nothing is set.

## Rules (extends media upload convention in WORKPLAN)

- Confirm before delete (shared `Dialog` / confirm pattern — never silent
  clear).
- Change from the modal reuses the same upload accept list and toast
  feedback as the slot’s existing upload path.
- Slideshow: deleting one frame does not delete the whole set; clearing
  the last frame returns the slot to empty placeholder.
- Storybook-first: extend or wrap existing upload primitives; add stories
  for empty / set / hover / modal / slideshow / confirm-delete.
- Keep live data and persist semantics; this is a chrome/UX layer on top
  of existing upload APIs.

## Surfaces to sweep

| Area | Components / views |
| --- | --- |
| Shared | `RoundImageUploadButton`, `BackdropUploadButton`, `ImageUploadField`, `RadioStationCover` |
| Studio branding / channel | `StudioBrandingView`, `ChannelDesigner`, archive banner, header media |
| Collections / gallery | collection cover + slideshow, `ArtistGalleryPanel` |
| Admin | radio station logo, disco widgets, news images, announcements |
| Other | venue / show image pickers, release artwork, onboarding avatar |

## Out of scope for this ticket

- Accepting pasted URLs as a substitute for upload (still disallowed).
- Changing R2 / media API contracts beyond clear/null fields already
  supported.
- Implementing the UX in the same pass as this worklog (track in
  WORKPLAN + UI-REDESIGN-WORKLOG when started).
