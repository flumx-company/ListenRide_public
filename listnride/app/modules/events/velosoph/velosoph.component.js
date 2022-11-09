'use strict';

angular.module('velosoph',[]).component('velosoph', {
  templateUrl: 'app/modules/events/velosoph/velosoph.template.html',
  controllerAs: 'velosoph',
  controller: ['api', '$translatePartialLoader', 'ENV',
    function Velosoph(api, $tpl, ENV) {
      var velosoph = this;
      $tpl.addPart(ENV.staticTranslation);
      velosoph.bikes = [];

      api.get('/rides?family=22').then(
        function (success) {
          velosoph.bikes = success.data;
        },
        function (error) {

        }
      );
    }
  ]
});
