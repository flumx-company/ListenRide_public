import {
  Scheduler,
  PresetManager,
  DateHelper
} from '../../../js_modules/bryntum-scheduler/scheduler.module.min';
import moment from 'moment';

import { bikeColumnRenderer } from './renderers/bike-column/bike-column-renderer';
import { bikeEventPopupRenderer } from './renderers/bike-event-popup/bike-event-popup-renderer';
import { bikeEventRenderer } from './renderers/bike-event/bike-event-renderer';

import './booking-calendar.css';

angular.module('bookingCalendar', []).component('bookingCalendar', {
  templateUrl: 'app/modules/booking-calendar/booking-calendar.template.html',
  controllerAs: 'bookingCalendar',
  controller: function BookingCalendarController(
    $log,
    $q,
    $translate,
    $state,
    $stateParams,
    $mdMenu,
    $filter,
    $mdDialog,
    accessControl,
    api,
    bookingCalendarService,
    requestsService,
    notification,
    bikeHelper
  ) {
    const bookingCalendar = this;

    bookingCalendar.anyLocationKey = 'ANY_LOCATION';
    bookingCalendar.locationOptions = [];
    bookingCalendar.filters = {
      onlyWithEvents: false,
      location: bookingCalendar.anyLocationKey
    };
    bookingCalendar.isLoading = false;

    bookingCalendar.isAvailable = () =>
      bookingCalendarService.shouldEnableBookingCalendar();

    bookingCalendar.$onInit = () => {
      if (accessControl.requireLogin()) {
        return;
      }
      bookingCalendar.isLoading = true;

      const goToDate = getDateFromStateParams();

      $q.all([
        bookingCalendarService.getTranslationsForScheduler(),
        bookingCalendarService.getRides()
      ])
        .then(([translations, rides]) => {
          bookingCalendar.locationOptions = Array.from(rides.locations);
          initScheduler({ translations, rides, goToDate });
          initDatepicker();
        })
        .finally(() => {
          bookingCalendar.isLoading = false;
        });
    };

    const viewPresetOptions = new Map([
      [
        'week',
        {
          key: 'week',
          labels: {
            option: 'shared.week',
            prev: 'booking-calendar.previous-week',
            next: 'booking-calendar.next-week'
          },
          getTimeSpan: start => {
            const end = moment(start)
              .add(6, 'days')
              .endOf('day')
              .toDate();
            return [start, end];
          }
        }
      ],
      [
        'month',
        {
          key: 'month',
          labels: {
            option: 'shared.month',
            prev: 'booking-calendar.previous-month',
            next: 'booking-calendar.next-month'
          },
          getTimeSpan: start => {
            const end = moment(start)
              .add(30, 'days')
              .endOf('day')
              .toDate();
            return [start, end];
          }
        }
      ]
    ]);

    bookingCalendar.viewPresetOptions = Array.from(viewPresetOptions.values());

    bookingCalendar.gotoToday = () => {
      bookingCalendar.scheduler.setTimeSpan(
        ...bookingCalendar.getCurrentViewPreset().getTimeSpan(new Date())
      );
    };

    bookingCalendar.setViewPreset = presetName => {
      const anchorDate = bookingCalendar.scheduler.startDate; // date that new time span should contain
      bookingCalendar.scheduler.setTimeSpan(
        ...viewPresetOptions.get(presetName).getTimeSpan(anchorDate)
      );
      bookingCalendar.scheduler.setViewPreset(presetName);
    };

    bookingCalendar.shiftPrevious = () => {
      bookingCalendar.scheduler.shiftPrevious();
    };

    bookingCalendar.shiftNext = () => {
      bookingCalendar.scheduler.shiftNext();
    };

    bookingCalendar.openDatepickerMenu = ($mdOpenMenu, $event) => {
      $mdOpenMenu($event);
    };

    bookingCalendar.getCurrentViewPreset = () => {
      return viewPresetOptions.get(bookingCalendar.scheduler.viewPreset.name);
    };

    bookingCalendar.getShiftButtonTooltip = direction => {
      if (!bookingCalendar.scheduler) {
        // scheduler hasn't been instantiated yet
        return '';
      }
      return bookingCalendar.getCurrentViewPreset().labels[direction];
    };

    bookingCalendar.filterBikes = () => {
      // check that scheduler has been instantiated
      if (!bookingCalendar.scheduler) {
        return;
      }

      // clear filter, so filtered out entries could reappear
      bookingCalendar.scheduler.resourceStore.clearFilters();

      // check if there are filters to apply
      if (Object.values(bookingCalendar.filters).every(filter => !filter)) {
        return;
      }

      // set bikes filter
      bookingCalendar.scheduler.resourceStore.filterBy(resource => {
        let eventsCountMatch = true;
        let locationMatch = true;

        // filter by events presence
        if (bookingCalendar.filters.onlyWithEvents) {
          eventsCountMatch = resource.events.some(event => {
            return DateHelper.intersectSpans(
              event.startDate,
              event.endDate,
              bookingCalendar.scheduler.startDate,
              bookingCalendar.scheduler.endDate
            );
          });
        }

        // filter by location
        if (
          bookingCalendar.filters.location !== bookingCalendar.anyLocationKey
        ) {
          locationMatch =
            resource.data.location &&
            resource.data.location.en_city === bookingCalendar.filters.location;
        }

        return eventsCountMatch && locationMatch;
      });
    };

    function initScheduler({ translations, rides, goToDate }) {
      registerViewPresets();

      // getters needed for event popups
      const getters = {
        getCategoryLabel: category =>
          translations[$filter('category')(category)],
        getBikeListingsHref: () => $state.href('listings'),
        getBookingHref: requestId => $state.href('requests', { requestId })
      };

      const defaultPreset = 'month';
      const [startDate, endDate] = viewPresetOptions
        .get(defaultPreset)
        .getTimeSpan(goToDate);

      bookingCalendar.scheduler = new Scheduler({
        appendTo: document.querySelector('.scheduler-container'),
        readOnly: true,
        zoomOnMouseWheel: false,
        zoomOnTimeAxisDoubleClick: false,
        viewPreset: defaultPreset,
        weekStartDay: 1, // monday
        barMargin: 2,
        rowHeight: 85,
        eventSelectedCls: 'selected-event',
        focusCls: 'focused-event',
        emptyText: translations['booking-calendar.no-bikes-to-display'],

        eventRenderer: ({ eventRecord, resourceRecord, tplData }) =>
          bikeEventRenderer({
            eventRecord,
            resourceRecord,
            tplData,
            translations
          }),

        columns: [
          {
            type: 'tree',
            text: 'Name',
            field: 'name',
            width: 320,
            leafIconCls: null,
            expandIconCls: 'fa-chevron-down',
            collapseIconCls: 'fa-chevron-up',
            htmlEncode: false,
            renderer: ({ cellElement, record }) =>
              bikeColumnRenderer({ cellElement, record, translations })
          }
        ],

        features: {
          contextMenu: false,
          eventFilter: false,
          headerContextMenu: false,
          scheduleContextMenu: {
            items: {
              addEvent: {
                text: translations['booking-calendar.add-non-availability'],
                onItem({
                  resourceRecord,
                  event
                }) {
                  // function from API to take DATE for mouse event position
                  let selectedDate = bookingCalendar.scheduler.getDateFromDomEvent(event);
                  $mdDialog.show({
                    controller: BikeAvailabilityController,
                    controllerAs: 'bikeAvailability',
                    templateUrl: 'app/modules/booking-calendar/booking-calendar-availability-dialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    openFrom: angular.element(document.body),
                    closeTo: angular.element(document.body),
                    clickOutsideToClose: true,
                    escapeToClose: true,
                    locals: {
                      selectedDate: selectedDate,
                      resourceRecord: resourceRecord
                    }
                  });
                }
              },
              deleteEvent: false
            }
          },
          eventContextMenu: {
            processItems({date, resourceRecord, items}) {
              if (resourceRecord.isCluster) return false;
              items.deleteEvent = {
                  text: translations['booking-calendar.remove-non-availability'],
                  icon: "b-icon b-icon-trash",
                  onItem({
                    resourceRecord,
                    eventRecord
                  }) {
                    if (eventRecord.isNotAvailable && !resourceRecord.isCluster) {
                      bookingCalendar.isLoading = true;

                      bikeHelper
                        .removeBikeAvailability(resourceRecord.originalData.id, eventRecord.resourceEventId)
                        .then(response => {
                          bookingCalendar.isLoading = false;
                          bookingCalendar.scheduler.eventStore.remove(eventRecord);

                          if (eventRecord.clusterEventId) {
                            const clusterEvent = bookingCalendar.scheduler.eventStore.getById(
                              eventRecord.clusterEventId
                            );

                            clusterEvent.requestsCount -= 1;

                            if (clusterEvent.requestsCount === 0) {
                              clusterEvent.remove();
                            }
                          }
                        })
                        .catch(error => {
                          bookingCalendar.isLoading = false;
                          notification.show(error, 'error');
                        })
                    }
                  }
                }
              }

          },
          timeRanges: {
            showCurrentTimeLine: true,
            showHeaderElements: true
          },
          tree: true,
          eventTooltip: {
            anchor: false,
            cls: 'bike-event-popup',
            template: ({ eventRecord }) =>
              bikeEventPopupRenderer({ eventRecord, translations, getters })
          }
        },

        resources: rides.bikes,
        events: rides.events,

        startDate,
        endDate
      });

      bookingCalendar.scheduler.on({
        eventclick: ({ resourceRecord, eventRecord }) => {
          $log.debug('Clicked bike event:', eventRecord);
          $log.debug('Clicked bike resourse:', resourceRecord);
          // expand bike cluster on cluster event click
          bookingCalendar.scheduler.toggleCollapse(resourceRecord);
        },
        cellClick: clickEvent => {
          if (
            clickEvent.target.getAttribute('data-id') === 'new-messages-badge'
          ) {
            const bike = clickEvent.record;
            const [request] = bike.requestsWithNewMessages;
            const event = getSchedulerEventByBookingId(request.bookingId);
            // expand cluster first
            if (!bike.isExpanded(bookingCalendar.scheduler.resourceStore)) {
              bookingCalendar.scheduler.expand(bike);
            }
            // go to the correct time span
            bookingCalendar.scheduler.setTimeSpan(
              ...bookingCalendar
                .getCurrentViewPreset()
                .getTimeSpan(new Date(event.startDate))
            );
            // when we are sure that event is on a view,
            // scroll event into view and highlight it
            bookingCalendar.scheduler.scrollEventIntoView(event, {
              highlight: true,
              focus: true
            });
          }
        },
        cellContextMenu: ({}) => {
          // TODO: add context menu for left cell (only works with single bike or bike variant)
          // 1. View Bike (goes to bike page)
          // 2. Edit Bike (goes to bike edit page)
          // forum link: https://www.bryntum.com/forum/viewtopic.php?f=44&t=12481
        },
        timeaxischange: () => {
          // on start/end date change
          bookingCalendar.filterBikes();
        }
      });

      bookingCalendar.scheduler.features.eventTooltip.tooltip.on({
        // Triggered when popup contents are updated
        innerHtmlUpdate: ({ source }) => {
          const rejectBtn = source.element.querySelector(
            'button[data-id="reject-booking"]'
          );
          const acceptBtn = source.element.querySelector(
            'button[data-id="accept-booking"]'
          );
          if (rejectBtn || acceptBtn) {
            // assign listeners to Reject/Accept buttons
            const bookingId = source.eventRecord.bookingId;
            rejectBtn.onclick = () => rejectBooking(bookingId);
            acceptBtn.onclick = () => acceptBooking(bookingId);
          }
          // hide popup after click on links or buttons inside
          source.element.onclick = event => {
            if (event.target.hasAttribute('hide-on-click')) {
              source.hide();
            }
          };
        }
      });

      bookingCalendar.filterBikes();
    }

    function initDatepicker() {
      getDatepickerElement()
        .dateRangePicker({
          alwaysOpen: true,
          container: '#booking-calendar-datepicker',
          inline: true,
          showTopbar: false,
          singleMonth: true,
          startOfWeek: 'monday',
          language: $translate.preferredLanguage(),
          singleDate: true
        })
        .bind('datepicker-change', (event, { value }) => {
          bookingCalendar.scheduler.setTimeSpan(
            ...bookingCalendar
              .getCurrentViewPreset()
              .getTimeSpan(new Date(value))
          );
          $mdMenu.hide();
          getDatepickerElement()
            .data('dateRangePicker')
            .clear();
        });
    }

    function getDatepickerElement() {
      return angular.element('#booking-calendar-datepicker');
    }

    function registerViewPresets() {
      PresetManager.registerPreset('week', {
        tickWidth: 150,
        displayDateFormat: 'MMMM DD, HH:mm',
        shiftUnit: 'day',
        shiftIncrement: 7,
        timeResolution: {
          unit: 'day',
          increment: 7
        },
        headerConfig: {
          top: {
            unit: 'month',
            dateFormat: 'MMMM YYYY'
          },
          middle: {
            unit: 'day',
            dateFormat: 'dddd DD'
          }
        }
      });

      PresetManager.registerPreset('month', {
        tickWidth: 50,
        displayDateFormat: 'MMMM DD, HH:mm',
        shiftUnit: 'day',
        shiftIncrement: 31,
        timeResolution: {
          unit: 'day',
          increment: 31
        },
        headerConfig: {
          top: {
            unit: 'month',
            dateFormat: 'MMMM YYYY'
          },
          middle: {
            unit: 'day',
            dateFormat: 'DD'
          }
        }
      });
    }

    function getDateFromStateParams() {
      const goToDate = moment(
        $stateParams.goToDate,
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
        true
      );
      return goToDate.isValid() ? goToDate.toDate() : new Date(); // today
    }

    function getSchedulerEventByBookingId(id) {
      return bookingCalendar.scheduler.eventStore.find(
        ({ bookingId }) => bookingId === id
      );
    }

    function removeRequestWithNewMessages({ bookingId, resource }) {
      const requestsWithNewMessages = resource.requestsWithNewMessages.filter(
        request => request.bookingId !== bookingId
      );
      resource.set({ requestsWithNewMessages });
    }

    function rejectBooking(bookingId) {
      const event = getSchedulerEventByBookingId(bookingId);
      event.set({ isChangingStatus: true });

      return api
        .get('/requests/' + bookingId)
        .then(response => response.data)
        .then(request => requestsService.rejectBooking({ request }))
        .then(() => {
          event.remove();
          removeRequestWithNewMessages({
            resource: event.resource,
            bookingId: event.bookingId
          });

          if (event.clusterEventId) {
            const clusterEvent = bookingCalendar.scheduler.eventStore.getById(
              event.clusterEventId
            );

            // remove "New" badge
            removeRequestWithNewMessages({
              resource: clusterEvent.resource,
              bookingId: event.bookingId
            });

            // decrement bikes count
            clusterEvent.requestsCount -= 1;

            if (clusterEvent.requestsCount === 0) {
              clusterEvent.remove();
            }
          }
        })
        .catch(() =>
          event.set({
            isChangingStatus: false
          })
        );
    }

    function acceptBooking(bookingId) {
      const event = getSchedulerEventByBookingId(bookingId);
      event.set({ isChangingStatus: true });
      return api
        .get('/requests/' + bookingId)
        .then(response => response.data)
        .then(request => requestsService.acceptBooking({ request }))
        .then(() =>
          event.set({
            isAccepted: true,
            isPending: false,
            isChangingStatus: false
          })
        )
        .catch(() =>
          event.set({
            isChangingStatus: false
          })
        );
    }

    function BikeAvailabilityController($mdDialog, selectedDate, resourceRecord) {
      let bikeAvailability = this;

      // variables
      bikeAvailability.date = {
        startDate: moment.utc(selectedDate).startOf('day'),
        endDate: moment.utc(selectedDate).startOf('day'),
        startTime: 0,
        endTime: 0,
      }
      bikeAvailability.optionalData = {
        reason: '',
        comment: ''
      }

      bikeAvailability.reasonOptions = [
        'booking-calendar.reasons.booked-in-store',
        'booking-calendar.reasons.service-repair',
        'booking-calendar.reasons.event-other'
      ]

      // methods
      bikeAvailability.close = closeDialog;
      bikeAvailability.onTimeChange = onTimeChange;
      bikeAvailability.onDateChange = onDateChange;
      bikeAvailability.onSaveButtonClick = onSaveButtonClick;
      bikeAvailability.isValid = isValid;

      // invocations
      bikeAvailability.dateRange = convertDatesToDuration();


      function convertDatesToDuration() {
        // set time to dates
        let startDateWithTime = bikeAvailability.date.startDate.clone()
          .hours(+bikeAvailability.date.startTime).minutes(0).seconds(0);
        let endDateWithTime = bikeAvailability.date.endDate.clone()
          .hours(+bikeAvailability.date.endTime).minutes(0).seconds(0);

        return {
          start_date: startDateWithTime.format(),
          duration: endDateWithTime.diff(startDateWithTime, 'seconds')
        }
      }

      function onDateChange() {
        bikeAvailability.date.startDate = moment.utc(bikeAvailability.dateRange.start_date);
        bikeAvailability.date.endDate = bikeAvailability.date.startDate
          .clone()
          .add(bikeAvailability.dateRange.duration, 'seconds');
        resetTime();
      }

      function resetTime() {
        bikeAvailability.date.startTime = null;
        bikeAvailability.date.endTime = null;
      }

      function onTimeChange() {
        bikeAvailability.dateRange = convertDatesToDuration();
      }

      function isValid() {
        return !!bikeAvailability.date.startTime && !!bikeAvailability.date.endTime;
      }

      function onSaveButtonClick() {
        let bikeId = resourceRecord.originalData.id;
        const newBikeAvailability = {
          ride_id: bikeId,
          ...bikeAvailability.dateRange,
          ...bikeAvailability.optionalData,
        };

        bikeHelper.createBikeAvailability({
          id: bikeId,
          isCluster: resourceRecord.isCluster,
          data: [newBikeAvailability]
        }).then(
          function(response) {
            _.forEach(response.data, function(availability){
              bookingCalendar.scheduler.eventStore.add(bookingCalendarService.createAvailabilityEvent({
                id: availability.ride_id,
                availability: availability
              }));
            });

            bikeAvailability.close();
          },
          function(error) {
            notification.show(error, 'error');
          }
        )
      }

      function closeDialog() {
        $mdDialog.hide();
      }
    }
  }
});
