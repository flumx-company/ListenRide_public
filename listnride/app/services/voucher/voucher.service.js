'use strict';

angular.
  module('listnride').
  factory('voucher', ['$q', 'api', 'notification',
    function ($q, api, notification) {
      return {
        addVoucher: function(voucherCode) {
          var data = {
            "voucher": {
              "code": voucherCode
            }
          };

          return api.post('/vouchers', data).then(
            function (success) {
              notification.show(success, null, 'toasts.add-voucher-success');
              return parseInt(success.data.value);
            },
            function (error) {
              notification.show(error, 'error');
              return $q.reject(error);
            }
          );
        }
      }
    }
  ]);
