'use strict';

angular.module('depart',[]).component('depart', {
  templateUrl: 'app/modules/events/depart/depart.template.html',
  controllerAs: 'depart',
  controller: ['api', '$translatePartialLoader', 'ENV',
    function DepartController(api, $tpl, ENV) {
      var depart = this;
        $tpl.addPart(ENV.staticTranslation);
        depart.bikes = [];

        api.get('/rides?family=18').then(
          function(response) {
            depart.bikes = response.data;
          },
          function(error) {
          }
        );
    }
  ]
});

