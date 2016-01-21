// var colors = require('colors');
// var extend = require('deep-extend');
// var Team = require('./../models/Team.js');
//
// /**
//  * Get the local route path
//  */
// var _getViewRoute = function _getViewRoute(name) {
//   return __dirname + '/../../views/' + name + '.ejs';
// };
//
// module.exports = {
//   /**
//    * Your list of teams
//    */
//   index: function index(req, res) {
//
//     'use strict';
//
//     Team.find(req.session.user, { }).then(function(teams) {
//
//       console.log(teams);
//
//       return res.view(_getViewRoute('teams/list'), {
//         title: 'Your Teams',
//         teams: teams
//       });
//
//     }, function(err) {
//       return res.serverError(err);
//     });
//
//   },
//
//   'GET /team/create': function(req, res) {
//
//   },
//
//   'POST /team/create': function(req, res) {
//
//   }
// };
