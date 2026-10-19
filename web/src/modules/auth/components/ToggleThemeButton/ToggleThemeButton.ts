import { useMotion } from '@vueuse/motion';
import { useTheme } from '../../../shared/composables/useTheme';
import { ref } from 'vue';

export default {
  name: 'ToggleThemeButton',
  components: {},
  setup() {
    const { isDark, themeStore } = useTheme();
    const buttonRef = ref();
    const { apply } = useMotion(buttonRef, {
      initial: {
        scale: 0.8,
        opacity: 0,
      },
      enter: {
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', stiffness: 250, damping: 15 },
      },
      hover: { scale: 1.1, transition: { duration: 200 } },
      press: { scale: 0.95, transition: { duration: 100 } },
    });
    return {
      isDark,
      toggleTheme: themeStore.toggleTheme,
      apply,
    };
  },
};
