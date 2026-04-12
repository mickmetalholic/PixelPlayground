/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      moduleFileExtensions: ['js', 'json', 'ts'],
      rootDir: 'src',
      testRegex: '.*\\.spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: ['**/*.(t|j)s', '!**/*.spec.ts', '!**/main.ts'],
      coverageDirectory: '../coverage',
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    {
      displayName: 'e2e',
      testEnvironment: 'node',
      moduleFileExtensions: ['js', 'json', 'ts'],
      rootDir: 'test',
      testRegex: '.*\\.e2e-spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
    },
  ],
};
