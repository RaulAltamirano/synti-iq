import { defineComponent } from 'vue';
import { useForm, Field } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useAuth } from '../../composables/useAuth';
import { useTheme } from '@/modules/shared/composables/useTheme';
import SocialAuth from '../../components/SocialAuth/SocialAuth.vue';
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue';
import { Button, Input, Card } from '../../../ui/components';
import { registerCustomerSchema } from '@/modules/auth/schemas/auth-forms.schema';

const registerSchema = toTypedSchema(registerCustomerSchema);

export default defineComponent({
  name: 'Register',
  components: { SocialAuth, PasswordInput, AppButton: Button, AppInput: Input, Card, Field },
  setup() {
    const { isDark } = useTheme();
    const { register, isLoading } = useAuth();

    const { values, validate } = useForm({
      validationSchema: registerSchema,
      initialValues: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      },
    });

    const handleSignup = async () => {
      const { valid } = await validate();
      if (!valid) return;
      try {
        await register({
          email: values.email,
          password: values.password,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
        });
      } catch {
        /* Error handled by useAuth */
      }
    };

    return {
      isDark,
      handleSignup,
      isLoading,
    };
  },
});
