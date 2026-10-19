import type { Request } from 'express';

export function readMetricsKeyFromRequest(req: Request): string | undefined {
  const rawHeader = req.headers['x-metrics-key'];
  const headerVal = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  const auth = req.headers.authorization;
  const bearer =
    typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7).trim() : undefined;
  return (typeof headerVal === 'string' ? headerVal.trim() : undefined) || bearer;
}
