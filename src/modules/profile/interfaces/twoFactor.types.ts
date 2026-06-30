/**
 * Tipos para autenticación de dos factores (2FA) TOTP
 * Alineados con el contrato del backend.
 */

export type TwoFactorMethod = 'authenticator';

export interface TwoFactorStatus {
  enabled: boolean;
  method: TwoFactorMethod | null;
  backupCodesRemaining: number;
}

export interface TwoFactorSetupData {
  secret: string;
  qrCode: string;
}

export interface TwoFactorVerifyResponse {
  backupCodes: string[];
}
