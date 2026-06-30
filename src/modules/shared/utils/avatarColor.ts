const AVATAR_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
  '#F43F5E',
] as const;

const DEFAULT_COLOR = '#6B7280';

export function generateAvatarColor(identifier: string | null | undefined): string {
  if (!identifier?.trim()) {
    return DEFAULT_COLOR;
  }

  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(fullName: string | null | undefined): string {
  if (!fullName || fullName.trim() === '') {
    return '??';
  }

  const words = fullName.trim().split(/\s+/);

  if (words.length === 0) {
    return '??';
  }

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  const firstInitial = words[0].charAt(0);
  const lastInitial = words[words.length - 1].charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
}

export { AVATAR_COLORS, DEFAULT_COLOR };
