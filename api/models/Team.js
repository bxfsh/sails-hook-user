/* global Team:true */
var promise       = require('promised-io/promise');
var AdBox         = require('boxfish-router');
var colors        = require('colors');

/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {

  /**
   * make a request to the keywords Service
   * @param  {Object} user [(required) the user]
   * @param  {String} path [(required) the url]
   * @param  {String} method [(required) request method]
   * @param  {Object} data
   * @return {Promise} Returns a new promise
   */
  _serviceRequest: function _serviceRequest(user, path, method, data, headers) {

    'use strict';

    if (!user) {
      throw 'You cannot make a request without a user';
    } else {
      if (!user.token) {
        throw 'Missing token in user object';
      }
      if (!user.teamId) {
        throw 'Missing teamId in user object';
      }
    }

    // sails.log.debug('--------'.green);
    // sails.log.debug('Audience.js model: MAKING REQUEST'.green);
    // sails.log.debug(sails.config.adBox.token.blue);
    // sails.log.debug(sails.config.adBox.host.blue);
    // sails.log.debug(sails.config.adBox.port.toString().blue);

    return new AdBox(user.token, sails.config.adBox).req({
      path: '/' + path,
      method: method,
      data: data,
      headers: headers
    });

  },

  /**
   * Creates a new team
   */
  create: function create(user, data) {
    'use strict';

    return this._serviceRequest(
      user,
      '/team/create',
      'GET',
      data,
      { 'Content-Type' : 'application/json' });

  },

  /**
   * Updates the team entry
   */
  update: function update(team) {
    'use strict';

    if (!team.id) {
      var deferred = promise.defer();
      deferred.reject('Missing team id');
      return deferred;
    }

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/team/update/' + team.id,
      method: 'PUT',
      data: team,
      headers: { 'Content-Type': 'application/json' }
    }, true);
  },

  /**
   * Get team by id
   */
  getById: function getById(id) {

    'use strict';

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/team/read',
      method: 'GET',
      data: { id: id },
      headers: { 'Content-Type': 'application/json' }
    }, true);

  },

  /**
   * Search
   * @param {Object} search query
   */
  find: function find(user, query) {
    'use strict';

    return this._serviceRequest(
      user,
      'team/find',
      'GET',
      query,
      { 'Content-Type' : 'application/json' });

  },

  /**
   * Deletes an existing user
   * @param {string} team id
   */
  delete: function remove(teamId) {
    'use strict';

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/team/' + teamId,
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }, true);
  },

  /**
   * Invite an user to a team
   */
  inviteUser: function inviteUser(teamId, email) {
    // TODO: checks if the user already exists
    // TODO: if not, send registration invite
    // TODO: else, send the invitation email with single link to accept
  },

  /**
   * accept invitation and enter a team
   */
  acceptInvitation: function acceptInvitation(teamId, userId, token) {
    var deferred = promise.defer();

    // TODO: Check token

    // add user to the team
    this.addUsers(teamId, [userId]).then(deferred.resolve, deferred.reject);
    return deferred;
  },

  /**
   * adds users to the a team
   */
  addUsers: function addUsers(teamId, userIds) {

    'use strict';

    // TODO: get team by id
    // TODO: update the list of users in the team
    // OR
    // TODO: chris will provide an easy endpoint for it
  },

  /**
   * Removes users to the a team
   */
  removeUsers: function removeUsers(teamId, userIds) {

    'use strict';

    // TODO: get team by id
    // TODO: update the list of users in the team
    // OR
    // TODO: chris will provide an endpoint for it
  }

}
