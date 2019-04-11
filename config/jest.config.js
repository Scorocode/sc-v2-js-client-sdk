const { defaults } = require('jest-config')
const scAppConfig = require('./scApp.config')

const tsJestConfig = {
  skipBabel: true,
}

const config = {
  rootDir: '..',
  transform: /** @type {any} */ ({
    '^.+\\.(ts|tsx)$': 'ts-jest',
  }),
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.ts?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).ts?(x)',
  ],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  globals: {
    'ts-jest': tsJestConfig,
    __SC_APP_CONFIG__: scAppConfig,
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = config
