import { ref } from 'vue';
import type { ApiResponse, AuthData } from '../interfaces/auth.types';
import { RequiresTotpError } from '../interfaces/auth.types';
import { useToast } from '../../ui/components';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { ApiService } from '@/modules/services/api-service';
import { AxiosError } from 'axios';
import { securityLogger } from '../services/securityLogger';
import { getPostAuthRedirect } from '../utils/post-auth-redirect.util';

const apiService = ApiService.getInstance();
const REQUEST_TIMEOUT_MS = 30000;

const SENSITIVE_PATTERNS = [
  /stack\s*trace/i,
  /at\s+\w+\s*\(/i,
  /node_modules/i,
  /internal\s*server/i,
  /database\s*(connection|error)/i,
  /sql\s*(syntax|error)/i,
  /econnrefused/i,
  /etimedout/i,
  /enotfound/i,
  /socket\s*hang\s*up/i,
];

const GENERIC_ERROR_MESSAGES: Record<string, string> = {
  '400': 'Invalid request. Please check your input.',
  '401': 'Authentication required. Please log in.',
  '403': 'You do not have permission to perform this action.',
  '404': 'The requested resource was not found.',
  '409': 'A conflict occurred. Please try again.',
  '422': 'Validation error. Please check your input.',
  '429': 'Too many requests. Please wait and try again.',
  '5xx': 'Something went wrong on our end. Please try again later.',
  default: 'An unexpected error occurred. Please try again.',
};

function containsSensitiveInfo(message: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(message));
}

function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;

    if (status && status >= 500) {
      return GENERIC_ERROR_MESSAGES['5xx'];
    }

    if (backendMessage) {
      const message = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : String(backendMessage);

      if (!containsSensitiveInfo(message)) {
        return message;
      }
    }

    if (status) {
      return GENERIC_ERROR_MESSAGES[status.toString()] || GENERIC_ERROR_MESSAGES['default'];
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Unable to connect to server. Please check your internet connection.';
    }

    return GENERIC_ERROR_MESSAGES['default'];
  }

  if (error instanceof Error) {
    if (containsSensitiveInfo(error.message)) {
      return GENERIC_ERROR_MESSAGES['default'];
    }
    return error.message;
  }

  return GENERIC_ERROR_MESSAGES['default'];
}

function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request is taking longer than expected. Please try again.'));
    }, ms);
  });
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<T> {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)]);
}

export const useAuth = () => {
  const storeAuth = useAuthStore();
  const router = useRouter();
  const toast = useToast();
  const isLoading = ref(false);

  const login = async (email: string, password: string, totpCode?: string): Promise<void> => {
    isLoading.value = true;
    try {
      const payload: { email: string; password: string; totpCode?: string } = {
        email,
        password,
      };
      if (totpCode) {
        payload.totpCode = totpCode;
      }

      const response = await withTimeout(
        apiService.api.post<ApiResponse<AuthData>>('/auth/login', payload)
      );

      const data = response.data?.data ?? response.data;
      if (!data?.user) {
        throw new Error('Invalid login response');
      }

      const { user, sessionId } = data;
      storeAuth.setUser(user, sessionId);
      securityLogger.loginSuccess();
      await router.push(getPostAuthRedirect(user));
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response?.status === 401 &&
        (error.response?.data as { requires_2fa?: boolean })?.requires_2fa === true &&
        !totpCode
      ) {
        throw new RequiresTotpError(
          (error.response?.data as { message?: string })?.message ?? 'TOTP code required'
        );
      }
      const errorMessage = sanitizeErrorMessage(error);
      securityLogger.loginFailed(
        errorMessage,
        error instanceof AxiosError ? error.response?.status : undefined
      );
      toast.error(errorMessage);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await withTimeout(
        apiService.api.post<ApiResponse<AuthData>>('/auth/signup', {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
        })
      );

      if (!response.data?.data?.user) {
        throw new Error('Invalid registration response');
      }

      const { user, sessionId } = response.data.data;
      storeAuth.setUser(user, sessionId);
      securityLogger.registrationSuccess();
      await router.push(getPostAuthRedirect(user));
    } catch (error) {
      const errorMessage = sanitizeErrorMessage(error);
      securityLogger.registrationFailed(
        errorMessage,
        error instanceof AxiosError ? error.response?.status : undefined
      );
      toast.error(errorMessage);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      isLoading.value = true;
      await storeAuth.logout();
      securityLogger.logout();
      await router.push({ name: 'Login' });
    } catch (error) {
      toast.error(sanitizeErrorMessage(error));
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isAuthenticated: storeAuth.isAuthenticated,
    isLoading,
    register,
    login,
    logout,
  };
};
