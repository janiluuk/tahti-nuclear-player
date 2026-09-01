import type { TahtiPlugin } from '@tahti-player/plugin-sdk';

export class TahtiPluginBuilder {
  private plugin: TahtiPlugin = {};

  withOnLoad(onLoad: TahtiPlugin['onLoad']): TahtiPluginBuilder {
    this.plugin.onLoad = onLoad;
    return this;
  }

  withOnEnable(onEnable: TahtiPlugin['onEnable']): TahtiPluginBuilder {
    this.plugin.onEnable = onEnable;
    return this;
  }

  withOnDisable(onDisable: TahtiPlugin['onDisable']): TahtiPluginBuilder {
    this.plugin.onDisable = onDisable;
    return this;
  }

  withOnUnload(onUnload: TahtiPlugin['onUnload']): TahtiPluginBuilder {
    this.plugin.onUnload = onUnload;
    return this;
  }

  build(): TahtiPlugin {
    return { ...this.plugin };
  }
}
