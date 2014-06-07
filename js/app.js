'use strict';

angular.module('energy', [
  'ngRoute',
  'energy.filters',
  'energy.services',
  'energy.directives',
  'energy.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/nodes', {templateUrl: 'partials/nodes.html', controller: 'Nodes'});
  $routeProvider.when('/edges', {templateUrl: 'partials/edges.html', controller: 'Edges'});
  $routeProvider.when('/results', {templateUrl: 'partials/results.html', controller: 'Results'});
  $routeProvider.otherwise({redirectTo: '/nodes'});
}]);
