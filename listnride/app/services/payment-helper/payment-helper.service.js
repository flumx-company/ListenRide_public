'use strict';

angular
  .module('listnride')
  .factory('paymentHelper', [
    'ENV',
    'api',
    'authentication',
    'notification',
    PaymentHelperController
  ]);


function PaymentHelperController(ENV, api, authentication, notification) {
  return {
    btClient: null,
    btPpInstance: null,
    btThreeDSecure: null,
    fetchClientToken: function() {
      return api.get('/users/' + authentication.userId() + '/payment_methods/new').then(function(response) {
        return response.data.token;
      });
    },
    fetchPaymentMethodNonce: function() {
      return api.get('/users/' + authentication.userId() + '/payment_methods/nonce').then(function(response) {
        return response.data.nonce;
      });
    },
    createBrainTreeClient: function(clientToken) {
      return braintree.client.create({
        authorization: clientToken
      });
    },
    createThreeDSecure: function(btClient) {
      return braintree.threeDSecure.create({
        version: 2,
        client: btClient
      });
    },
    setupBraintreeClient: function() {
      var self = this;

      return self.fetchClientToken()
        .then(self.createBrainTreeClient)
        .then(function(btClient) {
          self.btClient = btClient;
          return self.btClient;
        })
        .then(self.createThreeDSecure)
        .then(function(threeDSecure) {
          self.btThreeDSecure = threeDSecure;
          return self.btThreeDSecure;
        })
        .then(function() {
          return self.btClient;
        });
    },
    authenticateThreeDSecure: function(amount, user, addFrameCb, removeFrameCb) {
      var self = this;

      return self.setupBraintreeClient()
        .then(self.fetchPaymentMethodNonce)
        .then(function(nonce) {
          var location = user.locations.billing_address || user.locations.primary;

          return self.btThreeDSecure.verifyCard(
            {
              amount: amount,
              nonce: nonce,
              additionalInformation: {
                billingGivenName: user.firstName,
                billingSurname: user.lastName,
                billingPhoneNumber: user.pretty_phone_number,
                billingAddress: {
                  streetAddress: location.street,
                  locality: location.city,
                  countryCodeAlpha2: location.alpha2_country_code
                },
                email: user.email
              },
              addFrame: addFrameCb,
              removeFrame: removeFrameCb,
              onLookupComplete: function(data, next) {
                next();
              }
           }
          );
        });
    },
    postCreditCard: function(creditCardData, cb, cbError) {
      notification.show(null, null, 'booking.payment.getting-saved');

      var data = {
        "payment_method": {
          "payment_type": "credit-card",
          "data": {
            ...creditCardData.data.paymentMethod,
            holderName: creditCardData.cardholderName
          },
        }
      };

      api.post('/users/' + authentication.userId() + '/payment_methods', data).then(
        function (response) {
          if (typeof cb == 'function') cb(response.data);
        },
        function (error) {
          if (typeof cbError == 'function') cbError();
          notification.show(error, 'error');
        }
      );
    },
    btPostCreditCard: function(creditCardData, cb, cbError) {
      notification.show(null, null, 'booking.payment.getting-saved');
      var self = this;
      self.btClient.request({
        endpoint: 'payment_methods/credit_cards',
        method: 'post',
        data: {
          creditCard: {
            number: creditCardData.creditCardNumber,
            expirationDate: creditCardData.expiryDate,
            cvv: creditCardData.securityNumber
          }
        }
      }, function (err, response) {
        if (!err) {
          var data = {
            "payment_method": {
              "payment_method_nonce": response.creditCards[0].nonce,
              "last_four": response.creditCards[0].details.lastFour,
              "card_type": response.creditCards[0].details.cardType,
              "payment_type": "credit-card"
            }
          };
          api.post('/users/' + authentication.userId() + '/payment_methods', data).then(
            function () {
              if (typeof cb == 'function') cb(data.payment_method);
            },
            function (error) {
              if (typeof cbError == 'function') cbError();
              notification.show(error, 'error');
            }
          );
        } else {
          notification.showToast(err.message);
          if (typeof cbError == 'function') cbError();
        }
      });
    },
    updatePaymentUserData: function(currentPaymentData, newData) {
      return Object.assign({}, newData);
    },
    getPaymentShortDescription: function(paymentData) {
      switch (paymentData.payment_type) {
        case 'credit-card':
          return '**** **** **** ' + paymentData.last_four;
        case 'paypal-account':
          return paymentData.email;
        default:
          notification.show(null, null, 'shared.errors.unexpected-payment-type');
          return false;
      }
    },
    savePaypalPaymentMethod: function(payload) {
      var data = {
        "payment_method": {
          "payment_method_nonce": payload.nonce,
          "email": payload.details.email,
          "payment_type": "paypal-account"
        }
      };

      api.post('/users/' + authentication.userId() + '/payment_methods', data);
      return data.payment_method;
    },
    initAdyenCheckout(onChangeCb = null) {
      return new AdyenCheckout({
        locale: authentication.retrieveLocale(),
        environment: ENV.adyen_env,
        originKey: ENV['adyen_origin_key_' + authentication.getCountryDomain()],
        paymentMethodsResponse: {},
        onChange: onChangeCb
      });
    },
    createAdyenCardFields(adyenCheckout) {
      return adyenCheckout.create('securedfields', {
        'styles': {
          error: {
            color: 'red'
          },
          validated: {
            color: 'green',
          },
          placeholder: {
            color: '#d8d8d8'
          }
        },
        'placeholders': {
          encryptedCardNumber: '',
          encryptedSecurityCode: ''
        },
        onError: function (err) {
          if (err.i18n) notification.show(null, null, err.i18n);
        },
      });
    }
  };
}
