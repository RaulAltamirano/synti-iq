import { defineComponent, ref, computed } from 'vue';
import { useForm, Field } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useAuth } from '../../composables/useAuth';
import { RequiresTotpError } from '../../interfaces/auth.types';
import SocialAuth from '../../components/SocialAuth/SocialAuth.vue';
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue';
import TotpInput from '../../components/TotpInput/TotpInput.vue';
import { Button, Input, Card } from '../../../ui/components';
import { loginCredentialsSchema } from '@/modules/auth/schemas/auth-forms.schema';

const loginSchema = toTypedSchema(loginCredentialsSchema);

export default defineComponent({
  name: 'Login',
  components: { SocialAuth, PasswordInput, TotpInput, Button, Input, Card, Field },
  setup() {
    const { login, isLoading } = useAuth();
    const totpCode = ref('');
    const showTotpInput = ref(false);

    const { values, validate } = useForm({
      validationSchema: loginSchema,
      initialValues: {
        email: '',
        password: '',
      },
    });

    const TOTP_REGEX = /^\d{6}$/;
    const BACKUP_CODE_REGEX = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;
    const isTotpCodeValid = computed(() => {
      const code = totpCode.value.trim();
      return TOTP_REGEX.test(code) || BACKUP_CODE_REGEX.test(code);
    });

    const handleSubmit = async () => {
      if (showTotpInput.value) {
        if (!isTotpCodeValid.value) return;
        try {
          await login(values.email, values.password, totpCode.value.trim());
        } catch {
          /* Error handled by useAuth toast */
        }
        return;
      }

      const { valid } = await validate();
      if (!valid) return;
      try {
        await login(values.email, values.password);
      } catch (err) {
        if (err instanceof RequiresTotpError) {
          showTotpInput.value = true;
        }
      }
    };

    const handleBackFromTotp = () => {
      showTotpInput.value = false;
      totpCode.value = '';
    };

    return {
      values,
      totpCode,
      showTotpInput,
      isTotpCodeValid,
      handleSubmit,
      handleBackFromTotp,
      isLoading,
    };
  },
});
