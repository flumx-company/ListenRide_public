'use strict'

angular.module('booking', [])
// booking component
  .component('booking', {
    transclude: true,
    templateUrl: 'app/modules/booking/booking.template.html',
    controllerAs: 'booking',
    controller:
     function BookingController(
      $q,
      $localStorage,
      $rootScope,
      $scope,
      $state,
      $stateParams,
      $timeout,
      $mdDialog,
      $analytics,
      $translate,
      $filter,
      authentication,
      api,
      price,
      voucher,
      applicationHelper,
      calendarHelper,
      notification,
      paymentHelper,
      bikeHelper,
      bikeOptions,
      bikeCluster,
      userHelper,
      dateHelper
    ) {
      const booking = this;

      booking.$onInit = function () {
        // VARIABLES
        booking.showConfirmButton = true;
        booking.emailPattern = applicationHelper.emailPattern;
        booking.phonePattern = applicationHelper.phonePattern;

        booking.tabOrder = {
          'calendar': 0,
          'sign-in': 1,
          'details': 2,
          'payment': 3,
          'overview': 4
        }
        // get StateParams
        booking.bikeId = $stateParams.bikeId;
        booking.shopBooking = $stateParams.shop;
        $stateParams.hideHeader = $stateParams.shop;
        $stateParams.hideFooter = $stateParams.shop;
        // booking from SHOP PLUGIN starts without information about dates
        booking.startDate = $stateParams.startDate ? new Date($stateParams.startDate) : null;
        booking.endDate = $stateParams.endDate ? new Date($stateParams.endDate) : null;
        // default
        booking.bookDisabled = false;
        booking.user = {};
        booking.bike = {};
        booking.phoneConfirmed = 'progress';
        booking.selectedIndex = 0;
        booking.tabsDisabled = false;
        booking.voucherCode = "";
        booking.expiryDate = "";
        booking.booked = false;
        booking.processing = false;
        booking.isPremium = false;
        booking.bike.country_code = "";
        booking.user.balance = 0;
        booking.isOpeningHoursLoaded = false;
        booking.creditCardData = {}
        booking.paymentDescription = '';
        booking.insuranceEnabled = false;
        booking.hasTimeSlots = false;
        booking.timeslots = [];
        booking.validCreditCard = false;
        booking.showLogin = true;

        // METHODS
        booking.calendarHelper = calendarHelper;
        booking.authentication = authentication;
        booking.savePaymentOption = savePaymentOption;
        booking.sendCode = sendCode;
        booking.onSuccessPaymentValidation = onSuccessPaymentValidation;
        booking.loggedIn = loggedIn;
        booking.isTimeslotAvailable = isTimeslotAvailable;
        booking.humanReadableSize = bikeOptions.getHumanReadableSize;

        // INVOCATIONS
        getBikeData();

        // After material tabs inited
        $timeout(function () {
          authentication.loggedIn() ? getUserAndSetPayments() : setFirstTab();
        }, 0);

      };

      // go to next tab on user create success
      $rootScope.$on('user_created', function () {
        $timeout(function () {
          getUserAndSetPayments();
        }, 0);
      });

      // go to next tab on user login success
      $rootScope.$on('user_login', function () {
        $timeout(function () {
          getUserAndSetPayments();
        }, 0);
      });

      function loggedIn() {
        return authentication.loggedIn();
      }

      function getBikeData() {
        api.get('/rides/' + booking.bikeId).then(
          function (success) {
            booking.bike = success.data.current;
            booking.coverageTotal = booking.bike.coverage_total || 0;
            booking.bikeCategory = $translate.instant($filter('category')(booking.bike.category));
            booking.prices = booking.bike.prices;
            booking.insuranceEnabled = userHelper.insuranceEnabled(booking.bike.user);
            booking.hasTimeSlots = userHelper.hasTimeSlots(booking.bike.user);
            booking.timeslots = booking.hasTimeSlots ? userHelper.getTimeSlots(booking.bike.user) : [];
            booking.bike.is_cluster ? setSizeFromState() : booking.bike.size;
            booking.showLogin = true;
            getLister();
            updatePrices();

            // EVENT BIKE LOGIC
            booking.isOnSlotableEvent = _.indexOf([35, 36], booking.bike.family) !== -1;

            if (booking.isOnSlotableEvent) {
              booking.bike.event = {
                id: booking.bike.family,
                name: 'Cycling World',
                date: '23032019',
                duration: 2,
                type: 'slot',
                slot_range: 2,
                insurance: false
              }
            }

            // CLUSTER BIKE LOGIC
            if (booking.bike.is_cluster) {
              booking.cluster = success.data.cluster;

              booking.hasFrameSize = bikeCluster.hasFrameSize(booking.cluster.variations);

              booking.bikeVariations = bikeCluster
                .groupBikeVariations(booking.cluster.variations, booking.hasTimeSlots);

              mergeGeneralClusterParams();
            }
          },
          function (error) {
            notification.show(error, 'error');
            $state.go('home');
          }
        );
      }

      // TODO: check if we still need to have braintreeClient here
      function getUserAndSetPayments() {
        booking.reloadUser()
          .then(() => {
            let checkout = paymentHelper.initAdyenCheckout((state) => {
              $scope.$apply(function () {
                booking.validCreditCard = state.isValid;
                booking.creditCardData.data = state.data;
              });
            });

            paymentHelper.setupBraintreeClient();

            $timeout(() => {
              mountPaymentMethod(checkout);
            }, 0);
          });
      }

      function updateBikeDate() {
        api.get('/rides/' + booking.bikeId).then(
          function (success) {
            booking.bike = success.data.current;
          },
          function (error) {
            notification.show(error, 'error');
            $state.go('home');
          }
        );
      }

      function mergeGeneralClusterParams() {
        booking.bike.accessories = booking.cluster.accessories;
        booking.bike.ratings = booking.cluster.ratings;
      }

      function setSizeFromState() {
        if ($state.params.size) {
          booking.pickedBikeSize = bikeCluster.getVariationKey({
            size: $state.params.size,
            frame_size: $state.params.frame_size
          });
        }
      }

      function resetBikeSize() {
        return booking.bike.is_cluster ? null : booking.bike.size;
      }

      function isTimeslotAvailable(hour) {
        if (!booking.hasTimeSlots) return true;
        return calendarHelper.isTimeInTimeslots(hour, booking.timeslots);
      }

      function isCreditCardPayment() {
        return booking.user.payment_method.payment_type === 'credit-card';
      }

      function getLister() {
        api.get('/users/' + booking.bike.user.id).then(
          function (success) {
            booking.openingHours = success.data.opening_hours;
            booking.isOpeningHoursLoaded = true;
          },
          function (error) {
            // Treat opening hours as if non existing
            notification.show(error, 'error');
            booking.openingHours = [];
            booking.isOpeningHoursLoaded = true;
          }
        );
      }

      booking.insuranceAllowed = function () {
        return booking.insuranceEnabled && bikeHelper.isBikeCountryInsuranced(booking.bike) && eventBikeIncludeInsurance();
      };

      function eventBikeIncludeInsurance() {
        return booking.bike.event ? booking.bike.event.insurance : true;
      }

      booking.resetPassword = function() {
        //Set from error if any
        var form = booking.loginForm;
        form.email.$touched = true;
        if (form.email.$modelValue) {
          authentication.forgetGlobal(form.email.$modelValue)
        }
      };

      function getTabNameByOrder(index) {
        return (_.invert(booking.tabOrder))[index];
      }

      function updateState (params) {
        $state.go(
          $state.current,
          params,
          { notify: false }
        );
      }

      // ===============================
      // >>>> START BOOKING CALENDAR TAB
      // ===============================

      booking.dateRange = {};

      booking.updateDate = function() {
        if (booking.dateRange.start_date) {
          var startDate = new Date(booking.dateRange.start_date);
          booking.startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 10, 0, 0);

          booking.endDate = moment
            .utc([startDate.getFullYear(), startDate.getMonth(), startDate.getDate()])
            .add(+booking.dateRange.duration, 'seconds').hours(18)
            .toDate();

          setInitHours();
          updatePrices();
          booking.isDateValid = validDates();
          booking.pickedBikeSize = resetBikeSize();

          if (booking.bike.is_cluster){
            bikeCluster
              .getAvailableClusterBikes(booking.cluster.id, booking.startDate, booking.endDate)
              .then(availableBikeIds => {
                booking.availableBikeIds = availableBikeIds;
                bikeCluster.markAvailableSizes(booking.bikeVariations, booking.availableBikeIds);
              })
              .finally(() => {
                // update scope one more time
                _.defer(() => $scope.$apply());
              });
          }
        }
      };

      function validClusterSize() {
        if (!booking.bike.is_cluster) return true;

        // false - if we don't have available bike ids from backend
        if (booking.availableBikeIds && booking.pickedBikeSize) {
          return !booking.bikeVariations[booking.pickedBikeSize].notAvailable
        } else {
          return false;
        }
      }

      booking.onSizeChange = function () {
        let sizeStateParams = {
          size: booking.bikeVariations[booking.pickedBikeSize].size,
          frame_size: booking.bikeVariations[booking.pickedBikeSize].frame_size
        }
        updateStateSize(sizeStateParams);
      }

      function updateStateSize(sizeState) {
        updateState(sizeState);
      }

      function setInitHours() {
        var openTime = calendarHelper.getInitHours(booking.openingHours, booking.startDate, booking.endDate);
        booking.startTime = 0;
        booking.endTime = 0;
        booking.startDate = openTime.startDate;
        booking.endDate = openTime.endDate;
      }

      booking.onTimeChange = function(slot) {
        var slotDate = slot + "Date"; // startDate, endDate
        var slotTime = slot + "Time"; // startTime, endTime
        var date = new Date(booking[slotDate]);
        date.setHours(booking[slotTime], 0, 0, 0);
        booking[slotDate] = date;

        validDates();
        booking.pickedBikeSize = resetBikeSize();
        updatePrices();
      };

      function validDates() {
        return booking.startDate && booking.endDate &&
          booking.endDate != "Invalid Date" &&
          booking.startDate.getTime() < booking.endDate.getTime();
      }

       function isTimeValid() {
         return !!(booking.startTime && booking.endTime);
       }

      // =================================
      // START BOOKING CALENDAR TAB <<<<<<
      // =================================

      booking.tabCompleted = function(label) {
        return booking.selectedIndex > booking.tabOrder[label] ? "✔" : "    ";
      };

      booking.addVoucher = function() {
        voucher.addVoucher(booking.voucherCode).then(function(response){
          $analytics.eventTrack('click', {category: 'Request Bike', label: 'Add Voucher'});
          booking.voucherCode = "";
          booking.reloadUser();
        }, null);
      };

      booking.nextDisabled = function() {
        switch (getTabNameByOrder(booking.selectedIndex)) {
          case 'calendar': return !validDates() || !isTimeValid() || !validClusterSize();
          case 'sign-in': return false;
          case 'details': return !checkValidDetails();
          case 'payment': return !checkValidPayment();
          case 'overview': return booking.bookDisabled;
        }
      };

      function checkValidDetails() {
        return booking.phoneConfirmed === 'success' &&
               booking.validAddress &&
               booking.verificationForm.$valid &&
               !booking.processing
      }

      function checkValidPayment() {
        return booking.paymentMethod === 'current' || booking.validCreditCard;
      }

      function updatePrices() {
        var prices = price.calculatePrices({
          startDate: booking.startDate,
          endDate: booking.endDate,
          prices: booking.prices,
          coverageTotal: booking.coverageTotal,
          isPremiumCoverage: booking.isPremium,
          isShopUser: booking.shopBooking,
          setCustomPrices: booking.bike.custom_price,
          insuranceEnabled: booking.insuranceEnabled,
          timeslots: booking.timeslots
        });
        booking.subtotal = prices.subtotal;
        booking.subtotalDiscounted = prices.subtotalDiscounted;
        booking.lnrFee = prices.serviceFee + prices.basicCoverage;
        booking.premiumCoverage = prices.premiumCoverage;
        booking.total = Math.max(prices.total - booking.user.balance, 0);
      }

      booking.premiumChange =function() {
        updatePrices()
      };

      booking.resendSms = function() {
        booking.toggleConfirmButton();
        booking.phoneConfirmed = 'progress';
        booking.confirmation_0 = '';
        booking.confirmation_1 = '';
        booking.confirmation_2 = '';
        booking.confirmation_3 = '';
      };

      booking.pickAvailableBikeId = function () {
        return bikeCluster.pickAvailableBikeId({
          isCluster: booking.bike.is_cluster,
          bikeId: booking.bike.id,
          bikeVariations: booking.bikeVariations,
          pickedBikeVariant: booking.pickedBikeSize,
          availableBikeIds: booking.availableBikeIds
        });
      }

      booking.nextAction = function () {
        switch (getTabNameByOrder(booking.selectedIndex)) {
          case 'calendar': {
            // re-write bike id in component
            booking.bikeId = booking.pickAvailableBikeId();
            // update state
            updateState({
              bikeId: booking.bikeId,
              startDate: booking.startDate,
              endDate: booking.endDate,
              ...(booking.pickedBikeSize ? bikeCluster.transformBikeVariationKey(booking.pickedBikeSize) : [])
            });
            // get actual bike data
            updateBikeDate();
            // check which tab should be active
            setFirstTab();
            break;
          }
          case 'sign-in': setFirstTab(); break;
          case 'details': booking.saveAddress(); break;
          case 'payment': booking.savePaymentOption(); break;
          case 'overview': booking.book(); break;
          default: setFirstTab(); break;
        }
      };

      booking.saveAddress = function() {
        booking.processing = true;
        var address = {
          'locations': {
            '0': {
              "street": booking.address.street + " " + booking.address.streetNumber,
              "zip": booking.address.zip,
              "city": booking.address.city,
              "country": booking.address.country,
              "primary": true
            }
          }
        };
        api.put('/users/' + $localStorage.userId, address).then(
          function (success) {
            booking.reloadUser().then(function () {
              booking.processing = false;
            });
          },
          function (error) {
            booking.processing = false;
            notification.show(error, 'error');
          }
        );
      };

      function mountPaymentMethod(checkout) {
        if (booking.paymentFormFields) return;
        booking.paymentFormFields = paymentHelper.createAdyenCardFields(checkout);
        booking.paymentFormFields.mount('#securedfields');
      }

      booking.tokenizeCard = function() {
        paymentHelper.postCreditCard(booking.creditCardData, onSuccessPaymentValidation);
      };

      function savePaymentOption() {
        if (booking.paymentMethod === 'current') {
          booking.nextTab();
        } else {
          booking.tokenizeCard();
        }
      }

      function onSuccessPaymentValidation(data) {
        updatePaymentInformation(data);
        // reset form and data after success
        booking.creditCardData = {};
        booking.paymentForm.$setPristine();
        booking.paymentForm.$setUntouched();
        // go to next tab
        booking.nextTab();
      }

      function updatePaymentInformation(data) {
        booking.user.payment_method = paymentHelper.updatePaymentUserData(booking.user.payment_method, data);
        booking.paymentDescription = paymentHelper.getPaymentShortDescription(booking.user.payment_method);
        booking.paymentMethod = booking.user.payment_method ? 'current' : '';
      }

      booking.reloadUser = function() {
        return api.get('/users/' + $localStorage.userId).then(
          function (success) {
            booking.user = success.data;
            booking.user.firstName = success.data.first_name;
            booking.user.lastName = success.data.last_name;
            booking.creditCardHolderName = booking.user.first_name + " " + booking.user.last_name;

            booking.paymentMethod = booking.user.payment_method ? 'current' : '';

            // Autocomplete phone number if it's confirmed already
            if (booking.user.has_phone_number) {
              booking.phoneConfirmed = 'success';
              // TODO: we need to investigate and remove one of this phone_numbers, because it's a duplicate
              booking.phone_number = '+' + success.data.phone_number;
              // TODO: find why verificationForm equals undefined (after user sign in / sign up)
              if (booking.verificationForm) booking.verificationForm.phone_number = booking.phone_number;
            }

            if (booking.user.payment_method) {
              booking.paymentDescription = paymentHelper.getPaymentShortDescription(booking.user.payment_method);
            }

            setFirstTab();

            updatePrices();
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      };

      function setFirstTab() {
        if (!isDateSet()) {
          booking.selectedIndex = booking.tabOrder['calendar'];
        } else if (!authentication.loggedIn()) {
          booking.selectedIndex = booking.tabOrder['sign-in'];
        } else if (!validUserDetails()) {
          booking.selectedIndex = booking.tabOrder['details'];
        } else if(!booking.user.payment_method) {
          booking.selectedIndex = booking.tabOrder['payment'];
        } else {
          booking.selectedIndex = booking.tabOrder['overview'];
        }
        trackTabLoad();
      }

      function isDateSet() {
        return booking.startDate && booking.endDate;
      }

      function validUserDetails() {
        return booking.user.confirmed_phone && booking.user.has_address;
      }

      booking.emailSignup = function () {
        var user = {
          email: booking.user.email,
          firstName: booking.user.firstName,
          lastName: booking.user.lastName,
          password: booking.user.password,
          isShop: !!booking.shopBooking
        }
        booking.authentication.signupGlobal(user, true);
      };

      function sendCode() {
        if (!booking.authentication.loggedIn()) return setFirstTab();

        booking.sendSms(booking.verificationForm.phone_number);
      }

      // phone confirmation
      //TODO: move to shared logic
      booking.sendSms = function (numberInput) {
        if (!_.isEmpty(numberInput.$error)) { return }
        var data = {"phone_number": numberInput.$modelValue};
        booking.toggleConfirmButton();
        api.put('/users/' + $localStorage.userId + '/update_phone', data).then(
          function (success) {
            notification.show(success, null, 'booking.details.sms-confirmation-message');
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      };

      booking.confirmPhone = function () {
        var form = booking.verificationForm;
        var codeDigits = form.confirmation_0.$viewValue + form.confirmation_1.$viewValue + form.confirmation_2.$viewValue + form.confirmation_3.$viewValue;
        if (codeDigits.length === 4) {
          var data = { "phone_confirmation_code": codeDigits};
          api.post('/confirm_phone', data).then(
            function (success) {
              booking.toggleConfirmButton();
              booking.phoneConfirmed = 'success';
            },
            function (error) {
              notification.show(error, 'error');
              booking.phoneConfirmed = 'error';
            }
          );
        }
      };

      // toggle confirm phone button
      booking.toggleConfirmButton = function () {
        booking.showConfirmButton = !booking.showConfirmButton;
      };

      // go to next tab
      booking.nextTab = function () {
        booking.selectedIndex = booking.selectedIndex + 1;
        trackTabLoad();
      };

      // go to previous tab
      booking.previousTab = function () {
        booking.selectedIndex = booking.selectedIndex - 1;
        trackTabLoad();
      };

      function trackTabLoad() {
        $("#scroll-body").scrollTop(0);
        switch (booking.selectedIndex) {
          case 0: $analytics.eventTrack('load', {category: 'Request Bike', label: 'Sign Up Tab'}); break;
          case 1: $analytics.eventTrack('load', {category: 'Request Bike', label: 'Details Tab'}); break;
          case 2: $analytics.eventTrack('load', {category: 'Request Bike', label: 'Payment Tab'}); break;
          case 3: $analytics.eventTrack('load', {category: 'Request Bike', label: 'Summary Tab'}); break;
        }
      }


      booking.fillAddress = function(place) {
        var components = place.address_components;
        if (components) {
          var desiredComponents = {
            "street_number": "",
            "route": "",
            "locality": "",
            "country": "",
            "postal_code": ""
          };

          for (var i = 0; i < components.length; i++) {
            var type = components[i].types[0];
            if (type in desiredComponents) {
              desiredComponents[type] = components[i].long_name;
            }
          }

          booking.user.street = desiredComponents.route + " " + desiredComponents.street_number;
          booking.user.zip = desiredComponents.postal_code;
          booking.user.city = desiredComponents.locality;
          booking.user.country = desiredComponents.country;
        }
      };


      function authenticateThreeDSecure(requestData) {
        var threeDSecureAuthenticationResult = $q.defer();

        if (isCreditCardPayment() && requestData.redirect_params) {
          showThreeDSecureAuthentication(requestData);
        } else {
          threeDSecureAuthenticationResult.resolve(requestData);
        }

        return threeDSecureAuthenticationResult.promise;
      }

      function showThreeDSecureAuthentication(requestData) {
        $mdDialog.show({
          template: '<md-dialog aria-label="List dialog">' +
            '  <md-dialog-content>' +
            '<div id="three-d-secure" style="height:300px"></div>' +
            '</md-dialog-content>' +
            '</md-dialog>',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: true,
          escapeToClose: false,
          onComplete: function () {
            let {md, paRequest, issuerUrl} = requestData.redirect_params;
            const successPageRedirect = `${api.getApiUrl()}/requests/${requestData.id}/authorise3d?site=${document.location.origin}`;

            let iframeContent = `
                  <form method="POST" action="${issuerUrl}" id="3dform">
                      <input type="hidden" name="PaReq" value="${paRequest}" />
                      <input type="hidden" name="MD" value="${md}" />
                      <input type="hidden" name="TermUrl" value="${successPageRedirect}" />
                      <noscript>
                          <br>
                          <br>
                          <div style="text-align: center">
                              <h1>Processing your 3D Secure Transaction</h1>
                              <p>Please click continue to continue the processing of your 3D Secure transaction.</p>
                              <input type="submit" class="button" value="continue"/>
                          </div>
                      </noscript>
                  </form>`;

          document.getElementById('three-d-secure').innerHTML = iframeContent;
          document.getElementById('3dform').submit();
          }
        });
      }

      booking.book = function () {
        $analytics.eventTrack('click', {category: 'Request Bike', label: 'Request Now'});
        booking.inProcess = true;

        let data = {
          user_id: $localStorage.userId,
          ride_id: booking.bikeId,
          start_date: dateHelper.getDateUTC(booking.startDate).toISOString(),
          end_date: dateHelper.getDateUTC(booking.endDate).toISOString(),
          instant: !!booking.shopBooking,
          insurance: {
            premium: booking.isPremium
          }
        };

        // get Google Analytics client id
        ga(function (tracker) {
          data.tracking_id = tracker.get('clientId');
        });

        api
          .post('/requests', data)
          .then((response) => {
            $analytics.eventTrack('Book', {  category: 'Request Bike', label: 'Request'});
            return authenticateThreeDSecure(response.data);
          })
          .then((response) => {
            booking.booked = true;
            if (!booking.shopBooking) {$state.go('requests', {requestId: response.id});}
          })
          .catch((error) => {
            booking.inProcess = false;
            notification.show(error, 'error');
          });

      };
    }
  })
  // signup tab ui component
  .component('signupTab', {
    templateUrl: 'app/modules/booking/signup-tab.template.html',
    require: {parent: '^booking'},
    controllerAs: 'signup'
  })
  // details tab ui component
  .component('detailsTab', {
    templateUrl: 'app/modules/booking/details-tab.template.html',
    require: {parent: '^booking'},
    controllerAs: 'details'
  })
  // payment tab ui component
  .component('paymentTab', {
    templateUrl: 'app/modules/booking/payment-tab.template.html',
    require: {parent: '^booking'},
    controllerAs: 'payment'
  })
  // overview tab ui component
  .component('overviewTab', {
    templateUrl: 'app/modules/booking/overview-tab.template.html',
    require: {parent: '^booking'},
    controllerAs: 'overview'
  })
  // overview tab ui component
  .component('calendarTab', {
    templateUrl: 'app/modules/booking/calendar-tab.template.html',
    require: {parent: '^booking'},
    controllerAs: 'calendar'
  });
