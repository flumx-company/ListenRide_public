'use strict';

angular.module('message',[]).component('message', {
  templateUrl: 'app/modules/shared/message/message.template.html',
  controllerAs: 'message',
  bindings: {
    content: '<',
    status: '<',
    sender: '<',
    receiver: '<',
    timestamp: '<',
    confirmBooking: '&',
    acceptBooking: '&',
    showRatingDialog: '&',
    request: '<',
    messageTime: '<',
    time: '<',
    paymentFailed: '<',
    retryPayment: '<',
    retryClicked: '<'
  },
  controller: function MessageController(
    $translate,
    $localStorage,
    $mdDialog,
    api,
    ENV,
    MESSAGE_STATUSES,
    PAYMENT_STATUSES
  ) {
      const message = this;

      var messageDate = moment(message.time);
      var todayDate = moment(new Date());
      var hasInsurance = !!message.request.insurance;

      message.STATUSES = MESSAGE_STATUSES;
      message.PAYMENT_STATUSES = PAYMENT_STATUSES;

      message.isPaymentFailed = isPaymentFailed;
      message.isDirectBooking = message.request.lister.direct_booking_scheme && requestedMessageAbsent();

      // Dont display messages with following statuses to Rider;
      var riderNotDisplayableMessages = [
        message.STATUSES.ACCEPTED,
        message.STATUSES.RATE_RIDE,
        message.STATUSES.ONE_SIDE_RATE,
        message.STATUSES.PAYMENT_FAILED,
        message.STATUSES.WAITING_FOR_CAPTURE
      ];
      // Dont display messages with following statuses to Lister;
      var listerNotDisplayableMessages = [
        message.STATUSES.ACCEPTED,
        message.STATUSES.COMPLETE,
        message.STATUSES.RATE_RIDE,
        message.STATUSES.ONE_SIDE_RATE,
        message.STATUSES.PAYMENT_FAILED,
        message.STATUSES.WAITING_FOR_CAPTURE
      ];

      // var yesterdayDate = moment(new Date()).add(-1, 'days');

      // TODO: move to request helper
      function isPaymentFailed(paymentStatus) {
        // PAYMENT_STATUS
        // 1 - nothing happend
        // 2 - redirected but failed
        // 5 - failed, because not enough money on card
        return _.indexOf([1, 2, 5], paymentStatus) !== -1;
      }

      if (messageDate.format('LL') === todayDate.format('LL')){
        $translate(["shared.today"]).then(
          function (translations) {
            message.localTime = translations["shared.today"] + ', ' + messageDate.format('HH:mm');
          }
        );
      } else if (messageDate.add(1, 'days').format('LL') === todayDate.format('LL')){
        $translate(["shared.yesterday"]).then(
          function (translations) {
            message.localTime = translations["shared.yesterday"] + ', ' + messageDate.format('HH:mm');
          }
        );
      } else {
        message.localTime = messageDate.format('DD.MM.YYYY HH:mm');
      }

      message.buttonClicked = false;

      // check if current bike has insurance
      if (hasInsurance) {
        var insuranceEndpoint = "/users/" + $localStorage.userId + "/insurances/" + message.request.insurance.id + "?item_id=";
        message.bikeInsuranceUrl = ENV.apiEndpoint + insuranceEndpoint + message.request.insurance.items_uid.thing;
        message.bikeAssistInsuranceUrl = ENV.apiEndpoint + insuranceEndpoint + message.request.insurance.items_uid.person;
      }

      message.downloadDocument = function (certificateId) {
        api.get(insuranceEndpoint + certificateId, 'blob').then(
          function (success) {
            var name = message.request.insurance.items_uid.thing == certificateId ? "Bike" : "Bike Assist";
            var fileName ="Certificate " + name + " Insurance " + message.request.id + ".pdf";
            downloadAttachment(fileName, success.data, 'application/pdf');
          },
          function (error) {
          }
        );
      };

      function downloadAttachment(fileName, data, type) {
        var a = document.createElement('a');
        document.body.appendChild(a);
        var file = new Blob([data], {type: type});
        var fileURL = window.URL.createObjectURL(file);
        a.href = fileURL;
        a.download = fileName;
        a.click();
        document.body.removeChild(a);
      }

      message.closeDialog = function() {
        $mdDialog.hide();
      };

      message.book = function() {
        message.buttonClicked = true;
        message.acceptBooking();
      };

      message.sentMessage = function() {
        return message.status == null && $localStorage.userId == message.sender;
      };

      message.receivedMessage = function() {
        return message.status == null && $localStorage.userId != message.sender;
      };

      message.displayableStatusMessage = function() {
        if (!message.status) return false;
        if (message.request.rideChat) {
          return !riderNotDisplayableMessages.includes(message.status);
        } else {
          return !listerNotDisplayableMessages.includes(message.status);
        }
      };

      message.showReturnButton = function () {
        return !message.request.rideChat && message.isReturnable()
      };

      message.userAlreadyRated = function () {
        return message.request.status >= message.STATUSES.BOTH_SIDES_RATE ||
          message.request.status == message.STATUSES.ONE_SIDE_RATE && message.currentUserRated();
      }

      message.displayableNotification = function () {
        if (message.request.rideChat) {
          return message.displayableStatusMessage();
        } else {
          return message.status == message.STATUSES.BOTH_SIDES_RATE && message.userAlreadyRated()
           || message.displayableStatusMessage() && message.status !== message.STATUSES.BOTH_SIDES_RATE;
        }
      }

      message.currentUserRated = function () {
        return message.request.ratings[0].author_id == $localStorage.userId;
      }

      message.isReturnable = function () {
        var rentalStarted = moment.utc().diff(message.request.start_date) >= 0;
        if (message.request.returnable && rentalStarted) {
          if (message.request.rideChat) {
            return message.status == message.STATUSES.BOTH_SIDES_RATE
          } else {
            return message.status == message.STATUSES.CONFIRMED
          }
        }
      };

      message.handleRejectionSubmission = function(promise) {
        message.buttonClicked = true;
        promise
          .then(({ statusId }) => {
            message.request.messages.push({
              request_id: message.request.id,
              sender: $localStorage.userId,
              status: statusId,
              content: ""
            });
          })
          .catch(() => {
            message.buttonClicked = false;
          });
      };

      message.displayPicture = function(){
        return message.status == message.STATUSES.REQUESTED ||
          (message.isDirectBooking && message.status == message.STATUSES.CONFIRMED)
      };

      function requestedMessageAbsent(){
        return _.findIndex(message.request.messages, function(m) { return m.status == message.STATUSES.REQUESTED; }) == -1;
      }
    }
});
