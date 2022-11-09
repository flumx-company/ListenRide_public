'use strict';

angular.module('rossignolIntegration', []).component('rossignol', {
  templateUrl: 'app/modules/brand-integration/rossignol.template.html',
  controllerAs: 'rossignol',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function rossignolController($tpl, $translate, api, ENV, ngMeta, notification) {
      var rossignol = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.rossignol.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.rossignol.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/rossignol/lnr_rossignol_opengraph_image.jpg');

      rossignol.$onInit = function () {
        // METHODS
        rossignol.splitFaq = splitFaq;
        rossignol.getBikes = getBikes;

        // hero slider
        rossignol.cbSlider = [
          'app/assets/ui_images/brand-integration/rossignol/lnr_rossignol_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/rossignol/lnr_rossignol_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/rossignol/lnr_rossignol_hero_image_03.jpg',
          'app/assets/ui_images/brand-integration/rossignol/lnr_rossignol_hero_image_04.jpg',
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        rossignol.cities = {};

        // methods
        rossignol.isEmpty = _.isEmpty;

        // invocations
        // rossignol.splitFaq();
        rossignol.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < rossignol.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(rossignol.faqs[i]): col2.push(rossignol.faqs[i]);
        }

        return rossignol.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/' + 'rossignol').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!rossignol.cities.hasOwnProperty(bike.en_city)) {
                rossignol.cities[bike.en_city] = {
                  bikes: []
                };
              }
              rossignol.cities[bike.en_city].bikes.push(bike);
              rossignol.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            rossignol.currentShop = rossignol.cities[Object.keys(rossignol.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});
