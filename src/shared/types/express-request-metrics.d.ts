import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    /** Set by RequestIdMiddleware for HTTP metrics duration on error paths. */
    metricsStartTimeMs?: number;
  }
}
