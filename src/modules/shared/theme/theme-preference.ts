/**
 * Framework-agnostic theme preference: storage, OS preference, DOM class `dark`.
 * Pinia (`ThemeStore`) and Vue composables should delegate here.
 *
 * Keep `index.html` inline boot script aligned with {@link readStoredPreference} / {@link resolveIsDark}.
 */

export type ThemePreference = 'light' | 'dark' | 'system';

/** App-owned key (do not use generic `theme` — extensions / old builds may collide). */
export const THEME_STORAGE_KEY = 'synti-iq-theme-preference';

export function readStoredPreference(storage: Storage = globalThis.localStorage): ThemePreference {
  const raw = storage.getItem(THEME_STORAGE_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw;
  }
  return 'system';
}

export function prefersColorSchemeDark(): boolean {
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveIsDark(preference: ThemePreference): boolean {
  return preference === 'system' ? prefersColorSchemeDark() : preference === 'dark';
}

function applyDomTheme(root: HTMLElement, isDark: boolean): void {
  const commit = () => {
    root.classList.toggle('dark', isDark);
    root.dataset.theme = isDark ? 'dark' : 'light';
    root.style.colorScheme = isDark ? 'dark' : 'light';
  };

  if ('startViewTransition' in document) {
    (document as Document & { startViewTransition: (cb: () => void) => void })
      .startViewTransition(commit);
  } else {
    commit();
  }
}

export interface ApplyThemeOptions {
  /** When false (e.g. Storybook toolbar), do not write `localStorage`. Default true. */
  persist?: boolean;
  storage?: Storage;
  /** Defaults to `document.documentElement`. */
  root?: HTMLElement;
}

/**
 * Applies resolved dark/light to the document and optionally persists the preference string.
 */
export function applyThemePreference(
  preference: ThemePreference,
  options?: ApplyThemeOptions,
): { isDark: boolean } {
  const persist = options?.persist !== false;
  const storage = options?.storage ?? globalThis.localStorage;
  const root = options?.root ?? document.documentElement;
  const isDark = resolveIsDark(preference);
  applyDomTheme(root, isDark);
  if (persist) {
    try {
      storage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* private mode / quota — DOM + resolved isDark still apply */
    }
  }
  return { isDark };
}

/**
 * Next stored preference after one toggle. When `preference === 'system'`, `systemIsDark`
 * must be the current OS dark/light (see {@link prefersColorSchemeDark}); it is ignored otherwise.
 */
export function togglePreference(
  preference: ThemePreference,
  systemIsDark: boolean,
): ThemePreference {
  if (preference === 'system') {
    return systemIsDark ? 'light' : 'dark';
  }
  return preference === 'dark' ? 'light' : 'dark';
}

export function subscribePrefersColorSchemeChange(listener: () => void): () => void {
  const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
}
