'use strict';

angular
  .module('paypalCheckoutButton', [])
  .directive('paypalCheckoutButton', ['paymentHelper', 'ENV', 'notification', function (paymentHelper, ENV, notification) {

    function initPaypalCheckoutButton($scope, btClient, buttonId) {
      return braintree.paypalCheckout.create({
        client: btClient
      }).then(function (paypalCheckoutInstance) {
        paypal.Button.render({
          env: ENV.brainTreeEnv, // 'production' or 'sandbox'

          payment: function () {
            return paypalCheckoutInstance.createPayment({
              flow: 'vault'
            });
          },

          onAuthorize: function (data) {
            return paypalCheckoutInstance.tokenizePayment(data)
              .then(paymentHelper.savePaypalPaymentMethod)
              .then($scope.onSuccess);
          },

          onCancel: function (data) {
            notification.show(null, null, 'shared.errors.payment-cancelled');
          },

          onError: function (err) {
            notification.show(null, null, 'shared.errors.payment-paypal-error');
            // for developers
            console.error('checkout.js error', err);
          },
          locale: 'en_US',
          style: {
            shape: 'rect',
            color: 'blue',
            size: 'medium',
            label: 'paypal',
            tagline: 'false'
          },
        }, buttonId);
      });
    }

    return {
      restrict: 'E',
      templateUrl: 'app/modules/shared/paypal-checkout-button/paypal-checkout-button.template.html',
      scope: {
        onSuccess: '<'
      },
      link: function ($scope, element, attrs) {
        paymentHelper.setupBraintreeClient().then(function(btClient) {
          initPaypalCheckoutButton($scope, btClient, '#paypal-checkout');
        });
      }
    };
  }]);
