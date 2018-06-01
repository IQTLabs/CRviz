//config-overrides.js

const rewireEslint = require('react-app-rewire-eslint');
module.exports = function override(config, env) {
 config = rewireEslint(config, env);
 return config;
}