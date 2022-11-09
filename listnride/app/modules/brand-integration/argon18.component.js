'use strict';

angular.module('argon18Integration', []).component('argon18', {
  templateUrl: 'app/modules/brand-integration/argon18.template.html',
  controllerAs: 'argon18',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function argon18Controller($tpl, $translate, api, ENV, ngMeta, notification) {
      var argon18 = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.argon18.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.argon18.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/argon18/lnr_argon18_opengraph_image.jpg');

      argon18.$onInit = function () {
        // METHODS
        argon18.splitFaq = splitFaq;
        argon18.getBikes = getBikes;

        // hero slider
        argon18.cbSlider = [
          'app/assets/ui_images/brand-integration/argon18/lnr_argon18_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/argon18/lnr_argon18_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/argon18/lnr_argon18_hero_image_03.jpg',
          'app/assets/ui_images/brand-integration/argon18/lnr_argon18_hero_image_04.jpg',
        ];

        argon18.faqs = [{
          question: 'brand-integration.argon18.faq-question-1',
          answer: 'brand-integration.argon18.faq-answer-1',
        },
          {
            question: 'brand-integration.argon18.faq-question-2',
            answer: 'brand-integration.argon18.faq-answer-2',
          },
          {
            question: 'brand-integration.argon18.faq-question-3',
            answer: 'brand-integration.argon18.faq-answer-3',
          },
          {
            question: 'brand-integration.argon18.faq-question-4',
            answer: 'brand-integration.argon18.faq-answer-4',
          },
          {
            question: 'brand-integration.argon18.faq-question-5',
            answer: 'brand-integration.argon18.faq-answer-5',
          },
          {
            question: 'brand-integration.argon18.faq-question-6',
            answer: 'brand-integration.argon18.faq-answer-6',
          }
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        argon18.cities = {};

        // methods
        argon18.isEmpty = _.isEmpty;

        // invocations
        argon18.splitFaq();
        argon18.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < argon18.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(argon18.faqs[i]): col2.push(argon18.faqs[i]);
        }

        return argon18.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/' + 'argon18').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!argon18.cities.hasOwnProperty(bike.en_city)) {
                argon18.cities[bike.en_city] = {
                  bikes: []
                };
              }
              argon18.cities[bike.en_city].bikes.push(bike);
              argon18.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            argon18.currentShop = argon18.cities[Object.keys(argon18.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});
