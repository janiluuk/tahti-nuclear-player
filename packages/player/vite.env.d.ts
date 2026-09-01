/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly MODE: string;
  readonly VITE_TAHTI_API_URL?: string;
  readonly VITE_FORCE_MOCK?: string;
  readonly VITE_ALLOW_MOCK_FALLBACK?: string;
  readonly VITE_ENABLE_DIAGNOSTICS?: string;
  readonly VITE_CENTRIFUGO_WS?: string;
  readonly VITE_HCAPTCHA_SITEKEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
