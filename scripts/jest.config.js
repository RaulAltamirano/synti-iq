/** Jest config for scripts/ tests. Run with: yarn test:scripts or yarn test:cov */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/scripts/**/*.spec.js'],
  testEnvironment: 'node',
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'scripts/**/*.js',
    '!scripts/**/*.spec.js',
    '!scripts/roast-prompt.config.js',
    '!scripts/jest.config.js',
  ],
  coverageDirectory: '<rootDir>/coverage-scripts',
  coverageReporters: ['json'],
};
