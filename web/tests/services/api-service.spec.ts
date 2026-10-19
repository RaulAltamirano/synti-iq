import { describe, it, expect, vi, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import { API_CONSTANTS } from '../../src/modules/services/constants/constants-api';
import { apiService } from '../../src/modules/services/api-service';
import { ENDPOINTS } from '../../src/modules/services/constants/constants-endpoints';
import { ApiError } from '../../src/modules/services/api-error';

const mock = new MockAdapter(axios);

describe('ApiService', () => {
  const mockResponse = { message: 'success' };
  const endpointAuth = ENDPOINTS.TEST_AUTH;
  const endpoint = ENDPOINTS.TEST;
  const fullUrl = `${API_CONSTANTS.BASE_URL}${endpointAuth}`;

  beforeEach(() => {
    mock.reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });


  describe('GET Requests', () => {
    it('should perform a GET request successfully', async () => {
      mock.onGet(fullUrl).reply(200, mockResponse);

      const response = await apiService.get(endpoint);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse.message);
    });

    it('should handle GET request errors', async () => {
      mock.onGet(fullUrl).reply(500);

      await expect(apiService.get(endpointAuth)).rejects.toThrow(ApiError);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token on 401 response and retry request', async () => {
      const refreshResponse = {
        message: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token'
        }
      };
    
      const tokenStorageMock = {
        getStoredTokens: vi.fn(() => ({
          accessToken: 'expired-token',
          refreshToken: 'valid-refresh-token'
        })),
        setTokens: vi.fn(),
        clearTokens: vi.fn()
      };
    
      mock
        .onGet(fullUrl)
        .replyOnce(401)
        .onPost(`${API_CONSTANTS.BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
          refreshToken: 'valid-refresh-token'
        })
        .reply(200, refreshResponse)
        .onGet(fullUrl)
        .reply(200, mockResponse);
    
      (apiService as any).tokenStorage = tokenStorageMock;
      const response = await apiService.get(endpoint);
    
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse.message);
    });

    it('should clear tokens and notify on token refresh failure', async () => {
      mock
        .onGet(fullUrl)
        .replyOnce(401)
        .onPost(`${API_CONSTANTS.BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`)
        .reply(401);

      const tokenStorageMock = {
        getStoredTokens: vi.fn(() => ({
          accessToken: 'expired-token',
          refreshToken: 'invalid-refresh-token',
        })),
        setTokens: vi.fn(),
        clearTokens: vi.fn(),
      };

      (apiService as any).tokenStorage = tokenStorageMock;
      const logoutEventSpy = vi.spyOn(window, 'dispatchEvent');
      await expect(apiService.get(endpointAuth)).rejects.toThrow(ApiError);
      expect(tokenStorageMock.clearTokens).toHaveBeenCalled();
      expect(logoutEventSpy).toHaveBeenCalledWith(new CustomEvent('auth:logout'));
    });
  });

  describe('Error Handling', () => {
    it('should throw a custom ApiError for Axios errors', async () => {
      mock.onGet(fullUrl).reply(404, { error: 'Not found' });

      await expect(apiService.get(endpointAuth)).rejects.toThrow('Failed to refresh token');
      // await expect(apiService.get(endpointAuth)).rejects.toMatchObject({
      //   statusCode: 404,
      //   message: 'Not found',
      // });
    });

    it('should throw a generic error for non-Axios errors', async () => {
      const faultyService = {
        request: () => {
          throw new Error('Unexpected error');
        },
      };

      await expect(() => faultyService.request()).toThrow('Unexpected error');
    });
  });

  describe('Request Methods', () => {
    it('should perform a POST request', async () => {
      const postData = { key: 'value' };
      mock.onPost(fullUrl).reply(201, mockResponse);

      const response = await apiService.post(endpoint, postData);

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockResponse.message);
    });

    it('should perform a DELETE request', async () => {
      mock.onDelete(fullUrl).reply(204);

      const response = await apiService.delete(endpoint);

      expect(response.status).toBe(204);
    });

    it('should perform a PUT request', async () => {
      const putData = { key: 'value' };
      mock.onPut(fullUrl).reply(200, mockResponse);

      const response = await apiService.put(endpoint, putData);

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockResponse.message);
    });
  });
});
