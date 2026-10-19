import { MAIL_FORCE_DELIVER_TO_HARDCODED } from 'src/mail/constants/mail-delivery.constants';

/**
 * Normalizes email for Resend sandbox: strips +suffix (e.g. user+test@gmail.com → user@gmail.com).
 */
export function normalizeEmailForResend(email: string): string {
  const match = email.match(/^([^+]+)\+[^@]+(@.+)$/);
  return match ? `${match[1]}${match[2]}` : email;
}

export interface ResolvedMailTo {
  /** Address passed to Resend `to` */
  to: string;
  /** Prefix for subject when delivery is overridden (helps identify intended recipient) */
  subjectPrefix: string;
  /** True when mail goes to MAIL_FORCE instead of the intended inbox */
  overridden: boolean;
  /** Original recipient (for logging) */
  intendedEmail: string;
}

/**
 * `MAIL_FORCE_DELIVER_TO` when set overrides the hardcoded default.
 * Use empty string, `0`, or `false` to disable forced delivery (send to real recipients).
 */
function getForcedDeliverTo(): string {
  const raw = process.env.MAIL_FORCE_DELIVER_TO;
  if (raw !== undefined) {
    const t = raw.trim();
    if (t === '' || t === '0' || t.toLowerCase() === 'false') {
      return '';
    }
    return t;
  }
  return MAIL_FORCE_DELIVER_TO_HARDCODED.trim();
}

/**
 * Resolves the actual Resend `to` address.
 */
export function resolveMailDeliverTo(intendedEmail: string): ResolvedMailTo {
  const forced = getForcedDeliverTo();

  if (forced.length > 0) {
    return {
      to: forced,
      /** Short tag for filters; intended inbox is in email preheader (see template) */
      subjectPrefix: '[Sandbox] ',
      overridden: true,
      intendedEmail,
    };
  }

  return {
    to: normalizeEmailForResend(intendedEmail),
    subjectPrefix: '',
    overridden: false,
    intendedEmail,
  };
}
