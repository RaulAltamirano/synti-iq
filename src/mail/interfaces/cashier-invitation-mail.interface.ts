export interface CashierInvitationMailParams {
  email: string;
  firstName: string;
  /** Full URL including token query string */
  setPasswordUrl: string;
  /** When mail delivery is forced to a test inbox, shown in preheader so the subject stays short */
  sandboxIntendedEmail?: string;
}
