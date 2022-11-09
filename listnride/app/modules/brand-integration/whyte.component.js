'use strict';

angular.module('whyteIntegration', []).component('whyte', {
  templateUrl: 'app/modules/brand-integration/whyte.template.html',
  controllerAs: 'whyte',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function WhyteController($tpl, $translate, api, ENV, ngMeta, notification) {
      var whyte = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.whyte.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.whyte.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/whyte/lnr_whyte_opengraph.jpg');

      whyte.$onInit = function () {
        // METHODS
        // whyte.splitFaq = splitFaq;
        whyte.getBikes = getBikes;

        // VARIABLES
        // TODO: change on another familyId or create another request based on brands endpoint
        whyte.familyId = 16;

        // hero slider
        whyte.cbSlider = [
          'app/assets/ui_images/brand-integration/whyte/lnr_whyte_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/whyte/lnr_whyte_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/whyte/lnr_whyte_hero_image_03.jpg',
          'app/assets/ui_images/brand-integration/whyte/lnr_whyte_hero_image_04.jpg'
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        whyte.cities = {};

        // invocations
        // whyte.splitFaq();
        whyte.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < whyte.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(whyte.faqs[i]): col2.push(whyte.faqs[i]);
        }

        return whyte.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/' + 'whyte').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!whyte.cities.hasOwnProperty(bike.en_city)) {
                whyte.cities[bike.en_city] = {
                  bikes: []
                };
              }
              whyte.cities[bike.en_city].bikes.push(bike);
              whyte.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            whyte.currentShop = whyte.cities[Object.keys(whyte.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});