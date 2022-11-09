'use strict';

angular
  .module('inputRange', [])
  .directive('inputRange', function() {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'app/modules/shared/input-range/input-range.template.html',
      controllerAs: 'vm',
      bindToController: {
        data: '='
      },
      controller: inputRangeController,
      link: function ($scope, element, attrs) {
        $scope.isSingle = attrs.hasOwnProperty('lnrSingleInput');
      }
    }
  });


function inputRangeController($scope) {
  var vm = this;

  vm.start_at = '';
  vm.end_at = '';
  vm.$postLink = postLink;
  vm.isSingle = false;

  function postLink() {
    vm.isSingle = $scope.isSingle;
  }

  $scope.$watch('vm.data.start_date', function () {
    if (vm.data !== undefined && vm.data.start_date) {
      vm.start_at = moment.utc(vm.data.start_date).format('DD.MM.YYYY');
      vm.end_at = moment.utc(vm.data.start_date).add(vm.data.duration, 'seconds').format('DD.MM.YYYY');
    }
  });

}