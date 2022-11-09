'use strict';

angular.module('pushnpost',[]).component('pushnpost', {
  templateUrl: 'app/modules/events/cwd/pushnpost.template.html',
  controllerAs: 'pushnpost',
  controller: ['api', '$translatePartialLoader', 'ENV',
    function PushnpostController(api, $tpl, ENV) {
      var pushnpost = this;
      $tpl.addPart(ENV.staticTranslation);
      pushnpost.bikes = [];

      api.get('/users/1998').then(
        function(response) {
          // Only retrieve the road bikes of the specified lister for the event
          _.each(response.data.rides, function (value, index) {
            if (value.category == 20 && value.id < 730) {
              pushnpost.bikes.push(value);
            }
          });
        },
        function(error) {
        }
      );

    }
  ]
});
