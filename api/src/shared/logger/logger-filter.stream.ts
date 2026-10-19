import { Transform } from 'stream';

const FILTERED_CONTEXTS = ['InstanceLoader', 'RouterExplorer', 'RoutesResolver'];
const FILTERED_PATTERNS = [
  /dependencies initialized$/,
  /^Mapped \{/,
  / route$/,
  /^Unsupported route path/,
  /LegacyRouteConverter/,
  /Controller \{[^}]+\}:$/,
];

function shouldFilter(log: Record<string, unknown>): boolean {
  const context = log.context;
  if (typeof context === 'string' && FILTERED_CONTEXTS.includes(context)) {
    return true;
  }
  const msg = String(log.msg ?? log.message ?? '');
  return FILTERED_PATTERNS.some(p => p.test(msg));
}

export function createFilterStream(destination: NodeJS.WritableStream): NodeJS.WritableStream {
  const filter = new Transform({
    objectMode: false,
    transform(
      chunk: Buffer,
      _encoding: BufferEncoding,
      callback: (err?: Error | null, data?: Buffer) => void,
    ) {
      const line = chunk.toString();
      if (line.trim() === '') {
        callback(null, chunk);
        return;
      }
      try {
        const log = JSON.parse(line) as Record<string, unknown>;
        if (shouldFilter(log)) {
          callback(null);
          return;
        }
      } catch {}
      callback(null, chunk);
    },
  });
  filter.pipe(destination);
  return filter;
}
