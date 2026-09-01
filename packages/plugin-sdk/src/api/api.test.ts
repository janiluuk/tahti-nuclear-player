import { TahtiPluginAPI } from './index.js';

describe('TahtiPluginAPI', () => {
  it('should create an instance', () => {
    const api = new TahtiPluginAPI();
    expect(api).toBeInstanceOf(TahtiPluginAPI);
  });
});
