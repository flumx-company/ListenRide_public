'use strict';

angular.module('blackFriday', []).component('blackFriday', {
  templateUrl: 'app/modules/events/black-friday/black-friday.template.html',
  controllerAs: 'blackFriday',
  controller: ['ENV', '$translate', 'ngMeta', '$translatePartialLoader', 'notification',
    function BlackFridayController(ENV, $translate, ngMeta, $tpl, bikeOptions, notification) {
      var blackFriday = this;

      blackFriday.isStaging = ENV.apiEndpoint !== "https://api.listnride.com/v2";

      $tpl.addPart('static');
      ngMeta.setTitle($translate.instant("meta.events.black-friday.meta-title"));
      ngMeta.setTag("description", $translate.instant("meta.events.black-friday.meta-description"));
      ngMeta.setTag("og:image", "app/assets/ui_images/events/black-friday/black-friday_og.jpg");

      var SpecialToDate = '23-11-2018'; // DD/MM/YYYY

      var SpecialTo = moment(SpecialToDate, "DD/MM/YYYY");
      blackFriday.isBlackFriday = moment() > SpecialTo;
    }
  ]
});
