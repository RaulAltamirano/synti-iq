# Task Discovery: TOTP Two-Factor Authentication

Output of the Task Discovery process for TOTP authentication. See [task-discovery.md](./task-discovery.md) for the prompt template.

---

## Title

TOTP Two-Factor Authentication for User Accounts

---

## Description

**Purpose** — This task strengthens account security by requiring a Time-based One-Time Password (TOTP) from an authenticator app (e.g. Google Authenticator, Authy) in addition to the password. It addresses the need for a second factor to protect user accounts from credential theft and unauthorized access.

**Scope** — Included:

- Enrollment flow: user initiates 2FA setup, scans QR code with authenticator app, verifies with a TOTP code, and receives backup codes
- Verification during login: when 2FA is enabled, login requires a TOTP code (or backup code) in addition to email and password
- Disable flow: user can turn off 2FA by providing a valid TOTP or backup code
- Backup codes: one-time recovery codes (format XXXX-XXXX-XXXX) generated at enrollment, hashed and stored; each usable once for login or disable
- Status and regeneration: endpoint to check 2FA status and remaining backup codes; endpoint to regenerate backup codes when 2FA is enabled

**Actors** — End users (enrollment, login, disable, regenerate backup codes); auth service (validation, session creation); system (Redis for temporary secrets, PostgreSQL for persisted data).

**Key flows** — (1) Enrollment: POST /auth/2fa/setup → scan QR → POST /auth/2fa/verify with code → receive backup codes. (2) Login: POST /auth/login with email+password → if 2FA enabled and no code, 401 with requires_2fa → client prompts for code → POST /auth/login with email+password+totpCode. (3) Disable: POST /auth/2fa/disable with TOTP or backup code.

**Technical context** — Auth module, User entity (twoFactorSecret), UserBackupCode entity, TwoFactorService, AuthService, login flow. Uses otplib (RFC 6238) and qrcode. Redis for temporary setup secret (TTL 5 min).

**Constraints** — Enrollment is optional; backup codes are required at setup; TOTP follows RFC 6238; 6-digit codes; backup codes hashed with SHA-256; rate limiting applies to login and 2FA endpoints.

**Out of scope** — SMS 2FA, email 2FA, hardware keys (WebAuthn/FIDO2), admin bypass, mandatory 2FA for specific roles, frontend implementation (API-only scope).
