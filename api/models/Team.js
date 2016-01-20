/* global Team:true */
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

  /**
   * Creates a new team
   */
  create: function create(data) {
    'use strict';

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/team/create',
      method: 'POST',
      data: data,
      headers: { 'Content-Type': 'application/json' }
    }, true);
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
  find: function find(query) {
    'use strict';

    return new adBox(sails.config.adBox.token, sails.config.adBox).req({
      path: '/team/find',
      method: 'GET',
      data: query,
      headers: { 'Content-Type': 'application/json' }
    }, true);
  },

  /**
   * Deletes an existing user
   * @param {string} team id
   */
  delete: function delete(teamId) {
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
    // TODO: chris will provide an endpoint for it
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
