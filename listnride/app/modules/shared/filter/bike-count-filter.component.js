'use strict';

angular.module('bikeCountFilter', [])
  .component('bikeCountFilter', {
    templateUrl: 'app/modules/shared/filter/bike-count-filter.template.html',
    controllerAs: 'bikeCountFilter',
    bindings: {
      currentValues: '=',
      onFilterChange: '<?',
      excludedValues: '<?',
    },
    controller: [
      '$translate',
      'bikeOptions',
      function BikeCountFilterController($translate, bikeOptions) {
        var bikeCountFilter = this;

        bikeCountFilter.$onInit = function () {
          // methods
          bikeCountFilter.increaseBikesCount = increaseBikesCount;
          bikeCountFilter.decreaseBikesCount = decreaseBikesCount;

          // values
          bikeCountFilter.currentValues = bikeCountFilter.currentValues || [];
          bikeCountFilter.sizes = [];

          //invocations
          bikeOptions.sizeOptions(bikeCountFilter.excludedValues).then(function (resolve) {
            bikeCountFilter.sizes = resolve;
            if (!bikeCountFilter.currentValues.length) bikeCountFilter.currentValues = [bikeCountFilter.sizes[0].value];
          });
        };


        function increaseBikesCount() {
          bikeCountFilter.currentValues.push(bikeCountFilter.currentValues[0]);
          if (typeof bikeCountFilter.onFilterChange === "function") bikeCountFilter.onFilterChange();
        }

        function decreaseBikesCount() {
          if (bikeCountFilter.currentValues.length <= 1) return;
          bikeCountFilter.currentValues.pop();
          if (typeof bikeCountFilter.onFilterChange === "function") bikeCountFilter.onFilterChange();
        }

      }
    ]
  });
