/**
 * Resend sandbox / verified inbox only: when `MAIL_FORCE_DELIVER_TO` is **not** set in the
 * environment, all outgoing mail is delivered ONLY to this address (users in DB keep the
 * real email).
 *
 * Disable override: set `MAIL_FORCE_DELIVER_TO=0` or `false` in `.env`.
 * Override destination: set `MAIL_FORCE_DELIVER_TO=you@example.com`.
 *
 * Remove or empty this constant when you no longer need a default forced inbox.
 */
export const MAIL_FORCE_DELIVER_TO_HARDCODED = 'altamirano.developer@gmail.com';
