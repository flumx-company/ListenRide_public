import { getName, getNames, getCode } from 'country-list';

angular.module('settings', [])
.component('settings', {
  templateUrl: 'app/modules/settings/settings.template.html',
  controllerAs: 'settings',
  controller: function SettingsController(
    $localStorage,
    $translate,
    $state,
    api,
    accessControl,
    sha256,
    Upload,
    loadingDialog,
    ngMeta,
    userApi,
    $timeout,
    $mdDialog,
    authentication,
    voucher,
    notification,
    paymentHelper,
    payoutHelper,
    ENV,
    $scope
  ) {
      // should be an authenticated user
      if (accessControl.requireLogin()) return;

      // meta information
      ngMeta.setTitle($translate.instant("settings.meta-title"));
      ngMeta.setTag("description", $translate.instant("settings.meta-description"));

      var settings = this;

      settings.$onInit = function() {
        // VARIABLES
        settings.user = {};
        settings.croppedDataUrl = false;
        settings.loaded = false;
        settings.payoutMethod = {};
        settings.password = "";
        settings.startTime = {};
        settings.endTime = {};
        settings.errorTime = {};
        settings.enabledTime = {};
        settings.time = Date.now();
        settings.error = false;
        settings.openingHoursId = null;
        settings.weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        settings.completeClosed = false;
        settings.emailFormat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        settings.current_payment = false;
        settings.business = {};
        settings.user.business = false;
        settings.user.has_billing = false;

        // payment
        settings.showPaymentChangeForm = showPaymentChangeForm;
        settings.isPaymentChangeChecked = false;
        settings.paymentLoading = false;
        settings.creditCardData = {};
        settings.validCreditCard = false;
        settings.tokenizeCard = tokenizeCard;
        settings.onSuccessPaymentUpdate = onSuccessPaymentUpdate;
        settings.onErrorPaymentUpdate = onErrorPaymentUpdate;
        settings.isPayoutExist = isPayoutExist;
        // payout
        settings.showPayoutChangeForm = false;
        settings.payoutMethod.loading = false;
        settings.payoutMethod.formData = {};

        // methods
        settings.changePassword = changePassword;
        settings.changePhoneNumber = changePhoneNumber;
        settings.updateBusiness = updateBusiness;
        settings.deleteAccount = deleteAccount;
        settings.hoursFormValid = hoursFormValid;
        settings.getInputDate = getInputDate;
        settings.performInputDay = performInputDay;
        settings.performOpeningHours = performOpeningHours;
        settings.addChild = addChild;
        settings.removeInputDate = removeInputDate;
        settings.onSubmit = onSubmit;
        settings.toggleBilling = toggleBilling;
        settings.fillAddress = fillAddress;
        settings.addPayoutMethod = addPayoutMethod;
        settings.addVoucher = addVoucher;
        settings.updateUser = updateUser;
        settings.compactObject = compactObject;
        settings.showResponseMessage = showResponseMessage;
        settings.updateNewsletter = updateNewsletter;
        settings.toggleNotifications = toggleNotifications;
        settings.getCountryName = getName;
        settings.getCountryCode = getCode;
        settings.getCountryNames = getNames;

        // invocations
        userApi.getUserData().then(function (response) {
          settings.loaded = true;
          setUserData(response.data);
        });
        // init braintree client
        paymentHelper.setupBraintreeClient();
      };

      function setUserData(data) {
        settings.user = data;

        settings.selectedPreferences = _.omit(settings.user.notification_preference, ['id', 'newsletter']);
        settings.isChecked = _.valuesIn(settings.selectedPreferences).every(function (item) {
          return item === true;
        });

        // payment method exist
        if (settings.user.payment_method) {
          settings.paymentDescription = paymentHelper.getPaymentShortDescription(settings.user.payment_method);
        }

        settings.openingHoursEnabled = settings.user.opening_hours ? settings.user.opening_hours.enabled : false;

        if (settings.user.locations) {
          settings.user.has_billing = !!settings.user.locations.billing
        }
        if (settings.user.phone_number) {
          updatePrivatePhoneNumber(settings.user.phone_number)
        }
        if (!_.isEmpty(settings.user.business)) {
          settings.business = settings.user.business;
        }
        if (settings.user.payout_method && settings.user.payout_method.iban) {
          settings.payoutMethod.short_iban = getShortIban();
        }

        $timeout(setInitFormState.bind(this), 0);
      }

      // availability data
      var formData = {};

      // ===================
      // === PROFILE TAB ===
      // ===================

      /**
       * controller for change contact info
       * $mdDialog has a bug. it doesn't allow render template
       * correctly for component. thats why
       * inline controller is used instead of controller
       * @param {userApi} userApi api for users
       * @param {$mdDialog} $mdDialog material dialog
       * @param {verification} verification service for verfication
       * @returns {void}
       */
      var ChangeContactController = function(userApi, $mdDialog, verification) {
        var changeContact = this;

        changeContact.sentConfirmationSms = false;

        changeContact.confirmPhone = function () {
          verification.confirmPhone(changeContact.user.confirmation_code).then(function () {
            $mdDialog.hide({
              phone_number: changeContact.user.new_phone_number
            });
          });
        };

        changeContact.sendSms = function () {
          verification.sendSms(changeContact.user.new_phone_number).then(function () {
            changeContact.sentConfirmationSms = true;
          }, function () {
            changeContact.changeContact.sentConfirmationSms = false;
          });
        };

        // cancel the modal
        changeContact.closeDialog = $mdDialog.cancel;

        changeContact.onInit = function () {
          userApi.getUserData().then(function (response) {
            var phone_number = null;
            if (response.data.phone_number) {
              phone_number = angular.copy('+' + response.data.phone_number)
            } else if (response.data.unconfirmed_phone) {
              phone_number = angular.copy('+' + response.data.unconfirmed_phone)
            }

            changeContact.user = response.data;
            changeContact.user.new_phone_number = phone_number;
          });
        };

        changeContact.onInit();
      };

       var ChangePasswordController = function ($mdDialog) {
         var changePassword = this;

         // cancel the modal
         changePassword.closeDialog = $mdDialog.cancel;

         changePassword.update = function() {
           var user = {
               'email': $localStorage.email,
               'current_password': changePassword.user.old_password,
               'password': changePassword.user.new_password,
               'password_confirmation': changePassword.user.new_password
           };


           api.put('/users/' + $localStorage.userId + '/update_password/', user).then(function (success) {
             settings.password = changePassword.user.new_password;
             settings.showResponseMessage('update-profile-success', 'toasts');
             changePassword.closeDialog();
           }, function (error) {
             // message: toasts.incorrect-old-password
             settings.showResponseMessage(error.data.errors[0].detail, 'toasts');
           });

         };
       };

      /**
       * converts phone number to private number
       * 1234567890 -> 123****890
       * @param {string} phone_number phone number of the user
       * @returns {void}
       */
      function updatePrivatePhoneNumber(phone_number) {
        var initials = phone_number.slice(0, 3);
        var endings = phone_number.slice(-3);
        var length = phone_number.length - initials.length - endings.length + 1;
        settings.user.phone_number_privatized = "+" + initials.concat(Array(length).join('*')).concat(endings);
      }

      function toggleBilling (bool) {
        settings.user.has_billing = bool;
        if (!settings.user.locations) { settings.user['locations'] = {} }

        if (bool) {
          settings.user.locations['billing'] = {
            first_name: settings.user.first_name,
            last_name: settings.user.last_name
          };
          return
        }

        if (_.isEmpty(settings.user.locations.billing)) return;

        if (settings.user.locations.billing.id) {
          removeBilling(settings.user.locations.billing.id)
        } else {
          cleanBillingInputs()
        }
      }

      function removeBilling(id) {
        api.delete("/users/" + settings.user.id + "/locations/" + id).then(
          function (response) {
            cleanBillingInputs()
          },
          function (error) {
            notification.show(error, 'error');
          }
        )
      }

      function cleanBillingInputs() {
        var billing = settings.user.locations.billing;

        billing.id = '';
        billing.first_name = '';
        billing.last_name = '';
        billing.street = '';
        billing.zip = '';
        billing.city = '';
        billing.country = '';
        billing.name = '';
        billing.vat = '';

        settings.user.has_billing = false;
      }

      function fillAddress (place) {
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

          settings.user.locations.primary.street = desiredComponents.route + " " + desiredComponents.street_number;
          settings.user.locations.primary.zip = desiredComponents.postal_code;
          settings.user.locations.primary.city = desiredComponents.locality;
          settings.user.locations.primary.country = desiredComponents.country;
        }
      }

      function prepareData() {
        var primary = settings.user.locations.primary;
        var billing = settings.user.locations.billing;
        var user_billing_location = {};

        var user_data = {
          "description": settings.user.description,
          "profile_picture": Upload.dataUrltoBlob(settings.croppedDataUrl, _.isEmpty(settings.profilePicture) ? '' : settings.profilePicture.name)
        };

        var user_primary_location = {
          "id": primary.id,
          "street": primary.street,
          "zip": primary.zip,
          "city": primary.city,
          "country": primary.country,
          "primary": true
        };

        if (settings.user.has_billing) {
          user_billing_location = {
            "id": billing.id,
            "first_name": billing.first_name,
            "last_name": billing.last_name,
            "street": billing.street,
            "zip": billing.zip,
            "city": billing.city,
            "country": billing.country,
            "name": billing.name || '',
            "vat": billing.vat || '',
            "primary": false
          };
        }

        var locations = [user_primary_location];

        if (settings.user.has_billing) { locations = [user_primary_location, user_billing_location] }

        if (settings.password && settings.password.length >= 6) {
          user_data.password_hashed = sha256.encrypt(settings.password);
        }

        return {
          'user': settings.compactObject(user_data),
          'locations': locations
        }
      }

      function updateUser () {
        loadingDialog.open();

        Upload.upload({
          method: 'PUT',
          url: api.getApiUrl() + '/users/' + $localStorage.userId,
          data: prepareData() ,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + $localStorage.accessToken
          }
        }).then(
          function (success) {
            loadingDialog.close();
            notification.show(success, null, 'toasts.update-profile-success');
            settings.user = success.data;
            if (success.data.phone_number) updatePrivatePhoneNumber(success.data.phone_number);
            settings.user.has_billing = !!success.data.locations.billing;
            $localStorage.profilePicture = success.data.profile_picture.profile_picture.url;
            settings.profilePicture = false;
          },
          function (error) {
            loadingDialog.close();
            notification.show(error, 'error');
          }
        );
      }

      // TODO: replace to service
      function showResponseMessage(message, path) {
        // lowercase and replace all spaces in string to dash sign and concat with path
        // Incorrect Old Password, toast -> toast.incorrect-old-password
        var translateMessage = path + '.' + message.toLowerCase().replace(/\s/g, '-');
        notification.show(null, null, translateMessage);
      }

      function compactObject (o) {
        var clone = _.clone(o);
        _.each(clone, function(v, k) {
          if(!v) {
            delete clone[k];
          }
        });
        return clone;
      }

      function changePhoneNumber (event) {
        $mdDialog.show({
          templateUrl: 'app/modules/settings/change-contact.template.html',
          controller: ChangeContactController,
          controllerAs: 'changeContact',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          escapeToClose: true,
          fullscreen: true
        }).then(function (success) {
          // update model with new number
          settings.user.phone_number = success.phone_number;
          // update model with private number
          updatePrivatePhoneNumber(success.phone_number);
        });
      }

      function changePassword (event) {
        $mdDialog.show({
          templateUrl: 'app/modules/settings/change-password.template.html',
          controller: ChangePasswordController,
          controllerAs: 'changePassword',
          parent: angular.element(document.body),
          targetEvent: event,
          openFrom: angular.element(document.body),
          closeTo: angular.element(document.body),
          clickOutsideToClose: true,
          escapeToClose: true,
          fullscreen: true
        }).then(function (success) {
          // update model with new number
          // settings.user.phone_number = success.phone_number;
          // show success toast
        });
      }

      // ===================
      // === ACCOUNT TAB ===
      // ===================

      const checkout = paymentHelper.initAdyenCheckout((state) => {
        $scope.$apply(function () {
          settings.validCreditCard = state.isValid;
          settings.creditCardData.data = state.data;
        });
      });

      function mountPaymentMethod () {
        settings.paymentFormFields = paymentHelper.createAdyenCardFields(checkout);
        settings.paymentFormFields.mount('#securedfields');
      }

      function tokenizeCard () {
        settings.paymentLoading = true;
        paymentHelper.postCreditCard(settings.creditCardData, settings.onSuccessPaymentUpdate, settings.onErrorPaymentUpdate);
      }

      function showPaymentChangeForm() {
        settings.isPaymentChangeChecked = true;
        mountPaymentMethod();
      }

      function onSuccessPaymentUpdate(data) {
        // reset form and data after success
        settings.creditCardData = {};
        settings.paymentForm.$setPristine();
        settings.paymentForm.$setUntouched();
        settings.isPaymentChangeChecked = false;
        settings.paymentFormFields.unmount();
        settings.paymentLoading = false;

        updatePaymentInformation(data);
      }

      function onErrorPaymentUpdate(){
        settings.paymentLoading = false;
      }

      function updatePaymentInformation(data) {
        settings.user.payment_method = paymentHelper.updatePaymentUserData(settings.user.payment_method, data);
        settings.paymentDescription = paymentHelper.getPaymentShortDescription(settings.user.payment_method);
      }

      function addPayoutMethod () {
        settings.payoutMethod.loading = true;
        payoutHelper.postPayout(
          settings.payoutMethod,
          onSuccessPayoutUpdate,
          onErrorPayoutUpdate
        );

        function onSuccessPayoutUpdate(data) {
          settings.user.payout_method = data.payout_method;
          settings.payoutMethod.short_iban = getShortIban();
          settings.payoutMethod.loading = false;
          // clear payout form
          settings.payoutMethod.formData = {};
          settings.showPayoutChangeForm = false;
          settings.payoutForm.$setPristine();
          settings.payoutForm.$setUntouched();
        }

        function onErrorPayoutUpdate() {
          settings.payoutMethod.loading = false;
        }
      }

      function getShortIban() {
        return '**** ' + settings.user.payout_method.iban.slice(-6);
      }

      function isPayoutExist() {
        if (!settings.user.payout_method) return false;
        switch (settings.user.payout_method.payment_type) {
          case 'bank-account':
            return true;
          default:
            notification.show(null, null, 'shared.errors.unexpected-payment-type');
            return false;
        }
      }

      // business account settings
      function updateBusiness () {
        var data = {
          'business': {
            'company_name': settings.business.company_name,
            'vat': settings.business.vat
          }
        };

        api.put("/businesses/" + settings.user.business.id, data).then(
          function (success) {
            notification.show(success, null, 'toasts.update-profile-success');
            settings.user.business = true;
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

      function deleteAccount(event) {
        var confirm = $mdDialog.confirm()
          .title($translate.instant('settings.delete-account-sure'))
          .textContent($translate.instant('settings.delete-account-sure-description'))
          .targetEvent(event)
          .ok($translate.instant('settings.delete-account-yes'))
          .cancel($translate.instant('settings.delete-account-no'));

        $mdDialog.show(confirm).then(
          function() {
            api.delete('/users/' + authentication.userId()).then(
              function(success) {
                notification.show(success, null, 'toasts.account-deleted');
                document.execCommand("ClearAuthenticationCache");
                $localStorage.$reset();
                $state.go('home');
              },
              function(error) {
                notification.show(error, 'error');
              }
            );
          },
          function() {

          }
        );
      }

      function addVoucher() {
        voucher.addVoucher(settings.voucherCode).then(function () {
          settings.voucherCode = "";
          userApi.getUserData().then(function (response) {
            settings.user.balance = response.data.balance;
          });
        }, null);
      }

      function updateNewsletter() {
        var data = {
          'notification_preference': {
            'newsletter': settings.user.notification_preference.newsletter
          }
        };

        api.put("/notification_preferences/" + settings.user.notification_preference.id, data).then(
          function (success) {
            notification.show(success, null, 'toasts.update-profile-success');
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

      function toggleNotifications() {
        var preferences = settings.user.notification_preference;
        for (var key in preferences) {
          if(key !== 'id' && key !== 'newsletter') {
            preferences[key] = settings.isChecked;
          }
        }

        var data = {
          'notification_preference': settings.user.notification_preference
        };

        api.put("/notification_preferences/" + settings.user.notification_preference.id, data).then(
          function (success) {
            notification.show(success, null, 'toasts.update-profile-success');
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

      // ===================
      // ==== HOURS TAB ====
      // ===================

      function onSubmit() {
        var reqData = {
          'hours': _.isEmpty(formData) ? {
            0: null,
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null
          } : changeKeys(formData),
          'enabled': settings.openingHoursEnabled
        };

        if (settings.openingHoursId) {
          updateOpeningHours(reqData)
        } else {
          createOpeningHours(reqData)
        }
      }

      function changeKeys(data) {
        var formatedData = {};
        _.each(data, function (value, key) {
          var foundKey = settings.weekDays.findIndex(function (element) {
            return key === element;
          });
          _.set(formatedData, foundKey, formatDayData(value));
        });
        return formatedData;
      }

      function setInitFormState() {
        if (!_.isEmpty(settings.user.opening_hours)) {
          settings.openingHoursId = settings.user.opening_hours.id;
          var hours = settings.user.opening_hours.hours;
          _.each(settings.weekDays, function (weekDay, key) {
            if (!_.isEmpty(hours[key])) {
              _.each(hours[key], function (range, index) {
                var start_at = hours[key][index].start_at / 3600;
                var duration = hours[key][index].duration / 3600;
                settings.enabledTime[weekDay] = true;
                setDayTime(weekDay, start_at, duration, index);
              })
            } else {
              setDayTime(weekDay, null, null, 0);
            }
          });
          completeClosed();
        }
      }

      function performOpeningHours(model) {
        if (model) {
          _.each(settings.weekDays, function (weekDay, key) {
            setDayTime(weekDay, null, null, 0);
          });
          completeClosed()
        } else {
          onSubmit()
        }
      }

      function getInputDate(weekDay, isStart, index) {
        var date = isStart ? settings.startTime[weekDay][index] : settings.endTime[weekDay][index];
        var field = isStart ? 'start_at' : 'end_at';
        saveDate(weekDay, field, date, index);
        var duration = getDuration(weekDay, index);
        var endTime = _.get(formData, weekDay + '.' + index + '.' + 'end_at');

        if (duration) {
          _.set(settings.errorTime, weekDay, false);
          saveDate(weekDay, 'duration', duration, index);
        } else if (endTime == null) { // If second input still blank
          _.set(settings.errorTime, weekDay, false);
        } else {
          _.set(settings.errorTime, weekDay, true);
        }

        hoursFormValid();
        completeClosed();
      }

      function saveDate(weekDay, key, value, index) {
        var weekDayKey = weekDay + '.' + index + '.' + key;
        formData = _.set(formData, weekDayKey, value);
      }

      function getDuration(weekDayKey, index) {
        var startTime = _.get(formData, weekDayKey + '.' + index + '.' + 'start_at');
        var endTime = _.get(formData, weekDayKey + '.' + index + '.' + 'end_at');
        var duration = null;
        // Get values that came from server
        if (!startTime) startTime = Number(settings.startTime[weekDayKey][index]);
        if (!endTime) endTime = Number(settings.endTime[weekDayKey][index]);

        if (!startTime && !endTime) return null;
        duration = (endTime - startTime);
        return duration <= 0 ? null : duration;
      }

      function hoursFormValid() {
        var errors = Object.values(settings.errorTime);
        settings.error = errors.some(function (e) {
          return e === true;
        })
      }

      function performInputDay(weekDay, model) {
        if (model) {
          fillInputDate(weekDay)
        } else {
          clearInputDate(weekDay);
          completeClosed();
        }
      }

      function removeInputDate(weekDay, index) {
        settings.startTime[weekDay].splice(index, 1);
        settings.endTime[weekDay].splice(index, 1);
        formData[weekDay].splice(index, 1);
      }

      function clearInputDate(weekDay) {
        settings.startTime[weekDay] = [{}];
        settings.endTime[weekDay] = [{}];
        delete formData[weekDay];
      }

      function fillInputDate(weekDay) {
        if (unableToPreFill(weekDay)) return;
        var prev_day = [];
        var currentDay = _.findIndex(settings.weekDays, function (o) {
          return o == weekDay;
        });
        var hours = _.isEmpty(settings.user.opening_hours) ? [] : settings.user.opening_hours.hours;
        _.each(settings.weekDays, function (weekDay, key) { // Check for previously completed days
          if (key > currentDay) {
            return prev_day
          } // Return if day after current day
          var anyData = formDataPresent(weekDay);
          if (!_.isEmpty(hours[key]) && !anyData) {
            prev_day = getPreviousDay(hours[key], true);

          } else if (anyData) { // If previous day chosen, but not saved yet
            prev_day = getPreviousDay(formData[weekDay], false);
          }
        });

        if (!_.isEmpty(prev_day)) {
          _.each(prev_day, function (data, key) {
            setDayTime(weekDay, data.start_at, data.duration, key)
          });
        }
      }

      function unableToPreFill(weekDay) {
        var formEmphty = true;
        _.each(settings.weekDays, function (weekDay, key) {
          if (formDataPresent(weekDay)) formEmphty = false
        });

        return (weekDay == 'Monday' || (_.isEmpty(settings.user.opening_hours) && formEmphty))
      }

      function getPreviousDay(dayRanges, inSeconds) {
        var day = [];
        _.each(dayRanges, function (range, key) {
          day.push({
            'start_at': inSeconds ? range.start_at / 3600 : Number(range.start_at),
            'duration': inSeconds ? range.duration / 3600 : range.duration
          })
        });

        return day
      }

      function formDataPresent(weekDay) {
        var present = false;
        _.each(formData[weekDay], function (range, key) {
          if (range.start_at !== null || range.duration !== null) {
            present = true
          }
        });
        return present
      }

      function formatDayData(data) {
        var range = [];
        _.each(data, function (value, key) {
          var startAt = _.get(value, 'start_at') * 3600;
          var duration = _.get(value, 'duration') * 3600;
          if (startAt != 0 && startAt != 0) range.push({
            start_at: startAt,
            duration: duration
          });
        });
        return range
      }

      function createOpeningHours(data) {
        api.post('/opening_hours', data).then(
          function (success) {
            settings.openingHoursId = success.data.id;
            notification.show(success, null, 'toasts.opening-hours-success');
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

      function updateOpeningHours(data) {
        api.put("/opening_hours/" + settings.openingHoursId, data).then(
          function (success) {
            notification.show(success, null, 'toasts.opening-hours-success');
          },
          function (error) {
            notification.show(error, 'error');
          }
        );
      }

      function setDayTime(day, start_at, duration, rangeIndex) {
        settings.startTime = _.set(settings.startTime, day + '.' + rangeIndex, start_at);
        settings.endTime = _.set(settings.endTime, day + '.' + rangeIndex, duration + start_at);
        formData = _.set(formData, day + '.' + rangeIndex + '.' + 'start_at', start_at);
        formData = _.set(formData, day + '.' + rangeIndex + '.' + 'duration', duration);
      }

      function addChild(day) {
        if (settings.startTime[day]) {
          return settings.startTime[day].push({})
        }
        settings.startTime[day] = [{}]
      }

      function completeClosed() {
        if (!settings.openingHoursEnabled) return settings.completeClosed = false;
        _.each(formData, function (weekDay, key) {
          if (_.isEmpty(weekDay[0])) return settings.completeClosed = true;
          if (weekDay[0].start_at != undefined || weekDay[0].end_at!= undefined) {
            return settings.completeClosed = false
          } else {
            settings.completeClosed =  true
          }
        });
      }

    }
})
.component('settingsAccountTab', {
  templateUrl: 'app/modules/settings/settings-account-tab.template.html',
  require: {
    parent: '^settings'
  },
  controllerAs: 'settingsAccount'
})
