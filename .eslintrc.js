module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'airbnb-base',
  globals: {
    __static: true
  },
  plugins: ['html'],
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    'eqeqeq': 'off',
    'global-require': 'off',
    'import/extensions': 'off',
    'import/newline-after-import': 'off',
    'import/no-unresolved': 'off',
    'no-bitwise': 'off',
    'no-mixed-operators': 'off',
    'no-multi-assign': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-return-assign': 'off',
    'no-unused-vars': 'warn',
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    'max-len': 'off',
    'arrow-parens': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
