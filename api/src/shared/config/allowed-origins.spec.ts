import { ForbiddenException } from '@nestjs/common';
import { assertTrustedOrigin, resolveAllowedOrigins, trustProxyHops } from './allowed-origins';

describe('allowed origins', () => {
  it('uses CORS_ORIGINS when it is set', () => {
    expect(
      resolveAllowedOrigins({
        CORS_ORIGINS: ' https://app.example , http://localhost:5173 ',
        FRONTEND_URL: 'https://ignored.example',
      }),
    ).toEqual(['https://app.example', 'http://localhost:5173']);
  });

  it('falls back to a trimmed FRONTEND_URL', () => {
    expect(resolveAllowedOrigins({ FRONTEND_URL: ' http://localhost:5173 ' })).toEqual([
      'http://localhost:5173',
    ]);
  });

  it('returns no origins when neither variable is set', () => {
    expect(resolveAllowedOrigins({})).toEqual([]);
  });

  it('allows a missing Origin', () => {
    expect(() => assertTrustedOrigin(undefined, ['https://app.example'])).not.toThrow();
  });

  it('rejects an Origin outside the allow list', () => {
    expect(() => assertTrustedOrigin('https://evil.example', ['https://app.example'])).toThrow(
      ForbiddenException,
    );
  });

  it('reads only a numeric trust-proxy hop count', () => {
    expect(trustProxyHops('1')).toBe(1);
    expect(trustProxyHops('true')).toBeUndefined();
    expect(trustProxyHops(undefined)).toBeUndefined();
  });
});
