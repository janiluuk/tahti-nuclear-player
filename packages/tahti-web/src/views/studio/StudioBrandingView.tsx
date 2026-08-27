import { Link } from '@tanstack/react-router';
import {
  DownloadIcon,
  EyeIcon,
  ImagePlusIcon,
  ImagesIcon,
  PaletteIcon,
  Trash2Icon,
} from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button, Input, SaveButton, Toggle } from '@nuclearplayer/ui';

import {
  deletePressKitImage,
  fetchMyPressKitImages,
  fetchPressKitMeta,
  fetchPublicPressKitImages,
  MAX_PRESS_KIT_SELECTED_IMAGES,
  patchPressKitBio,
  removeProfileAvatar,
  setPressKitGalleryPublic,
  updatePressKitImage,
  uploadPressKitImages,
  uploadProfileAvatar,
  type PressKitImageItem,
  type PressKitMeta,
} from '../../api/artist-settings';
import { fetchMeProfile, type ProfileFields } from '../../api/studio-extras';
import { ArtistGalleryPanel } from '../../components/ArtistGalleryPanel';
import { ChannelDesigner } from '../../components/ChannelDesigner';
import { ImageLightbox } from '../../components/ImageLightbox';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { useAuthStore } from '../../stores/authStore';

const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp';

type BrandingTab = 'branding' | 'gallery' | 'press-kit';
type UploadMode = 'append' | 'replace';

const selectedPressKitImages = (images: PressKitImageItem[]) =>
  images
    .filter((image) => image.includeInZip)
    .sort((left, right) => left.position - right.position);

