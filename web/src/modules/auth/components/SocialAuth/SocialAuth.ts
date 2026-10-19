import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'SocialAuth',
  props: {
    disabled: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const showComingSoonTooltip = ref<'google' | 'github' | null>(null);

    const handleGoogleAuth = () => {
      if (props.disabled) {
        showComingSoonTooltip.value = 'google';
        setTimeout(() => {
          showComingSoonTooltip.value = null;
        }, 2000);
        return;
      }
    };

    const handleGithubAuth = () => {
      if (props.disabled) {
        showComingSoonTooltip.value = 'github';
        setTimeout(() => {
          showComingSoonTooltip.value = null;
        }, 2000);
        return;
      }
    };

    return {
      handleGoogleAuth,
      handleGithubAuth,
      showComingSoonTooltip,
    };
  },
});
