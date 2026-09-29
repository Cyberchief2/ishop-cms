'use strict';

module.exports = (plugin) => {
  plugin.controllers.auth.googleCallback = require('./controllers/auth').googleCallback;
  return plugin;
};