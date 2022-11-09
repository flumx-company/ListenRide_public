'use strict';

angular.
  module('listnride').
  filter('category', ['$translate', function($translate) {
    return function(categoryId) {
      switch(categoryId) {
        case 1: return "list.category.urban";
        case 10: return "list.subcategory.1.city-bike";
        case 11: return "list.subcategory.1.dutch-bike";
        case 12: return "list.subcategory.1.single-speed";

        case 2: return "list.category.e-bike";
        case 20: return "list.subcategory.2.e-city-bike";
        case 21: return "list.subcategory.2.e-touring-bike";
        case 22: return "list.subcategory.2.e-cargo-bike";
        case 23: return "list.subcategory.2.e-mountain-bike";
        case 24: return "list.subcategory.2.e-road-bike";
        case 25: return "list.subcategory.2.e-folding-bike";
        case 26: return "list.subcategory.2.e-scooter";

        case 3: return "list.category.road";
        case 30: return "list.subcategory.3.road-bike";
        case 31: return "list.subcategory.3.triathlon-bike";
        case 32: return "list.subcategory.3.touring-bike";
        case 33: return "list.subcategory.3.fixed-gear-bike";

        case 4: return "list.category.all-terrain";
        case 40: return "list.subcategory.4.mtb-hardtail";
        case 41: return "list.subcategory.4.mtb-fullsuspension";
        case 42: return "list.subcategory.4.cyclocross-bike";
        case 43: return "list.subcategory.4.gravel-bike";

        case 5: return "list.category.transport";
        case 50: return "list.subcategory.5.cargo-bike";
        case 51: return "list.subcategory.5.bike-trailer";
        case 52: return "list.subcategory.5.bike-child-seat";
        case 53: return "list.subcategory.5.bike-car-rack";
        case 54: return "list.subcategory.5.bike-travel-bag";

        case 6: return "list.category.kids";
        case 60: return "list.subcategory.6.city-bike";
        case 61: return "list.subcategory.6.all-terrain-bike";
        case 62: return "list.subcategory.6.road-bike";
        case 63: return "list.subcategory.6.bogie-wheel";

        case 7: return "list.category.special";
        case 70: return "list.subcategory.7.folding-bike";
        case 71: return "list.subcategory.7.recumbent-bike";
        case 72: return "list.subcategory.7.tandem-bike";
        case 73: return "list.subcategory.7.longtail-bike";
        case 74: return "list.subcategory.7.scooter";

        default: return "";
      }
    };
  }]);
