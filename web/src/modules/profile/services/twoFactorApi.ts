import { ApiService } from '@/modules/services/api-service';
import { AUTH_2FA_ENDPOINTS } from '@/modules/services/constants/constants-endpoints';
import type { ApiResponse } from '@/modules/auth/interfaces/auth.types';
import type {
  TwoFactorStatus,
  TwoFactorSetupData,
  TwoFactorVerifyResponse,
} from '../interfaces/twoFactor.types';

const api = ApiService.getInstance().api;

export interface TwoFactorStatusResponse {
  enabled: boolean;
  method: string | null;
  backupCodesRemaining: number;
}

export interface TwoFactorDisableResponse {
  message: string;
}

export interface ApiErrorDto {
  statusCode: number;
  message: string;
  error?: string;
}

function extractPayload<T>(response: { data: ApiResponse<T> | T }): T {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as ApiResponse<T>).data;
  }
  return body as T;
}

function getErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: ApiErrorDto } })?.response?.data;
  return data?.message ?? 'Something went wrong. Please try again.';
}

export async function fetchStatus(): Promise<TwoFactorStatus> {
  const response = await api.get<ApiResponse<TwoFactorStatusResponse> | TwoFactorStatusResponse>(
    AUTH_2FA_ENDPOINTS.STATUS
  );
  const payload = extractPayload<TwoFactorStatusResponse>(response);
  return {
    enabled: payload.enabled,
    method: payload.method === 'authenticator' ? 'authenticator' : null,
    backupCodesRemaining: payload.backupCodesRemaining ?? 0,
  };
}

export async function startSetup(password: string): Promise<TwoFactorSetupData> {
  const response = await api.post<ApiResponse<TwoFactorSetupData> | TwoFactorSetupData>(
    AUTH_2FA_ENDPOINTS.SETUP,
    { password }
  );
  return extractPayload<TwoFactorSetupData>(response);
}

export async function verifyAndEnable(
  code: string,
  password: string
): Promise<TwoFactorVerifyResponse> {
  const response = await api.post<ApiResponse<TwoFactorVerifyResponse> | TwoFactorVerifyResponse>(
    AUTH_2FA_ENDPOINTS.VERIFY,
    { code, password }
  );
  return extractPayload<TwoFactorVerifyResponse>(response);
}

export async function disable(code: string): Promise<TwoFactorDisableResponse> {
  const response = await api.post<ApiResponse<TwoFactorDisableResponse> | TwoFactorDisableResponse>(
    AUTH_2FA_ENDPOINTS.DISABLE,
    { code }
  );
  return extractPayload<TwoFactorDisableResponse>(response);
}

export async function regenerateBackupCodes(password: string): Promise<string[]> {
  const response = await api.post<
    ApiResponse<{ backupCodes: string[] }> | { backupCodes: string[] }
  >(AUTH_2FA_ENDPOINTS.REGENERATE_BACKUP_CODES, { password });
  const payload = extractPayload<{ backupCodes: string[] }>(response);
  return payload.backupCodes ?? [];
}

export { getErrorMessage };
