/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAHTI_API_URL?: string;
  readonly VITE_TAHTI_API_PROXY_TARGET?: string;
  readonly VITE_FORCE_MOCK?: string;
  readonly VITE_MOCK_ADMIN?: string;
  /** `1` force / `0` forbid silent mock fallback; default = allow in DEV only */
  readonly VITE_ALLOW_MOCK_FALLBACK?: string;
  readonly VITE_ENABLE_DIAGNOSTICS?: string;
  readonly VITE_CENTRIFUGO_WS?: string;
  readonly VITE_HCAPTCHA_SITEKEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __COMMIT_HASH__: string;
declare const __BUILD_TIME__: string;
declare const __RELEASE_TAG_DATE__: string;
