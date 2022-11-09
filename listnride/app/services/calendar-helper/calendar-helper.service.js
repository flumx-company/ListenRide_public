angular
  .module('listnride')
  .factory('calendarHelper', function (
    $translate,
    dateHelper,
    userHelper
  ) {
    let getWeekDay = function(date) {
      var dayOfWeek = date.getDay() - 1;
      if (dayOfWeek == - 1) {
        dayOfWeek = 6;
      }
      return dayOfWeek;
    };

    let openHours = function(weekDay) {
      var workingHours = [];
      $.each( weekDay, function( key, value ) {
        var from = value.start_at / 3600;
        var until = (value.duration / 3600) + from + 1;
        $.merge( workingHours, _.range(from,until) )
      });
      return workingHours
    };

    let isTimeAvailable = function(timeIndex, openingHours, date) {
      if (date === undefined) return true;

      var isAvailable = true;
      var isDateToday = moment().startOf('day').isSame(moment(date).startOf('day'));

      if (!openingHours && !isDateToday) return isAvailable;

      if (isDateToday) {
        isAvailable = timeIndex + 6 >= moment().hour() + 1;
      }

      if (openingHours && checkIsOpeningHoursEnabled(openingHours)) {
        var weekDay = openingHours.hours[getWeekDay(date)];
        if (!_.isEmpty(weekDay)) {
          var workingHours = openHours(weekDay);
          return workingHours.includes(timeIndex + 6) && isAvailable;
        }
      }

      return isAvailable;
    };

    let isTimeInTimeslots = function(hour, timeslots) {
      let timeslotsRange = [];
      _.forEach(timeslots, function(timeslot) {
        let timeslotRange = _.range(timeslot.start_time.hour, timeslot.end_time.hour + 1);
        timeslotsRange = [...timeslotsRange, ...timeslotRange]
      })
      return _.includes(timeslotsRange, hour);
    };

    let isDayAvailable = function(openingHours, date) {
      if (!openingHoursAvailable(openingHours)) return false;

      return _.isEmpty(openingHours.hours[getWeekDay(date)]);
    };

    function getInitHours(openingHours, startDate, endDate) {
      var openTime = {};
      if (openingHoursAvailable(openingHours)) {
        var firstDay = openingHours.hours[getWeekDay(startDate)];
        var lastDay = openingHours.hours[getWeekDay(endDate)];

            firstDay = openHours(firstDay);
            lastDay = openHours(lastDay);
            openTime.startTime = firstDay[0];
            openTime.endTime = lastDay[lastDay.length - 1];
      } else {
            openTime.startTime = 10; // default opening time
            openTime.endTime = 20; // default closing time
      }

      // If date today
      if (moment(startDate).isSame(moment(), 'day')) {
        var hour_now = moment().add(1, 'hours').hour();
        if (hour_now < 6) { hour_now = 6 }
        if (hour_now < openTime.startTime && openingHoursAvailable()) {
          hour_now = openTime.startTime
        }
        openTime.startTime = hour_now;
      }
      openTime.startDate = setStartDate(openTime.startTime, startDate);
      openTime.endDate = moment(endDate).hour(openTime.endTime)._d;
      return openTime;
    }

    function openingHoursAvailable(openingHours) {
      return !!openingHours && checkIsOpeningHoursEnabled(openingHours) && _.some(openingHours.hours, Array)
    }

    function checkIsOpeningHoursEnabled(openingHours) {
      if (openingHours.enabled !== undefined) {
        return openingHours.enabled
      }
      return true;
    }

    function setStartDate(startTime, startDate) {
      return moment(startDate).hour(startTime)._d;
    }

    function countTimeslots(requestStart, requestEnd, timeslots) {
      var startTime = moment.utc(requestStart).format('HH');
      var endTime = moment.utc(requestEnd).format('HH');
      let dateTimeRange = _.range(startTime, +endTime + 1);

      let prev_time = null;
      let used_part_day_slots = 0;

      _.forEach(timeslots, (timeslot) => {
        let timeSlotRange = _.range(timeslot.start_time.hour, timeslot.end_time.hour+1);
        let in_slot = !!_.intersection(timeSlotRange, dateTimeRange).length;
        let extreme_time = (prev_time == timeslot.start_time.hour && !!_.find([startTime, endTime], prev_time));

        if (in_slot && !extreme_time) used_part_day_slots += 1

        prev_time = timeslot.end_time.hour;
      });

      return used_part_day_slots;
    }

    function isBikeNotAvailable({
      date,
      bike = {},
      cluster,
      timeslots
    }) {
      if (_.isEmpty(bike.availabilities)) return false;
      return bikeNotAvailable({
        date,
        bikeAvailabilities: bike.availabilities,
        timeslots
      }) &&
      isClusterNotAvailable({date, bike, cluster, timeslots });
    }

    function isClusterNotAvailable({date, bike, cluster, timeslots}) {
      let isNotAvailable = true;

      if (!bike.is_cluster) return isNotAvailable;

      _.forEach(cluster.variations, function (variant) {
        isNotAvailable = isNotAvailable && bikeNotAvailable({date, bikeAvailabilities: variant.availabilities, timeslots})
      });

      return isNotAvailable;
    }

    // checks if we have unavailability set for this day
    // works with full days
    function bikeNotAvailable({
      date,
      bikeAvailabilities = [],
      timeslots = []
    }) {
      let dayNotAvailable = false;
      let m_date = dateHelper.m_getDateUTC(date);

      let notAvailableDates = getNotAvailableDates(bikeAvailabilities);
      dayNotAvailable = _.indexOf(notAvailableDates, m_date.format('YYYY-MM-DD')) !== -1;

      // if bike has timeslots we need to check if a full day is unavailable
      if (dayNotAvailable && timeslots.length) {
        let dateTimeslotAvailable = [];

        _.forEach(bikeAvailabilities, function (slot) {
          let m_startDate = moment.utc(slot.start_date);
          let m_endDate = m_startDate.clone().add(slot.duration, 'seconds');
          let differenceInDays = dateHelper.durationDays(m_startDate, m_endDate) - 1;

          if (m_date.isBetween(m_startDate, m_endDate, 'day', '[]')) {
            // if difference in days more than 1 day we set all days as unavailable
            // or if both timeslots are not available
            if (differenceInDays > 0 || isAllTimeslotsClosed(dateTimeslotAvailable, timeslots)) {
              return dateTimeslotAvailable = [false, false];
            }

            // if it's in one day range, we should check if all timeslots are closed
            let dayTimeRange = _.range(Number(m_startDate.format('HH')), Number(m_endDate.format('HH')) + 1);
            let {isHalfDay, timeslotIndex} = dateHelper.isOnlyOneSlotPicked({
              timeslots,
              dayTimeRange
            });
            // if it's not a half day we should close both timeslots
            if (!isHalfDay) {
              dateTimeslotAvailable = [false, false];
            } else {
              dateTimeslotAvailable[timeslotIndex] = false;
            }
          }
        });

        dayNotAvailable = dateTimeslotAvailable.length ? isAllTimeslotsClosed(dateTimeslotAvailable, timeslots) : dayNotAvailable
      }

      return dayNotAvailable;
    }

    function isAllTimeslotsClosed(dateTimeslotAvailable, timeslots) {
      return dateTimeslotAvailable.length == timeslots.length &&
        dateTimeslotAvailable[0] === false && dateTimeslotAvailable[1] === false;
    }

    // TODO: we should do this only one time
    // when we take requests/availabilities from backend
    // and then use this for optimization
    function getNotAvailableDates(bikeAvailabilities) {
      return _.flattenDeep(bikeAvailabilities.map((bikeAvailability) => {
        return transformToDatesArray({
          startDate: bikeAvailability.start_date,
          duration: bikeAvailability.duration
        });
      }));
    }

    /**
     * transforms startDate and duration into array of dates
     * @param {startDate} start date in utc timezone
     * @param {duration} duration in seconds
     * @returns {Array} array of string dates in follow format: YYYY-MM-DD
     */
    function transformToDatesArray({startDate, duration}) {
      let m_startDate = moment.utc(startDate);
      let m_endDate = m_startDate.clone().add(duration, 's');
      let differenceInDays = dateHelper.durationDays(m_startDate, m_endDate) - 1;
      let dates = [];

      for (let i = 0; i <= differenceInDays; i++) {
        dates.push(m_startDate.clone().add(i, 'day').format('YYYY-MM-DD'));
      }

      return dates;
    }

    return {
      isBikeNotAvailable,
      isTimeAvailable,
      isDayAvailable,
      getInitHours,
      checkIsOpeningHoursEnabled,
      isTimeInTimeslots,
      countTimeslots,
    };
  });
