'use strict';

angular.module('energy', [
        'ngRoute',
        'energy.filters',
        'energy.services',
        'energy.directives',
        'energy.controllers'
    ]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/nodes', {templateUrl: 'partials/nodes.html', controller: 'Nodes'});
        $routeProvider.when('/edges', {templateUrl: 'partials/edges.html', controller: 'Edges'});
        $routeProvider.when('/results', {templateUrl: 'partials/results.html', controller: 'Results'});
        $routeProvider.when('/regime', {templateUrl: 'partials/regime.html', controller: 'Regime'});
        $routeProvider.when('/branches', {templateUrl: 'partials/branches.html', controller: 'Branches'});
        $routeProvider.otherwise({redirectTo: '/nodes'});
    }])
    .run(function($location) {
       $location.path('/');
    });
