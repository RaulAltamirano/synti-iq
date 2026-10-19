import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ref } from 'vue';

import { useAuthStore } from '@/modules/auth/stores/authStore';
import { useTokenStorage } from '@/modules/services/composables/useTokenStorage';
import { apiService } from '@/modules/services/api-service';

vi.mock('@/modules/services/composables/useTokenStorage', () => ({
  useTokenStorage: vi.fn(() => ({
    clearTokens: vi.fn(),
    setTokens: vi.fn(),
    tokens: ref(null),
  })),
}));


vi.mock('@/modules/services/api-service', () => ({
  apiService: {
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  let authStore: ReturnType<typeof useAuthStore>;

  const mockTokens = { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
  const mockSession = {
    tokens: mockTokens,
    roles: ['user'],
    permissions: ['read'],
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    // Obtener referencia a los mocks

  });


  afterEach(() => {
    vi.clearAllMocks();
  });
  // const tokenStorageMock = useTokenStorage();

  it('should initialize with correct default values', () => {
    expect(authStore.user).toBeUndefined();
    expect(authStore.isAuthenticated).toBe(false);
  });

  describe('setSession', () => {
    it('should set the user session and tokens', () => {
      authStore.setSession(mockSession, mockTokens);

      expect(authStore.user).toEqual(mockSession);
      expect(apiService.setTokens).toHaveBeenCalledWith(mockTokens);
      // expect(tokenStorageMock.setTokens).toHaveBeenCalledWith(mockTokens);
      expect(authStore.isAuthenticated).toBe(true);
    });

  });

  describe('clearSession', () => {
    it('should clear the user session and tokens', () => {
      authStore.setSession(mockSession, mockTokens);
      authStore.clearSession();

      expect(authStore.user).toBeNull();
      expect(apiService.clearTokens).toHaveBeenCalled();
      // expect(useTokenStorage().clearTokens).toHaveBeenCalled();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if the user has a valid access token', () => {
      authStore.setSession(mockSession, mockTokens);
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('should return false if the user session is null', () => {
      authStore.clearSession();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true if the user has the specified role', () => {
      authStore.setSession(mockSession, mockTokens);
      expect(authStore.hasRole('user')).toBe(true);
    });

    it('should return false if the user does not have the specified role', () => {
      authStore.setSession(mockSession, mockTokens);
      expect(authStore.hasRole('admin')).toBe(false);
    });

    it('should return false if the user session is null', () => {
      authStore.clearSession();
      expect(authStore.hasRole('user')).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if the user has the specified permission', () => {
      authStore.setSession(mockSession, mockTokens);
      expect(authStore.hasPermission('read')).toBe(true);
    });

    it('should return false if the user does not have the specified permission', () => {
      authStore.setSession(mockSession, mockTokens);
      expect(authStore.hasPermission('write')).toBe(false);
    });

    it('should return false if the user session is null', () => {
      authStore.clearSession();
      expect(authStore.hasPermission('read')).toBe(false);
    });
  });
});
