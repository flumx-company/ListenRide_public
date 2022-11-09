'use strict';

angular.module('yubaIntegration', []).component('yuba', {
  templateUrl: 'app/modules/brand-integration/yuba.template.html',
  controllerAs: 'yuba',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function yubaController($tpl, $translate, api, ENV, ngMeta, notification) {
      var yuba = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.yuba.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.yuba.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/yuba/lnr_yuba_opengraph_image.jpg');

      yuba.$onInit = function () {
        // METHODS
        yuba.splitFaq = splitFaq;
        yuba.getBikes = getBikes;

        // hero slider
        yuba.cbSlider = [
          'app/assets/ui_images/brand-integration/yuba/lnr_yuba_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/yuba/lnr_yuba_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/yuba/lnr_yuba_hero_image_03.jpg',
          'app/assets/ui_images/brand-integration/yuba/lnr_yuba_hero_image_04.jpg',
          'app/assets/ui_images/brand-integration/yuba/lnr_yuba_hero_image_05.jpg'
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        yuba.cities = {};

        // methods
        yuba.isEmpty = _.isEmpty;

        // invocations
        // yuba.splitFaq();
        yuba.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < yuba.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(yuba.faqs[i]): col2.push(yuba.faqs[i]);
        }

        return yuba.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/' + 'yuba').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!yuba.cities.hasOwnProperty(bike.en_city)) {
                yuba.cities[bike.en_city] = {
                  bikes: []
                };
              }
              yuba.cities[bike.en_city].bikes.push(bike);
              yuba.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            yuba.currentShop = yuba.cities[Object.keys(yuba.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});
