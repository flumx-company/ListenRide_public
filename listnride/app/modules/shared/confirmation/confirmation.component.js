'use strict';

angular.module('confirmation', []).component('confirmation', {
  bindings: {
    buttonClass: '<',
    buttonDisable: '<',
    buttonText: '<',
    request: '<',
    onSubmit: '&',
    modalTitle: '<',
    modalBody: '<',
    modalOkBtnText: '<',
    modalCancelBtnText: '<',
    buttonCancelClass: '<'
  },

  template: `
    <md-button
      class="{{confirmation.buttonClass}}"
      ng-disabled="confirmation.buttonDisable"
      ng-click="confirmation.openDialog($event)">
      {{ confirmation.buttonText | translate }}
    </md-button>
  `,

  controllerAs: 'confirmation',

  controller: function ConfirmationController(requestsService) {
    const confirmation = this;

    confirmation.openDialog = function(clickEvent) {
      const promise = requestsService.rejectBooking({
        request: confirmation.request,
        clickEvent,
        options: {
          buttonClass: confirmation.buttonClass,
          modalTitle: confirmation.modalTitle,
          modalBody: confirmation.modalBody,
          modalOkBtnText: confirmation.modalOkBtnText,
          modalCancelBtnText: confirmation.modalCancelBtnText,
          buttonCancelClass: confirmation.buttonCancelClass
        }
      });
      confirmation.onSubmit({ promise });
    };
  }
});
