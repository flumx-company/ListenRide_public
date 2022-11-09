module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'es6': true
  },
  'extends': ["eslint:recommended"],
  'globals': {
    'angular': true,
    '_': true,
    'moment': true,
    '$': true,
    'jQuery': true,
    'google': true,
    'ga': true,
    'paypal': true,
    'coview': true,
    'braintree': true,
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'rules': {
    'no-console': 0,
    'no-useless-escape': 0,
    'no-unused-vars': 0,
  }
};
