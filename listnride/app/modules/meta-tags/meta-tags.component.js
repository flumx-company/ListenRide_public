'use strict';

angular.module('metaTags',[]).component('metaTags', {
  templateUrl: 'app/modules/meta-tags/meta-tags.template.html',
  controllerAs: 'metaTags',
  controller: ['$mdSidenav', '$localStorage', '$stateParams', 'api', 'authentication', 'verification',
    function MetaTagsController($mdSidenav, $localStorage, $stateParams, api, authentication, verification) {
      var metaTags = this;
    }
  ]
});