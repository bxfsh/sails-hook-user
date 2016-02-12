/* global User:true */
var promise       = require('promised-io/promise');
var adBox         = require('boxfish-router');
var colors        = require('colors');

var customLogger = function customLogger() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[Sails-Hook-User]'.magenta);
  sails.log.debug.apply(sails, args);
};

/**
* User.js
*
* @description :: Provides authentication service for Boxfish applications.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {

  /**
   * Checks the user's username and password
   * @param  {String}   email
   * @param  {String}   password
   * @param  {Function} callback
   * @return {Promise}
   */
  login: function( email, password ) {

    'use strict';

    var deferred = promise.defer();
    var requireAuth = false;

    customLogger(email, 'is trying to login.');

    new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/login',
      method: 'POST',
      data: {
        email: email,
        password: password
      },
      headers: { 'Content-Type': 'application/json' }
    }, requireAuth).then(function(data) {

      if (data.user === null) {
        deferred.reject('Wrong Credentials');
        return;
      }

      if (data) {
        deferred.resolve(data);
      } else {
        sails.log.error(arguments);
          deferred.reject({ message: 'Internal Server error' });
      }

    }, function(err) {
      sails.log.error(err);
      deferred.reject(err);
    });

    return deferred;

  },

  /**
   * Find an user by email
   */
  findByEmail: function findByEmail(email) {

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/find?email=' + email,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, true);

  },

  /**
   * Update the users profile information
   * @method updateProfile
   * @param  {String} token - the user token
   * @param  {Object} user - the user object
   * @return {Promise} returns promise
   */
  updateProfile: function updateProfile(token, user) {

    return new adBox(token, sails.config.adBox).req({
      path: '/user/' + user.id,
      method: 'PUT',
      data: user,
      headers: { 'Content-Type': 'application/json' }
    }, true);

  },

  /**
   * Try to create a new user
   * @param  {Object} user
   * @param  {Function} callback
   */
  create: function create(user) {

    'use strict';

    customLogger('Creating User', user);

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/register',
      method: 'POST',
      data: user,
      headers: { 'Content-Type': 'application/json' }
    }, true);

  },

  /**
   * requests a password reset
   *
   * this should generate a token that allows the user to update its
   * password, token should expire in 1 hour
   *
   * @param  {String} email
   * @return {Promise}
   */
  requestResetPassword: function requestResetPassword(email, req) {

    var deferred = promise.defer();
    var template = __dirname + '/../../views/email/reset-password.ejs';
    var fs = require('fs');

    customLogger(email, 'is requesting reset password.');

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/reset?email=' + email,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, true).then(function(token) {

      customLogger('[requestResetPassword] Request Complete'.green);
      customLogger('[requestResetPassword] Reading Template'.green);

      // send email
      var url = req.protocol + '://' + req.host + '/resetPassword?token=' + token + '&email=' + email;

      fs.readFile(template, 'utf8', function(err, file) {

        customLogger('[requestResetPassword] File Read Complete'.green);

        var html = require('ejs').render(file, {
          title: 'Password Update Request',
          link: url
        });

        customLogger('[requestResetPassword] Sending Email'.green);

        sails.hooks.email.send(
          'services@boxfish.com',
          [email],
          'Password Reset Request',
          null,
          html,
          function(err) {
            if (err) {
              sails.log.warn('[requestResetPassword] Error Sending Email'.red, err);
              deferred.reject(err);
            }
            else {
              sails.log.debug('[requestResetPassword] Successfully Sent Email'.green);
              deferred.resolve(true);
            }
          }
        );
      });

    }, deferred.reject);

    return deferred;

  },

  /**
   * Resets the user password
   * @param  {String} email
   * @param  {String} token
   * @param  {String} pass
   * @param  {String} confirmPass
   * @return {Promise} Returns promise
   */
  resetPassword: function resetPassword(email, token, pass, confirmPass) {

    var deferred = promise.defer();

    if (pass !== confirmPass) {

      deferred.reject('Passwords do not match.');

    } else {

      new adBox(sails.config.adBox.token, sails.config.adBox).req({
        path: '/user/reset?email=' + email,
        method: 'POST',
        data: {
          password: pass,
          token : token
        },
        headers: { 'Content-Type': 'application/json' }
      }, true).then(deferred.resolve, deferred.reject);

    }

    return deferred;

  }

};
