var colors = require('colors');
var extend = require('deep-extend');
var User = require('./api/models/User.js');
var Team = require('./api/models/Team.js');

/**
 * Get the local route path
 */
var _getViewRoute = function _getViewRoute(name) {
  return __dirname + '/views/auth/' + name + '.ejs';
};

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

        /**
         * Shows the register view
         */
        'GET /register': function (req, res, next) {
          'use strict';
          return res.view(_getViewRoute('register'), { title: 'Register' });
        },

        /**
         * Register an user POST
         */
        'POST /register': function (req, res, next) {
          'use strict';
          if ( req.param('password') !== req.param('confirm-password') ) {
            return res.view(_getViewRoute('register'), { message : 'Passwords do not match', title: 'Register' });
          }

          var user = {
            email       : req.param('email'),
            password    : req.param('password'),
            firstName   : req.param('firstName'),
            lastName    : req.param('lastName'),
            avatar      : 'THUMB',
            jobTitle    : 'Ad Ops'
          };

          // Creates the client with the API
          User.create(user).then(function(data) {

            // NOTE: we want to avoid putting the users password in the session
            if ( data.hasOwnProperty('password') ) {
              delete data.password;
            }

            user.password = null;
            delete user.password;

            req.session.user = data;
            return res.redirect('/');
          }, function(err) {
            sails.log.error('ERROR -------->'.red, err);
            return res.view(_getViewRoute('register'), { message : err.messages[0], title: 'Register' });
          });
        },

        /**
         * Renders the login form
         */
        'GET /login': function(req, res, next) {
          'use strict';
          var target = req.param('target') || '/';

          if (typeof req.session.user === 'undefined' || req.session.user === null) {
            return res.view(_getViewRoute('login'),
              {
                title: 'Login',
                target: target
              });
          } else {
            return res.redirect('/');
          }
        },

        /**
         * Login post
         */
        'POST /login': function(req, res, next) {
          'use strict';
          var email = req.param('email');
          var pass = req.param('password');
          var target = req.param('target') || '/';

          // authenticate the user
          User.login(email, pass).then(function(data) {

            sails.log.info('User has just logged in'.green, data);

            res.status(200);
            delete data.password;
            req.session.user = extend(data.user, { token: data.token });
            req.session.authenticated = true;

            // setting the team id in the user object
            if (data.user.teams.length > 0) {
              if (data.user.teams.length === 1) {
                req.session.user.teamId = data.user.teams[0].id;
              } else {
                req.session.user.teamId = data.user.teams.filter(function(i) {
                  return !/boxfish/ig.test(i.name) ? i : null;
                })[0].id;
              }
            }

            sails.log.debug('User has just mapped out'.green, req.session.user);
            sails.log.debug(new Date(), 'redirect to', target);

            return res.redirect(target);

          }, function(error) {

            sails.log.debug(new Date(), 'ATTEMPTED USER LOGIN:', error);
            res.status(403);
            return res.view(_getViewRoute('login'),
              {
                message: 'Incorrect Username or Password',
                title: 'Login',
                target: target
              });

          });
        },

        /**
         * User Logout
         * @return redirect to the login view
         */
        'GET /logout': function(req, res) {
          'use strict';
          req.session.destroy();
          return res.redirect('/');
        },

        /**
         * User Logout
         * @return redirect to the login view
         */
        'POST /logout': function(req, res) {
          'use strict';
          req.session.destroy();
          return res.redirect('/');
        },

        /**
         * request password reset
         *
         * :GET shows the form asking for the email address
         *
         */
        'GET /request_password_reset': function( req, res ) {
          'use strict';
          if (req.method === 'get' || req.method === 'GET') {
            return res.view(_getViewRoute('request_password_reset'), {
              title: 'Request New Password',
              message: ''
            });
          }

        },

        /**
         * request password reset
         *
         * :POST generates the token and sends the email with the reser URL
         *
         */
        'POST /request_password_reset': function( req, res ) {

          'use strict';

          var regExp = new RegExp('[^\\.\\s@][^\\s@]*(?!\\.)@[^\\.\\s@]+(?:\\.[^\\.\\s@]+)*', 'ig');

          // validate email
          if (!regExp.test(req.param('email'))) {
            return res.view(_getViewRoute('request_password_reset'), {
              title: 'Request New Password',
              message: 'Invalid Email Address.'
            });
          }

          // TODO: check token and update password
          User.requestResetPassword(req.param('email'), req).then(function() {
            return res.view(_getViewRoute('request_password_success'), {
              title: 'Request New Password',
              message: 'Invalid Email Address.'
            });
          }, function() {
            return res.serverError(arguments);
          });

        },

        /**
         * Resets the users password if the url has the correct token
         *
         * : GET shows the form with the passwords field
         * : POST resets the password if validated and redirect use to /login
         *
         * @param  {[type]} req
         * @param  {[type]} res
         * @return {view}
         */
        'GET /resetPassword': function(req, res) {

          'use strict';

          var token = req.param('token');
          var email = req.param('email');
          return res.view(_getViewRoute('reset_password'), {
            title: 'Reset Password',
            token: token,
            email: email
          });

        },

        /**
         * Resets the users password if the url has the correct token
         *
         * : GET shows the form with the passwords field
         * : POST resets the password if validated and redirect use to /login
         *
         * @param  {[type]} req
         * @param  {[type]} res
         * @return {view}
         */
        'POST /resetPassword': function(req, res) {

          'use strict';

          var token = req.param('token');
          var email = req.param('email');

          if (!token) return res.badRequest('Missing token');
          if (!email) return res.badRequest('Missing email address');

          User.resetPassword(email, token, req.param('password'), req.param('confirm-password')).then(function() {

            return res.redirect('/login');

          }, function(message) {

            return res.view(_getViewRoute('reset_password'), {
              title: 'Reset Password',
              message: message,
              token: token,
              email: email
            });

          });

        },

        // TEAMS SECTION
        'POST /team/create': function(req, res) {

        }

      },
      before: {

      }

    }

  }

};
