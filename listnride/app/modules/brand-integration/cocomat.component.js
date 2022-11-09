'use strict';

angular.module('cocomatIntegration',[]).component('cocomat', {
  templateUrl: 'app/modules/brand-integration/cocomat.template.html',
  controllerAs: 'cocomat',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ENV',
    function CocomatController($translate, $tpl, api, ENV) {
      var cocomat = this;
      $tpl.addPart(ENV.staticTranslation);

      cocomat.currentBikes = [];
      // TODO: UGLY! YUCK!
      cocomat.shops = {
        6059: {
          id: "6059",
          name: "COCO-MAT Hotel Athens",
          bikes: []
        },
        6061: {
          id: "6061",
          name: "COCO-MAT Hotel Nafsika",
          bikes: []
        },
        6063: {
          id: "6063",
          name: "COCO-MAT Store Alimos",
          bikes: []
        },
        6064: {
          id: "6064",
          name: "COCO-MAT Store Kalamaki",
          bikes: []
        },
        6065: {
          id: "6065",
          name: "COCO-MAT Store Voula",
          bikes: []
        },
        6066: {
          id: "6066",
          name: "COCO-MAT Store - Zea's Marine",
          bikes: []
        }
      };
      cocomat.currentShop = cocomat.shops[6059];

      api.get('/rides?family=32').then(
        function (success) {
          for (var i=0; i<success.data.bikes.length; i++) {
            var bike = success.data.bikes[i];
            cocomat.shops[bike.user_id].bikes.push(bike);
          }
          cocomat.currentBikes = cocomat.currentShop.bikes;
        },
        function (error) {
          console.log('Error fetching Bikes');
        }
      );

      cocomat.showBikesIn = function(shopId) {
        cocomat.currentShop = cocomat.shops[shopId];
        cocomat.currentBikes = cocomat.currentShop.bikes;
      }
    }

  ]
});
