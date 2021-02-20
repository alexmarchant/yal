module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'standard'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'no-console': 'off',
    "no-useless-escape": 0,
    "no-debugger": 1,
    "no-unused-vars": 0,
    "indent": "off",
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/explicit-function-return-type": 1
  },
  overrides: [{
    files: [
      '**/tests/**/*.{j,t}s?(x)'
    ],
    env: {
      jest: true
    }
  }]
}