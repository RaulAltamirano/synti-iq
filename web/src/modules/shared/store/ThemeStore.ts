import { defineStore } from 'pinia';

import {
  type ThemePreference,
  applyThemePreference,
  prefersColorSchemeDark,
  readStoredPreference,
  subscribePrefersColorSchemeChange,
  togglePreference,
} from '@/modules/shared/theme';

interface ThemeState {
  preference: ThemePreference;
  isDark: boolean;
}

/** Ensures a single OS theme listener across HMR / repeated init calls. */
let systemPreferenceListenerAttached = false;

/**
 * Options-style store so `isDark` / `preference` stay plain reactive state (reliable in all views).
 * Core logic lives in `@/modules/shared/theme` (Vue-agnostic).
 */
export const useThemeStore = defineStore('themePreference', {
  state: (): ThemeState => {
    const preference = readStoredPreference();
    const { isDark } = applyThemePreference(preference, { persist: true });
    return { preference, isDark };
  },
  getters: {
    currentTheme: (state): 'dark' | 'light' => (state.isDark ? 'dark' : 'light'),
  },
  actions: {
    /** Call once after `app.use(pinia)` (see `main.ts` and Storybook `preview.ts`). */
    init(): void {
      if (systemPreferenceListenerAttached) {
        return;
      }
      systemPreferenceListenerAttached = true;
      subscribePrefersColorSchemeChange(() => {
        if (this.preference === 'system') {
          this.syncFromPreference(true);
        }
      });
    },
    syncFromPreference(persistToStorage = true): void {
      const { isDark } = applyThemePreference(this.preference, {
        persist: persistToStorage,
      });
      this.isDark = isDark;
    },
    toggleTheme(): void {
      const systemIsDark =
        this.preference === 'system' ? prefersColorSchemeDark() : false;
      this.preference = togglePreference(this.preference, systemIsDark);
      this.syncFromPreference();
    },
    /**
     * Sets the user's theme preference and applies it to `document.documentElement` and `isDark`.
     * Use from Storybook with `{ persist: false }` so the toolbar does not overwrite app localStorage.
     */
    setPreference(next: ThemePreference, options?: { persist?: boolean }): void {
      this.preference = next;
      this.syncFromPreference(options?.persist !== false);
    },
  },
});
