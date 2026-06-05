/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./index.cjs'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // NestJS controller/service methods are typed by decorators & DI — return types are noise
    '@typescript-eslint/explicit-function-return-type': 'off',
    // False positive for packages like openai, @nestjs/*, etc. that export both default+named
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
  },
};
