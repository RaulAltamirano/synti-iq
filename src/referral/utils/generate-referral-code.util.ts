const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 8;
const MAX_ATTEMPTS = 50;

export async function generateUniqueReferralCode(
  exists: (code: string) => Promise<boolean>,
): Promise<string> {
  let code: string;
  let attempts = 0;

  do {
    if (attempts >= MAX_ATTEMPTS) {
      throw new Error('Unable to generate unique referral code');
    }
    code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    attempts++;
  } while (await exists(code));

  return code;
}
