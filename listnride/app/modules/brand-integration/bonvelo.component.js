'use strict';

angular.module('bonvelo-integration',[]).component('bonvelo', {
  templateUrl: 'app/modules/brand-integration/bonvelo.template.html',
  controllerAs: 'bonvelo',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ngMeta', 'ENV',
    function BonveloController($translate, $tpl, api, ngMeta, ENV) {
      var bonvelo = this;
      $tpl.addPart(ENV.staticTranslation);
      ngMeta.setTitle($translate.instant("brand-integration.bonvelo.meta-title"));
      ngMeta.setTag("description", $translate.instant("brand-integration.bonvelo.meta-description"));

      bonvelo.bikes = {
        berlin: [],
        munich: [],
        hamburg: []
      };

      bonvelo.slickConfig = {
        enabled: true,
        autoplay: true,
        draggable: true,
        autoplaySpeed: 12000,
        ease: 'ease-in-out',
        speed: '500',
        prevArrow: "<img class='testimonials-prev-arrow slick-prev' src='app/assets/ui_images/back.png'>",
        nextArrow: "<img class='testimonials-prev-arrow slick-next' src='app/assets/ui_images/next.png'>"
      };

      $translate('shared.from-place').then(function(translation) {
        bonvelo.testimonials = [
          {text: $translate.instant("brand-integration.bonvelo.testimonial-1")},
          {text: $translate.instant("brand-integration.bonvelo.testimonial-2")},
          {text: $translate.instant("brand-integration.bonvelo.testimonial-3")}
        ];
      });

      api.get('/rides?family=17').then(
        function (success) {
          for (var i=0; i<success.data.bikes.length; i++) {
            switch (success.data.bikes[i].city) {
              case "Berlin": bonvelo.bikes.berlin.push(success.data.bikes[i]); break;
              case "München": bonvelo.bikes.munich.push(success.data.bikes[i]); break;
              case "Hamburg": bonvelo.bikes.hamburg.push(success.data.bikes[i]); break;
            }
          }
        },
        function (error) {
        }
      );
    }
  ]
});
