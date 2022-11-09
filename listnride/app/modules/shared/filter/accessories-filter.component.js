'use strict';

angular.module('accessoriesFilter', [])
  .component('accessoriesFilter', {
    templateUrl: 'app/modules/shared/filter/accessories-filter.template.html',
    controllerAs: 'accessoriesFilter',
    bindings: {
      currentAccessories: '=',
      onFilterChange: '<'
    },
    controller: [
      'bikeOptions',
      function AccessoriesFilterController(bikeOptions) {
        var accessoriesFilter = this;

        accessoriesFilter.$onInit = function () {
          // methods
          accessoriesFilter.toggle = toggle;
          accessoriesFilter.exists = exists;

          // variables
          accessoriesFilter.accessories = [];
          bikeOptions.accessoryOptions().then(function (resolve) {
            accessoriesFilter.accessories = resolve;
          });
        };

        function toggle(item, list) {
          var idx = list.indexOf(item);
          if (idx > -1) {
            list.splice(idx, 1);
          } else {
            list.push(item);
          }
          if (typeof accessoriesFilter.onFilterChange === "function") accessoriesFilter.onFilterChange();
        }

        function exists(item, list) {
          return list.indexOf(item) > -1;
        }
      }
    ]
  });

