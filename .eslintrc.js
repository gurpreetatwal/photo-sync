'use strict';

const E = 'error';

const config = {
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2017, // support async/await
  },
  env: {
    es6: true,
    node: true
  },
  rules: {
    'indent': [E, 2],
    'linebreak-style': [E, 'unix'],
    'quotes': [E, 'single'],
    'semi': [E, 'always']
  }
};

module.exports = config;
