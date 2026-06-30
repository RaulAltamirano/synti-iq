let fieldIdSequence = 0;

/**
 * Stable unique `id` for form fields when both `id` and `name` are omitted.
 * One id per component instance (call once in `setup` / `script setup`).
 */
export function createFieldFallbackId(kind: string): string {
  fieldIdSequence += 1;
  return `ui-${kind}-${fieldIdSequence}`;
}
