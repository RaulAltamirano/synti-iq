import { createHash } from 'node:crypto';
import { AccountInvitationService } from './account-invitation.service';

describe('AccountInvitationService', () => {
  describe('hashToken', () => {
    it('returns sha256 hex of utf8 input', () => {
      const raw = 'opaque-token-value';
      const expected = createHash('sha256').update(raw, 'utf8').digest('hex');
      expect(AccountInvitationService.hashToken(raw)).toBe(expected);
    });

    it('is deterministic', () => {
      const raw = 'x'.repeat(43);
      expect(AccountInvitationService.hashToken(raw)).toBe(AccountInvitationService.hashToken(raw));
    });
  });
});
