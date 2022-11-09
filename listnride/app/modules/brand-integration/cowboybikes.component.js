'use strict';

angular.module('cowboybikesIntegration', []).component('cowboybikes', {
  templateUrl: 'app/modules/brand-integration/cowboybikes.template.html',
  controllerAs: 'cowboybikes',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function CowboybikesController($tpl, $translate, api, ENV, ngMeta, notification) {
      var cowboybikes = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.cowboybikes.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.cowboybikes.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/cowboybikes/lnr_cowboybikes_opengraph_image.jpg');

      cowboybikes.$onInit = function () {
        // METHODS
        cowboybikes.splitFaq = splitFaq;
        cowboybikes.getBikes = getBikes;

        // hero slider
        cowboybikes.cbSlider = [
          'app/assets/ui_images/brand-integration/cowboybikes/lnr_cowboybikes_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/cowboybikes/lnr_cowboybikes_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/cowboybikes/lnr_cowboybikes_hero_image_03.jpg',
          'app/assets/ui_images/brand-integration/cowboybikes/lnr_cowboybikes_hero_image_04.jpg',
        ];

        cowboybikes.faqs = [{
          question: 'brand-integration.cowboybikes.faq-question-1',
          answer: 'brand-integration.cowboybikes.faq-answer-1',
        },
          {
            question: 'brand-integration.cowboybikes.faq-question-2',
            answer: 'brand-integration.cowboybikes.faq-answer-2',
          },
          {
            question: 'brand-integration.cowboybikes.faq-question-3',
            answer: 'brand-integration.cowboybikes.faq-answer-3',
          },
          {
            question: 'brand-integration.cowboybikes.faq-question-4',
            answer: 'brand-integration.cowboybikes.faq-answer-4',
          },
          {
            question: 'brand-integration.cowboybikes.faq-question-5',
            answer: 'brand-integration.cowboybikes.faq-answer-5',
          },
          {
            question: 'brand-integration.cowboybikes.faq-question-6',
            answer: 'brand-integration.cowboybikes.faq-answer-6',
          },
          {
            question: 'brand-integration.cowboybikes.faq-question-7',
            answer: 'brand-integration.cowboybikes.faq-answer-7',
          },
          {
            question: 'brand-integration.cowboybikes.faq-question-8',
            answer: 'brand-integration.cowboybikes.faq-answer-8',
          },
          {
            question: 'brand-integration.cowboybikes.faq-question-9',
            answer: 'brand-integration.cowboybikes.faq-answer-9',
          }
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        cowboybikes.cities = {};

        // methods
        cowboybikes.isEmpty = _.isEmpty;

        // invocations
        cowboybikes.splitFaq();
        cowboybikes.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < cowboybikes.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(cowboybikes.faqs[i]): col2.push(cowboybikes.faqs[i]);
        }

        return cowboybikes.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/' + 'cowboybikes').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!cowboybikes.cities.hasOwnProperty(bike.en_city)) {
                cowboybikes.cities[bike.en_city] = {
                  bikes: []
                };
              }
              cowboybikes.cities[bike.en_city].bikes.push(bike);
              cowboybikes.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            cowboybikes.currentShop = cowboybikes.cities[Object.keys(cowboybikes.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});
