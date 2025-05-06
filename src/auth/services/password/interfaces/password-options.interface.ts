export interface PasswordOptions {
  saltRounds: number;
  maxAttempts: number;
  lockoutDuration: number;
}
