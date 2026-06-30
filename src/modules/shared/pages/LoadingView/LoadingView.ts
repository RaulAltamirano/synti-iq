import { useTheme } from '../../composables/useTheme';

export default {
  name: 'LoadingView',
  components: {},
  setup() {
    const { isDark } = useTheme();

    return {
      isDark,
    };
  },
};
