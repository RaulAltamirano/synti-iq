import { ref } from 'vue';
import { useTheme } from '../../shared/composables/useTheme';
import { useMotion } from '@vueuse/motion';

export default {
  name: 'CardHome',
  components: {},
  props: {
    icon: String,
    iconBg: String,
    title: String,
    description: String,
  },
  setup() {
    const isHovered = ref(false);
    const { isDark } = useTheme();
    const motionElement = ref(null);
    const iconElement = ref(null);
    const titleElement = ref(null);
    const descriptionElement = ref(null);
    const hoverElement = ref(null);

    // Configuración de animaciones con Vue Motion

    useMotion(motionElement, {
      initial: { opacity: 0, y: 20 },
      enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    });

    // Animación de flotación para el icono
    useMotion(iconElement, {
      animate: {
        y: isHovered.value ? -10 : 0,
        scale: isHovered.value ? 1.1 : 1,
        transition: { type: 'spring', stiffness: 300 },
      },
    });

    // Animación de gradiente para el título (usa isDark de useTheme, no props)
    useMotion(titleElement, {
      animate: {
        background: isHovered.value
          ? isDark.value
            ? 'linear-gradient(45deg, #60a5fa, #93c5fd)'
            : 'linear-gradient(45deg, #3b82f6, #2563eb)'
          : 'transparent',
        WebkitBackgroundClip: isHovered.value ? 'text' : 'initial',
        WebkitTextFillColor: isHovered.value ? 'transparent' : 'initial',
        transition: { duration: 0.3 },
      },
    });

    // Animación de opacidad para la descripción
    useMotion(descriptionElement, {
      animate: { opacity: isHovered.value ? 1 : 0.8 },
    });

    // Animación de opacidad para el efecto de hover
    useMotion(hoverElement, {
      animate: { opacity: isHovered.value ? 1 : 0, transition: { duration: 0.3 } },
    });

    const darkCardStyle = 'backdrop-blur-lg bg-gray-900/30 border border-gray-700/30 rounded-xl';
    const lightCardStyle =
      'bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-xl hover:shadow-2xl';
    return {
      isHovered,
      darkCardStyle,
      lightCardStyle,
      isDark,
      handleClick: () => {},
    };
  },
};
