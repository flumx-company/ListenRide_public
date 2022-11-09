'use strict';

angular.module('bikeCard',[]).component('bikeCard', {
  templateUrl: 'app/modules/shared/bike-card/bike-card.template.html',
  controllerAs: 'bikeCard',
  bindings: {
    bike: '<',
    booked: '<',
    home: '<',
    seo: '<',
    showLabels: '<',
    urlParams:'<'
  },
  controller: function BikeCardController(
    $mdMedia,
    $translate
    ) {
      var bikeCard = this;
      bikeCard.showIcon = !bikeCard.seo && bikeCard.bike.category;
      bikeCard.from = Math.ceil(bikeCard.bike.price_from);
      bikeCard.isPhoneScreen = $mdMedia('xs');

      $translate(["shared.img-alt"],
        { bikeBrand: bikeCard.bike.brand, bikeName: bikeCard.bike.name, bikeCity: bikeCard.bike.city}).then(
        function (translations) {
          bikeCard.imageAlt = translations[
            "shared.img-alt"
            ];
        }
      );
    }
});
