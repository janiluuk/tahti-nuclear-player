import type { TahtiPluginAPI } from './api';

export type PluginIcon = { type: 'link'; link: string };

export type PluginManifestConfig = {
  displayName?: string;
  // TODO: Remove category after registry migration to categories
  category?: string;
  categories?: string[];
  icon?: PluginIcon;
  permissions?: string[];
};

export type PluginManifest = {
  name: string;
  version: string;
  description: string;
  author: string;
  main?: string;
  /** Primary config key. */
  tahti?: PluginManifestConfig;
  /** @deprecated Use `tahti` instead. Still read for plugins published before the Tahti rebrand. */
  nuclear?: PluginManifestConfig;
};

export type TahtiPlugin = {
  onLoad?(api: TahtiPluginAPI): void | Promise<void>;
  onUnload?(api: TahtiPluginAPI): void | Promise<void>;
  onEnable?(api: TahtiPluginAPI): void | Promise<void>;
  onDisable?(api: TahtiPluginAPI): void | Promise<void>;
};

/** @deprecated Use `TahtiPlugin` instead. */
export type NuclearPlugin = TahtiPlugin;

export type PluginMetadata = {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: string;
  // TODO: Remove category after registry migration to categories
  category?: string;
  categories: string[];
  icon?: PluginIcon;
  permissions: string[];
};

export type LoadedPlugin = {
  metadata: PluginMetadata;
  instance: TahtiPlugin;
  path: string;
};
