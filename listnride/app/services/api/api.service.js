'use strict';

angular.
  module('listnride').
  factory('api', function(
    $http,
    $localStorage,
    ENV
    ) {
      const apiUrl = ENV.apiEndpoint;
      const webappUrl = ENV.webappUrl;

      return {
        get: function(url, type = 'json') {
          return $http({
            method: 'GET',
            url: apiUrl + url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $localStorage.accessToken
            },
            responseType: type
          });
        },
        post: function(url, data) {
          return $http({
            method: 'POST',
            url: apiUrl + url,
            data: data,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $localStorage.accessToken
            }
          });
        },
        put: function(url, data) {
          return $http({
            method: 'PUT',
            url: apiUrl + url,
            data: data,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $localStorage.accessToken
            }
          });
        },
        delete: function(url) {
          return $http({
            method: 'DELETE',
            url: apiUrl + url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $localStorage.accessToken
            }
          });
        },
        getApiUrl: function() {
          return apiUrl;
        },
        getWebappUrl: function() {
          return webappUrl;
        },
        custom: function(options) {
          return $http({
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $localStorage.accessToken
            }
          });
        }
      }
    }
  );
