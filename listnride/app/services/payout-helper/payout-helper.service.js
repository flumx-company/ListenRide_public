'use strict';

angular
  .module('listnride')
  .factory('payoutHelper', [
    'api',
    'authentication',
    'notification',
    PayoutHelperController
  ]);

// authentication.userId()
function PayoutHelperController(api, authentication, notification) {
  return {
    postPayout: function (payoutMethod, cb, cbError) {
      var formattedDate = _.replace(payoutMethod.date_of_birth, /-|\.|\s/g, '/');
      var data = {
        'payout_method': {
          'payment_type': payoutMethod.payment_type || 'bank-account',
          'first_name': payoutMethod.first_name,
          'last_name': payoutMethod.last_name,
          'iban': payoutMethod.iban,
          'bic': payoutMethod.bic,
          'country_code': payoutMethod.country_code,
          'account_holder_name': payoutMethod.account_holder_name,
          'gender': payoutMethod.gender,
          'nationality': payoutMethod.nationality,
          'date_of_birth': payoutMethod.date_of_birth ? moment(formattedDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
          'entity_type': payoutMethod.entity_type
        }
      };

      api.post('/users/' + authentication.userId() + '/payout_methods', data).then(
        function (success) {
          if (typeof cb == 'function') cb(data);
          notification.show(success, null, 'toasts.add-payout-success');
        },
        function (error) {
          notification.show(error, 'error', false, true);
          if (typeof cbError == 'function') cbError();
        }
      );
    }
  }
}
