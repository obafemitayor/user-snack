module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: true,
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    // React 17+ with new JSX transform doesn't require React in scope
    'react/react-in-jsx-scope': 'off',
    // Using TS types instead of PropTypes
    'react/prop-types': 'off',
    // Enforce braces for all control statements
    curly: ['error', 'all'],
    // Example import ordering
    'import/order': [
      'warn',
      {
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    // Allow console.error but warn on other console usage
    'no-console': [
      'warn',
      { allow: ['error'] },
    ],
    // Allow empty catch blocks (common when intentionally ignoring errors like localStorage)
    'no-empty': ['error', { allowEmptyCatch: true }],
    // Too strict for typical React apps; keep as a warning globally
    '@typescript-eslint/no-explicit-any': 'warn',
    // Plugin import rule that is noisy with axios default export
    'import/no-named-as-default-member': 'off',
  },
  ignorePatterns: ['build/', 'dist/', 'coverage/', 'node_modules/', 'public/'],
  overrides: [
    {
      files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
      env: { jest: true },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      },
    },
  ],
};
