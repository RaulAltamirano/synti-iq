import { defineComponent, ref, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useMotion } from '@vueuse/motion';
import { Button } from '../../../ui/components';

interface TitleCardAction {
  icon: string;
  click: () => void;
  label?: string;
}

export default defineComponent({
  name: 'TitleCard',
  components: {
    FontAwesomeIcon,
    AppButton: Button,
  },
  props: {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    actions: {
      type: Array as PropType<TitleCardAction[]>,
      default: () => [],
    },
    showBackButton: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const router = useRouter();
    const motionElement = ref<HTMLElement | null>(null);

    useMotion(motionElement, {
      initial: { y: -20, opacity: 0 },
      enter: {
        y: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 100,
          damping: 15,
        },
      },
    });

    const goBack = () => {
      router.go(-1);
    };

    return {
      router,
      motionElement,
      goBack,
    };
  },
});
