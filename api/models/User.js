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
    var self = this;

    if (!sails.config.adBox) {

      sails.log.error('sails.config.adBox is undefined');
      sails.log.error('make sure to add the adBox keys to your sails configs');
      sails.log.error('see https://bitbucket.org/boxfish-ondemand/web-presentation-tool/src/90349e832f8704e8f1c63cf25a968facd6d4afbe/config/env/development.js?at=master&fileviewer=file-view-default#development.js-34');
    } else {
      
      sails.log.debug(sails.config.adBox);
    }

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
        deferred.reject({ message: 'Internal Server error' });
      }

    }, function(err) {
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
   * Gets user by id
   */
  getById: function getById(userId) {

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/' + userId,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, true);

  },

  /**
   * Get user teams
   */
  getUserTeams: function getUserTeams(email) {

    var deferred = promise.defer();

    // refresh the session for the current user
    this.findByEmail(email).then(function(user) {

      var teams = user.userTeamRoles.map(function(i) {

        return {
          id: i.team.id,
          name: i.team.name,
          platform: 'twitter',
          teamRole: i.teamRole.name
        };
      });

      deferred.resolve(teams);

    }, deferred.reject);

    return deferred;

  },

  /**
   * Update the users profile information
   * @method updateProfile
   * @param  {String} token - the user token
   * @param  {Object} user - the user object
   * @return {Promise} returns promise
   */
  updateBasicProfile: function updateBasicProfile(user, firstName, lastName, company, avatar) {

    var deferred = promise.defer();
    var url = '/user/' + user.id;

    this.findByEmail(user.email).then(function(userFromDb) {

      var userToSend = {
        firstName   : firstName || userFromDb.firstName,
        lastName    : lastName || userFromDb.lastName,
        company     : company || userFromDb.company,
        avatar      : avatar || userFromDb.avatar
      };

      sails.log.debug('updateBasicProfile'.green, url, userToSend);

      new adBox(user.token, sails.config.adBox).req({
        path: url,
        method: 'PUT',
        data: userToSend,
        headers: { 'Content-Type': 'application/json' }
      }, true).then(deferred.resolve, deferred.reject);

    }, deferred.reject);

    return deferred;

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
