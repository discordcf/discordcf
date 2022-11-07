module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'standard-with-typescript',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  rules: {
    '@typescript-eslint/comma-dangle': ['error', 'only-multiline'],
    '@typescript-eslint/space-before-function-paren': ['error', 'never'],
  },
}
