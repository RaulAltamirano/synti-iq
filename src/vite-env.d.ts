/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Dev only: where Vite proxies `/api` (default http://127.0.0.1:3000). */
  readonly VITE_DEV_API_PROXY_TARGET?: string;
}
