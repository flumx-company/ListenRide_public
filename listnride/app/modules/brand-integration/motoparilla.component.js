'use strict';

angular.module('motoparilla-integration',[]).component('motoparilla', {
  templateUrl: 'app/modules/brand-integration/motoparilla.template.html',
  controllerAs: 'motoparilla',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ngMeta', 'ENV',
    function MotoparillaController($translate, $tpl, api, ngMeta, ENV) {
      var motoparilla = this;
      $tpl.addPart(ENV.staticTranslation);
      ngMeta.setTitle($translate.instant("brand-integration.motoparilla.meta-title"));
      ngMeta.setTag("description", $translate.instant("brand-integration.motoparilla.meta-description"));

      motoparilla.bikes = [];

      motoparilla.slickConfig = {
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
        motoparilla.testimonials = [
          {text: $translate.instant("brand-integration.motoparilla.testimonial-1"), userImagePath: "app/assets/ui_images/brand-integration/motoparilla/icon1.jpg"},
          {text: $translate.instant("brand-integration.motoparilla.testimonial-2"), userImagePath: "app/assets/ui_images/brand-integration/motoparilla/icon1.jpg"},
          {text: $translate.instant("brand-integration.motoparilla.testimonial-3"), userImagePath: "app/assets/ui_images/brand-integration/motoparilla/icon1.jpg"}
        ];
      });

      api.get('/rides?family=23').then(
        function (success) {
          motoparilla.bikes = success.data.bikes;
        },
        function (error) {
        }
      );
    }
  ]
});
