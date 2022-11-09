'use strict';

angular.module('autocomplete',[]).component('autocomplete', {
  templateUrl: 'app/modules/shared/autocomplete/autocomplete.template.html',
  controllerAs: 'autocomplete',
  bindings: {
    autocompleteId: '@',
    location: '=',
    labelId: '@',
    placeholderId: '@',
    required: '<',
    name: '@',
    error: '=',
    hideInput: '<',
    placeChanged: '&'
  },
  controller: ['$interval', '$scope', '$window',
    function AutocompleteController($interval, $scope, $window) {
      var autocomplete = this;
      autocomplete.filled = false;
      autocomplete.location = "";

      autocomplete.$onChanges = function (changes) {
        autocomplete.toggleButton();
      };

      var deregisterAutocompleteWatcher = $scope.$watch(
        function () {
          return document.getElementById(autocomplete.autocompleteId);
        },
        function(newValue) {
          if (newValue) {
            deregisterAutocompleteWatcher();

            var autocompleteObject = new google.maps.places.Autocomplete(
              document.getElementById(autocomplete.autocompleteId), {types: ['geocode']}
            );

            autocompleteObject.inputId = autocomplete.autocompleteId;
            autocompleteObject.addListener('place_changed', function() {
              var response = autocompleteObject.getPlace();
              autocomplete.placeChanged({place: response});
            });
          }
        }
      );

      autocomplete.showResults = function() {
        autocomplete.toggleButton();
        if ($(".pac-container").length > 0) {
          var el = $(".pac-container").detach();
          var acClass = "." + autocomplete.autocompleteId;
          el.appendTo($(acClass));
        }
      };

      autocomplete.toggleButton = function() {
        autocomplete.filled = autocomplete.location.length > 0;
      };

      autocomplete.toggleButton();


      autocomplete.clear = function() {
        autocomplete.location = "";
        autocomplete.toggleButton();
        angular.element('autocompleteSearch').focus();
        $window.document.getElementById(autocomplete.autocompleteId).focus();
      }
    }
  ]
});
