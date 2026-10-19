import { storeToRefs } from 'pinia';

import { useThemeStore } from '../store/ThemeStore';

/** Pinia theme store + `isDark` ref. Destructure: `const { isDark, themeStore } = useTheme()`. */
export const useTheme = () => {
  const themeStore = useThemeStore();
  const { isDark } = storeToRefs(themeStore);

  return {
    isDark,
    themeStore,
  };
};
