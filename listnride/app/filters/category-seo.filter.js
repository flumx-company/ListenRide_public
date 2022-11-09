angular.
  module('listnride').
  filter('categorySeo', ['$translate', function($translate) {
    return function(category) {
      switch(category) {
        case 'urban': return 1;
        case 'e-bike': return 2;
        case 'road': return 3;
        case 'all-terrain': return 4;
        case 'transport': return 5;
        case 'kids': return 6;
        case 'special': return 7;
        default: return "";
      }
    };
  }]);
