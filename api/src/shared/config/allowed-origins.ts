import { ForbiddenException } from '@nestjs/common';

type OriginEnv = {
  CORS_ORIGINS?: string;
  FRONTEND_URL?: string;
};

export function resolveAllowedOrigins(env: OriginEnv = process.env): string[] {
  const raw = env.CORS_ORIGINS?.trim();
  if (raw) {
    return raw
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);
  }
  const frontend = env.FRONTEND_URL?.trim();
  return frontend ? [frontend] : [];
}

export function assertTrustedOrigin(
  originHeader: string | string[] | undefined,
  allowed: string[] = resolveAllowedOrigins(),
): void {
  if (originHeader == null || originHeader === '') return;
  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  if (!origin || !allowed.includes(origin)) {
    throw new ForbiddenException('Untrusted origin');
  }
}

export function trustProxyHops(raw: string | undefined): number | undefined {
  if (!raw || !/^\d+$/.test(raw.trim())) return undefined;
  return Number(raw.trim());
}
