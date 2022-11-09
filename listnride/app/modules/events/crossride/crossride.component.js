'use strict';

angular.module('crossride',[]).component('crossride', {
  templateUrl: 'app/modules/events/crossride/crossride.template.html',
  controllerAs: 'crossride',
  controller: ['api', '$translatePartialLoader', 'ENV',
    function CrossrideController(api, $tpl, ENV) {
      var crossride = this;
      $tpl.addPart(ENV.staticTranslation);
      api.get('/rides?family=29').then(
        function(response) {
          crossride.bikes = response.data;
        },
        function(error) {
        }
      );
    }
  ]
});
