import { Link } from '@tanstack/react-router';
import { ArrowRightIcon, SettingsIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Dialog,
  Input,
  PluginStoreItem,
  Select,
  Textarea,
} from '@nuclearplayer/ui';

import {
  NUCLEAR_PLUGIN_ADDONS,
  type NuclearPluginAddon,
} from '../content/nuclearPluginAddons';
import { useSettingsModalStore } from '../stores/settingsModalStore';

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
  const [installTab, setInstallTab] = useState<'installed' | 'available'>(
    'installed',
  );

  useEffect(() => setConfig(readConfig()), []);

  const isConfigured = (addon: NuclearPluginAddon) =>
    addon.status === 'available' ||
    Object.values(config[addon.id] ?? {}).some((value) => value.trim());

  const categories = useMemo(
    () => [
      'All',
      ...new Set(NUCLEAR_PLUGIN_ADDONS.map((addon) => addon.category)),
    ],
    [],
  );
  const categoryFiltered = NUCLEAR_PLUGIN_ADDONS.filter(
    (addon) => filter === 'All' || addon.category === filter,
  );
  const installedCount = categoryFiltered.filter(isConfigured).length;
  const availableCount = categoryFiltered.length - installedCount;
  const addons = categoryFiltered.filter((addon) =>
    installTab === 'installed' ? isConfigured(addon) : !isConfigured(addon),
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
        className="flex gap-1"
        role="tablist"
        aria-label="Installed or available"
      >
        <button
          type="button"
          role="tab"
          aria-selected={installTab === 'installed'}
          onClick={() => setInstallTab('installed')}
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
            installTab === 'installed'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground-secondary hover:bg-background-secondary'
          }`}
        >
          Installed ({installedCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={installTab === 'available'}
          onClick={() => setInstallTab('available')}
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
            installTab === 'available'
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground-secondary hover:bg-background-secondary'
          }`}
        >
          Available ({availableCount})
        </button>
      </div>
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
      {addons.length === 0 && (
        <p className="text-foreground-secondary text-sm">
          {installTab === 'installed'
            ? 'Nothing configured yet in this category — check Available.'
            : 'Everything in this category is already configured.'}
        </p>
      )}
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
            {editing.realFeature &&
              (editing.realFeature.kind === 'route' ? (
                <Link
                  to={editing.realFeature.to}
                  onClick={() => {
                    useSettingsModalStore.getState().close();
                    setEditing(null);
                  }}
                  className="border-primary bg-primary/10 text-primary mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:underline"
                >
                  {editing.realFeature.label}
                  <ArrowRightIcon size={14} aria-hidden />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const category = editing.realFeature!;
                    if (category.kind === 'plugin-category') {
                      useSettingsModalStore
                        .getState()
                        .open('plugin-store', category.category);
                    }
                    setEditing(null);
                  }}
                  className="border-primary bg-primary/10 text-primary mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm font-medium hover:underline"
                >
                  {editing.realFeature.label}
                  <ArrowRightIcon size={14} aria-hidden />
                </button>
              ))}
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
                        {field.description && (
                          <span className="text-foreground-secondary text-xs">
                            {field.description}
                          </span>
                        )}
                      </label>
                    );
                  }
                  if (kind === 'select') {
                    return (
                      <Select
                        key={field.id}
                        label={field.label}
                        placeholder={field.placeholder}
                        options={[
                          { id: '', label: 'Select…' },
                          ...(field.options ?? []).map((option) => ({
                            id: option.value,
                            label: option.label,
                          })),
                        ]}
                        value={value}
                        onValueChange={onChange}
                        description={field.description}
                      />
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
                      description={field.description}
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
