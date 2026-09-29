'use strict';

module.exports = (plugin) => {
  // Override the Google callback
  plugin.controllers.auth.googleCallback = require('./controllers/auth').googleCallback;
  return plugin;
};