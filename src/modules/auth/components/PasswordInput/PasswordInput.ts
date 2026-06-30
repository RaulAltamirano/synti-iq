import { computed, defineComponent, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useMotion } from '@vueuse/motion';

export default defineComponent({
  name: 'PasswordInput',
  components: {
    FontAwesomeIcon,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    showStrength: {
      type: Boolean,
      default: true,
    },
    /** For login use default `current-password`; for sign-up / reset use `new-password`. */
    autocomplete: {
      type: String,
      default: 'current-password',
    },
    name: {
      type: String,
      default: 'password',
    },
  },
  emits: ['update:modelValue', 'blur'],
  setup(props, { emit }) {
    const showPassword = ref(false);
    const inputRef = ref<HTMLInputElement | null>(null);
    const isInputFocused = ref(false);
    const localValue = ref(props.modelValue || '');

    watch(
      () => props.modelValue,
      (v) => {
        localValue.value = v ?? '';
      }
    );

    const { target: inputTarget } = useMotion(inputRef, {
      initial: { scale: 1, borderWidth: '1px' },
      hover: { scale: 1.002 },
      focused: {
        scale: 1.004,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 15,
        },
      },
    });

    const strengthScore = computed(() => {
      const password = localValue.value;
      let score = 0;

      if (password.length >= 12) score += 2;
      else if (password.length >= 8) score++;

      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      const varietyCount =
        (/[A-Z]/.test(password) ? 1 : 0) +
        (/[a-z]/.test(password) ? 1 : 0) +
        (/[0-9]/.test(password) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
      if (varietyCount >= 3) score++;

      return Math.min(score, 5);
    });

    const strengthConfig = computed(() => {
      const configs = {
        0: {
          level: 'weak',
          text: 'Very Weak',
          color: 'bg-red-500',
          icon: 'xmark',
          gradient: 'from-red-500 to-red-600',
        },
        1: {
          level: 'weak',
          text: 'Weak',
          color: 'bg-red-500',
          icon: 'xmark',
          gradient: 'from-red-400 to-red-500',
        },
        2: {
          level: 'fair',
          text: 'Fair',
          color: 'bg-yellow-500',
          icon: 'triangle-exclamation',
          gradient: 'from-yellow-400 to-yellow-500',
        },
        3: {
          level: 'good',
          text: 'Good',
          color: 'bg-green-500',
          icon: 'check',
          gradient: 'from-green-400 to-green-500',
        },
        4: {
          level: 'strong',
          text: 'Strong',
          color: 'bg-emerald-600',
          icon: 'shield-halved',
          gradient: 'from-emerald-400 to-emerald-600',
        },
        5: {
          level: 'strong',
          text: 'Very Strong',
          color: 'bg-emerald-600',
          icon: 'shield-halved',
          gradient: 'from-emerald-500 to-emerald-700',
        },
      };
      return configs[strengthScore.value];
    });

    const strengthPercentage = computed(() => (strengthScore.value / 5) * 100);

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      localValue.value = value;
      emit('update:modelValue', value);
    };

    const handleFocus = () => {
      isInputFocused.value = true;
    };

    const handleBlur = () => {
      isInputFocused.value = false;
    };

    const handleInputBlur = (event: FocusEvent) => {
      handleBlur();
      emit('blur', event);
    };

    return {
      showPassword,
      strengthPercentage,
      strengthConfig,
      inputTarget,
      localValue,
      isInputFocused,
      strengthScore,
      handleInput,
      handleFocus,
      handleBlur,
      handleInputBlur,
    };
  },
});
