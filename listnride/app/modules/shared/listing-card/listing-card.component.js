'use strict';

angular.module('listingCard',[]).component('listingCard', {
  templateUrl: 'app/modules/shared/listing-card/listing-card.template.html',
  controllerAs: 'listingCard',
  bindings: {
    status: '=',
    bikeId: '<',
    bike: '<',
    name: '<',
    brand: '<',
    category: '<',
    price: '<',
    imageUrl: '<',
    available: '<',
    isDuplicating: '=',
    duplicate: '<',
    delete: '<',
    edit: '<',
    view: '<',
    changeAvailability: '<',
    showLabels: '<',
    isCheckModeOn: '<',
    onBikeTileCheck: '<',
    isChecked: '<',
    isSelectable: '<',
    unmerge: '<'
  },
  controller: function ListingCardController(api, notification, bikeHelper) {
      var listingCard = this;

      listingCard.$onInit = function() {
        //variables
        listingCard.price = Math.ceil(listingCard.price);

        //methods
        listingCard.checkBike = listingCard.onBikeTileCheck;
        listingCard.changeBikeAvailableTo = changeBikeAvailableTo;
      }

      function changeBikeAvailableTo() {
        listingCard.changeAvailableInProgress = true;
        bikeHelper.changeBikeAvailableTo(listingCard.bike, !listingCard.bike.available)
          .then(response => {
            listingCard.changeAvailableInProgress = false;
            listingCard.bike.available = !listingCard.bike.available;
          })
          .catch(error => {
            listingCard.changeAvailableInProgress = false;
            notification.show(error, 'error');
          })
      }

    }
  }
);
