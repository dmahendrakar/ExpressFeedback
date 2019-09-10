// Invoke 'strict' JavaScript mode
'use strict';

angular.module('monitor').factory('SessionService', ['$resource', '$http',
    function ($resource, $http) {
        var service = {
            profileDetails: undefined,
            getProfile: function (hamsid) {
                return $http.get('/api/get/stats/' + hamsid)
                    .then(function (response) {
                        service.profileDetails = response.data;
                        console.log(response);
                        return response;
                    });
            }
        };
        return service;
  }]);
