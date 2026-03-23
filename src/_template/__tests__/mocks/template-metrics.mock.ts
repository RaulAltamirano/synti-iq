/** Mock TemplateMetricsService for unit tests */
export const createMockTemplateMetricsService = () => ({
  recordCreate: jest.fn(),
  recordList: jest.fn(),
  recordUpdate: jest.fn(),
  recordDelete: jest.fn(),
});
