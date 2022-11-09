'use strict';

angular.module('urwahnIntegration', []).component('urwahn', {
  templateUrl: 'app/modules/brand-integration/urwahn.template.html',
  controllerAs: 'urwahn',
  controller: ['$translatePartialLoader', '$translate', 'api', 'ENV', 'ngMeta', 'notification',
    function urwahnController($tpl, $translate, api, ENV, ngMeta, notification) {
      var urwahn = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTitle($translate.instant("meta.brand-integration.urwahn.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.brand-integration.urwahn.meta-description"));
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/urwahn/lnr_urwahn_opengraph_image.jpg');

      urwahn.$onInit = function () {
        // METHODS
        urwahn.splitFaq = splitFaq;
        urwahn.getBikes = getBikes;

        // hero slider
        urwahn.cbSlider = [
          'app/assets/ui_images/brand-integration/urwahn/lnr_urwahn_hero_image_01.jpg',
          'app/assets/ui_images/brand-integration/urwahn/lnr_urwahn_hero_image_02.jpg',
          'app/assets/ui_images/brand-integration/urwahn/lnr_urwahn_hero_image_03.jpg',
          'app/assets/ui_images/brand-integration/urwahn/lnr_urwahn_hero_image_04.jpg'
        ];

        urwahn.faqs = [{
            question: 'brand-integration.urwahn.faq-question-1',
            answer: 'brand-integration.urwahn.faq-answer-1',
          },
          {
            question: 'brand-integration.urwahn.faq-question-2',
            answer: 'brand-integration.urwahn.faq-answer-2',
          },
          {
            question: 'brand-integration.urwahn.faq-question-3',
            answer: 'brand-integration.urwahn.faq-answer-3',
          },
          {
            question: 'brand-integration.urwahn.faq-question-4',
            answer: 'brand-integration.urwahn.faq-answer-4',
          },
          {
            question: 'brand-integration.urwahn.faq-question-5',
            answer: 'brand-integration.urwahn.faq-answer-5',
          },
          {
            question: 'brand-integration.urwahn.faq-question-6',
            answer: 'brand-integration.urwahn.faq-answer-6',
          }
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        urwahn.cities = {};

        // methods
        urwahn.isEmpty = _.isEmpty;

        // invocations
        urwahn.splitFaq();
        urwahn.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
        var col1 = [];
        var col2 = [];

        for (var i = 0; i < urwahn.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(urwahn.faqs[i]): col2.push(urwahn.faqs[i]);
        }

        return urwahn.faqs = [col1, col2];
      }

      function jsUcfirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      function getBikes() {
        api.get('/brand_pages/urwahn').then(
          function (success) {
            _.forEach(success.data.bikes, function (bike) {
              if (!urwahn.cities.hasOwnProperty(bike.en_city)) {
                urwahn.cities[bike.en_city] = {
                  bikes: []
                };
              }
              urwahn.cities[bike.en_city].bikes.push(bike);
              urwahn.cities[bike.en_city].cityName = jsUcfirst(bike.en_city);
            });
            urwahn.currentShop = urwahn.cities[Object.keys(urwahn.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});
