// D3 Factory
angular.module('monitor')
.factory('d3', function() {

  /* We could declare locals or other D3.js
     specific configurations here. */

  return d3;
})

// D3 Loader service
.factory('SimpleD3Loader', ["d3", 
  function(d3) {
    return function(url, callback) {
      d3.text(url, 'text/plain', callback);
    };
}])

// Simple Http loader service
.factory('SimpleHttpLoader', ["$http",
  function($http) {
    return function(url, params) {
      console.log(params);
      return $http.get(url, { params: params, cache: true })
    }
}])

// Multi-File Http loader service
.factory('HttpLoader', ["$http", "$q",
  function($http, $q) {
    return function(url) {

      /* Create an array of urls */
      var urls = [].concat( url );

      /* Create the Promises */
      var promises = urls.map(function(url) {
        return $http.get(url, { cache: true });
      });

      /* Queue the promises */
      return $q.all(promises);
    };
}])