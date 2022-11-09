'use strict';

angular.module('muli-integration',[]).component('muli', {
  templateUrl: 'app/modules/brand-integration/muli.template.html',
  controllerAs: 'muli',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ngMeta', 'ENV',
    function MuliController($translate, $tpl, api, ngMeta, ENV ) {
      ngMeta.setTitle($translate.instant("brand-integration.muli.meta-title"));
      ngMeta.setTag("description", $translate.instant("brand-integration.muli.meta-description"));

      var muli = this;
      $tpl.addPart(ENV.staticTranslation);
      muli.bikes = {
        berlin: [],
        munich: [],
        pfaffstatten: []
      };

      api.get('/rides?family=14').then(
        function (success) {

          for (var i=0; i<success.data.bikes.length; i++) {
            switch (success.data.bikes[i].city) {
              case "Berlin": muli.bikes.berlin.push(success.data.bikes[i]); break;
              case "München": muli.bikes.munich.push(success.data.bikes[i]); break;
              case "Pfaffstätten": muli.bikes.pfaffstatten.push(success.data.bikes[i]); break;
            }
          }

        },
        function (error) {
        }
      );
    }
  ]
});
