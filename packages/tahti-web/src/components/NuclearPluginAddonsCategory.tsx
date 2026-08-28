import { SettingsIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Dialog,
  Input,
  PluginStoreItem,
  Textarea,
} from '@nuclearplayer/ui';

import {
  NUCLEAR_PLUGIN_ADDONS,
  type NuclearPluginAddon,
} from '../content/nuclearPluginAddons';

const STORAGE_KEY = 'tahti-nuclear-plugin-addon-settings';
type ConfigMap = Record<string, Record<string, string>>;

function readConfig(): ConfigMap {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as ConfigMap) : {};
  } catch {
    return {};
  }
}

export function NuclearPluginAddonsCategory() {
  const [config, setConfig] = useState<ConfigMap>({});
  const [editing, setEditing] = useState<NuclearPluginAddon | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('All');

  useEffect(() => setConfig(readConfig()), []);

  const categories = useMemo(
    () => [
      'All',
      ...new Set(NUCLEAR_PLUGIN_ADDONS.map((addon) => addon.category)),
    ],
    [],
  );
  const addons = NUCLEAR_PLUGIN_ADDONS.filter(
    (addon) => filter === 'All' || addon.category === filter,
  );

  const openEditor = (addon: NuclearPluginAddon) => {
    setEditing(addon);
    setDraft(config[addon.id] ?? {});
  };

  const save = () => {
    if (!editing) {
      return;
    }
    const next = { ...config, [editing.id]: draft };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setConfig(next);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-wrap gap-1"
        role="tablist"
        aria-label="Nuclear add-on types"
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={filter === category}
            onClick={() => setFilter(category)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
              filter === category
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-secondary hover:bg-background-secondary'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      {addons.map((addon) => (
        <div key={addon.id} className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <PluginStoreItem
              name={addon.name}
              author="Nuclear registry"
              description={addon.description}
              isInstalled={addon.status === 'available'}
              onInstall={() => openEditor(addon)}
              labels={{
                install: addon.status === 'available' ? 'Configure' : 'Set up',
                installed: addon.statusLabel,
              }}
            />
          </div>
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={() => openEditor(addon)}
            aria-label={`Configure ${addon.name}`}
            title={`Configure ${addon.name}`}
          >
            <SettingsIcon size={15} aria-hidden />
          </Button>
        </div>
      ))}
      <p className="text-foreground-secondary text-xs">
        Settings are kept locally until the corresponding Tahti API contract is
        available. An add-on is not marked active unless its runtime behavior is
        already supported.
      </p>
      <Dialog.Root
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        className="max-w-lg"
      >
        {editing && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Dialog.Title>Configure {editing.name}</Dialog.Title>
            <Dialog.Description>{editing.note}</Dialog.Description>
            <p className="text-foreground-secondary mt-2 text-xs">
              API status: {editing.apiCounterpart.status}.{' '}
              {editing.apiCounterpart.routes.length > 0
                ? editing.apiCounterpart.routes.join(', ')
                : 'No Tahti API route yet.'}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {editing.fields.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  This plugin has no user parameters yet.
                </p>
              ) : (
                editing.fields.map((field) => {
                  const kind =
                    field.kind ?? (field.secret ? 'password' : 'text');
                  const value = draft[field.id] ?? '';
                  const onChange = (nextValue: string) =>
                    setDraft((current) => ({
                      ...current,
                      [field.id]: nextValue,
                    }));
                  if (kind === 'textarea') {
                    return (
                      <label
                        key={field.id}
                        className="flex flex-col gap-1 text-sm"
                      >
                        {field.label}
                        <Textarea
                          rows={4}
                          placeholder={field.placeholder}
                          value={value}
                          onChange={(event) => onChange(event.target.value)}
                        />
                      </label>
                    );
                  }
                  if (kind === 'select') {
                    return (
                      <label
                        key={field.id}
                        className="flex flex-col gap-1 text-sm"
                      >
                        {field.label}
                        <select
                          className="border-border bg-background-input rounded border px-3 py-2 text-sm"
                          value={value}
                          onChange={(event) => onChange(event.target.value)}
                        >
                          <option value="">Select…</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }
                  return (
                    <Input
                      key={field.id}
                      label={field.label}
                      variant={kind === 'password' ? 'password' : 'text'}
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(event) => onChange(event.target.value)}
                    />
                  );
                })
              )}
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button type="submit">Save configuration</Button>
            </Dialog.Actions>
          </form>
        )}
      </Dialog.Root>
    </div>
  );
}
