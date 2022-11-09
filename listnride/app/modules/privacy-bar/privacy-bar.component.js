'use strict';

angular.module('privacyBar', []).component('privacyBar', {
  templateUrl: 'app/modules/privacy-bar/privacy-bar.template.html',
  controllerAs: 'privacyBar',
  bindings: {},
  controller: [
    '$localStorage',
    '$translate',
    function privacyBarController($localStorage, $translate) {
      var privacyBar = this;

      privacyBar.$onInit = function () {
        // variable
        privacyBar.isAgreeCookiesInfo = !!$localStorage.isAgreeCookiesInfo;

        // methods
        privacyBar.close = close;
      }

      function close() {
        privacyBar.isAgreeCookiesInfo = $localStorage.isAgreeCookiesInfo = true;
      }

    }
  ]
});