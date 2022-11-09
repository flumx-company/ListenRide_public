'use strict';

angular.module('filter',[])
  .component('filter', {
    templateUrl: 'app/modules/shared/filter/filter.template.html',
    controllerAs: 'filter',
    bindings: {
      updateState: '<',
      initialValues: '<',
      initialBikes: '<',
      bikes: '=',
      populateBikes: '<',
      categorizedBikes: '=',
      limit: '=',
      dateChange: '<'
    },
    controller: [
      '$translate',
      '$state',
      'bikeOptions',
      'filterFilter',
      function FilterController($translate, $state, bikeOptions, filterFilter) {
        var filter = this;

        // brand
        filter.brands = [$translate.instant("search.all-brands")];
        filter.currentBrand = filter.brands[0];

        filter.$onInit = function () {
          // methods
          filter.onDateChange = onDateChange;
          filter.onBrandChange = onBrandChange;
          // filter.onSizeChange = onSizeChange;
          filter.onSimpleSizeChange = onSimpleSizeChange;
          filter.clearFilters = clearFilters;
          filter.onCategoryChange = onCategoryChange;
          filter.closeDateRange = closeDateRange;

          // variables
          filter.isClearDataRange = false;
          filter.currentDate = filter.initialValues.date;
          // sizes
          // filter.currentSizes = filter.initialValues.sizes.slice();
          filter.currentSize = filter.initialValues.sizes[0];
          // initializeSizeFilter();
          initializeSimpleSizeFilter();


          filter.currentCategories = filter.initialValues.categories.filter(Boolean).slice().map(Number);
        };


        // Wait for bikes to be actually provided
        filter.$onChanges = function (changes) {
          // TODO: initializeBrandFilter inited one time here and one time in applyFilters.
          // Remove unnecessary init @moritz
          if (filter.initialBikes != undefined) {
            filter.bikes = filter.initialBikes;
            initializeBrandFilter();
            applyFilters();
          }
        };

        function onBrandChange() {
          filter.updateState({ brand: filter.currentBrand });
          applyFilters();
        }

        function onDateChange() {
          filter.updateState({
            start_date: filter.currentDate.start_date,
            duration: filter.currentDate.duration
          }, function() {
            filter.dateChange();
          });
        }

        // function onSizeChange() {
        //   filter.updateState({ sizes: filter.currentSizes.join(',') });
        //   applyFilters();
        // };

        function onSimpleSizeChange() {
          filter.updateState({ sizes: filter.currentSize });
          applyFilters();
        }

        function clearFilters() {
          clearState(function(){
            // filter.currentSizes = [-1];
            filter.currentSize = filter.sizes[0].value;
            filter.currentCategories = [];
            filter.openSubs = [];
            filter.currentBrand = filter.brands[0];
            filter.limit = 15;
            clearDate();
            applyFilters();
          });
        }

        function onCategoryChange() {
          filter.updateState({ categories: filter.currentCategories.join(',') });
          applyFilters();
        }

        function clearState(cb) {
          filter.updateState({
            brand: '',
            sizes: '',
            start_date: '',
            duration: '',
            categories: ''
          }, cb);
        }

        function initializeBrandFilter() {
          // Populate brand filter with all available brands
          for (var i=0; i<filter.bikes.length; i++) {
            var currentBrand = filter.bikes[i].brand;
            if (!filter.brands.includes(currentBrand)) {
              filter.brands.push(currentBrand);
            }
          }
          // If filtered brand doesn't exist, switch to default
          if (filter.brands.includes(filter.initialValues.brand)) {
            filter.currentBrand = filter.initialValues.brand;
          }

          // sord brands
          var defaultBrand = filter.brands.shift();
          filter.brands.sort(alphabetical);
          filter.brands.unshift(defaultBrand);
        }

        function alphabetical(a, b) {
          var A = a.toLowerCase();
          var B = b.toLowerCase();
          if (A < B) {
            return -1;
          } else if (A > B) {
            return 1;
          } else {
            return 0;
          }
        }

        function initializeSimpleSizeFilter() {
          filter.sizes = [];
          bikeOptions.sizeOptions().then(function (resolve) {
            filter.sizes = resolve
          });
          if (filter.currentSize === '') filter.currentSize = '-1';
        }

        function applyFilters() {
          var filteredBikes = filter.initialBikes.slice();
          filteredBikes = filterBrands(filteredBikes);
          // filteredBikes = filterSizes(filteredBikes);
          filteredBikes = filterSize(filteredBikes);
          filteredBikes = filterCategories(filteredBikes);
          filter.bikes = filteredBikes;

          filter.categorizedBikes = [{
            title: $translate.instant("search.all-bikes"),
            bikes: filter.bikes
          }];

          initializeBrandFilter();
        }

        function filterBrands(bikes) {
          if (filter.currentBrand != filter.brands[0]) {
            return filterFilter(bikes, filter.currentBrand);
          } else {
            return bikes;
          }
        }

        // function filterSizes(bikes) {
        //   // TODO: find clear solution for this
        //   if (!_.isEmpty(filter.currentSizes) && filter.currentSizes.indexOf("-1") == -1 && filter.currentSizes.indexOf(-1) == -1) {
        //     var selectedSizes = _.uniq(filter.currentSizes);
        //     selectedSizes = selectedSizes.map(Number);
        //     return arrayFilter(bikes, selectedSizes, 'size');
        //   } else {
        //     return bikes;
        //   }
        // }

        function filterSize(bikes) {
          if (filter.sizes && filter.currentSize != filter.sizes[0].value) {
            return _.filter(bikes, function (bike) {
              if (bike.is_cluster) {
                var clusterSizes = _.map(bike.cluster.sizes, 'size');
                return _.includes(clusterSizes, Number(filter.currentSize));
              } else {
                return bike.size == filter.currentSize;
              }
            });
          } else {
            return bikes;
          }
        }

        function filterCategories (bikes) {
          if (!_.isEmpty(filter.currentCategories)) {
            return arrayFilter(bikes, filter.currentCategories, 'category');
          } else {
            return bikes;
          }
        }

        function clearDate() {
          filter.isClearDataRange = true;
          if (!filter.currentDate.start_date) return;
          filter.currentDate = {
            'start_date': null,
            'duration': null
          }
          filter.populateBikes();
        }

        // tricky function to initialize date-picker close, when we click ng-menu
        function closeDateRange() {
          var datePickerTrigger = angular.element('.js-datepicker-opened');
          if (datePickerTrigger.length) {
            datePickerTrigger.click();
          }
        }

        function arrayFilter(bikes, selectedItems, filterBy) {
          return _.filter(bikes, function (o) {
            return _.includes(selectedItems, o[filterBy]);
          })
        }

      }
    ]
  });
