'use strict';

angular.module('addressInput',[]).component('addressInput', {
  templateUrl: 'app/modules/shared/address-input/address-input.template.html',
  controllerAs: 'addressInput',
  bindings: {
    validAddress: '=',
    address: '='
  },
  controller: ['$mdMedia', '$scope',
    function AddressInputController($mdMedia, $scope) {
      var addressInput = this;

      addressInput.validAddress = false;
      addressInput.address = {
        street: "",
        streetNumber: "",
        zip: "",
        city: "",
        country: ""
      }
      

      addressInput.checkValidAddress = function() {
        addressInput.validAddress = addressInput.addressForm.$valid;
      };

      addressInput.updateAddress = function(place) {
        var desiredComponents = {
          "street_number": "",
          "route": "",
          "locality": "",
          "country": "",
          "postal_code": ""
        };

        var components = place.address_components;
        if (components) {
          for (var i = 0; i < components.length; i++) {
            var type = components[i].types[0];
            if (type in desiredComponents) {
              desiredComponents[type] = components[i].long_name;
            }
          }

          $scope.$apply(function () {
            addressInput.address.street = desiredComponents.route;
            addressInput.address.streetNumber = desiredComponents.street_number;
            addressInput.address.zip = desiredComponents.postal_code;
            addressInput.address.city = desiredComponents.locality;
            addressInput.address.country = desiredComponents.country;
          });
          
          $scope.$apply(function() {
            addressInput.validAddress = addressInput.addressForm.$valid;
            addressInput.addressForm.$setSubmitted();
          });
        }
      }
    }
  ]
});
