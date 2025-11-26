module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Strict type safety
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],

    // Import rules
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',

    // Architectural boundaries
    'import/no-restricted-paths': ['error', {
      zones: [
        // Frontend cannot import backend
        {
          target: './apps/frontend/src',
          from: './apps/backend/src',
          message: 'Frontend cannot import from backend. Use GraphQL API.',
        },
        // Resolvers must use services, not repositories
        {
          target: './apps/backend/src/resolvers',
          from: './apps/backend/src/repositories',
          message: 'Resolvers must use services layer, not repositories directly.',
        },
        // Domain cannot depend on infrastructure
        {
          target: './apps/backend/src/domain',
          from: './apps/backend/src/infrastructure',
          message: 'Domain layer must be infrastructure-agnostic.',
        },
        // Services cannot import resolvers
        {
          target: './apps/backend/src/services',
          from: './apps/backend/src/resolvers',
          message: 'Services cannot depend on presentation layer (resolvers).',
        },
        // Domain cannot import from services
        {
          target: './apps/backend/src/domain',
          from: './apps/backend/src/services',
          message: 'Domain entities should not depend on application services.',
        },
      ],
    }],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./apps/*/tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
  },
};
