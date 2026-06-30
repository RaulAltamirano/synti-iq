/** Shared observability mock for auth domain specs — withSpan must invoke the callback (CONVENTIONS). */

export const createMockSpan = (): { setAttribute: jest.Mock } => ({
  setAttribute: jest.fn(),
});

export const createMockObservabilityService = (
  span: { setAttribute: jest.Mock } = createMockSpan(),
): {
  withSpan: jest.Mock;
} => ({
  withSpan: jest.fn(<T>(_name: string, fn: (s: unknown) => Promise<T>) => fn(span)),
});
