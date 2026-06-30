export function getFieldError(errors: Record<string, unknown>, path: string): string {
  const flat = errors[path];
  if (typeof flat === 'string') return flat;

  const parts = path.split('.');
  let current: unknown = errors;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return '';
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : '';
}

export function hasFieldError(errors: Record<string, unknown>, path: string): boolean {
  return getFieldError(errors, path).length > 0;
}

export function toFieldErrorProps(errorMessage: string | undefined): {
  error: boolean;
  errorMessage: string;
} {
  return {
    error: !!errorMessage,
    errorMessage: errorMessage ?? '',
  };
}
