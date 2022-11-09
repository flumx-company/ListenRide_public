angular.module('list').directive('showAsInteger', ['$filter', function ($filter) {
  return {
    terminal: true,
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, ngModel) {

      // fix up the incoming number to make sure
      // it will parse into a number correctly
      function parseNumber(number) {
        if (number) {
          if (typeof number !== 'number') {
            number = number.replace(',', '');
            number = parseFloat(number);
          }
        }
        return number;
      }

      // function to do the rounding
      function roundAsInteger(number) {
        number = parseNumber(number);
        if (number === 0) return number;
        else if (number >= 0) return $filter('number')(number, 0);
      }

      // do nothing if no ng-model
      if (!ngModel) return;

      // Listen for change events to enable binding
      element.bind('blur', function () {
        element.val(roundAsInteger(ngModel.$modelValue));
      });

      // push a formatter so the model knows how to render
      ngModel.$formatters.push(function (value) {
        if (value) return roundAsInteger(value);
      });

      // push a parser to remove any special
      // rendering and make sure the inputted number is rounded
      ngModel.$parsers.push(function (value) {
        return value;
      });
    }
  };
}]);