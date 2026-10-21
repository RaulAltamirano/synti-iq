import { ApiService } from '@/modules/services/api-service';
import { AUTH_CONSTANTS } from '@/modules/services/constants/constants-api';
import { defineStore } from 'pinia';
import { reactive, computed, readonly } from 'vue';
import type { User, ApiResponse } from '../interfaces/auth.types';
import { securityLogger } from '../services/securityLogger';

const apiService = ApiService.getInstance();

type UserPermission = string;

const SESSION_ID_STORAGE_KEY = 'syntiiq_session_id';

export const useAuthStore = defineStore('auth', () => {
  const loadSessionIdFromStorage = (): string | null => {
    try {
      return sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const saveSessionIdToStorage = (sessionId: string): void => {
    try {
      sessionStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
    } catch {
      /* sessionStorage unavailable */
    }
  };

  const clearSessionIdFromStorage = (): void => {
    try {
      sessionStorage.removeItem(SESSION_ID_STORAGE_KEY);
    } catch {
      /* sessionStorage unavailable */
    }
  };

  const state = reactive<{
    user: User | null;
    sessionId: string | null;
    initialized: boolean;
    loading: boolean;
    error: Error | null;
  }>({
    user: null,
    sessionId: loadSessionIdFromStorage(),
    initialized: false,
    loading: false,
    error: null,
  });

  let inactivityTimer: number | null = null;
  let inactivityListenersRegistered = false;
  let sessionExpiredListenerRegistered = false;
  let forbiddenListenerRegistered = false;

  const isAuthenticated = computed(() => !!state.user);
  const currentUser = computed(() => (state.user ? readonly(state.user) : null));
  const currentSessionId = computed(() => state.sessionId);
  const isLoading = computed(() => state.loading);
  const isInitialized = computed(() => state.initialized);
  const authError = computed(() => state.error);

  const hasPermission = (permission: UserPermission): boolean => {
    return state.user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: UserPermission[]): boolean => {
    if (!state.user?.permissions?.length) return false;
    return permissions.some((perm) => state.user!.permissions!.includes(perm));
  };

  const hasAllPermissions = (permissions: UserPermission[]): boolean => {
    if (!state.user?.permissions?.length) return false;
    return permissions.every((perm) => state.user!.permissions!.includes(perm));
  };

  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  const resetInactivityTimer = (): void => {
    if (inactivityTimer !== null) {
      window.clearTimeout(inactivityTimer);
    }

    if (!state.user) return;

    inactivityTimer = window.setTimeout(() => {
      securityLogger.sessionTimeout();
      logout();
      window.dispatchEvent(new CustomEvent('auth:session-timeout'));
    }, AUTH_CONSTANTS.SESSION_TIMEOUT);
  };

  const setupInactivityMonitor = (): void => {
    resetInactivityTimer();

    if (inactivityListenersRegistered) return;
    inactivityListenersRegistered = true;

    const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });
  };

  const clearInactivityMonitor = (): void => {
    if (inactivityTimer !== null) {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    if (inactivityListenersRegistered) {
      const events = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      inactivityListenersRegistered = false;
    }
  };

  const registerSessionExpiredListener = (): void => {
    if (sessionExpiredListenerRegistered) return;
    window.addEventListener('auth:session-expired', handleSessionExpired);
    sessionExpiredListenerRegistered = true;
  };

  const handleForbidden = (): void => {
    securityLogger.accessDenied();
    window.dispatchEvent(
      new CustomEvent('auth:forbidden-alert', {
        detail: { message: 'You do not have permission to perform this action.' },
      })
    );
  };

  const registerForbiddenListener = (): void => {
    if (forbiddenListenerRegistered) return;
    window.addEventListener('auth:forbidden', handleForbidden);
    forbiddenListenerRegistered = true;
  };

  const initializeAuth = async (): Promise<boolean> => {
    if (state.initialized) return !!state.user;

    try {
      state.loading = true;
      const response = await apiService.api.get<ApiResponse<User>>('/user/me');
      state.user = response.data.data;
      setupInactivityMonitor();
      registerSessionExpiredListener();
      registerForbiddenListener();
      return true;
    } catch {
      state.user = null;
      return false;
    } finally {
      state.initialized = true;
      state.loading = false;
    }
  };

  const setUser = (user: User, sessionId?: string): void => {
    state.user = user;
    if (sessionId) {
      state.sessionId = sessionId;
      saveSessionIdToStorage(sessionId);
    }
    state.initialized = true;
    state.error = null;
    setupInactivityMonitor();
    registerSessionExpiredListener();
    registerForbiddenListener();
  };

  const logout = async (): Promise<void> => {
    try {
      state.loading = true;
      if (state.user) {
        try {
          await apiService.api.post('/auth/logout');
        } catch {
          /* logout request failed; local session is still cleared */
        }
      }
    } catch {
      /* logout request failed; local session is still cleared */
    } finally {
      clearSession();
      state.loading = false;
    }
  };

  const clearSession = (): void => {
    if (sessionExpiredListenerRegistered) {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
      sessionExpiredListenerRegistered = false;
    }
    if (forbiddenListenerRegistered) {
      window.removeEventListener('auth:forbidden', handleForbidden);
      forbiddenListenerRegistered = false;
    }
    clearInactivityMonitor();
    state.user = null;
    state.sessionId = null;
    clearSessionIdFromStorage();
    state.error = null;
  };

  const handleSessionExpired = (): void => {
    securityLogger.sessionExpired();
    clearSession();
    window.dispatchEvent(new CustomEvent('auth:session-expired-alert'));
  };

  return {
    isAuthenticated,
    isInitialized,
    currentUser,
    currentSessionId,
    isLoading,
    authError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    initializeAuth,
    logout,
    setUser,
  };
});
