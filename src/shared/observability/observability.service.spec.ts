import { sanitizeMetricRoute } from './observability.service';

describe('sanitizeMetricRoute', () => {
  it('replaces numeric path segments', () => {
    expect(sanitizeMetricRoute('/api/users/123/posts/45')).toBe('/api/users/:id/posts/:id');
  });

  it('replaces UUID-like segments', () => {
    expect(sanitizeMetricRoute('/api/x/550e8400-e29b-41d4-a716-446655440000')).toBe('/api/x/:id');
  });

  it('replaces long opaque alphanumeric segments', () => {
    expect(sanitizeMetricRoute('/api/t/V1StGXR8_Z5jdHi6B')).toBe('/api/t/:id');
  });

  it('strips query string', () => {
    expect(sanitizeMetricRoute('/api/items/1?foo=bar')).toBe('/api/items/:id');
  });
});
