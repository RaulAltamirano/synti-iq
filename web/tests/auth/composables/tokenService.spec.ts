import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTokenService } from '../../../src/modules/auth/composables/tokenService';
import { apiService } from '../../../src/modules/services/api-service';
import { jwtDecode } from 'jwt-decode';

vi.mock('jwt-decode');
vi.mock('../../services/api-service');

describe('useTokenService', () => {
  const mockJwtDecode = jwtDecode as jest.Mock;
  const mockUserSession = { id: 1, email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isTokenExpired', () => {
    it('should return true if token is expired', () => {
      const { isTokenExpired } = useTokenService();
      const expiredTime = Date.now() / 1000 - 300;
      mockJwtDecode.mockReturnValue({ exp: expiredTime });
      expect(isTokenExpired('mock-token')).toBe(true);
    });

    it('should return true if token expires in less than 5 minutes', () => {
      const { isTokenExpired } = useTokenService();
      const almostExpiredTime = Date.now() / 1000 + 200;
      mockJwtDecode.mockReturnValue({ exp: almostExpiredTime });
      expect(isTokenExpired('mock-token')).toBe(true);
    });

    it('should return false if token is valid', () => {
      const { isTokenExpired } = useTokenService();
      const validTime = Date.now() / 1000 + 3600;
      mockJwtDecode.mockReturnValue({ exp: validTime });
      expect(isTokenExpired('mock-token')).toBe(false);
    });

    it('should return true if token decoding fails', () => {
      const { isTokenExpired } = useTokenService();
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      expect(isTokenExpired('invalid-token')).toBe(true);
    });

    it('should return true for null or empty token', () => {
      const { isTokenExpired } = useTokenService();
      expect(isTokenExpired(null)).toBe(true);
      expect(isTokenExpired('')).toBe(true);
    });
  });

  describe('verifySession', () => {
    it('should successfully return session data', async () => {
      const { verifySession, isLoading } = useTokenService();
      vi.spyOn(apiService, 'get').mockResolvedValue({
        data: mockUserSession,
        status: 200
      });

      expect(isLoading.value).toBe(false);
      const result = await verifySession();
      
      expect(apiService.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUserSession);
      expect(isLoading.value).toBe(false);
    });

    it('should handle API errors correctly', async () => {
      const { verifySession, isLoading } = useTokenService();
      const mockError = new Error('API Error');
      vi.spyOn(apiService, 'get').mockRejectedValue(mockError);

      expect(isLoading.value).toBe(false);
      await expect(verifySession()).rejects.toThrow(mockError);
      expect(isLoading.value).toBe(false);
    });

    it('should update isLoading during request', async () => {
      const { verifySession, isLoading } = useTokenService();
      vi.spyOn(apiService, 'get').mockResolvedValue({
        data: mockUserSession,
        status: 200
      });

      const verifyPromise = verifySession();
      expect(isLoading.value).toBe(true);
      await verifyPromise;
      expect(isLoading.value).toBe(false);
    });

    it('should ensure isLoading is false after error', async () => {
      const { verifySession, isLoading } = useTokenService();
      vi.spyOn(apiService, 'get').mockRejectedValue(new Error('API Error'));

      try {
        await verifySession();
      } catch (error) {
        expect(isLoading.value).toBe(false);
      }
    });

    it('should handle network timeout', async () => {
      const { verifySession } = useTokenService();
      const timeoutError = new Error('Network timeout');
      vi.spyOn(apiService, 'get').mockRejectedValue(timeoutError);

      await expect(verifySession()).rejects.toThrow('Network timeout');
    });

    it('should handle unauthorized response', async () => {
      const { verifySession } = useTokenService();
      const unauthorizedError = new Error('Unauthorized');
      unauthorizedError.name = '401';
      vi.spyOn(apiService, 'get').mockRejectedValue(unauthorizedError);

      await expect(verifySession()).rejects.toThrow('Unauthorized');
    });
  });
});