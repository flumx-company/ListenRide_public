'use strict';

angular.module('rentingABike',[]).component('rentingABike', {
  templateUrl: 'app/modules/renting-a-bike/renting-a-bike.template.html',
  controllerAs: 'rentingABike',
  controller: [ '$state',
    function RentingABikeController($state) {
      var rentingABike = this;

      rentingABike.placeChanged = function(place) {
        var location = place.formatted_address || place.name;
        $state.go('search', {location: location});
      };

      rentingABike.onSearchClick = function() {
        $state.go('search', {location: rentingABike.location});
      };

    }
  ]
});