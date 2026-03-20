/**
 * Formats first and last name into a single display string.
 * Reusable across modules for user display purposes.
 */
export function formatUserName(firstName?: string, lastName?: string): string {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown';
}
