'use strict';

angular
  .module('list')
  .directive('lnrDatePicker', function() {
    return {
      restrict: "A",
      controller: ['$scope', '$translate', 'calendarHelper', lnrDatePickerController],
      bindToController: {
        data: '=',
        openingHours: '<?',
        disabledDates: '<',
        bike: '<?',
        bikeCluster: "<?",
        requests: '<?',
        dateOnChange: '<?',
        dateOnClear: '<?',
        clearCalendarData: '=?',
        dateContainer: '<?',
        dateScrollContainer: '<?',
        hasTimeSlots: '<?',
        timeslots: '<?'
      },
      link: function ($scope, element, attrs) {
        $scope.el = angular.element(element[0]).find('.js-datapicker');
        if (!$scope.el.length) $scope.el = angular.element(element[0]);
      }
    }
  });

function lnrDatePickerController($scope, $translate, calendarHelper) {
  var vm = this;

  vm.$onInit = function() {
    vm.updateData = updateData;
    vm.clearData = clearData;
    vm.openCalendar = openCalendar;
    vm.clearCalendar = clearCalendar;
  }

  vm.$postLink = postLink;
  vm.$onDestroy = onDestroy;

  // TODO: should find a method to call directive methods at outside
  // TODO: replace watch with angualr component way
  $scope.$watch(function(scope){
    return(vm.clearCalendarData);
  }, function (newVal, oldVal) {
    if (vm.clearCalendarData) vm.clearCalendar();
    vm.clearCalendarData = false;
  }, false);

  function updateData(date1, date2) {
    date1 = moment
      .utc([date1.getFullYear(), date1.getMonth(), date1.getDate(), 0, 0])

    date2 = date2 ? moment.utc([date2.getFullYear(), date2.getMonth(), date2.getDate(), 0, 0]) : date1.clone();

    if (date1.isSame(date2)) date2.hours(23).minutes(59);

    var duration = date2.diff(date1, 'seconds');
    var startDate = duration > 0 ? date1 : date2;
    var newData = {
      'start_date': startDate.format(),
      'duration': Math.abs(duration),
      'is_changed': true
    }

    angular.extend(vm.data, newData);

    if (typeof vm.dateOnChange == 'function') vm.dateOnChange();
    _.defer(function () {
      $scope.$apply();
    });
  }

  function clearData() {
    vm.clearCalendar();
    angular.extend(vm.data, {
      'start_date': null,
      'duration': null
    });

    if (typeof vm.dateOnClear == 'function') vm.dateOnClear();
    $scope.$apply();
  }

  function postLink(){
    var active = 'js-datepicker-opened';
    $scope.el.dateRangePicker({
      autoClose: true,
      showTopbar: false,
      stickyMonths: true,
      singleMonth: 'auto',
      selectForward: true,
      startOfWeek: 'monday',
      showShortcuts: false,
      beforeShowDay: classifyDate,
      language: $translate.preferredLanguage(),
      container: vm.dateContainer || 'body',

      lnrIsWidthStatic: true,
      lnrShowTimeDom: false,
      lnrSingleMonthMinWidth: 659, // 320px - min-width for 1 calendar part + gap
      lnrJumpToSelected: false,
      lnrContainer: vm.dateContainer || '',
      lnrScrollWindow: vm.dateScrollContainer || '',

      extraClass: 'date-picker-wrapper--ngDialog date-picker-wrapper--two-months'
    }).bind('datepicker-opened', function () {
      $scope.el.addClass(active);
    }).bind('datepicker-change', function (event, obj) {
        vm.updateData(obj.date1, obj.date2);
    }).bind('datepicker-first-date-selected', function (event, obj) {
      vm.clearData();
      setFirstDate(obj.date1);
    }).bind('datepicker-closed', function (event, obj) {
      if (obj.date1 && !obj.date2) {
        setEndDate(new Date(obj.date1));
        vm.updateData(obj.date1, obj.date2);
      }
      $scope.el.removeClass(active);
    });

    //TODO: make services for this
    function classifyDate(date) {
      date.setHours(0, 0, 0, 0);
      var now = new Date();
      now.setHours(0, 0, 0, 0);
      if (date.getTime() < now.getTime()) {
        return [false, "date-past", ""];
      } else if (isReserved(date)) {
        return [false, "date-reserved", ""];
      } else if (isNotAvailable(date) || calendarHelper.isDayAvailable(vm.openingHours, date)) {
        return [false, "date-closed", ""];
      } else {
        return [true, "date-available", ""];
      }
    }

    function setFirstDate(d) {
      $scope.el.dateRange.setStart(d);
    }

    function setEndDate(d) {
      $scope.el.dateRange.setEnd(d);
    }

    function changeRange() {
      if (vm.data.start_date) {
        // set range to datepicker with datepicker special method
        // setDateRange({String}, {String})
        var startDate = moment.utc(vm.data.start_date);
        var lastDate = startDate.clone().add(vm.data.duration, 'seconds');
        $scope.el.dateRange
          .setDateRange(startDate.format(), lastDate.format(), true);
      } else {
        vm.clearCalendar();
      }
    }

    function isNotAvailable(date) {
      if (vm.bike && _.isEmpty(vm.bike.availabilities)) return false;
      return calendarHelper.isBikeNotAvailable({
        date,
        bike: vm.bike,
        cluster: vm.bikeCluster,
        timeslots: vm.timeslots
      });
    }

    // The data for cluster bike will be reserved only if all bikes in cluster reserved on this date
    function isReserved(date) {
      return isReservedPrimary(date) && isAllClusterReserved(date) && isAllHalfDayReserved(date, vm.requests);
    }

    function isReservedDate(date, requests) {
      if (!requests) return false;

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
      if (!vm.hasTimeSlots) return true;
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
          if (moment(start, "DD-MM-YYYY").isSame(moment(end, "DD-MM-YYYY"))) {
            requestsCount += calendarHelper.countTimeslots(requests[i].start_date_tz, requests[i].end_date_tz, vm.timeslots);
          } else {
            return true;
          }
        }
      }

      isAllDayBooked = requestsCount >= 2;

      return isAllDayBooked;
    }

    function isReservedPrimary(date) {
      return isReservedDate(date, vm.requests);
    }

    function isAllClusterReserved(date) {
      // for single bike always return true
      if (!(vm.bike && vm.bike.is_cluster)) return true;

      var isClusterBikeReserved = true;
      _.forEach(vm.bikeCluster.variations, function (variant) {
        isClusterBikeReserved = isClusterBikeReserved && isReservedDate(date, variant.requests)
      });

      return isClusterBikeReserved;
    }

    // add close event, if we click on trigger object when calendar is open
    $scope.el.on('click', function (e) {
      if ($(this).hasClass(active)) $scope.el.dateRange.close();
    });

    // save this data, because mdDialog destroys elements before $onDestroy method
    $scope.el.dateRange = $scope.el.data('dateRangePicker');

    // add relative position to custom container if it was set
    if (vm.dateContainer) $(vm.dateContainer).css('position', 'relative');

    changeRange();
  }

  function clearCalendar() {
    $scope.el.dateRange.clear();
  }

  function onDestroy() {
    $scope.el.dateRange.destroy();
  }

  function openCalendar($event) {
    $event.stopPropagation();
    $scope.el.dateRange.open();
  }
}
