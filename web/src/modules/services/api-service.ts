import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONSTANTS } from './constants/constants-api';
import { securityLogger } from '../auth/services/securityLogger';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
}

export class ApiService {
  private static instance: ApiService;
  public api: AxiosInstance;
  private refreshing: boolean = false;
  private refreshPromise: Promise<void> | null = null;
  private refreshSubscribers: Array<() => void> = [];

  private constructor() {
    this.api = axios.create({
      baseURL: API_CONSTANTS.BASE_URL,
      withCredentials: true,
      timeout: 30000,
    });
    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

        if (!originalRequest || originalRequest._retry) {
          return Promise.reject(error);
        }

        if (error.response?.status === 403) {
          window.dispatchEvent(
            new CustomEvent('auth:forbidden', {
              detail: { url: originalRequest.url },
            })
          );
          return Promise.reject(error);
        }

        if (error.response?.status === 401) {
          const isAuthRefreshRequest = originalRequest.url?.includes('/auth/refresh') ?? false;
          const isInitialAuthCheck = originalRequest.url?.includes('/user/me') ?? false;
          const isLoginRequest = originalRequest.url?.includes('/auth/login') ?? false;
          const isPasswordSetupRequest =
            originalRequest.url?.includes('/invitations/accept') ?? false;

          if (
            originalRequest.skipAuthRefresh ||
            isAuthRefreshRequest ||
            isLoginRequest ||
            isPasswordSetupRequest
          ) {
            return Promise.reject(error);
          }
          if (this.refreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push(() => {
                originalRequest._retry = true;
                resolve(this.api(originalRequest));
              });
            });
          }

          this.refreshing = true;
          try {
            if (!this.refreshPromise) {
              this.refreshPromise = this.refreshAccessToken();
            }

            await this.refreshPromise;

            this.refreshSubscribers.forEach((callback) => callback());
            this.refreshSubscribers = [];

            originalRequest._retry = true;
            return this.api(originalRequest);
          } catch {
            securityLogger.refreshFailed('Token refresh failed');
            if (!isInitialAuthCheck) {
              window.dispatchEvent(new CustomEvent('auth:session-expired'));
            }
            return Promise.reject(error);
          } finally {
            this.refreshing = false;
            this.refreshPromise = null;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<void> {
    await this.api.post('/auth/refresh');
  }
}
