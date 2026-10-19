/** Mock ReferralMetricsService for unit tests */
export const createMockReferralMetricsService = () => ({
  recordValidation: jest.fn(),
  recordCodeGeneration: jest.fn(),
  recordUsage: jest.fn(),
});
