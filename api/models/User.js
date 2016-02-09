/* global User:true */
var promise       = require('promised-io/promise');
var adBox         = require('boxfish-router');
var colors        = require('colors');

/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {

  clientId : {
   type: 'string',
   unique: true
  },

  _namespace: '/dev',

  username: {
    type: 'string',
    unique: true
  },

  password: {
    type: 'string'
  },

  client_sesecret : { type: 'string' }, // jshint ignore:line

  resource_ids : { // jshint ignore:line
    type: 'string',
    defaultsTo: 'boxfish-api'
  },

  scope : {
   type: 'string',
   defaultsTo: 'read,write'
  },

  authorized_grant_types : { // jshint ignore:line
    type: 'string',
    defaultsTo: function () {
        'use strict';
        return 'password,client_credentials,refresh_token';
    }
  },

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

    sails.log.debug('USER TRYING TO LOGIN:'.yellow, email);

    new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/login',
      method: 'POST',
      data: {
        email: email,
        password: password
      },
      headers: { 'Content-Type': 'application/json' }
    }, requireAuth).then(function(data) {

      console.log(data);

      if (data.user == null) {
        deferred.reject('Wrong Credentials');
        return;
      }

      if (data) {
        // data.user.email = data.user.email.value;
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

    sails.log.debug('Creating User', user);

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

    sails.log.debug('[requestResetPassword] Starting'.green);

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/reset?email=' + email,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, true).then(function(token) {

      sails.log.debug('[requestResetPassword] Request Complete'.green);
      sails.log.debug('[requestResetPassword] Reading Template'.green);

      // send email
      var url = req.protocol + '://' + req.host + '/resetPassword?token=' + token + '&email=' + email;

      fs.readFile(template, 'utf8', function(err, file) {

        sails.log.debug('[requestResetPassword] File Read Complete'.green);

        var html = require('ejs').render(file, {
          title: 'Password Update Request',
          link: url
        });

        sails.log.debug('[requestResetPassword] Sending Email'.green);

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
