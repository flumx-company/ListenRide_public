'use strict';

angular.
  module('listnride').
  factory('userApi', ['$localStorage', 'api',
    function($localStorage, api) {
      function getUserData() {
        return api.get('/users/' + $localStorage.userId)
      }
      return {
        getUserData: getUserData
      }
    }
  ]);
