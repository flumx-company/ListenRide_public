'use strict';

angular.module('vello-integration',[]).component('vello', {
  templateUrl: 'app/modules/brand-integration/vello.template.html',
  controllerAs: 'vello',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ngMeta', 'ENV',
    function VelloController($translate, $tpl, api, ngMeta, ENV) {
      var vello = this;
      $tpl.addPart(ENV.staticTranslation);
      ngMeta.setTitle($translate.instant("brand-integration.vello.meta-title"));
      ngMeta.setTag("description", $translate.instant("brand-integration.vello.meta-descr"));

      vello.bikes = {
        berlin: [],
        munich: []
      };

      api.get('/rides?family=15').then(
        function (success) {

          for (var i=0; i<success.data.bikes.length; i++) {
            switch (success.data.bikes[i].city) {
              case "Berlin": vello.bikes.berlin.push(success.data.bikes[i]); break;
              case "München": vello.bikes.munich.push(success.data.bikes[i]); break;
            }
          }

        },
        function (error) {
        }
      );
    }
  ]
});
