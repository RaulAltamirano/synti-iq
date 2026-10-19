import { describe, it, expect, beforeEach } from 'vitest';

import {
  applyThemePreference,
  readStoredPreference,
  resolveIsDark,
  togglePreference,
  THEME_STORAGE_KEY,
} from '@/modules/shared/theme';

describe('theme-preference', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };
  });

  it('readStoredPreference returns system when empty', () => {
    expect(readStoredPreference(storage)).toBe('system');
  });

  it('readStoredPreference returns stored value', () => {
    storage.getItem = (key: string) => (key === THEME_STORAGE_KEY ? 'dark' : null);
    expect(readStoredPreference(storage)).toBe('dark');
  });

  it('resolveIsDark maps light and dark', () => {
    expect(resolveIsDark('light')).toBe(false);
    expect(resolveIsDark('dark')).toBe(true);
  });

  it('togglePreference alternates explicit light/dark', () => {
    expect(togglePreference('dark', false)).toBe('light');
    expect(togglePreference('light', false)).toBe('dark');
  });

  it('togglePreference from system picks opposite of resolved dark', () => {
    expect(togglePreference('system', true)).toBe('light');
    expect(togglePreference('system', false)).toBe('dark');
  });

  it('applyThemePreference sets class and persists', () => {
    const root = document.createElement('html');
    let savedKey = '';
    let savedVal = '';
    const mem: Storage = {
      ...storage,
      setItem(k: string, v: string) {
        savedKey = k;
        savedVal = v;
      },
    };

    const { isDark } = applyThemePreference('dark', { root, storage: mem, persist: true });
    expect(isDark).toBe(true);
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
    expect(savedKey).toBe(THEME_STORAGE_KEY);
    expect(savedVal).toBe('dark');
  });

  it('applyThemePreference persist false does not call setItem', () => {
    const root = document.createElement('html');
    let setCalls = 0;
    const mem: Storage = {
      ...storage,
      setItem() {
        setCalls += 1;
      },
    };
    applyThemePreference('light', { root, storage: mem, persist: false });
    expect(setCalls).toBe(0);
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.style.colorScheme).toBe('light');
  });
});
