'use strict';

angular.module('inVeloVeritas',[]).component('inVeloVeritas', {
  templateUrl: 'app/modules/events/in-velo-veritas/in-velo-veritas.template.html',
  controllerAs: 'inVeloVeritas',
  controller: ['NgMap', 'api', '$translate', '$translatePartialLoader', 'ENV',
    function InVeloVeritasController(NgMap, api, $translate, $tpl, ENV) {
      var inVeloVeritas = this;
      $tpl.addPart(ENV.staticTranslation);

      api.get('/rides?family=4').then(
        function(response) {
          inVeloVeritas.bikes = response.data.bikes;
        },
        function(error) {
        }
      );

    }
  ]
});
