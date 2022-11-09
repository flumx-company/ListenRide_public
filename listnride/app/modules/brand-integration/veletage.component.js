'use strict';

angular.module('veletage-integration',[]).component('veletage', {
  templateUrl: 'app/modules/brand-integration/veletage.template.html',
  controllerAs: 'veletage',
  controller: [ '$translate', '$translatePartialLoader', 'api', 'ngMeta', 'ENV',
    function VeletageController($translate, $tpl, api, ngMeta, ENV) {
      var veletage = this;
      $tpl.addPart(ENV.staticTranslation);
      ngMeta.setTitle($translate.instant("brand-integration.veletage.meta-title"));
      ngMeta.setTag("description", $translate.instant("brand-integration.veletage.meta-descr"));

      veletage.bikes = [];

      api.get('/rides?family=16').then(
        function (success) {
          veletage.bikes = success.data.bikes;
        },
        function (error) {
        }
      );

    }
  ]
});
