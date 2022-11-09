angular
  .module('listnride')
  .factory('bikeEventHelper', function (
    dateHelper,
    $translate,
  ) {
    const slotableEventFamilyIds = [35, 36, 37, 38, 39];
    const eventNames = {
      'cwd': 35,
      '8bar': 36
    }
    const eventTypes = {
      twoHours: [eventNames.cwd],
      threeHours: [eventNames['8bar']],
      rangedDate: [37,38,39]
    }

    const EVENTS = {
      35: {
        name: 'cwd',
        predefined_dates: [1, 3, 10, 17, 24] // each Tuesday. TODO: make generator,
      },
      36: {
        name: '8bar-clubride',
        type: 'selected dates',
        dates: ['10.05.2019', '15.05.2019'], // generateTuesdays(10) <- generate 10 Tuesdays
        predefined_dates: [3, 10, 17, 24] // each Tuesday. TODO: make generator
      },
      37: {
        name: 'radfahren-neu-entdecken-eschborn',
        type: 'selected date ranges',
        dates: [{
            startDate: '20190604',
            endDate: '20190618'
          },
          {
            startDate: '20190618',
            endDate: '20190702'
          },
          {
            startDate: '20190702',
            endDate: '20190716'
          },
          {
            startDate: '20190716',
            endDate: '20190730'
          },
          {
            startDate: '20190730',
            endDate: '20190813'
          },
          {
            startDate: '20190813',
            endDate: '20190827'
          }
        ]
      },
      38: {
        name: 'radfahren-neu-entdecken-kassel',
        type: 'selected date ranges',
        dates: [{
            startDate: '20190613',
            endDate: '20190627'
          },
          {
            startDate: '20190627',
            endDate: '20190711'
          },
          {
            startDate: '20190711',
            endDate: '20190725'
          },
          {
            startDate: '20190725',
            endDate: '20190808'
          },
          {
            startDate: '20190808',
            endDate: '20190822'
          },
          {
            startDate: '20190822',
            endDate: '20190905'
          }
        ]
      },
      39: {
        name: 'radfahren-neu-entdecken-hofheim',
        type: 'selected date ranges',
        dates: [{
            startDate: '20190606',
            endDate: '20190619'
          },
          {
            startDate: '20190619',
            endDate: '20190704'
          },
          {
            startDate: '20190704',
            endDate: '20190718'
          },
          {
            startDate: '20190718',
            endDate: '20190801'
          },
          {
            startDate: '20190801',
            endDate: '20190815'
          },
          {
            startDate: '20190815',
            endDate: '20190828'
          }
        ]
      },
      extras: {
        slotDuration: 3,
        eventStartTime: 18,
        eventEndTime: 21,
        eventMonth: 8, // Months start at 0
        eventYear: 2019,
        eventMonthName: dateHelper.getMonthLangKey(8)
      }
    }

    function getEventData(bikeFamily, bikeRequests) {
      let eventData = {}
      eventData.slots = [];
      eventData.slotsDayRanges = [];

      eventData.name = EVENTS[bikeFamily].name;
      eventData.extras = EVENTS.extras;

      if (this.isRangedDateEvent(bikeFamily)) {
        _.forEach(EVENTS[bikeFamily].dates, function (dateRange) {
          let slot = generateSlotHourableDateRanges(dateRange);
          slot.isReserved = checkDateRangeReserved({
            bikeRequests,
            slot
          });
          eventData.slotsDayRanges.push(slot);
        });
      } else {
        // prepare specific data
        eventData.date = '28042019';
        eventData.startDay = 9;
        eventData.endDay = 9;
        eventData.pickupSlotId;
        eventData.returnSlotId;
        eventData.days = EVENTS[bikeFamily].predefined_dates ? EVENTS[bikeFamily].predefined_dates : _.range(eventData.startDay, eventData.endDay + 1); // last number not included

        _.forEach(eventData.days, (day) => {
          let daySlots = generateHourSlots({
            day,
            slotDuration: EVENTS.extras.slotDuration,
            eventStartTime: EVENTS.extras.eventStartTime,
            eventEndTime: EVENTS.extras.eventEndTime,
            eventMonth: EVENTS.extras.eventMonth,
            eventYear: EVENTS.extras.eventYear
          });
          eventData.slots.push(...daySlots);
        });
      }

      if (this.isOnSlotableEvent(bikeFamily)) {
        checkReservedSlots({slots: eventData.slots, bikeRequests});

        // TODO: check if all hour slots are disabled in this date
        _.forEach(eventData.slots, (slot) => {
          // slot.isFullReserved = slot.reserved;
        });
      }

      eventData.changePickupSlot = changePickupSlot;
      eventData.changeReturnSlot = changeReturnSlot;

      return eventData;
    }

    function checkReservedSlots({slots, bikeRequests}) {
      for (var i = 0; i < bikeRequests.length; i++) {
        var startDate = new Date(bikeRequests[i].start_date_tz);
        var endDate = new Date(bikeRequests[i].end_date_tz);

        var startDay = startDate.getDate();
        var startTime = moment.utc(bikeRequests[i].start_date_tz).format('HH')
        var endTime = moment.utc(bikeRequests[i].end_date_tz).format('HH')
        var startYear = startDate.getFullYear();
        var startMonth = startDate.getMonth();

        for (var j = 0; j < slots.length; j++) {
          if (startYear == EVENTS.extras.eventYear &&
            startMonth == EVENTS.extras.eventMonth &&
            slots[j].day == startDay &&
            startTime == slots[j].hour) {
            // Additional Rule: Add this rule to disable time slots before already booked by this user
            // && (slots[j].overnight || slots[j].hour + slotDuration <= endTime))
            slots[j].reserved = true;
            slots[j].text = slots[j].text.split(" ", 1) + ' (' + $translate.instant('calendar.booked') + ')';
            // slots[j].text = slots[j].text + " (booked)";
          }
        }
      }
    };

    function generateHourSlots({
      day,
      eventStartTime,
      eventEndTime,
      slotDuration,
      eventMonth,
      eventYear
    }) {
      let daySlots = [];

      _.forEach(_.range(eventStartTime, eventEndTime, slotDuration), function (hour) {
        var slot = {
          pickupEnabled: hour < eventEndTime,
          overnight: false,
          reserved: false,
          day: day,
          month: eventMonth,
          year: eventYear,
          text: hour + ":00 - " + (hour + slotDuration) + ":00",
          hour: hour
        };
        daySlots.push(slot)
      });

      return daySlots;
    }

    function generateSlotHourableDateRanges(range) {
      return {
        selectboxText: moment(range.startDate).format('DD-MM-YYYY') + ' - ' + moment(range.endDate).format('DD-MM-YYYY'),
        startDate: new Date(moment(range.startDate)),
        endDate: new Date(moment(range.endDate)),
        isReserved: false
      }
    }

    function checkDateRangeReserved({bikeRequests, slot}) {
      for (var i = 0; i < bikeRequests.length; i++) {
        // set Hours to 0, because we check only day/month/year
        var startDate = new Date(bikeRequests[i].start_date_tz);
        startDate = startDate.setHours(0, 0, 0, 0);
        var endDate = new Date(bikeRequests[i].end_date_tz);
        endDate = endDate.setHours(0, 0, 0, 0);

        return moment(startDate).isBetween(slot.startDate, slot.endDate, null, '[]') && moment(endDate).isBetween(slot.startDate, slot.endDate, null, '[]');
      }
    }

    function changePickupSlot(pickupSlotId) {
      // Define picked slot as pickupSlot
      this.slots[pickupSlotId].pickup = true;
      // Enable all following slots as returnSlots if no booking is in between
      let bookingInBetween = false;
      _.each(this.slots, (value, index) => {
        if (index >= pickupSlotId) {
          if (value.reserved && this.slots[index - 1].reserved) {
            bookingInBetween = true;
          }
          value.returnDisabled = bookingInBetween;
        } else {
          value.returnDisabled = true;
        }
      });

      let slot = this.slots[pickupSlotId];
      let startDate = new Date(EVENTS.extras.eventYear, EVENTS.extras.eventMonth, slot.day, slot.hour, 0, 0, 0);

      // Presets returnSlot to be (slotDuration) after pickupSlot
      this.returnSlotId = parseInt(pickupSlotId);
      // this.returnSlotId = parseInt(pickupSlotId) + slotDuration;
      let endDate = this.changeReturnSlot(pickupSlotId);

      let startTime = slot.hour;
      let endTime = slot.hour + EVENTS.extras.slotDuration;

      return {
        startDate,
        endDate,
        startTime,
        endTime
      }
    }

    function changeReturnSlot(returnSlotId) {
      let slot = this.slots[returnSlotId];
      let endDate;

      if (slot.overnight) {
        endDate = new Date(EVENTS.extras.eventYear, EVENTS.extras.eventMonth, slot.day + 1, slot.hour + EVENTS.extras.slotDuration, 0, 0, 0);
      } else {
        endDate = new Date(EVENTS.extras.eventYear, EVENTS.extras.eventMonth, slot.day, slot.hour + EVENTS.extras.slotDuration, 0, 0, 0);
      }

      return endDate;
    }

    return {
      isOnSlotableEvent: (bikeFamily) => _.indexOf(slotableEventFamilyIds, bikeFamily) !== -1,
      isTwoHoursEventBike: (bikeFamily) => _.indexOf(eventTypes.twoHours, bikeFamily) !== -1,
      isThreeHoursEventBike: (bikeFamily) => _.indexOf(eventTypes.threeHours, bikeFamily) !== -1,
      isRangedDateEvent: (bikeFamily) => _.indexOf(eventTypes.rangedDate, bikeFamily) !== -1,
      getEventData
    };
  });
