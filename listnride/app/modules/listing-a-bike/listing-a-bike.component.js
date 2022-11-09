'use strict';

angular.module('listingABike',[]).component('listingABike', {
  templateUrl: 'app/modules/listing-a-bike/listing-a-bike.template.html',
  controllerAs: 'listingABike',
  controller: [ 'authentication',
    function ListingABikeController(authentication) {
      var listingABike = this;

      listingABike.authentication = authentication;
    }
  ]
});