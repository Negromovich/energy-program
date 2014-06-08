'use strict';

/* Filters */

angular.module('energy.filters', []).
    filter('round', function($filter) {
        return function (value, precision) {
            precision = precision || 0;
            return math.round(value, precision).toFixed(precision);
        };
    });
