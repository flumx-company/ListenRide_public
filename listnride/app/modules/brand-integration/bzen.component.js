'use strict';

angular.module('bzenIntegration', []).component('bzen', {
  templateUrl: 'app/modules/brand-integration/bzen.template.html',
  controllerAs: 'bzen',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function bzenController($tpl, $translate, api, ENV, ngMeta, notification) {
      var bzen = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.bzen.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.bzen.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/bzen/lnr_bzen_opengraph_image.jpg');

      bzen.$onInit = function () {
        // METHODS
        bzen.splitFaq = splitFaq;
        bzen.getBikes = getBikes;

        // hero slider
        bzen.cbSlider = [
          'app/assets/ui_images/brand-integration/bzen/lnr_bzen_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/bzen/lnr_bzen_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/bzen/lnr_bzen_hero_image_03.jpg',
          'app/assets/ui_images/brand-integration/bzen/lnr_bzen_hero_image_04.jpg'
        ];

        bzen.faqs = [{
            question: 'brand-integration.bzen.faq-question-1',
            answer: 'brand-integration.bzen.faq-answer-1',
          },
          {
            question: 'brand-integration.bzen.faq-question-2',
            answer: 'brand-integration.bzen.faq-answer-2',
          },
          {
            question: 'brand-integration.bzen.faq-question-3',
            answer: 'brand-integration.bzen.faq-answer-3',
          },
          {
            question: 'brand-integration.bzen.faq-question-4',
            answer: 'brand-integration.bzen.faq-answer-4',
          },
          {
            question: 'brand-integration.bzen.faq-question-5',
            answer: 'brand-integration.bzen.faq-answer-5',
          },
          {
            question: 'brand-integration.bzen.faq-question-6',
            answer: 'brand-integration.bzen.faq-answer-6',
          },
          {
            question: 'brand-integration.bzen.faq-question-7',
            answer: 'brand-integration.bzen.faq-answer-7',
          },
          {
            question: 'brand-integration.bzen.faq-question-8',
            answer: 'brand-integration.bzen.faq-answer-8',
          },
          {
            question: 'brand-integration.bzen.faq-question-9',
            answer: 'brand-integration.bzen.faq-answer-9'
          }
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        bzen.cities = {};

        // methods
        bzen.isEmpty = _.isEmpty;

        // invocations
        bzen.splitFaq();
        bzen.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < bzen.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(bzen.faqs[i]): col2.push(bzen.faqs[i]);
        }

        return bzen.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/bzen').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!bzen.cities.hasOwnProperty(bike.en_city)) {
                bzen.cities[bike.en_city] = {
                  bikes: []
                };
              }
              bzen.cities[bike.en_city].bikes.push(bike);
              bzen.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            bzen.currentShop = bzen.cities[Object.keys(bzen.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});
