/** Jest config for scripts/ tests. Run with: yarn test:scripts */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/scripts/**/*.spec.js'],
  testEnvironment: 'node',
};
