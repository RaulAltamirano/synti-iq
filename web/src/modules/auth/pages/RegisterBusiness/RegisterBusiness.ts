import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useForm, Field } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { useTheme } from '@/modules/shared/composables/useTheme';
import SocialAuth from '../../components/SocialAuth/SocialAuth.vue';
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue';
import { useAdminRegister } from '../../composables/useAdminRegister';
import { Button, Input, Card, InfoBanner } from '../../../ui/components';
import { registerBusinessSchema } from '@/modules/auth/schemas/auth-forms.schema';

const businessFormSchema = toTypedSchema(registerBusinessSchema);

export default defineComponent({
  name: 'RegisterBusiness',
  components: {
    SocialAuth,
    FontAwesomeIcon,
    PasswordInput,
    AppButton: Button,
    AppInput: Input,
    Card,
    InfoBanner,
    Field,
  },
  setup() {
    const { isDark } = useTheme();
    const {
      isLoading,
      isValidatingCode,
      referrerInfo,
      codeValidationError,
      hasValidReferral,
      extractReferralFromUrl,
      validateReferralCode,
      registerAdmin,
      clearReferralValidation,
    } = useAdminRegister();

    const { values, validate } = useForm({
      validationSchema: businessFormSchema,
      initialValues: {
        firstName: '',
        lastName: '',
        businessName: '',
        email: '',
        password: '',
      },
    });

    const localReferralCode = ref('');

    const showReferralField = ref(false);
    const hasAttemptedValidation = ref(false);

    const referrerDisplayName = computed(() => {
      return referrerInfo.value?.referrerName || 'Unknown';
    });

    const benefitsDescription = computed(() => {
      return referrerInfo.value?.benefits?.description || '';
    });

    const canSubmit = computed(() => {
      const v = values;
      return (
        v.email.trim() !== '' &&
        v.firstName.trim() !== '' &&
        v.lastName.trim() !== '' &&
        v.businessName.trim() !== '' &&
        v.password.trim() !== '' &&
        !isLoading.value &&
        !isValidatingCode.value
      );
    });

    const handleValidateCode = async () => {
      hasAttemptedValidation.value = true;
      if (localReferralCode.value.trim()) {
        await validateReferralCode(localReferralCode.value.trim());
      }
    };

    const toggleReferralField = () => {
      showReferralField.value = !showReferralField.value;
      if (!showReferralField.value) {
        localReferralCode.value = '';
        clearReferralValidation();
        hasAttemptedValidation.value = false;
      }
    };

    const removeReferral = () => {
      localReferralCode.value = '';
      clearReferralValidation();
      hasAttemptedValidation.value = false;
    };

    const submitForm = async () => {
      const { valid } = await validate();
      if (!valid) return;

      await registerAdmin({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        businessName: values.businessName,
        referralCode: hasValidReferral.value ? localReferralCode.value : undefined,
      });
    };

    watch(localReferralCode, () => {
      if (hasAttemptedValidation.value && codeValidationError.value) {
        hasAttemptedValidation.value = false;
      }
    });

    onMounted(async () => {
      const urlCode = extractReferralFromUrl();
      if (urlCode) {
        localReferralCode.value = urlCode;
        showReferralField.value = true;
        await validateReferralCode(urlCode);
        hasAttemptedValidation.value = true;
      }
    });

    return {
      isDark,
      localReferralCode,
      isLoading,
      isValidatingCode,
      referrerInfo,
      codeValidationError,
      hasValidReferral,
      showReferralField,
      hasAttemptedValidation,
      referrerDisplayName,
      benefitsDescription,
      canSubmit,
      handleValidateCode,
      toggleReferralField,
      removeReferral,
      submitForm,
    };
  },
});
