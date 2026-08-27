import { PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, FilePicker } from '@nuclearplayer/ui';

import {
  deleteAnnouncementClip,
  fetchAdminAnnouncements,
  patchAnnouncementClip,
  setAnnouncementsSystemEnabled,
  uploadAnnouncementClip,
  type AdminAnnouncementClip,
  type AdminAnnouncementScheduleMode,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { PageLoading } from '../../components/PageStates';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { usePlayerStore } from '../../stores/playerStore';

function fmtDuration(sec: number | null): string {
  if (sec == null) {
    return '—';
  }
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AdminAnnouncementsView() {
  const play = usePlayerStore((s) => s.play);
  const [clips, setClips] = useState<AdminAnnouncementClip[]>([]);
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void fetchAdminAnnouncements().then((res) => {
      setClips(res.data.clips);
      setSystemEnabled(res.data.systemEnabled);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const patch = (
    id: string,
    p: Partial<
      Pick<AdminAnnouncementClip, 'isEnabled' | 'scheduleMode' | 'everyNth'>
    >,
  ) => {
    void patchAnnouncementClip(id, p).then((r) => {
      if (!r.ok) {
        setMsg(r.error);
      } else {
        reload();
      }
    });
  };

  return (
    <AdminGate>
      <div className="admin-page-layout mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/announcements" />
        <StudioPageHeader
          title="Announcements"
          subtitle="Short audio clips interleaved into every channel's rotation."
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel
          title="System announcements"
          action={
            <Button
              size="sm"
              variant={systemEnabled ? 'secondary' : 'default'}
              onClick={() => {
                void setAnnouncementsSystemEnabled(!systemEnabled).then((r) => {
                  if (!r.ok) {
                    setMsg(r.error);
                  } else {
                    setSystemEnabled(!systemEnabled);
                  }
                });
              }}
            >
              {systemEnabled ? 'On — disable' : 'Off — enable'}
            </Button>
          }
        >
          <p className="text-foreground-secondary text-sm">
            Turning this off stops all system announcements everywhere,
            instantly — each clip below still keeps its own on/off and schedule.
          </p>
        </StudioPanel>

        <StudioPanel title="Clips">
          <FilePicker
            accept="audio/*"
            disabled={uploading}
            labels={{
              title: uploading
                ? 'Uploading announcement…'
                : 'Announcement clip',
              description: 'Choose a short MP3, WAV, FLAC, or AIFF clip.',
              browse: uploading ? 'Uploading…' : 'Choose audio',
            }}
            onFiles={(files) => {
              const file = files[0];
              if (!file) {
                return;
              }
              setUploading(true);
              void uploadAnnouncementClip(file).then((result) => {
                setUploading(false);
                if (!result.ok) {
                  setMsg(result.error);
                } else {
                  reload();
                }
              });
            }}
          />
          {loading ? (
            <PageLoading label="Loading announcements…" />
          ) : clips.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No system announcement clips yet.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {clips.map((clip) => (
                <li
                  key={clip.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={clip.isEnabled}
                      onChange={() =>
                        patch(clip.id, { isEnabled: !clip.isEnabled })
                      }
                    />
                    <div>
                      <div className="font-medium">{clip.title}</div>
                      <div className="text-foreground-secondary text-xs">
                        {fmtDuration(clip.durationSec)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={clip.scheduleMode}
                      onChange={(e) => {
                        const scheduleMode = e.target
                          .value as AdminAnnouncementScheduleMode;
                        patch(clip.id, {
                          scheduleMode,
                          everyNth:
                            scheduleMode === 'EVERY_NTH'
                              ? (clip.everyNth ?? 4)
                              : null,
                        });
                      }}
                      className="border-border bg-background rounded-md border px-2 py-1 text-xs"
                    >
                      <option value="AFTER_EVERY">After every clip</option>
                      <option value="EVERY_NTH">Every Nth clip</option>
                      <option value="RANDOM">Randomly</option>
                    </select>
                    {clip.scheduleMode === 'EVERY_NTH' && (
                      <input
                        type="number"
                        min={2}
                        max={100}
                        value={clip.everyNth ?? 4}
                        onChange={(e) =>
                          patch(clip.id, { everyNth: Number(e.target.value) })
                        }
                        className="border-border bg-background w-16 rounded-md border px-2 py-1 text-xs"
                      />
                    )}
                    {clip.audioUrl && (
                      <Button
                        size="icon-sm"
                        variant="text"
                        aria-label="Preview"
                        title="Preview"
                        onClick={() => {
                          play({
                            id: `announcement:${clip.id}`,
                            kind: 'archive',
                            title: clip.title,
                            artist: 'System announcement',
                            streamUrl: clip.audioUrl!,
                            protocol: 'https',
                          });
                        }}
                      >
                        <PlayIcon size={16} aria-hidden />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() => {
                        void deleteAnnouncementClip(clip.id).then((r) => {
                          if (!r.ok) {
                            setMsg(r.error);
                          } else {
                            reload();
                          }
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
