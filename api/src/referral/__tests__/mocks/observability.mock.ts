/** Mock span for OpenTelemetry tracing in tests */
export const createMockSpan = () => ({
  setAttribute: jest.fn(),
  setStatus: jest.fn(),
  end: jest.fn(),
  recordException: jest.fn(),
});

/** Mock ObservabilityService that executes the callback with the span */
export const createMockObservabilityService = (span = createMockSpan()) => ({
  withSpan: jest.fn(<T>(_name: string, fn: (s: unknown) => Promise<T>) => fn(span)),
});