export const StudioBrandingPanel: FC = () => {
  const user = useAuthStore((state) => state.user);
  const refreshAuth = useAuthStore((state) => state.refresh);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<BrandingTab>('branding');
  const [profile, setProfile] = useState<ProfileFields | null>(null);
  const [images, setImages] = useState<PressKitImageItem[]>([]);
  const [pressKit, setPressKit] = useState<PressKitMeta | null>(null);
  const [galleryPublic, setGalleryPublic] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>('append');
  const [includeUploads, setIncludeUploads] = useState(true);
  const [busy, setBusy] = useState(false);
  const [avatarViewerOpen, setAvatarViewerOpen] = useState(false);

  const reload = async () => {
    const [profileResult, imageResult, pressResult] = await Promise.all([
      fetchMeProfile(),
      fetchMyPressKitImages(),
      fetchPressKitMeta(),
    ]);
    setProfile(profileResult.data);
    setImages(imageResult.data);
    setPressKit(pressResult.data);
    const publicResult = await fetchPublicPressKitImages(
      profileResult.data.username,
    );
    setGalleryPublic(publicResult.data.length > 0);
  };

  useEffect(() => {
    void reload();
  }, []);

  const setVisibility = async (nextPublic: boolean) => {
    const previous = galleryPublic;
    setGalleryPublic(nextPublic);
    const result = await setPressKitGalleryPublic(nextPublic);
    if (!result.ok) {
      setGalleryPublic(previous);
      toast.error(result.error);
    }
  };

  const enforcePressKitLimit = async (nextImages: PressKitImageItem[]) => {
    const selected = selectedPressKitImages(nextImages);
    const overflow = selected.slice(
      0,
      Math.max(0, selected.length - MAX_PRESS_KIT_SELECTED_IMAGES),
    );
    if (overflow.length === 0) {
      return nextImages;
    }
    await Promise.all(
      overflow.map((image) =>
        updatePressKitImage(image.id, { includeInZip: false }),
      ),
    );
    const dropped = new Set(overflow.map((image) => image.id));
    return nextImages.map((image) =>
      dropped.has(image.id) ? { ...image, includeInZip: false } : image,
    );
  };

  const uploadGallery = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }
    if (
      uploadMode === 'replace' &&
      images.length > 0 &&
      !window.confirm(
        `Replace all ${images.length} existing gallery images with this upload?`,
      )
    ) {
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
      return;
    }
    setBusy(true);
    if (uploadMode === 'replace') {
      await Promise.all(images.map((image) => deletePressKitImage(image.id)));
    }
    const uploaded = await uploadPressKitImages(files);
    let nextImages = [
      ...(uploadMode === 'replace' ? [] : images),
      ...uploaded.images,
    ];
    if (!includeUploads) {
      await Promise.all(
        uploaded.images.map((image) =>
          updatePressKitImage(image.id, { includeInZip: false }),
        ),
      );
      const uploadedIds = new Set(uploaded.images.map((image) => image.id));
      nextImages = nextImages.map((image) =>
        uploadedIds.has(image.id) ? { ...image, includeInZip: false } : image,
      );
    }
    nextImages = await enforcePressKitLimit(nextImages);
    await setPressKitGalleryPublic(galleryPublic);
    setImages(nextImages);
    setBusy(false);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
    if (uploaded.errors.length > 0) {
      toast.error(uploaded.errors.join('; '));
    } else {
      toast.success(
        `${uploaded.images.length} image${uploaded.images.length === 1 ? '' : 's'} added.`,
      );
    }
  };

  const togglePressKitImage = async (image: PressKitImageItem) => {
    const nextIncluded = !image.includeInZip;
    let nextImages = images.map((candidate) =>
      candidate.id === image.id
        ? { ...candidate, includeInZip: nextIncluded }
        : candidate,
    );
    setImages(nextImages);
    const result = await updatePressKitImage(image.id, {
      includeInZip: nextIncluded,
    });
    if (!result.ok) {
      setImages(images);
      toast.error(result.error);
      return;
    }
    nextImages = await enforcePressKitLimit(nextImages);
    setImages(nextImages);
  };

  const removeImage = async (id: string) => {
    const previous = images;
    setImages((current) => current.filter((image) => image.id !== id));
    const result = await deletePressKitImage(id);
    if (!result.ok) {
      setImages(previous);
      toast.error(result.error);
    }
  };

  const uploadAvatar = async (file: File | undefined) => {
    if (!file || !profile) {
      return;
    }
    setBusy(true);
    const result = await uploadProfileAvatar(file);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setProfile({ ...profile, avatarUrl: result.avatarUrl });
    await refreshAuth();
    toast.success('Profile picture updated.');
  };

  const removeAvatar = async () => {
    if (!profile) {
      return;
    }
    setBusy(true);
    const result = await removeProfileAvatar();
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setProfile({ ...profile, avatarUrl: null });
    await refreshAuth();
    toast.success('Profile picture removed.');
  };

  const pressImages = selectedPressKitImages(images);
  const avatarUrl = profile?.avatarUrl ?? user?.avatarUrl ?? null;

  return (
    <div className="flex flex-col gap-6">
      <nav
        className="border-border flex flex-wrap gap-1 rounded-lg border p-1"
        role="tablist"
        aria-label="Branding sections"
      >
        {(
          [
            ['branding', 'Branding', PaletteIcon],
            ['gallery', 'Gallery', ImagesIcon],
            ['press-kit', 'Press kit', DownloadIcon],
          ] as const
        ).map(([id, label, Icon]) => (
          <Button
            key={id}
            type="button"
            variant="text"
            role="tab"
            aria-selected={tab === id}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              tab === id
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
            onClick={() => setTab(id)}
          >
            <Icon size={15} aria-hidden />
            {label}
          </Button>
        ))}
      </nav>

      {tab === 'branding' ? (
        <>
          <StudioPanel
            title="Profile picture"
            description="Use a clear square portrait or mark. Hover the picture to replace or remove it."
          >
            <div className="flex flex-wrap items-center gap-5">
              <div className="group relative size-32 shrink-0">
                <button
                  type="button"
                  className="border-border block size-32 overflow-hidden rounded-full border shadow-lg"
                  aria-label={
                    avatarUrl
                      ? `View ${profile?.displayName ?? 'artist'} profile picture`
                      : 'Upload profile picture'
                  }
                  onClick={() =>
                    avatarUrl
                      ? setAvatarViewerOpen(true)
                      : avatarInputRef.current?.click()
                  }
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="bg-primary/15 text-primary flex size-full items-center justify-center text-4xl font-bold">
                      {(profile?.displayName ?? user?.displayName ?? 'A')
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                  )}
                </button>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-full bg-black/50 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation();
                      avatarInputRef.current?.click();
                    }}
                    aria-label={
                      avatarUrl
                        ? 'Replace profile picture'
                        : 'Upload profile picture'
                    }
                    title={avatarUrl ? 'Replace picture' : 'Upload picture'}
                    className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-white/90 text-black transition-colors hover:bg-white disabled:opacity-50"
                  >
                    <ImagePlusIcon size={16} aria-hidden />
                  </button>
                  {avatarUrl ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={(event) => {
                        event.stopPropagation();
                        void removeAvatar();
                      }}
                      aria-label="Remove profile picture"
                      title="Remove picture"
                      className="text-accent-red pointer-events-auto flex size-9 items-center justify-center rounded-full bg-white/90 transition-colors hover:bg-white disabled:opacity-50"
                    >
                      <Trash2Icon size={16} aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-foreground-secondary text-xs">
                  JPEG, PNG, or WebP. The original is kept for full-size use.
                </p>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGES}
                  className="sr-only"
                  aria-label="Profile picture"
                  onChange={(event) =>
                    void uploadAvatar(event.target.files?.[0])
                  }
                />
              </div>
            </div>
          </StudioPanel>
          {profile ? (
            <StudioPanel
              title="Channel outlook"
              description="Apply the same visual language across your profile and live channel."
            >
              <ChannelDesigner
                displayName={profile.displayName}
                username={profile.username}
                avatarUrl={avatarUrl}
                bio={profile.bio}
                compact
              />
            </StudioPanel>
          ) : null}
        </>
      ) : null}

      {tab === 'gallery' ? (
        <>
          <StudioPanel
            title="Gallery upload"
            description="Add to the current gallery or replace it in one deliberate upload."
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="flex flex-col gap-4">
                <div
                  className="border-border grid grid-cols-2 rounded-md border p-1"
                  role="group"
                  aria-label="Gallery upload mode"
                >
                  {(
                    [
                      ['append', 'Append'],
                      ['replace', 'Replace'],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      className={`rounded px-3 py-2 text-xs font-semibold uppercase ${
                        uploadMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground-secondary'
                      }`}
                      aria-pressed={uploadMode === mode}
                      onClick={() => setUploadMode(mode)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span>
                    Public gallery
                    <span className="text-foreground-secondary block text-xs">
                      Listed on your artist profile
                    </span>
                  </span>
                  <Toggle
                    checked={galleryPublic}
                    onChange={(checked) => void setVisibility(checked)}
                    aria-label="Public gallery"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeUploads}
                    onChange={(event) =>
                      setIncludeUploads(event.target.checked)
                    }
                  />
                  Include uploaded images in press kit
                </label>
              </div>
              <Button
                disabled={busy}
                onClick={() => galleryInputRef.current?.click()}
              >
                <ImagePlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Uploading…' : 'Choose images'}
              </Button>
              <input
                ref={galleryInputRef}
                type="file"
                accept={ACCEPTED_IMAGES}
                multiple
                className="sr-only"
                aria-label="Gallery images"
                onChange={(event) => void uploadGallery(event.target.files)}
              />
            </div>
          </StudioPanel>
          <StudioPanel
            title="Profile gallery"
            description={`${images.length} images in gallery · ${galleryPublic ? 'public' : 'private'}`}
          >
            <ArtistGalleryPanel
              images={images}
              isOwner
              onChange={(next) => setImages(next as PressKitImageItem[])}
            />
          </StudioPanel>
        </>
      ) : null}

      {tab === 'press-kit' ? (
        <>
          <StudioPanel
            title="Press kit story"
            description="A concise introduction for promoters, venues, and journalists."
          >
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-foreground-secondary text-xs uppercase">
                Short bio
              </span>
              <textarea
                rows={5}
                value={pressKit?.bioShort ?? ''}
                onChange={(event) =>
                  setPressKit((current) =>
                    current
                      ? { ...current, bioShort: event.target.value }
                      : current,
                  )
                }
                className="border-border bg-background rounded-md border px-3 py-2"
              />
            </label>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {pressKit?.downloadPath ? (
                <a href={pressKit.downloadPath}>
                  <Button size="sm" variant="secondary">
                    <DownloadIcon size={14} aria-hidden className="mr-1.5" />
                    Download ZIP
                  </Button>
                </a>
              ) : null}
              <SaveButton
                disabled={!pressKit}
                label="Save bio"
                onClick={() => {
                  if (!pressKit) {
                    return;
                  }
                  void patchPressKitBio(pressKit.bioShort).then((result) => {
                    if (result.ok) {
                      setPressKit(result.data);
                      toast.success('Press kit bio saved.');
                    } else {
                      toast.error(result.error);
                    }
                  });
                }}
              />
            </div>
          </StudioPanel>
          <StudioPanel
            title="Press kit images"
            description={`${pressImages.length} of ${MAX_PRESS_KIT_SELECTED_IMAGES} press kit images · selecting another automatically drops the oldest selection`}
          >
            {images.length === 0 ? (
              <p className="text-foreground-secondary text-sm">
                Add images in the Gallery tab first.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <li
                    key={image.id}
                    className="border-border bg-background-secondary overflow-hidden rounded-lg border"
                  >
                    <img
                      src={image.imageUrl}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="flex flex-col gap-2 p-3">
                      <Input
                        aria-label={`Title for image ${image.position + 1}`}
                        value={image.title ?? ''}
                        placeholder="Photo title or credit"
                        onChange={(event) => {
                          const title = event.target.value;
                          setImages((current) =>
                            current.map((candidate) =>
                              candidate.id === image.id
                                ? { ...candidate, title }
                                : candidate,
                            ),
                          );
                        }}
                        onBlur={(event) =>
                          void updatePressKitImage(image.id, {
                            title: event.target.value.trim() || null,
                          })
                        }
                      />
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={image.includeInZip}
                            onChange={() => void togglePressKitImage(image)}
                          />
                          Include in press kit
                        </label>
                        <Button
                          size="icon-sm"
                          variant="text"
                          aria-label="Remove image from gallery"
                          title="Remove image"
                          onClick={() => void removeImage(image.id)}
                        >
                          <Trash2Icon size={14} aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </StudioPanel>
        </>
      ) : null}
      {avatarViewerOpen && avatarUrl ? (
        <ImageLightbox
          images={[{ imageUrl: avatarUrl }]}
          index={0}
          label={`${profile?.displayName ?? 'Artist'} profile picture`}
          onClose={() => setAvatarViewerOpen(false)}
        />
      ) : null}
    </div>
  );
};

export const StudioBrandingView: FC = () => {
  const profile = useAuthStore((state) => state.user);

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/branding" />
        <StudioPageHeader
          title="Artist branding"
          subtitle="Shape your visual identity, keep a public image gallery, and assemble a promoter-ready press kit."
          action={
            profile ? (
              <Link to="/u/$username" params={{ username: profile.username }}>
                <Button size="sm" variant="secondary">
                  <EyeIcon size={15} aria-hidden className="mr-1.5" />
                  View public profile
                </Button>
              </Link>
            ) : undefined
          }
        />
        <StudioBrandingPanel />
      </div>
    </StudioGate>
  );
};
