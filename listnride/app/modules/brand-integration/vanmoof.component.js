'use strict';

angular.module('vanmoofIntegration',[]).component('vanmoof', {
  templateUrl: 'app/modules/brand-integration/vanmoof.template.html',
  controllerAs: 'vanmoof',
  controller: ['$translate', '$translatePartialLoader', 'api', 'ENV',
    function VanmoofController($translate, $tpl, api, ENV) {
      var vanmoof = this;
      $tpl.addPart(ENV.staticTranslation);

      vanmoof.currentBikes = [];
      $translate(["shared.berlin"]).then(
        function (translations) {
          vanmoof.currentCity = translations["shared.berlin"];
        }
      );
      vanmoof.bikes = {
        berlin: [],
        munich: [],
        hamburg: []
      };
      vanmoof.slickConfig = {
        enabled: true,
        autoplay: true,
        draggable: true,
        autoplaySpeed: 12000,
        ease: 'ease-in-out',
        speed: '500',
        prevArrow: "<img class='testimonials-prev-arrow slick-prev' src='app/assets/ui_images/back.png'>",
        nextArrow: "<img class='testimonials-prev-arrow slick-next' src='app/assets/ui_images/next.png'>"
      };

      api.get('/rides?family=27').then(
        function (success) {
          for (var i=0; i<success.data.bikes.length; i++) {
            switch (success.data.bikes[i].city) {
              case "Berlin": vanmoof.bikes.berlin.push(success.data.bikes[i]); break;
              case "München": vanmoof.bikes.munich.push(success.data.bikes[i]); break;
              case "Hamburg": vanmoof.bikes.hamburg.push(success.data.bikes[i]); break;
            }
          }
          vanmoof.currentBikes = vanmoof.bikes["berlin"];
        },
        function (error) {
          console.log('Error fetching Bikes');
        }
      );

      vanmoof.showBikesIn = function(city) {
        vanmoof.currentCity = $translate.instant("shared." + city);
        vanmoof.currentBikes = vanmoof.bikes[city];
      }

    }
  ]
});
