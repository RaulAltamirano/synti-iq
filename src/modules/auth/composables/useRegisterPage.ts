import { computed, reactive, ref } from 'vue';

import { useAuth } from '@/modules/auth/composables/useAuth';
import { useTheme } from '@/modules/shared/composables/useTheme';
import {
  validateEmailFormat,
  validatePasswordStrength,
  validateName as validateNameUtil,
} from '@/modules/auth/constants/validation.constants';

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function useRegisterPage() {
  const { isDark } = useTheme();
  const { register, isLoading } = useAuth();
  const email = ref('');
  const firstName = ref('');
  const lastName = ref('');
  const password = ref('');

  const errors = reactive<FormErrors>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const touched = reactive({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });

  const hasErrors = computed(
    () => !!(errors.firstName || errors.lastName || errors.email || errors.password)
  );
  const isFormValid = computed(
    () => firstName.value && lastName.value && email.value && password.value && !hasErrors.value
  );

  const validateFirstName = (): boolean => {
    const result = validateNameUtil(firstName.value);
    errors.firstName = result.error || '';
    return result.isValid;
  };

  const validateLastName = (): boolean => {
    const result = validateNameUtil(lastName.value);
    errors.lastName = result.error || '';
    return result.isValid;
  };

  const validateEmail = (): boolean => {
    const result = validateEmailFormat(email.value);
    errors.email = result.error || '';
    return result.isValid;
  };

  const validatePassword = (): boolean => {
    const result = validatePasswordStrength(password.value);
    errors.password = result.error || '';
    return result.isValid;
  };

  const validateForm = (): boolean => {
    touched.firstName = true;
    touched.lastName = true;
    touched.email = true;
    touched.password = true;
    return validateFirstName() && validateLastName() && validateEmail() && validatePassword();
  };

  const handleSignup = async (): Promise<void> => {
    if (!validateForm()) return;
    try {
      await register({
        email: email.value,
        password: password.value,
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
      });
    } catch {
      // useAuth handles user feedback
    }
  };

  const onFirstNameBlur = (): void => {
    touched.firstName = true;
    validateFirstName();
  };

  const onLastNameBlur = (): void => {
    touched.lastName = true;
    validateLastName();
  };

  const onEmailBlur = (): void => {
    touched.email = true;
    validateEmail();
  };

  const onPasswordBlur = (): void => {
    touched.password = true;
    validatePassword();
  };

  return {
    isDark,
    email,
    password,
    firstName,
    lastName,
    errors,
    touched,
    hasErrors,
    isFormValid,
    handleSignup,
    onFirstNameBlur,
    onLastNameBlur,
    onEmailBlur,
    onPasswordBlur,
    isLoading,
  };
}
