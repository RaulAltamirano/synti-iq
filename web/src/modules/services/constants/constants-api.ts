/**
 * API base URL for axios.
 * - Dev: default `/api` so requests stay on the same host as the Vite dev server (e.g. 192.168.x.x:5173);
 *   Vite proxies `/api` → backend (see vite.config.ts, VITE_DEV_API_PROXY_TARGET).
 * - Override any time with VITE_API_BASE_URL (e.g. production or direct LAN URL without proxy).
 */
const resolvedBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const devDefaultRelative = '/api';
const prodFallback = 'http://localhost:3000/api';

export const API_CONSTANTS = {
  BASE_URL: resolvedBaseUrl || (import.meta.env.DEV ? devDefaultRelative : prodFallback),
  TIMEOUT: 30000,
} as const;

export const AUTH_CONSTANTS = {
  SESSION_TIMEOUT: 30 * 60 * 1000,
};
