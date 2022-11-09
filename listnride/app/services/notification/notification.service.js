'use strict';

angular
  .module('listnride')
  .factory('notification', [
    '$mdToast',
    '$translate',
    notificationController
  ]
);

// Lingohub supported keys placed in shared.notifications (default)

function notificationController($mdToast, $translate) {
 return {
  show: function (response, originalType, translateKey, showPointer) {
    var self = this;
    var type = originalType || 'success';

    if (translateKey) {
      convertToKey(translateKey)
    } else {
      getMessage(showPointer);
    }

    function getMessage(showPointer) {
      var responseText;

      if (type === 'error' && response.data && response.data.errors && response.data.errors.length) {
        // TODO: Add multiply errors
        if (showPointer) {
          var pointer = response.data.errors[0].source.pointer;
          var displayablePointer = pointer === 'base' ? '' : beautifyPointer(pointer) + ': ';
          return self.showToast(displayablePointer + response.data.errors[0].detail);
        } else {
          return self.showToast(response.data.errors[0].detail);
        }
      } else if (response.status != -1) {
        responseText = 'shared.notifications.'+ response.status
      } else {
        responseText = 'toasts.error';
      }

      return convertToKey(responseText);
    }

    function convertToKey(text) {
      $translate(text).then(function (success) {
        self.showToast(success)
      }, function (error) {
        self.showToast(error)
      });
    }

    function beautifyPointer(pointer) {
      return pointer == 'iban' ? 'IBAN' : pointer.replace(/_/g, ' ').toUpperCase();
    }
  },
  showToast: function (text) {
    $mdToast.show(
      $mdToast.simple()
      .textContent(text)
      .hideDelay(4000)
      .position('top center')
    );
  }
 }
}
