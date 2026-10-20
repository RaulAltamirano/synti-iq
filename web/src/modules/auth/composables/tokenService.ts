import { ref } from 'vue';
import type { User, ApiResponse } from '../interfaces/auth.types';
import { ApiService } from '@/modules/services/api-service';

const apiService = ApiService.getInstance();

export const useTokenService = () => {
  const isLoading = ref(false);

  const verifySession = async (): Promise<User> => {
    try {
      isLoading.value = true;
      const response = await apiService.api.get<ApiResponse<User>>('/user/me');
      return response.data.data;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    verifySession,
    isLoading,
  };
};
