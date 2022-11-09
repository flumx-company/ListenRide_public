'use strict';

angular.module('veloheldIntegration', []).component('veloheld', {
  templateUrl: 'app/modules/brand-integration/veloheld.template.html',
  controllerAs: 'veloheld',
  controller: ['$translatePartialLoader', 'api', 'ENV', 'ngMeta', 'notification',
    function VeloheldController($tpl, api, ENV, ngMeta, notification) {
      var veloheld = this;
      $tpl.addPart(ENV.staticTranslation);
      // Open Graph Image
      ngMeta.setTag("og:image", 'https://www.listnride.com/app/assets/ui_images/brand-integration/veloheld/lnr_veloheld_opengraph.jpg');

      veloheld.$onInit = function() {
        // METHODS
        veloheld.splitFaq = splitFaq;
        veloheld.getBikes = getBikes;

        // VARIABLES
        veloheld.familyId = 34;

        // hero slider
        veloheld.cbSlider = [
          'app/assets/ui_images/brand-integration/veloheld/lnr_veloheld_hero01.jpg',
          'app/assets/ui_images/brand-integration/veloheld/lnr_veloheld_hero02.jpg',
          'app/assets/ui_images/brand-integration/veloheld/lnr_veloheld_hero03.jpg',
        ];
        // FAQ keys
        veloheld.faqs = [
          {
            question: 'brand-integration.veloheld.faq-question-1',
            answer: 'brand-integration.veloheld.faq-answer-1',
          },
          {
            question: 'brand-integration.veloheld.faq-question-2',
            answer: 'brand-integration.veloheld.faq-answer-2',
          },
          {
            question: 'brand-integration.veloheld.faq-question-3',
            answer: 'brand-integration.veloheld.faq-answer-3',
          },
          {
            question: 'brand-integration.veloheld.faq-question-4',
            answer: 'brand-integration.veloheld.faq-answer-4',
          },
          {
            question: 'brand-integration.veloheld.faq-question-5',
            answer: 'brand-integration.veloheld.faq-answer-5',
          }
        ];

        // GROUPED BIKES
        // TODO: Move to Admin panel
        veloheld.cities = {};

        // invocations
        veloheld.splitFaq();
        veloheld.getBikes();
      }

      // TODO: find better way to split FAQ via html,css
      function splitFaq() {
          var col1 = [];
          var col2 = [];

        for (var i = 0; i < veloheld.faqs.length; i++) {
          ((i + 2) % 2) ? col1.push(veloheld.faqs[i]): col2.push(veloheld.faqs[i]);
        }

        return veloheld.faqs = [col1, col2];
      }

      function transformToKeys(str){
        return str.replace(/\s+/g, '_').toLowerCase();
      }

      function getBikes() {
        api.get('/rides?family=' + veloheld.familyId).then(
          function (success) {
            _.forEach(success.data.bikes, function(bike){
              if (!veloheld.cities.hasOwnProperty(bike.city)){
                veloheld.cities[bike.city] = {
                  bikes:[]
                };
              }
              veloheld.cities[bike.city].bikes.push(bike);
              veloheld.cities[bike.city].cityName = transformToKeys(bike.city);
            });
            veloheld.currentShop = veloheld.cities[Object.keys(veloheld.cities)[0]];
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

    }
  ]
});
