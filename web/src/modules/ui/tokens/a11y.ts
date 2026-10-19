/**
 * A11y / semantic layout values mirrored in Tailwind and `styles/tokens.css`.
 * Prefer Tailwind utilities in components: `min-h-11 min-w-11` (44px touch target),
 * `min-w-toast` / `max-w-toastViewport` for toast container.
 */
export const a11yLayout = {
  /** 2.75rem — matches `min-h-11` / `min-w-11` (WCAG 2.5.5 minimum target size). */
  touchTargetMin: '2.75rem',
  /** 17.5rem (280px) — matches `min-w-toast` in tailwind.config.js */
  toastMinWidth: '17.5rem',
} as const;
