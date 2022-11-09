'use strict';

angular.module('constanceSpin',[]).component('constanceSpin', {
  templateUrl: 'app/modules/events/constance-spin/constance-spin.template.html',
  controllerAs: 'constanceSpin',
  controller: ['api', '$translatePartialLoader', 'ENV',
    function ConstanceSpinController(api, $tpl, ENV) {
      var constanceSpin = this;
      $tpl.addPart(ENV.staticTranslation);
      constanceSpin.bikes = [];

      api.get('/rides?family=21').then(
        function (success) {
          constanceSpin.bikes = success.data;
        },
        function (error) {

        }
      );

      // api.get('/bikes/1998').then(
      //   function(response) {
      //     // Only retrieve the road bikes of the specified lister for the event
      //     _.each(response.data.rides, function (value, index) {
      //       if (value.category == 20 && value.id < 730) {
      //         pushnpost.bikes.push(value);
      //       }
      //     });
      //   },
      //   function(error) {
      //     console.log("Error retrieving User", error);
      //   }
      // );

    }
  ]
});
