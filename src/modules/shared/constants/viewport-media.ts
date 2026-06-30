/**
 * Media-query strings shared across the app so JS matches Tailwind breakpoints.
 *
 * Tailwind v4 default `md` = 48rem (768px). “Below md” = max-width one pixel less.
 *
 * @see docs/FRONTEND_CONVENTIONS.md — Tailwind Design System; viewports in `.storybook/preview.ts`
 */
export const MEDIA_BELOW_MD = '(max-width: 47.99875rem)' as const;
