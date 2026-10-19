import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { THEME_STORAGE_KEY } from '@/modules/shared/theme';
import { useThemeStore } from '@/modules/shared/store/ThemeStore';

function stubMatchMedia(matches = false): void {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  );
}

describe('useThemeStore', () => {
  beforeEach(() => {
    stubMatchMedia(false);
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.classList.remove('dark');
    setActivePinia(createPinia());
  });

  it('toggleTheme switches from light to dark and updates document', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const store = useThemeStore();
    store.init();
    expect(store.isDark).toBe(false);

    store.toggleTheme();
    expect(store.preference).toBe('dark');
    expect(store.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setPreference dark applies class without throwing', () => {
    const store = useThemeStore();
    store.init();
    store.setPreference('dark');
    expect(store.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
