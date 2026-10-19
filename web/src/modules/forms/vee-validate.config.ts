import { configure } from 'vee-validate';

/** Shown when the library does not supply a usable string (or would stringify an object as `[object Object]`). */
const FALLBACK_FIELD_MESSAGE = 'Invalid value';

/**
 * Converts a validation `message` payload to text safe for the UI.
 * Only strings and primitive numbers/booleans are rendered; everything else falls back.
 */
function validationMessageToDisplayString(value: unknown): string {
  if (value == null) {
    return FALLBACK_FIELD_MESSAGE;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return FALLBACK_FIELD_MESSAGE;
}

/**
 * `generateMessage` receives `FieldValidationMetaInfo` in typings, but schema backends (e.g. Zod)
 * often attach `message` at runtime. Read it safely without relying on incomplete package types.
 */
function resolveConfiguredMessage(ctx: object): string {
  if (!('message' in ctx)) {
    return FALLBACK_FIELD_MESSAGE;
  }
  return validationMessageToDisplayString((ctx as { message: unknown }).message);
}

/**
 * Global VeeValidate defaults. Call once before `app.mount()` (see `main.ts`).
 * Validation is intentionally conservative so wizards can validate on explicit actions (Next / submit).
 */
export function setupVeeValidate(): void {
  configure({
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
    bails: true,
    generateMessage: (ctx) => resolveConfiguredMessage(ctx),
  });
}
