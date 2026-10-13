import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: true,
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
    '/shared/branding/assets/.*\\.svg$': '<rootDir>/../experience/jest.asset-url.cjs',
    '\\.(svg)$': 'jest-transformer-svg',
    '\\.(png|ico)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    '^(.*\\.svg)\\?url$': '$1',
    '^@branding/(.*)$': '<rootDir>/../experience/src/shared/branding/$1',
    '^@/(.*)\\.svg\\?react$': '<rootDir>/src/$1.svg',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@logto/shared/(.*)$': '<rootDir>/../shared/lib/$1',
    '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: ['node_modules/(?!(.*(nanoid|jose|ky|@logto|@silverhand))/)'],
};

export default config;
