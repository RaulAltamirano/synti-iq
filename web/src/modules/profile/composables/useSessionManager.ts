import { ref } from 'vue';
import { ApiService } from '@/modules/services/api-service';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import type { ApiResponse } from '@/modules/auth/interfaces/auth.types';
import { ActiveUserSession, PaginatedSessionsResponse } from '../interfaces/session.types';

const apiService = ApiService.getInstance();

export function useSessionManager() {
  const sessions = ref<ActiveUserSession[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalSessions = ref(0);
  const currentPage = ref(1);
  const limit = ref(10);

  const getCurrentSessionId = (): string | null => {
    const authStore = useAuthStore();
    return authStore.currentSessionId;
  };

  const fetchSessions = async (page: number = 1, pageLimit: number = 10): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiService.api.get<ApiResponse<PaginatedSessionsResponse>>(
        '/user-session',
        {
          params: {
            page,
            limit: pageLimit,
          },
        }
      );

      const paginatedData = response.data.data;
      sessions.value = paginatedData.items.map((session) => ({
        ...session,
        lastUsed: new Date(session.lastUsed),
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      }));

      totalSessions.value = paginatedData.total;
      currentPage.value = paginatedData.page;
      limit.value = paginatedData.limit;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error.value = msg || 'Unable to load sessions';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      await apiService.api.delete(`/user-session/${sessionId}`);
      await fetchSessions(currentPage.value, limit.value);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error.value = msg || 'Unable to close this session';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAllSessions = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      await apiService.api.delete('/user-session/all');
      await fetchSessions(currentPage.value, limit.value);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error.value = msg || 'Unable to close all sessions';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteOtherSessions = async (currentSessionId: string): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      await apiService.api.delete(`/user-session/current/${currentSessionId}/others`);
      await fetchSessions(currentPage.value, limit.value);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error.value = msg || 'Unable to close other sessions';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const isCurrentSession = (sessionId: string): boolean => {
    const currentSessionIdValue = getCurrentSessionId();
    return currentSessionIdValue !== null && sessionId === currentSessionIdValue;
  };

  return {
    sessions,
    loading,
    error,
    totalSessions,
    currentPage,
    limit,
    fetchSessions,
    deleteSession,
    deleteAllSessions,
    deleteOtherSessions,
    getCurrentSessionId,
    isCurrentSession,
  };
}
