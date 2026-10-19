import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from '../../ui/components';
import { useAuthStore } from '../stores/authStore';
import { ApiService } from '@/modules/services/api-service';
import { AuthData } from '../interfaces/auth.types';
import { AdminRegisterDto, ReferralValidationResponse } from '../interfaces/admin-register.types';
import { securityLogger } from '../services/securityLogger';

const api = ApiService.getInstance().api;
const REFERRAL_CODE_REGEX = /^[A-Z0-9]{6,12}$/i;

function sanitizeReferralCode(code: string): string | null {
  if (!code) return null;
  const trimmed = code.trim().toUpperCase();
  if (!REFERRAL_CODE_REGEX.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export const useAdminRegister = () => {
  const storeAuth = useAuthStore();
  const router = useRouter();
  const route = useRoute();
  const toast = useToast();

  const isLoading = ref(false);
  const isValidatingCode = ref(false);
  const referralCode = ref('');
  const referrerInfo = ref<ReferralValidationResponse | null>(null);
  const codeValidationError = ref<string | null>(null);

  const hasValidReferral = computed(() => {
    return referrerInfo.value?.isValid === true;
  });

  const extractReferralFromUrl = (): string | null => {
    const refCode = route.query.ref as string | undefined;
    if (refCode) {
      const sanitized = sanitizeReferralCode(refCode);
      if (sanitized) {
        referralCode.value = sanitized;
        return sanitized;
      }
      securityLogger.invalidReferralCode();
    }
    return null;
  };

  const validateReferralCode = async (code: string): Promise<ReferralValidationResponse> => {
    const sanitizedCode = sanitizeReferralCode(code);

    if (!sanitizedCode) {
      const response: ReferralValidationResponse = {
        isValid: false,
        errorMessage:
          code.trim() === ''
            ? 'Referral code is required'
            : 'Invalid referral code format. Code must be 6-12 alphanumeric characters.',
      };
      referrerInfo.value = null;
      codeValidationError.value = response.errorMessage ?? null;

      if (code.trim() !== '') {
        securityLogger.invalidReferralCode();
      }

      return response;
    }

    isValidatingCode.value = true;
    codeValidationError.value = null;

    try {
      const res = await api.get(`/referrals/validate/${encodeURIComponent(sanitizedCode)}`);
      const data = (res.data as { data?: ReferralValidationResponse })?.data ?? res.data;

      if (data?.isValid) {
        referrerInfo.value = data;
        codeValidationError.value = null;
      } else {
        referrerInfo.value = null;
        codeValidationError.value = data?.errorMessage ?? 'Invalid referral code';
        securityLogger.invalidReferralCode();
      }

      return data ?? { isValid: false, errorMessage: 'Invalid referral code' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to validate referral code';

      codeValidationError.value = errorMessage;
      referrerInfo.value = null;
      securityLogger.invalidReferralCode();

      return {
        isValid: false,
        errorMessage,
      };
    } finally {
      isValidatingCode.value = false;
    }
  };

  const registerAdmin = async (data: AdminRegisterDto): Promise<boolean> => {
    isLoading.value = true;

    try {
      if (data.referralCode) {
        const validation = await validateReferralCode(data.referralCode);
        if (!validation.isValid) {
          toast.error('Invalid referral code. You can continue without it or use a valid code.');
          isLoading.value = false;
          return false;
        }
      }

      const res = await api.post('/auth/register-business', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        businessName: data.businessName,
        referralCode: data.referralCode || undefined,
      });

      const payload = (res.data as { data?: AuthData })?.data ?? res.data;
      if (!payload?.user) throw new Error('Invalid registration response');

      const { user, sessionId } = payload;
      storeAuth.setUser(user, sessionId);
      securityLogger.registrationSuccess();
      toast.success('Business account created successfully!');
      router.push({ name: 'Home' });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';

      securityLogger.registrationFailed(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const clearReferralValidation = () => {
    referrerInfo.value = null;
    codeValidationError.value = null;
    referralCode.value = '';
  };

  return {
    isLoading,
    isValidatingCode,
    referralCode,
    referrerInfo,
    codeValidationError,
    hasValidReferral,
    extractReferralFromUrl,
    validateReferralCode,
    registerAdmin,
    clearReferralValidation,
  };
};
