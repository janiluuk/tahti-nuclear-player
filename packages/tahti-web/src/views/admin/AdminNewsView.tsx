import {
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog, Input, SaveButton } from '@nuclearplayer/ui';

import {
  createNewsPost,
  deleteNewsPost,
  fetchAdminNews,
  updateNewsPost,
  type AdminNewsPost,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function AdminNewsView() {
  const [posts, setPosts] = useState<AdminNewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHeadline, setEditHeadline] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editLinkLabel, setEditLinkLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void fetchAdminNews().then((res) => {
      setPosts(res.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const closeCompose = () => {
    setComposeOpen(false);
    setHeadline('');
    setSummary('');
    setImageUrl('');
    setLinkUrl('');
    setLinkLabel('');
    setBusy(false);
  };

  const startEdit = (post: AdminNewsPost) => {
    setEditingId(post.id);
    setEditHeadline(post.headline);
    setEditSummary(post.summary);
    setEditImageUrl(post.imageUrl ?? '');
    setEditLinkUrl(post.linkUrl ?? '');
    setEditLinkLabel(post.linkLabel ?? '');
  };

  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/news" />
        <StudioPageHeader
          title="News"
          subtitle="Posts published to the platform news feed."
          action={
            <Button
              size="icon-sm"
              onClick={() => setComposeOpen(true)}
              aria-label="Write post"
              title="Write post"
            >
              <PlusIcon size={16} aria-hidden />
            </Button>
          }
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel>
          {loading ? (
            <PageLoading label="Loading news…" />
          ) : posts.length === 0 ? (
            <div className="flex flex-col gap-3 py-4 text-center">
              <p className="text-foreground-secondary text-sm">
                No news posts yet.
              </p>
              <div>
                <Button
                  size="icon-sm"
                  onClick={() => setComposeOpen(true)}
                  aria-label="Write post"
                  title="Write post"
                >
                  <PlusIcon size={16} aria-hidden />
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {posts.map((post) =>
                editingId === post.id ? (
                  <li key={post.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-3">
                      <Input
                        label="Headline"
                        value={editHeadline}
                        onChange={(e) => setEditHeadline(e.target.value)}
                      />
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-foreground-secondary text-xs uppercase">
                          Summary
                        </span>
                        <textarea
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          rows={3}
                          className="border-border bg-background rounded-md border px-3 py-2"
                        />
                      </label>
                      <Input
                        label="Image URL"
                        value={editImageUrl}
                        onChange={(event) =>
                          setEditImageUrl(event.target.value)
                        }
                        placeholder="https://…"
                      />
                      <Input
                        label="Link URL"
                        value={editLinkUrl}
                        onChange={(event) => setEditLinkUrl(event.target.value)}
                        placeholder="https://…"
                      />
                      <Input
                        label="Link label"
                        value={editLinkLabel}
                        onChange={(event) =>
                          setEditLinkLabel(event.target.value)
                        }
                        placeholder="Read more"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="text"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <SaveButton
                          saving={busy}
                          onClick={() => {
                            setBusy(true);
                            void updateNewsPost(post.id, {
                              headline: editHeadline.trim(),
                              summary: editSummary.trim(),
                              imageUrl: editImageUrl.trim() || null,
                              linkUrl: editLinkUrl.trim() || null,
                              linkLabel: editLinkLabel.trim() || null,
                            }).then((r) => {
                              setBusy(false);
                              if (!r.ok) {
                                setMsg(r.error);
                                return;
                              }
                              setEditingId(null);
                              reload();
                            });
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ) : (
                  <li
                    key={post.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        {post.imageUrl ? (
                          <ImageIcon
                            size={14}
                            aria-label="Includes image"
                            className="text-primary"
                          />
                        ) : null}
                        {post.linkUrl ? (
                          <ExternalLinkIcon
                            size={14}
                            aria-label="Includes link"
                            className="text-primary"
                          />
                        ) : null}
                        {post.headline}
                      </div>
                      <p className="text-foreground-secondary text-xs">
                        By {post.authorName} ·{' '}
                        {post.publishedAt
                          ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                          : 'Draft'}
                      </p>
                      <p className="mt-1 text-sm">{post.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => startEdit(post)}
                      >
                        <PencilIcon size={14} aria-hidden className="mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          void updateNewsPost(post.id, {
                            publish: !post.publishedAt,
                          }).then((r) => {
                            if (!r.ok) {
                              setMsg(r.error);
                            } else {
                              reload();
                            }
                          });
                        }}
                      >
                        {post.publishedAt ? (
                          <EyeOffIcon
                            size={14}
                            aria-hidden
                            className="mr-1.5"
                          />
                        ) : (
                          <EyeIcon size={14} aria-hidden className="mr-1.5" />
                        )}
                        {post.publishedAt ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Delete "${post.headline}"? This can't be undone.`,
                            )
                          ) {
                            return;
                          }
                          void deleteNewsPost(post.id).then((r) => {
                            if (!r.ok) {
                              setMsg(r.error);
                            } else {
                              reload();
                            }
                          });
                        }}
                      >
                        <Trash2Icon size={14} aria-hidden className="mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </StudioPanel>

        <Dialog.Root isOpen={composeOpen} onClose={closeCompose}>
          <Dialog.Title>Write a news post</Dialog.Title>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              autoFocus
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground-secondary text-xs uppercase">
                Short summary
              </span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="border-border bg-background rounded-md border px-3 py-2"
              />
            </label>
            <Input
              label="Image URL"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://…"
            />
            <Input
              label="Link URL"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://…"
            />
            <Input
              label="Link label"
              value={linkLabel}
              onChange={(event) => setLinkLabel(event.target.value)}
              placeholder="Read more"
            />
          </div>
          <Dialog.Actions>
            <Dialog.Close>Cancel</Dialog.Close>
            <Button
              variant="secondary"
              disabled={busy || !headline.trim() || !summary.trim()}
              onClick={() => {
                setBusy(true);
                void createNewsPost({
                  headline: headline.trim(),
                  summary: summary.trim(),
                  imageUrl: imageUrl.trim() || undefined,
                  linkUrl: linkUrl.trim() || undefined,
                  linkLabel: linkLabel.trim() || undefined,
                  publish: false,
                }).then((r) => {
                  setBusy(false);
                  if (!r.ok) {
                    setMsg(r.error);
                    return;
                  }
                  closeCompose();
                  reload();
                });
              }}
            >
              Save as draft
            </Button>
            <Button
              disabled={busy || !headline.trim() || !summary.trim()}
              onClick={() => {
                setBusy(true);
                void createNewsPost({
                  headline: headline.trim(),
                  summary: summary.trim(),
                  imageUrl: imageUrl.trim() || undefined,
                  linkUrl: linkUrl.trim() || undefined,
                  linkLabel: linkLabel.trim() || undefined,
                  publish: true,
                }).then((r) => {
                  setBusy(false);
                  if (!r.ok) {
                    setMsg(r.error);
                    return;
                  }
                  closeCompose();
                  reload();
                });
              }}
            >
              {busy ? 'Publishing…' : 'Publish'}
            </Button>
          </Dialog.Actions>
        </Dialog.Root>
      </div>
    </AdminGate>
  );
}
