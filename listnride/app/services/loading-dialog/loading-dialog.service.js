'use strict';

angular.
  module('listnride').
  factory('loadingDialog', ['$mdDialog',
    function($mdDialog) {

      var open = function(event) {
        $mdDialog.show({
          templateUrl: 'app/services/loading-dialog/loading-dialog.template.html',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: false,
          escapeToClose: false
        });
      };

      var close = function() {
        $mdDialog.hide();
      }

      return {
        open: open,
        close: close
      };

    }
  ]);