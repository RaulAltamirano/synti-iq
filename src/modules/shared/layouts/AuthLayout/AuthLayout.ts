import { defineComponent, ref } from 'vue';

import { useMotion } from '@vueuse/motion';
import ToggleThemeButton from '../../../auth/components/ToggleThemeButton/ToggleThemeButton.vue';
import AnimatedBackground from '../../components/Backgound/AnimatedBackground.vue';

export default defineComponent({
  name: 'AuthLayout',
  components: {
    ToggleThemeButton,
    AnimatedBackground,
  },
  setup() {
    const contentRef = ref(null);

    const contentMotion = useMotion(contentRef, {
      initial: { opacity: 0, y: 20 },
      enter: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 500,
          type: 'spring',
          stiffness: 100,
        },
      },
      leave: {
        opacity: 0,
        y: -20,
        transition: { duration: 300 },
      },
    });

    const layoutClasses = {
      'flex min-h-[100dvh] items-start justify-center p-4 pb-24': true,
      'sm:items-center sm:pb-4': true,
    };

    const handleBeforeEnter = () => {
      contentMotion.apply('enter');
    };

    const handleBeforeLeave = () => {
      contentMotion.apply('leave');
    };

    return {
      contentRef,
      layoutClasses,
      handleBeforeEnter,
      handleBeforeLeave,
    };
  },
});
