import {
  EyeIcon,
  NewspaperIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  FilePicker,
  Input,
  Textarea,
  Toggle,
} from '@tahti-player/ui';

import {
  createArtistPost,
  createNewsletterDraft,
  deleteArtistPost,
  fetchArtistPosts,
  fetchNewsletterDrafts,
  sendNewsletterDraft,
  uploadArtistPostImage,
  type ArtistPost,
  type NewsletterDraft,
} from '../../api/studio-extras';
import { ImageLightbox } from '../../components/ImageLightbox';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

type Tab = 'posts' | 'newsletter';

function PostPreview({
  title,
  body,
  publishAt,
  images,
  onImageClick,
}: {
  title: string | null;
  body: string;
  publishAt?: string;
  images: string[];
  onImageClick?: (index: number) => void;
}) {
  return (
    <article className="flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-semibold">{title || 'Untitled'}</h3>
        {publishAt && (
          <p className="text-foreground-secondary mt-1 text-xs">
            {new Date(publishAt).toLocaleString()}
          </p>
        )}
      </div>
      <p className="text-sm whitespace-pre-wrap">{body}</p>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className="bg-background-secondary aspect-video overflow-hidden rounded-lg"
              onClick={() => onImageClick?.(index)}
              aria-label={`View image ${index + 1} full size`}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

export function StudioUpdatesView() {
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<ArtistPost[]>([]);
  const [drafts, setDrafts] = useState<NewsletterDraft[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [postOpen, setPostOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [postPreviewOpen, setPostPreviewOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<ArtistPost | null>(null);
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const [nlSubject, setNlSubject] = useState('');
  const [nlBody, setNlBody] = useState('');
  const [nlFansOnly, setNlFansOnly] = useState(false);
  const [busy, setBusy] = useState(false);

  const isEmpty = posts.length === 0 && drafts.length === 0;

  const reload = () => {
    void Promise.all([fetchArtistPosts(), fetchNewsletterDrafts()]).then(
      ([p, n]) => {
        setPosts(p.data);
        setDrafts(n.data);
      },
    );
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    return () => {
      if (postImagePreview) {
        URL.revokeObjectURL(postImagePreview);
      }
    };
  }, [postImagePreview]);

  const closePost = () => {
    setPostOpen(false);
    setPostTitle('');
    setPostBody('');
    setPostImage(null);
    setPostImagePreview(null);
    setPostPreviewOpen(false);
    setBusy(false);
  };

  const closeDraft = () => {
    setDraftOpen(false);
    setNlSubject('');
    setNlBody('');
    setNlFansOnly(false);
    setBusy(false);
  };

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/updates" />
        <StudioPageHeader
          title="Posts"
          subtitle="Post to your fans and send newsletter drafts."
          action={
            tab === 'posts' ? (
              <Button
                size="icon-sm"
                onClick={() => {
                  setMsg(null);
                  setPostOpen(true);
                }}
                aria-label="New post"
                title="New post"
              >
                <PlusIcon size={16} aria-hidden />
              </Button>
            ) : (
              <Button
                size="icon-sm"
                onClick={() => {
                  setMsg(null);
                  setDraftOpen(true);
                }}
                aria-label="New draft"
                title="New draft"
              >
                <PlusIcon size={16} aria-hidden />
              </Button>
            )
          }
        />

        <nav className="flex flex-wrap gap-2" role="tablist">
          {(
            [
              { id: 'posts' as const, label: 'Posts', icon: NewspaperIcon },
              {
                id: 'newsletter' as const,
                label: 'Newsletter',
                icon: SendIcon,
              },
            ] as const
          ).map((t) => (
            <Button
              key={t.id}
              type="button"
              variant="text"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              <t.icon size={14} aria-hidden />
              {t.label}
            </Button>
          ))}
        </nav>

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        {tab === 'posts' && (
          <StudioPanel>
            {posts.length === 0 ? (
              <div className="flex flex-col gap-3 py-4 text-center">
                <p className="text-foreground-secondary text-sm">
                  No posts yet.
                </p>
                {!isEmpty && (
                  <div>
                    <Button
                      size="icon-sm"
                      onClick={() => setPostOpen(true)}
                      aria-label="New post"
                      title="New post"
                    >
                      <PlusIcon size={16} aria-hidden />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {posts.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{p.title || 'Untitled'}</div>
                      <p className="text-foreground-secondary mt-1 line-clamp-3 whitespace-pre-wrap">
                        {p.body}
                      </p>
                      {p.images.length > 0 && (
                        <div className="mt-2 flex gap-2 overflow-hidden">
                          {p.images.map((image, index) => (
                            <button
                              key={`${image}-${index}`}
                              type="button"
                              className="bg-background-secondary size-16 shrink-0 overflow-hidden rounded-md"
                              onClick={() =>
                                setLightbox({ images: p.images, index })
                              }
                              aria-label={`View image ${index + 1} full size`}
                            >
                              <img
                                src={image}
                                alt=""
                                className="size-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-foreground-secondary mt-1 text-xs">
                        {new Date(p.publishAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => setPreviewPost(p)}
                      >
                        <EyeIcon size={15} aria-hidden className="mr-1.5" />
                        Preview
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="text"
                        aria-label="Delete post"
                        title="Delete"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Delete “${p.title || 'Untitled'}”? This cannot be undone.`,
                            )
                          ) {
                            return;
                          }
                          void deleteArtistPost(p.id).then((result) => {
                            if (!result.ok) {
                              setMsg(result.error);
                              toast.error(result.error);
                              return;
                            }
                            setPosts((current) =>
                              current.filter((post) => post.id !== p.id),
                            );
                            toast.success('Post deleted.');
                          });
                        }}
                      >
                        <Trash2Icon size={16} aria-hidden />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </StudioPanel>
        )}

        {tab === 'newsletter' && (
          <StudioPanel>
            {drafts.length === 0 ? (
              <div className="flex flex-col gap-3 py-4 text-center">
                <p className="text-foreground-secondary text-sm">
                  No drafts yet.
                </p>
                {!isEmpty && (
                  <div>
                    <Button
                      size="icon-sm"
                      onClick={() => setDraftOpen(true)}
                      aria-label="New draft"
                      title="New draft"
                    >
                      <PlusIcon size={16} aria-hidden />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {drafts.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{d.subject}</div>
                      {d.bodyMd && (
                        <p className="text-foreground-secondary mt-1 whitespace-pre-wrap">
                          {d.bodyMd}
                        </p>
                      )}
                      <p className="text-foreground-secondary mt-1 text-xs">
                        {d.subscribersOnly ? 'Fans only' : 'All subscribers'}
                        {d.state ? `, ${d.state}` : ''}
                        {d.sentAt
                          ? `, sent ${new Date(d.sentAt).toLocaleString()}`
                          : ', draft'}
                      </p>
                    </div>
                    {(!d.state || d.state === 'DRAFT') && !d.sentAt && (
                      <Button
                        size="sm"
                        onClick={() => {
                          void sendNewsletterDraft(
                            d.id,
                            d.subscribersOnly ? 'fans' : 'all',
                          ).then((r) => {
                            if (!r.ok) {
                              setMsg(r.error);
                            } else {
                              setMsg(
                                r.queued != null
                                  ? `Queued send to ${r.queued} subscribers.`
                                  : 'Send queued.',
                              );
                              reload();
                            }
                          });
                        }}
                      >
                        <SendIcon size={16} aria-hidden className="mr-1.5" />
                        Send
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </StudioPanel>
        )}

        <Dialog.Root isOpen={postOpen} onClose={closePost}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!postBody.trim() || busy) {
                return;
              }
              setBusy(true);
              void createArtistPost({
                title: postTitle.trim() || undefined,
                body: postBody.trim(),
              }).then(async (r) => {
                if (!r.ok) {
                  setBusy(false);
                  setMsg(r.error);
                  return;
                }
                if (postImage) {
                  const imageResult = await uploadArtistPostImage(
                    r.data.id,
                    postImage,
                  );
                  if (!imageResult.ok) {
                    setBusy(false);
                    setMsg(
                      `Post published, but image upload failed: ${imageResult.error}`,
                    );
                    closePost();
                    reload();
                    return;
                  }
                }
                setBusy(false);
                setMsg('Post published.');
                closePost();
                reload();
              });
            }}
          >
            <Dialog.Title>
              <span className="inline-flex items-center gap-2">
                <NewspaperIcon size={18} aria-hidden />
                New post
              </span>
            </Dialog.Title>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Title (optional)"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                autoFocus
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Body
                </span>
                <Textarea
                  tone="secondary"
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  rows={4}
                  required
                />
              </label>
              <FilePicker
                accept="image/jpeg,image/png,image/webp"
                labels={{
                  title: 'Post image',
                  description: 'JPEG, PNG, or WebP. One image per post.',
                  browse: postImage ? 'Choose another image' : 'Choose image',
                }}
                selectedFiles={postImage ? [postImage] : []}
                onFiles={(files) => {
                  const file = files[0] ?? null;
                  setPostImage(file);
                  setPostImagePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button
                type="button"
                variant="secondary"
                disabled={!postBody.trim()}
                onClick={() => setPostPreviewOpen(true)}
              >
                <EyeIcon size={16} aria-hidden className="mr-1.5" />
                Preview
              </Button>
              <Button type="submit" disabled={!postBody.trim() || busy}>
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Publishing…' : 'Publish'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>

        <Dialog.Root
          isOpen={postPreviewOpen}
          onClose={() => setPostPreviewOpen(false)}
        >
          <Dialog.Title>Post preview</Dialog.Title>
          <div className="mt-4">
            <PostPreview
              title={postTitle.trim() || null}
              body={postBody}
              images={postImagePreview ? [postImagePreview] : []}
              onImageClick={() => {
                if (postImagePreview) {
                  setLightbox({ images: [postImagePreview], index: 0 });
                }
              }}
            />
          </div>
          <Dialog.Actions>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Root>

        <Dialog.Root
          isOpen={previewPost !== null}
          onClose={() => setPreviewPost(null)}
        >
          <Dialog.Title>Post preview</Dialog.Title>
          {previewPost && (
            <div className="mt-4">
              <PostPreview
                title={previewPost.title}
                body={previewPost.body}
                publishAt={previewPost.publishAt}
                images={previewPost.images}
                onImageClick={(index) =>
                  setLightbox({ images: previewPost.images, index })
                }
              />
            </div>
          )}
          <Dialog.Actions>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Root>

        {lightbox && (
          <ImageLightbox
            images={lightbox.images.map((image) => ({ imageUrl: image }))}
            index={lightbox.index}
            label="Post image viewer"
            onIndexChange={(index) => setLightbox({ ...lightbox, index })}
            onClose={() => setLightbox(null)}
          />
        )}

        <Dialog.Root isOpen={draftOpen} onClose={closeDraft}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!nlSubject.trim() || !nlBody.trim() || busy) {
                return;
              }
              setBusy(true);
              void createNewsletterDraft({
                subject: nlSubject.trim(),
                bodyMd: nlBody.trim(),
                subscribersOnly: nlFansOnly,
              }).then((r) => {
                setBusy(false);
                if (!r.ok) {
                  setMsg(r.error);
                  return;
                }
                setMsg('Draft saved.');
                closeDraft();
                reload();
              });
            }}
          >
            <Dialog.Title>
              <span className="inline-flex items-center gap-2">
                <SendIcon size={18} aria-hidden />
                New draft
              </span>
            </Dialog.Title>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Subject"
                value={nlSubject}
                onChange={(e) => setNlSubject(e.target.value)}
                autoFocus
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Body (markdown)
                </span>
                <Textarea
                  tone="secondary"
                  value={nlBody}
                  onChange={(e) => setNlBody(e.target.value)}
                  rows={5}
                  required
                />
              </label>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>Fans / subscribers only</span>
                <Toggle
                  label="Fans / subscribers only"
                  checked={nlFansOnly}
                  onChange={setNlFansOnly}
                />
              </div>
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button
                type="submit"
                disabled={!nlSubject.trim() || !nlBody.trim() || busy}
              >
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Saving…' : 'Save draft'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>
      </div>
    </StudioGate>
  );
}
