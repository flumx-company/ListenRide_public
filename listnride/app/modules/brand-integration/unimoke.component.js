'use strict';

angular.module('unimokeIntegration', []).component('unimoke', {
  templateUrl: 'app/modules/brand-integration/unimoke.template.html',
  controllerAs: 'unimoke',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function UnimokeController($tpl, $translate, api, ENV, ngMeta, notification) {
      var unimoke = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.unimoke.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.unimoke.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/unimoke/lnr_unimoke_opengraph_image.jpg');

      unimoke.$onInit = function () {
        // METHODS
        unimoke.splitFaq = splitFaq;
        unimoke.getBikes = getBikes;

        // hero slider
        unimoke.cbSlider = [
          'app/assets/ui_images/brand-integration/unimoke/lnr_unimoke_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/unimoke/lnr_unimoke_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/unimoke/lnr_unimoke_hero_image_03.jpg',
        ];

        unimoke.faqs = [{
            question: 'brand-integration.unimoke.faq-question-1',
            answer: 'brand-integration.unimoke.faq-answer-1',
          },
          {
            question: 'brand-integration.unimoke.faq-question-2',
            answer: 'brand-integration.unimoke.faq-answer-2',
          },
          {
            question: 'brand-integration.unimoke.faq-question-3',
            answer: 'brand-integration.unimoke.faq-answer-3',
          },
          {
            question: 'brand-integration.unimoke.faq-question-4',
            answer: 'brand-integration.unimoke.faq-answer-4',
          },
          {
            question: 'brand-integration.unimoke.faq-question-5',
            answer: 'brand-integration.unimoke.faq-answer-5',
          },
          {
            question: 'brand-integration.unimoke.faq-question-6',
            answer: 'brand-integration.unimoke.faq-answer-6',
          }
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        unimoke.cities = {};

        // methods
        unimoke.isEmpty = _.isEmpty;

        // invocations
        unimoke.splitFaq();
        unimoke.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < unimoke.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(unimoke.faqs[i]): col2.push(unimoke.faqs[i]);
        }

        return unimoke.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/' + 'unimoke').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!unimoke.cities.hasOwnProperty(bike.en_city)) {
                unimoke.cities[bike.en_city] = {
                  bikes: []
                };
              }
              unimoke.cities[bike.en_city].bikes.push(bike);
              unimoke.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            unimoke.currentShop = unimoke.cities[Object.keys(unimoke.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});