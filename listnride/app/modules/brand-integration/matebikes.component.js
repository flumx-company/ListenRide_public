'use strict';

angular.module('matebikesIntegration', []).component('matebikes', {
  templateUrl: 'app/modules/brand-integration/matebikes.template.html',
  controllerAs: 'matebikes',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function matebikesController($tpl, $translate, api, ENV, ngMeta, notification) {
      var matebikes = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.matebikes.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.matebikes.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/matebikes/lnr_matebikes_opengraph_image.jpg');

      matebikes.$onInit = function () {
        // METHODS
        matebikes.splitFaq = splitFaq;
        matebikes.getBikes = getBikes;

        // hero slider
        matebikes.cbSlider = [
          'https://s3.eu-central-1.amazonaws.com/cdn.listnride.com/brands/lnr_matebikes_hero_image_01.jpg',
          'https://s3.eu-central-1.amazonaws.com/cdn.listnride.com/brands/lnr_matebikes_hero_image_02.jpg',
          'https://s3.eu-central-1.amazonaws.com/cdn.listnride.com/brands/lnr_matebikes_hero_image_03.jpg',
          'https://s3.eu-central-1.amazonaws.com/cdn.listnride.com/brands/lnr_matebikes_hero_image_04.jpg',
          'https://s3.eu-central-1.amazonaws.com/cdn.listnride.com/brands/lnr_matebikes_hero_image_05.jpg'
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        matebikes.cities = {};

        // methods
        matebikes.isEmpty = _.isEmpty;

        // invocations
        matebikes.getBikes();
      };

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < matebikes.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(matebikes.faqs[i]): col2.push(matebikes.faqs[i]);
        }

        return matebikes.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/' + 'matebikes').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!matebikes.cities.hasOwnProperty(bike.en_city)) {
                matebikes.cities[bike.en_city] = {
                  bikes: []
                };
              }
              matebikes.cities[bike.en_city].bikes.push(bike);
              matebikes.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            matebikes.currentShop = matebikes.cities[Object.keys(matebikes.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});
