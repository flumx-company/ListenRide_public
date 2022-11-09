'use strict';

angular.
  module('listnride').
  filter('addText', [function () {
    return function (input, text) {
      return input.length ? input + text : input;
    }
  }]);
