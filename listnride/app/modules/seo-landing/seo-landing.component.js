'use strict';

angular.module('seoLanding',[]).component('seoLanding', {
  templateUrl: 'app/modules/seo-landing/seo-landing.template.html',
  controllerAs: 'seoLanding',
  controller: ['$translate', '$translatePartialLoader', '$stateParams', '$state', 'api', 'ENV',
    function SeoLandingController($translate, $tpl, $stateParams, $state, api, ENV) {

      var seoLanding = this;
      $tpl.addPart(ENV.staticTranslation);
      seoLanding.bikes = {};
      seoLanding.loading = true;

      api.get('/seo_page?url=' + $stateParams.pageTitle).then(
        function (success) {
          seoLanding.data = success.data;
          seoLanding.bikes = success.data.bikes;
          seoLanding.loading = false;
        },
        function (error) {
          $state.go('404');
        }
      );
    }
  ]
});
