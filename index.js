var colors = require('colors');
var extend = require('deep-extend');
var TeamController = require('./api/controllers/TeamController.js');
var AuthController = require('./api/controllers/AuthController.js');

module.exports = function (sails) {

  return {

    /**
     * Intialise the hook
     */
    initialize: function(cb) {
      sails.log.info('Initialising sails-hook-user');
      return cb();
    },

    /**
     * Configure the hook
     */
    configure: function() {
    },

    // ROUTES

    routes: {
      after: {

        // Auth and User routes
        'GET /register': AuthController['GET /register'],
        'POST /register': AuthController['POST /register'],
        'GET /login': AuthController['GET /login'],
        'POST /login': AuthController['POST /login'],
        'GET /logout': AuthController['GET /logout'],
        'POST /logout': AuthController['POST /logout'],
        'GET /request_password_reset': AuthController['GET /request_password_reset'],
        'POST /request_password_reset': AuthController['POST /request_password_reset'],
        'GET /resetPassword': AuthController['GET /resetPassword'],
        'POST /resetPassword': AuthController['POST /resetPassword'],

        // Teams Routes
        'GET /teams': TeamController.index

      },
      before: {

      }

    }

  }

};
