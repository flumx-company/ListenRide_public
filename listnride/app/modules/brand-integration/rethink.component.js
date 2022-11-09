'use strict';

angular.module('rethinkIntegration',[]).component('rethink', {
  templateUrl: 'app/modules/brand-integration/rethink.template.html',
  controllerAs: 'rethink',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ENV',
    function RethinkController($translate, $tpl, api, ENV) {
      var rethink = this;
      $tpl.addPart(ENV.staticTranslation);

      rethink.bikes = {
        dresden: [],
        munich: [],
        hamburg: []
      };

      rethink.slickConfig = {
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
        rethink.testimonials = [
          {text: $translate.instant("brand-integration.rethink.testimonial-1")},
          {text: $translate.instant("brand-integration.rethink.testimonial-2")},
          {text: $translate.instant("brand-integration.rethink.testimonial-3")}
        ];
      });

      api.get('/rides?family=28').then(
        function (success) {
          for (var i=0; i<success.data.bikes.length; i++) {
            switch (success.data.bikes[i].city) {
              case "Dresden": rethink.bikes.dresden.push(success.data.bikes[i]); break;
              case "Munich": rethink.bikes.munich.push(success.data.bikes[i]); break;
              case "Hamburg": rethink.bikes.hamburg.push(success.data.bikes[i]); break;
            }
          }
        },
        function (error) {
          console.log('Error fetching Bikes');
        }
      );
    }
  ]
});
