// Invoke 'strict' JavaScript mode
'use strict';

// Configure the 'monitor' module routes
angular.module('monitor').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'monitor/views/monitor.client.view.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);
