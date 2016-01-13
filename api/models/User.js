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
   * @param  {[type]}   email
   * @param  {[type]}   password
   * @param  {Function} callback
   * @return {[type]}
   */
  login: function( email, password ) {

    'use strict';

    var deferred = promise.defer();
    var requireAuth = false;

    if (email && email.toLowerCase() === 'boxfish' && password === '1133557799') {

      sails.log.debug('User Login for Boxfish'.green, 'hardcoded pass');

      // hard coded credentials
      deferred.resolve({
        user : {
          username: 'boxfish',
          email: 'services@boxfish.com',
          teams: [{
            id: '8a8083f24d4a7a7a014d4a7a86460001',
            name: 'Boxfish',
            platform: 'twitter',
            platformRole: null,
            teamRole: 'user'
          }]
        },
        token: 'c1a25bb8-8f4f-4033-818e-7f3c3729977b'
      });

    } else {

      sails.log.debug('USER TRYING TO LOGIN:'.yellow, email);

      // curl -i -X POST -H "Content-Type:application/json" -d
      // '{"email" : "clatko@boxfish.com", "password": "tester"}'
      // http://staging-microservices.boxfish.com:8080/user/login

      new adBox(sails.config.adBox.token, sails.config.adBox).req({
        path: '/user/login',
        method: 'POST',
        data: {
          email: email,
          password: password
        },
        headers: { 'Content-Type': 'application/json' }
      }, requireAuth).then(function(data) {
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

    }

    return deferred;

  },

  /**
   * Try to create a new user
   * @param  {[type]}   user
   * @param  {Function} callback
   */
  create: function create(user) {

    'use strict';

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/create',
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
   * @param  {[type]} email [description]
   * @return {[type]}       [description]
   */
  requestResetPassword: function requestResetPassword(email, req) {

    var deferred = promise.defer();

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/user/reset?email=' + email,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, true).then(function(token) {

      sails.log.success(email, 'Successfully requested to reset password', 'token', token);

      // send email
      var url = req.protocol + '://' + req.host + '/auth/resetPassword?token=' + token + '&email=' + email;

      // rendering the template
      var file = require('fs').readFileSync('views/emailTemplates/general.ejs', 'utf-8');
      var template = require('ejs').render(file, {
        title: 'Password Update Request',
        body: 'You have forgotten your password.',
        link: url,
        buttonText: 'Click here to Update'
      });

      sails.hooks.email.send(
        'services@bofish.com',
        [email],
        'Password Reset Request',
        null,
        template,
        function(err) {
          if (err) deferred.reject(err);
          else deferred.resolve(true);
        }
      );

    }, deferred.reject);

    return deferred;

  },

  /**
   * Resets the user password
   * @param  {[type]} email       [description]
   * @param  {[type]} token       [description]
   * @param  {[type]} pass        [description]
   * @param  {[type]} confirmPass [description]
   * @return {[type]}             [description]
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

  },

  /**
   * upload an image to S3 and update the profile avatar
   * @param  {[type]} user  [description]
   * @param  {[type]} image [description]
   * @return {[type]}       [description]
   */
  uploadAndUpdateProfilePic: function uploadAndUpdateProfilePic(user, image) {

  }

};
