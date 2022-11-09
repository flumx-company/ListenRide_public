import moment from 'moment';

angular.module('bike').component('calendar', {
  templateUrl: 'app/modules/bike/calendar/calendar.template.html',
  controllerAs: 'calendar',
  bindings: {
    bike: '<',
    bikeCluster: '<',
    bikeId: '<',
    bikeFamily: '<',
    bikeSize: '<',
    bikeAvailabilities: '<',
    userId: '<',
    priceHalfDay: '<',
    priceDay: '<',
    priceWeek: '<',
    prices: '<',
    requests: '<',
    coverageTotal: '<',
    countryCode: '<',
    cluster: '<',
    bikeVariations: '<'
  },
  controller: function CalendarController(
    $scope,
    $localStorage,
    $state,
    $mdDialog,
    $translate,
    $mdMedia,
    $window,
    $analytics,
    dateHelper,
    price,
    api,
    authentication,
    verification,
    ENV,
    calendarHelper,
    notification,
    bikeOptions,
    bikeCluster,
    userHelper,
    bikeEventHelper
  ) {
    const calendar = this;

    // variables
    calendar.authentication = authentication;
    calendar.calendarHelper = calendarHelper;
    calendar.requested = false;
    calendar.defaultDateRange = '';
    calendar.hasInsurance = false;
    calendar.insuranceEnabled = false;
    calendar.hasTimeSlots = false;
    calendar.isHalfDayBook = false;
    calendar.HOURS_QUANTITY = 17;
    calendar.pickedBikeSize = null;

    // methods
    calendar.validClusterSize = validClusterSize;
    calendar.isTimeslotAvailable = isTimeslotAvailable;
    calendar.bikeEventSlotPicked = bikeEventSlotPicked;

    // initialization
    setRider();

    calendar.$onChanges = function (changes) {
      calendar.humanReadableSize = bikeOptions.getHumanReadableSize(calendar.bikeSize);
      if (changes.userId.currentValue && (changes.userId.currentValue !== changes.userId.previousValue)) {
        api.get('/users/' + changes.userId.currentValue).then(function (response) {
          calendar.bikeOwner = response.data;
          checkUserData();
          initOverview();
          setPropertiesFromState();
          initCalendarPicker();
          checkEventBike();
        });
      }
    };

    function setRider() {
      if (!$localStorage.userId) {
        return false;
      }

      api.get('/users/' + $localStorage.userId).then(
        function (success) {
          calendar.rider = success.data;
        },
        function (error) {
          notification.show(error, 'error');
        }
      );
    }

    function setPropertiesFromState() {
      setCalendarDefaultParams();
      setSizeFromState();
    }

    function checkUserData() {
      calendar.insuranceEnabled = userHelper.insuranceEnabled(calendar.bike.user);
      calendar.hasTimeSlots = userHelper.hasTimeSlots(calendar.bike.user);
      calendar.timeslots = userHelper.getTimeSlots(calendar.bike.user);
    }

    calendar.onSizeChange = function() {
      let sizeStateParams = {
        size: calendar.bikeVariations[calendar.pickedBikeSize].size,
        frame_size: calendar.bikeVariations[calendar.pickedBikeSize].frame_size
      }
      calendar.updateStateSize(sizeStateParams);
    }

    calendar.updateStateSize = function(sizeState){
      updateState(sizeState);
    }

    function updateState (params) {
      // calendar.isOnSlotableEvent checks if bike related to event 8bar-clubride
      // TODO: update it after new logic for event bike will be implemented
      if (calendar.isOnSlotableEvent) return;
      $state.go(
        $state.current, params
      );
    }

    function setDateTime(startDate, endDate) {
      calendar.startTime = 0;
      calendar.endTime = 0;
      startDate.setHours(calendar.startTime, 0, 0, 0);
      endDate.setHours(calendar.endTime, 0, 0, 0);
      dateChange(startDate, endDate);
    }

    function setCalendarDefaultParams() {
      calendar.startDate = $state.params.start_date ? new Date($state.params.start_date) : null;

      if(calendar.startDate) {
        calendar.endDate = new Date(moment(calendar.startDate).add($state.params.duration, 'seconds'));
        calendar.defaultDateRange = (moment(calendar.startDate).format('YYYY-MM-DD') + ' to ' + moment(calendar.endDate).format('YYYY-MM-DD'));
        setDateTime(calendar.startDate, calendar.endDate);
      }
    }

    function setSizeFromState() {
      if ($state.params.size) {
        calendar.pickedBikeSize = bikeCluster.getVariationKey({
          size: $state.params.size,
          frame_size: $state.params.frame_size
        });
      }
    }

    function initCalendarPicker() {
      var deregisterRequestsWatcher = $scope.$watch('calendar.requests', function () {
        if (calendar.requests !== undefined) {
          deregisterRequestsWatcher();
          calendar.owner = calendar.userId == $localStorage.userId;
          angular.element('#bikeCalendar').dateRangePicker({
            alwaysOpen: true,
            container: '#bikeCalendarWrapper',
            beforeShowDay: classifyDate,
            inline: true,
            selectForward: true,
            showShortcuts: false,
            showTopbar: false,
            singleMonth: true,
            startOfWeek: 'monday',
            language: $translate.preferredLanguage(),
          }).bind('datepicker-change', function (event, obj) {
            var start = obj.date1;
            var end = obj.date2;

            $scope.$apply(function () {
              calendar.startDate = start;
              calendar.endDate = end;
              setDateTime(calendar.startDate, calendar.endDate);
            });
          });
        }
      });
    }

    calendar.onTimeChange = function(slot) {
      var slotDate = slot + "Date";
      var slotTime = slot + "Time";
      var date = new Date(calendar[slotDate]);
      date.setHours(calendar[slotTime], 0, 0, 0);
      calendar[slotDate] = date;
      dateChange(calendar.startDate, calendar.endDate);
    };

    calendar.onDayRangeChange = function() {
      var dayRangeParsed = JSON.parse(calendar.event.dayRange);
      calendar.startDate = new Date(dayRangeParsed.startDate);
      calendar.endDate = new Date(dayRangeParsed.endDate);

      calendar.endDate.setHours(9, 0, 0, 0);
      calendar.startDate.setHours(9, 0, 0, 0);
      dateChange(calendar.startDate, calendar.endDate);
    }

    calendar.onBooking = function(){
      $mdDialog.hide();
      $state.go('booking', {
        bikeId: calendar.pickAvailableBikeId(),
        startDate: calendar.startDate,
        endDate: calendar.endDate,
        ...(calendar.pickedBikeSize ? bikeCluster.transformBikeVariationKey(calendar.pickedBikeSize) : [])
      });
    };

    calendar.pickAvailableBikeId = function () {
      return bikeCluster.pickAvailableBikeId({
        isCluster: calendar.bike.is_cluster,
        bikeId: calendar.bike.id,
        bikeVariations: calendar.bikeVariations,
        pickedBikeVariant: calendar.pickedBikeSize,
        availableBikeIds: calendar.availableBikeIds
      });
    }

    calendar.onBikeRequest = function() {
      $mdDialog.hide();
      calendar.requested = true;
      api.get('/users/' + $localStorage.userId).then(
        function (success) {
          calendar.rider = success.data;
          verifyOnConfirm();
        },
        function (error) {
          notification.show(error, 'error');
        }
      );
    };

    function verifyOnConfirm() {
      if (calendar.isOnSlotableEvent || isUserVerified()) {
        calendar.confirmBooking();
      }
      else {
        calendar.requested = false;
        verification.openDialog(false, false, false, calendar.confirmBooking);
      }
    }

    function isUserVerified() {
      return calendar.rider.has_address && calendar.rider.confirmed_phone && calendar.rider.status >= 1;
    }

    calendar.promptAuthentication = function(event) {
      authentication.showSignupDialog(false, true, event);
    };

    calendar.isFormInvalid = function() {
      return !calendar.bikeId || !calendar.isDateValid() || !isTimeValid();
    };

    function validClusterSize() {
      // always true if bike is not a cluster
      if (calendar.bike && !calendar.bike.is_cluster) return true;

      // false - if we don't have available bike ids from backend
      if (calendar.availableBikeIds && calendar.pickedBikeSize) {
        return !calendar.bikeVariations[calendar.pickedBikeSize].notAvailable
      } else {
        return false;
      }
    }

    function isTimeValid() {
      return !!(calendar.startTime && calendar.endTime);
    }

    calendar.isDateValid = function() {
      return calendar.startDate && calendar.endDate &&
        calendar.startDate.getTime() < calendar.endDate.getTime();
    }

    // EVENT BIKE CODE
    function checkEventBike() {
      calendar.isOnSlotableEvent = bikeEventHelper.isOnSlotableEvent(calendar.bikeFamily);
      if (!calendar.isOnSlotableEvent) return;

      calendar.isRangedDateEvent = bikeEventHelper.isRangedDateEvent(calendar.bikeFamily);

      // TODO: move this to bike helper?
      calendar.freeBike = calendar.prices[0].price <= 0;

      calendar.event = bikeEventHelper.getEventData(calendar.bikeFamily, calendar.requests);
      // if event duration is only one day we should pick it automatically
      if (calendar.event.days && calendar.event.days.length == 1) calendar.day = calendar.event.days[0];

      // if there is only one time slot available we should pick the first one
      if (calendar.event && calendar.event.slots.length == 1) {
        calendar.event.pickupSlotId = 0;
        calendar.bikeEventSlotPicked(calendar.event.pickupSlotId);
      }
    }

    function bikeEventSlotPicked(pickupSlotId) {
      const {startDate, endDate, startTime, endTime} = calendar.event.changePickupSlot(pickupSlotId);
      calendar.startDate = startDate;
      calendar.endDate = endDate;
      calendar.startTime = startTime;
      calendar.endTime = endTime;
      dateChange(calendar.startDate, calendar.endDate);
    }

    calendar.availabilityMessage = function($index, date) {
      if (!calendar.isOptionEnabled($index, calendar.bikeOwner.opening_hours, date)) {
        return openingHoursAvailable() ?  ' ('+ $translate.instant('calendar.status-closed')+')' : ' ('+($translate.instant('calendar.status-in-past'))+')';
      }
    };

    calendar.isOptionEnabled = calendarHelper.isTimeAvailable;


    // This function handles booking and all necessary validations
    calendar.confirmBooking = function () {
      if (calendar.isOnSlotableEvent || calendar.rider.status === 3) {
        showBookingDialog();
      } else {
        // User did not enter any payment method yet
        showPaymentDialog();
      }
    };


    calendar.insuranceCountry = function () {
      if (calendar.countryCode) { return _.includes(["DE", "AT"], calendar.countryCode) }
    };

    calendar.hasInsurance = function() {
      // calendar.insurance_disabled
      return calendar.insuranceEnabled && calendar.insuranceCountry();
    }

    var showBookingDialog = function (event) {
      $mdDialog.show({
        controller: BookingDialogController,
        controllerAs: 'bookingDialog',
        templateUrl: 'app/modules/bike/calendar/bookingDialog.template.html',
        parent: angular.element(document.body),
        targetEvent: event,
        openFrom: angular.element(document.body),
        closeTo: angular.element(document.body),
        clickOutsideToClose: false,
        fullscreen: true // Only for -xs, -sm breakpoints.
      });
    };

    var BookingDialogController = function () {
      var bookingDialog = this;
      bookingDialog.errors = {};
      bookingDialog.inProcess = false;
      bookingDialog.calendar = calendar;
      bookingDialog.total = totalPriceCalculator();
      bookingDialog.balance = calendar.rider.balance;
      bookingDialog.hide = hideDialog;

      bookingDialog.book = function () {
        bookingDialog.inProcess = true;
        var startDate = calendar.startDate;
        var endDate = calendar.endDate;

        // The local timezone-dependent dates get converted into neutral,
        // non-timezone utc dates, preserving the actually selected date values
        var startDate_utc = new Date(
          Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours())
        );
        var endDate_utc = new Date(
          Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endDate.getHours())
        );

        var data = {
          user_id: $localStorage.userId,
          ride_id: calendar.bikeId,
          start_date: startDate_utc.toISOString(),
          end_date: endDate_utc.toISOString()
        };

        api.post('/requests', data).then(
          function(success) {
            calendar.current_request = success.data;
            calendar.current_request.glued = true;
            calendar.current_request.rideChat = $localStorage.userId == calendar.current_request.user.id;

            calendar.current_request.chatFlow = calendar.current_request.rideChat ? "rideChat" : "listChat";
            calendar.current_request.userType = calendar.current_request.rideChat ? "lister" : "user";
            calendar.current_request.userData = calendar.current_request[calendar.current_request.userType];

            calendar.current_request.rating = calendar.current_request.userData.rating_lister + calendar.current_request.userData.rating_rider;
            if (calendar.current_request.userData.rating_lister != 0 &&
                calendar.current_request.userData.rating_rider != 0) {
              calendar.current_request.rating = calendar.current_request.rating / 2;
            }

            calendar.current_request.rating = Math.round(calendar.current_request.rating);
            $state.go('requests', {requestId: success.data.id});
            bookingDialog.hide();
            $analytics.eventTrack('Book', {  category: 'Request Bike', label: 'Request'});
          },
          function(error) {
            bookingDialog.inProcess = false;
            calendar.requested = false;
            notification.show(error, 'error');
          }
        );
      };

      bookingDialog.cancel = function () {
        bookingDialog.hide();
        calendar.requested = false;
        $analytics.eventTrack('Cancel', {  category: 'Request Bike', label: 'Cancel Request'});
      }
    };

    var showPaymentDialog = function (event) {
      $mdDialog.show({
        controller: PaymentDialogController,
        controllerAs: 'paymentDialog',
        templateUrl: 'app/modules/bike/calendar/paymentDialog.template.html',
        parent: angular.element(document.body),
        targetEvent: event,
        openFrom: angular.element(document.body),
        closeTo: angular.element(document.body),
        clickOutsideToClose: true,
        fullscreen: false // Only for -xs, -sm breakpoints.
      });
    };

    var PaymentDialogController = function () {
      var paymentDialog = this;

      paymentDialog.openPaymentForm = function () {
        var w = 550;
        var h = 700;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);

        var locale = $translate.use();
        $window.open(ENV.userEndpoint + $localStorage.userId + "/payment_methods/new?locale=" + locale, "popup", "width=" + w + ",height=" + h + ",left=" + left + ",top=" + top);
        // For small screens, show Chat Dialog again
        hideDialog();
        calendar.requested = false;
      }
    };

    var hideDialog = function () {
      // For small screens, show Chat Dialog again
      if ($mdMedia('xs')) {
        showChatDialog();
      } else {
        $mdDialog.hide();
      }
    };

    var showChatDialog = function (event) {
      $mdDialog.show({
        controller: ChatDialogController,
        controllerAs: 'chatDialog',
        templateUrl: 'app/modules/bike/calendar/chatDialog.template.html',
        parent: angular.element(document.body),
        targetEvent: event,
        openFrom: angular.element(document.body),
        closeTo: angular.element(document.body),
        clickOutsideToClose: false,
        fullscreen: true // Only for -xs, -sm breakpoints.
      });
    };

    var ChatDialogController = function () {
      var chatDialog = this;
      chatDialog.request = calendar.current_request;
      chatDialog.hide = function () {
        $mdDialog.hide();
      };
    };

    function totalPriceCalculator() {
      var total = calendar.total - calendar.rider.balance;
      total >= 0 ? total : total = 0;
      return total
    }

    function getWeekDay(date) {
      var dayOfWeek = date.getDay() - 1;
      if (dayOfWeek == - 1) {
        dayOfWeek = 6;
      }
      return dayOfWeek
    }

    function openHours(weekDay) {
      var workingHours = [];
      $.each( weekDay, function( key, value ) {
        var from = value.start_at / 3600;
        var until = (value.duration / 3600) + from + 1;
        $.merge( workingHours, _.range(from,until) )
      });
      return workingHours
    }

    function classifyDate(date) {
      date.setHours(0, 0, 0, 0);
      var now = new Date();
      now.setHours(0, 0, 0, 0);
      if (date.getTime() < now.getTime()) {
        return [false, "date-past", ""];
      } else if (isReserved(date)) {
        return [false, "date-reserved", ""];
      } else if (dateClosed(date)) {
        return [false, "date-closed", ""];
      } else {
        return [true, "date-available", ""];
      }
    }

    function dateClosed(date) {
      var isDateClose = false;

      // check if opening hours exist
      if (openingHoursAvailable()) {
        isDateClose = isDateClose || _.isEmpty(calendar.bikeOwner.opening_hours.hours[getWeekDay(date)]);
      }

      // check if availabilities exist and concat with previous results
      if (!_.isEmpty(calendar.bike.availabilities)) {
        isDateClose = isDateClose || isNotAvailable(date)
      }

      return isDateClose;
    }

    function isNotAvailable(date) {
      return calendarHelper.isBikeNotAvailable({
        date,
        bike: calendar.bike,
        cluster: calendar.bikeCluster,
        timeslots: calendar.timeslots
      });
    }

    function openingHoursAvailable() {
      return calendar.bikeOwner &&
        !!calendar.bikeOwner.opening_hours &&
        calendarHelper.checkIsOpeningHoursEnabled(calendar.bikeOwner.opening_hours) &&
        _.some(calendar.bikeOwner.opening_hours.hours, Array)
    }

    // The data for cluster bike will be reserved only if all bikes in cluster reserved on this date
    function isReserved(date) {
      return isReservedPrimary(date) && isAllClusterReserved(date) && isAllHalfDayReserved(date, calendar.requests);
    }

    function isReservedDate(date, requests) {
      for (var i = 0; i < requests.length; ++i) {
        var start = new Date(requests[i].start_date_tz);
        start.setHours(0, 0, 0, 0);
        var end = new Date(requests[i].end_date_tz);
        end.setHours(0, 0, 0, 0);

        if (start.getTime() <= date.getTime() &&
          date.getTime() <= end.getTime()) {
          return true;
        }
      }
      return false;
    }

    function isAllHalfDayReserved(date, requests) {
      if (!calendar.hasTimeSlots) return true;
      let isAllDayBooked = true;

      // TODO: remove hardcode from here
      let requestsCount = 0;

      for (var i = 0; i < requests.length; ++i) {
        var start = new Date(requests[i].start_date_tz);
        start.setHours(0, 0, 0, 0);
        var end = new Date(requests[i].end_date_tz);
        end.setHours(0, 0, 0, 0);

        if (start.getTime() <= date.getTime() &&
          date.getTime() <= end.getTime()) {

          // if request for one day we should check how much timeslots requested there
          if (moment(start, "DD-MM-YYYY").isSame(moment(end, "DD-MM-YYYY"))) {
            requestsCount += calendarHelper.countTimeslots(requests[i].start_date_tz, requests[i].end_date_tz, calendar.timeslots);
          } else {
            return true;
          }
        }
      }

      isAllDayBooked = requestsCount >= 2;

      return isAllDayBooked;
    }

    function isReservedPrimary(date) {
      return isReservedDate(date, calendar.requests);
    }

    function isAllClusterReserved(date) {
      // for single bike always return true
      if (calendar.bike && !calendar.bike.is_cluster) return true;

      var isClusterBikeReserved = true;
      _.forEach(calendar.bikeCluster.variations, function(variant) {
        isClusterBikeReserved = isClusterBikeReserved && isReservedDate(date, variant.requests)
      });

      return isClusterBikeReserved;
    }

    function initOverview() {
      calendar.subtotal = 0;
      calendar.lnrFee = 0;
      calendar.total = 0;

      calendar.formValid = false;
      calendar.datesValid = false;
    }

    // TODO: Replace custom receipt with modular receipt component in calendar template
    function dateChange(startDate, endDate) {
      resetSizePicker();
      if (calendar.isDateValid()) {
        calendar.durationDays = dateHelper.durationDays(startDate, endDate);
        calendar.durationDaysNew = dateHelper.durationDays(startDate, endDate);
        if (calendar.hasTimeSlots && calendar.durationDays <= 1) {
          calendar.isHalfDayBook = price.checkHalfDayEnabled(startDate, endDate, calendar.timeslots);
          calendar.halfDayPrice = price.getPriceFor('1/2 day', calendar.prices);
        }
        if (calendar.hasTimeSlots && calendar.isHalfDayBook) {
          calendar.displayableDuration = dateHelper.durationHoursPretty(startDate, endDate);
        } else {
          calendar.displayableDuration = dateHelper.durationDaysPretty(startDate, endDate);
        }
        var prices = price.calculatePrices({
          startDate: startDate,
          endDate: endDate,
          prices: calendar.prices,
          coverageTotal: calendar.coverageTotal,
          setCustomPrices: calendar.bike.custom_price,
          insuranceEnabled: calendar.insuranceEnabled,
          timeslots: calendar.hasTimeSlots ? calendar.timeslots : []
        });
        calendar.subtotal = prices.subtotal;
        // show discount only if special price is lower than base price
        calendar.specialPriceLowerThanBase = prices.subtotalDiscounted < prices.subtotal;
        calendar.subtotalDiscounted = prices.subtotalDiscounted;
        calendar.discount = prices.subtotal - prices.subtotalDiscounted;
        calendar.discountRelative = calendar.discount / calendar.durationDays;
        calendar.specialPriceDaily = prices.subtotalDiscounted / calendar.durationDays;

        calendar.lnrFee = prices.serviceFee + prices.basicCoverage;
        calendar.balance = calendar.rider ? Math.min(prices.total, calendar.rider.balance) : 0;
        calendar.total = prices.total - calendar.balance;

        if (calendar.cluster) {
          bikeCluster
            .getAvailableClusterBikes(calendar.cluster.id, startDate, endDate)
            .then(availableBikeIds => {
              // TODO: remove old logic when backend will send ids
              calendar.cluster.rides = availableBikeIds;

              // TODO: new logic
              calendar.availableBikeIds = availableBikeIds;
              bikeCluster.markAvailableSizes(calendar.bikeVariations, calendar.cluster.rides);
            })
            .finally(() => {
              // update scope one more time
              _.defer(() => $scope.$apply());
            });
        }

        updateState({
          start_date: moment(startDate).format('YYYY-MM-DD'),
          duration: moment(endDate).diff(moment(startDate), 'seconds')
        });

      } else {
        calendar.displayableDuration = dateHelper.durationDaysPretty(startDate, endDate);
        calendar.durationDays = 0;
        calendar.durationDaysNew = 0;
        calendar.subtotal = 0;
        calendar.lnrFee = 0;
        calendar.total = 0;
      }
    }

    function resetSizePicker() {
      calendar.pickedBikeSize = null;
    }

    function isTimeslotAvailable(hour) {
      if (!calendar.hasTimeSlots) return true;
      return calendarHelper.isTimeInTimeslots(hour, calendar.timeslots);
    }

    function countInvalidDays(startDate, endDate){
      var totalDays = Math.abs( startDate.getDate() - endDate.getDate() ) + 1;
      var currentDay = new Date(endDate);
      currentDay.setHours(0, 0, 0, 0);
      var i = 0;
      var invalidDays = 0;
      while (i < totalDays) {
        i++;
        if (isReserved(currentDay)) invalidDays++;
        currentDay.setDate(currentDay.getDate() - 1);
        currentDay.setHours(0, 0, 0, 0);
      }
      return invalidDays;
    }
  }
});
