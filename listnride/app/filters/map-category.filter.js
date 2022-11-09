'use strict';

angular.
module('listnride').
filter('mapCategory', function() {

  return function (bikes, categories) {
    if (bikes == undefined) {
      return [];
    }

    var categoryValues = Object.keys(categories).map(function(key) {
        return categories[key];
    });

    var allFalse = categoryValues.every(function(value) {
      return value === false;
    });

    if (allFalse) {
      return bikes;
    }

    var categoryArray = [
      "city",
      "race",
      "allterrain",
      "kids",
      "ebikes",
      "special"
    ];

    return bikes.filter(function(bike) {
      var categoryIndex = Math.floor(bike.category / 10) - 1;
      return (categories[categoryArray[categoryIndex]] === true);
    });
  }

});