'use strict';

angular.module('mcbw',[]).component('mcbw', {
  templateUrl: 'app/modules/events/mcbw/mcbw.template.html',
  controllerAs: 'mcbw',
  controller: ['api', '$translatePartialLoader', 'ENV',
    function AmplerController(api, $tpl, ENV) {
      var mcbw = this;
      $tpl.addPart(ENV.staticTranslation);
      mcbw.bikes1 = [];
      mcbw.bikes2 = [];

      mcbw.mapOptions = {
        lat: 48.1574300,
        lng: 11.5754900,
        zoom: 12,
        radius: 500
      };

      api.get('/users/1886').then(
        function (success) {
          mcbw.bikes1 = success.data.rides;
        },
        function (error) {
        }
      );

      api.get('/rides?family=8').then(
        function (success) {
          mcbw.bikes2 = success.data;
        },
        function (error) {
        }
      );

    }
  ]
});
