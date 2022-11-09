'use strict';

angular.module('feltIntegration', []).component('felt', {
  templateUrl: 'app/modules/brand-integration/felt.template.html',
  controllerAs: 'felt',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function FeltController($tpl, $translate, api, ENV, ngMeta, notification) {
      var felt = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.felt.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.felt.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/felt/lnr_felt_opengraph.jpg');

      felt.$onInit = function () {
        // METHODS
        // felt.splitFaq = splitFaq;
        felt.getBikes = getBikes;

        // hero slider
        felt.cbSlider = [
          'app/assets/ui_images/brand-integration/felt/lnr_felt_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/felt/lnr_felt_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/felt/lnr_felt_hero_image_03.jpg',
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        felt.cities = {};

        // methods
        felt.isEmpty = _.isEmpty;

        // invocations
        // felt.splitFaq();
        felt.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < felt.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(felt.faqs[i]): col2.push(felt.faqs[i]);
        }

        return felt.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/' + 'felt').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!felt.cities.hasOwnProperty(bike.en_city)) {
                felt.cities[bike.en_city] = {
                  bikes: []
                };
              }
              felt.cities[bike.en_city].bikes.push(bike);
              felt.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            felt.currentShop = felt.cities[Object.keys(felt.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});