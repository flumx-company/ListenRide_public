'use strict';

angular.module('raphaSuperCross',[]).component('raphaSuperCross', {
  templateUrl: 'app/modules/events/rapha-super-cross/rapha-super-cross.template.html',
  controllerAs: 'raphaSuperCross',
  controller: ['NgMap', 'api', '$translatePartialLoader', 'ENV',
    function RaphaSuperCrossController(NgMap, api, $tpl, ENV) {
      var raphaSuperCross = this;
      $tpl.addPart(ENV.staticTranslation);
      api.get('/rides?family=7').then(
        function(response) {
          raphaSuperCross.bikes = response.data;
        },
        function(error) {
        }
      );

    }
  ]
});
