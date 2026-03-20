# Synti-IQ API — Logging Conventions

Canonical reference for application logging. Complements [CONVENTIONS.md](CONVENTIONS.md) and [AGENTS.md](../AGENTS.md).

---

## Summary

- Use **NestJS Logger** (`@nestjs/common`) backed by **nestjs-pino** (Pino). Never use `console.log`, `console.error`, or `console.warn`.
- Logging is configured in `src/shared/logger/logger.module.ts` and wired via `app.useLogger(app.get(Logger))` in `main.ts`.
- All logs are structured JSON in production (Pino); `pino-pretty` is used in development for readability.

---

## Pattern per Service

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  constructor(/* ... */) {}
}
```

- Use an **instance** logger, not a static `Logger.error()` call.
- Always pass `ServiceName.name` as the context for the service.

---

## Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `error` | Unrecoverable failures, exceptions in catch blocks | `this.logger.error('Failed to save referral usage', error.stack, ReferralService.name)` |
| `warn` | Recoverable or anomalous situations | `this.logger.warn('Access denied: business owner role required', ReferralService.name)` |
| `log` | Important business events (e.g. audit) | `this.logger.log('Referral usage recorded', ReferralService.name)` |
| `debug` | Development-only, verbose validation failures | `this.logger.debug('Referral code not found', ReferralService.name)` |

---

## Error Signature

Correct signature for `error`:

```typescript
this.logger.error(message: string, stack?: string, context?: string);
```

- **First param**: Human-readable message.
- **Second param**: Stack trace (optional); use `error.stack` when available.
- **Third param**: Context (class name string), e.g. `ReferralService.name`. Do **not** pass an object as the third parameter — Nest Logger treats it as a context string, not structured data.

**Correct:**

```typescript
this.logger.error(`Error during signUp: ${error.message}`, error.stack, AuthService.name);
```

**Incorrect:**

```typescript
this.logger.error('msg', stack, { userId })  // Object as context — avoid
```

---

## What to Log

- **Errors** in catch blocks: message + stack trace.
- **Business validation failures** that are relevant for debugging (e.g. `warn` for anomalous data).
- **Critical operations** (e.g. `recordUsage`, `createCode`) for audit — use `log` level.
- **Frequent validation failures** (e.g. invalid format, not found) — use `debug` to avoid noise in production.

---

## What NOT to Log

- **PII**: emails, full names, tokens, passwords.
- **Referral codes** or other identifiers that could be sensitive.
- **Stack traces** in API responses (log internally only).
- **Excessive detail** in production — prefer `debug` for verbose logs.

---

## Correlation with Traces

- OpenTelemetry spans already expose attributes (e.g. `referral.referral_code_id`, `referral.user_id`).
- Log messages should be descriptive and complement spans; avoid duplicating span attributes in log messages.
- HTTP request logs include `traceId` and `spanId` via `customProps` in `pinoHttp`; application logs do not automatically include them. Use consistent message wording to aid correlation with traces.

---

## Reference Implementation

See [src/referral/referral.service.ts](../src/referral/referral.service.ts) for the canonical logging pattern:

```typescript
// After successful recordUsage
this.logger.log('Referral usage recorded', ReferralService.name);

// After successful createCode
this.logger.log('Referral code created for business profile', ReferralService.name);

// Before ForbiddenException
this.logger.warn('Access denied: business owner role required', ReferralService.name);

// Validation failures (debug level)
this.logger.debug('Referral code validation failed: invalid format', ReferralService.name);
```

---

## References

- [src/shared/logger/](../src/shared/logger/) — Logger module and Pino configuration
- [docs/CONVENTIONS.md](CONVENTIONS.md) — Technical conventions
- [AGENTS.md](../AGENTS.md) — Agent guide
- [src/referral/constants/referral-span.constants.ts](../src/referral/constants/referral-span.constants.ts) — Span attributes for correlation
