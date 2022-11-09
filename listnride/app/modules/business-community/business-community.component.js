'use strict';

angular.module('businessCommunity',[]).component('businessCommunity', {
  templateUrl: 'app/modules/business-community/business-community.template.html',
  controllerAs: 'businessCommunity',
  controller: ['$translate', 'authentication', '$translatePartialLoader', 'ENV',
    function BusinessCommunityController($translate, authentication, $tpl, ENV) {

      var businessCommunity = this;
      $tpl.addPart(ENV.staticTranslation);
      businessCommunity.authentication = authentication;
    }
  ]
});
