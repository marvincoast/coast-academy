/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './index.cjs',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/prop-types': 'off',
    // False positives for react-hot-toast (toast), i18next (i18n), react-dom (ReactDOM)
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
  },
};
