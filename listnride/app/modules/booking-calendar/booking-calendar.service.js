import { get, uniqueId } from 'lodash';
import { DateHelper } from '../../../js_modules/bryntum-scheduler/scheduler.module.min';

angular
  .module('listnride')
  .factory('bookingCalendarService', function(
    $localStorage,
    $translate,
    $mdMedia,
    bikeOptions,
    api,
    MESSAGE_STATUSES
  ) {
    const ALLOWED_REQUEST_STATUSES = [
      MESSAGE_STATUSES.REQUESTED,
      MESSAGE_STATUSES.ACCEPTED,
      MESSAGE_STATUSES.CONFIRMED,
      MESSAGE_STATUSES.ONE_SIDE_RATE,
      MESSAGE_STATUSES.BOTH_SIDES_RATE,
      MESSAGE_STATUSES.RATE_RIDE,
      MESSAGE_STATUSES.COMPLETE
    ];

    return {
      shouldEnableBookingCalendar() {
        return $mdMedia('min-width: 960px');
      },
      getTranslationsForScheduler() {
        return $translate([
          // bikes column
          'shared.id',
          'booking.overview.size',
          'search.unisize',
          'shared.label_new',
          'booking-calendar.bike-variants',
          'booking-calendar.no-bikes-to-display',
          // events
          'booking-calendar.event.accepted',
          'booking-calendar.event.request-waiting',
          'booking-calendar.event.not-available',
          'shared.request',
          'shared.requests',
          'shared.event',
          'shared.events',
          // event popups
          'booking-calendar.event.waiting',
          'booking-calendar.event.not-available-header',
          'booking-calendar.event.not-available-text',
          'booking-calendar.event.see-settings',
          'booking-calendar.event.date',
          'booking-calendar.event.pickup',
          'booking.calendar.return-time',
          'booking-calendar.event.booking-id',
          'booking-calendar.event.rider',
          'booking-calendar.event.contact',
          'message.reject',
          'message.accept',
          'booking-calendar.event.view-booking',
          'booking-calendar.add-non-availability',
          'booking-calendar.remove-non-availability',
          'booking-calendar.reasons.booked-in-store',
          'booking-calendar.reasons.service-repair',
          'booking-calendar.reasons.event-other',
          'booking-calendar.reason',
          ...bikeOptions.categoriesTranslationKeys()
        ]);
      },

      getRides() {
        return api
          .get(`/users/${$localStorage.userId}/rides?detailed=true`)
          .then(({ data }) => data.bikes)
          .then(bikes => parseBikes(bikes));
      },

      createAvailabilityEvent
    };

    function parseBikes(bikes) {
      bikes = bikes.filter((bike) => bike.available);
      return bikes.reduce(
        (acc, bike) => {
          // bike boilerplate
          const bikeResource = getResource({
            id: bike.is_cluster ? bike.cluster_id : bike.id,
            bikeNumber: bike.bicycle_number,
            name: `${bike.brand} ${bike.name}`,
            location: bike.location,
            isCluster: bike.is_cluster,
            category: bike.category,
            imageUrl: bike.image_file,
            size: bike.size,
            sizeLabel: bikeOptions.getSizeLabel(bike.size, bike.frame_size)
          });

          const bikeRequests = parseRequests({
            id: bikeResource.id,
            requests: bike.requests
          });
          bikeResource.requestsWithNewMessages = parseRequestsWithMewMessages({
            requests: bikeRequests
          });

          // add bike events
          acc.events.push(
            // accepted/pending events
            ...bikeRequests,
            // not available events
            ...(bike.is_cluster ? [] : parseAvailabilities({
              id: bikeResource.id,
              availabilities: Object.values(get(bike, 'availabilities', {}))
            }))
          );

          // add bike
          acc.bikes.push(bikeResource);

          if (bikeResource.isCluster) {
            const allVariantsRequests = [];
            const allAvailabilities = [];

            // add bike variants
            bike.rides.forEach((bikeVariant, index) => {
              // add variant requests
              const variantRequests = parseRequests({
                id: bikeVariant.id,
                requests: bikeVariant.requests
              });
              allVariantsRequests.push(
                // accepted/pending events
                ...variantRequests
              );

              allAvailabilities.push(
                // not available events
                ...parseAvailabilities({
                  id: bikeVariant.id,
                  availabilities: Object.values(get(bikeVariant, 'availabilities', {}))
                })
              );

              // add variant bike
              bikeResource.children.push(
                Object.assign({}, bikeResource, {
                  children: [],
                  requestsWithNewMessages: parseRequestsWithMewMessages({
                    requests: variantRequests
                  }),
                  id: bikeVariant.id,
                  bikeNumber: bikeVariant.bicycle_number,
                  size: bikeVariant.size,
                  isCluster: false,
                  isVariant: true,
                  variantIndex: index + 1,
                  cls: 'variant-row',
                  sizeLabel: bikeOptions.getSizeLabel(bikeVariant.size, bikeVariant.frame_size)
                })
              );
            });

            bikeResource.requestsWithNewMessages = parseRequestsWithMewMessages(
              {
                requests: allVariantsRequests
              }
            );

            // add variant events
            acc.events.push(
              ...allVariantsRequests,
              ...allAvailabilities
            );

            // add cluster bike requests
            acc.events.push(
              ...parseClusterRequests({
                id: bikeResource.id,
                requests: allVariantsRequests
              }),
              // not available events for cluster(group)
              ...parseClusterAvailabilities({
                id: bikeResource.id,
                availabilities: allAvailabilities
              })
            );
          }

          // accumulate bike locations
          acc.locations.add(bike.location.en_city);

          return acc;
        },
        { bikes: [], events: [], locations: new Set() }
      );
    }

    function parseRequests({ id, requests }) {
      return requests.reduce((acc, rawRequest) => {
        if (!ALLOWED_REQUEST_STATUSES.includes(rawRequest.status)) {
          // filter out canceled requests
          return acc;
        }
        const request = getEvent({
          resourceId: id,
          bookingId: rawRequest.id,
          startDate: rawRequest.start_date_tz.replace('Z', ''), // drop time zone
          endDate: rawRequest.end_date_tz.replace('Z', ''), // drop time zone
          rawStartDate: rawRequest.start_date_tz,
          rawEndDate: rawRequest.end_date_tz,
          isPending: rawRequest.status === MESSAGE_STATUSES.REQUESTED,
          isAccepted: rawRequest.status !== MESSAGE_STATUSES.REQUESTED, // we show only pending and accepted requests. Canceled requests are filtered out
          hasNewMessage: !!rawRequest.has_new_message
        });

        if (rawRequest.rider) {
          const { first_name, last_name } = rawRequest.rider;
          request.rider = `${first_name} ${last_name}`;
          request.contact = rawRequest.rider.phone_number;
        }
        acc.push(request);
        return acc;
      }, []);
    }

    function parseClusterRequests({ id, requests }) {
      let clusterEventId;
      return [...requests]
        .sort(sortRequestsByStartDate)
        .reduce((acc, request) => {
          const last = acc[acc.length - 1];
          if (!last || request.startDate > last.endDate) {
            clusterEventId = uniqueId('cluster-event-');
            acc.push(
              getEvent({
                id: clusterEventId,
                resourceId: id,
                startDate: request.startDate,
                endDate: request.endDate,
                requestsCount: 1,
                isCluster: true
              })
            );
            request.clusterEventId = clusterEventId;
          } else {
            last.requestsCount += 1;
            last.endDate =
              request.endDate > last.endDate ? request.endDate : last.endDate;
            request.clusterEventId = clusterEventId;
          }

          return acc;
        }, []);
    }

    function parseClusterAvailabilities({ id, availabilities }) {
      let clusterEventId;
      return [...availabilities]
        .sort(sortRequestsByStartDate)
        .reduce((acc, availability) => {
          const last = acc[acc.length - 1];

          availability.endDateCalculated = moment.utc(availability.startDate).clone().add(availability.duration, 'seconds').format('YYYY-MM-DD HH:mm');
          if (last) last.endDateCalculated = moment.utc(last.startDate).clone().add(last.duration, 'seconds').format('YYYY-MM-DD HH:mm');

          if (!last || moment.utc(availability.startDate).format('YYYY-MM-DD HH:mm') > last.endDateCalculated) {
            clusterEventId = uniqueId('cluster-availability-');

            acc.push(
              getEvent({
                id: clusterEventId,
                resourceId: id,
                startDate: availability.startDate,
                duration: availability.duration + 1,
                durationUnit: 's',
                requestsCount: 1,
                isCluster: true,
                isNotAvailable: true
              })
            );
            availability.clusterEventId = clusterEventId;
          } else {
            last.requestsCount += 1;
            last.endDateCalculated = availability.endDateCalculated > last.endDateCalculated ? availability.endDateCalculated : last.endDateCalculated;
            availability.clusterEventId = clusterEventId;
          }

          return acc;
        }, []);
    }

    function parseAvailabilities({ id, availabilities }) {
      return availabilities.reduce((acc, availability) => {
        acc.push(createAvailabilityEvent({id, availability}));
        return acc;
      }, []);
    }

    function createAvailabilityEvent({id, availability}) {
      const { start_date, duration, reason, comment } = availability;

      return getEvent({
        resourceId: id,
        startDate: moment.utc(start_date).format('YYYY-MM-DD HH:mm'),
        duration: duration + 1,
        durationUnit: 's',
        isNotAvailable: true,
        reason: reason,
        comment: comment,
        resourceEventId: availability.id
      })
    }

    function parseRequestsWithMewMessages({ requests }) {
      return requests
        .filter(({ hasNewMessage }) => hasNewMessage)
        .sort(sortRequestsByStartDate);
    }

    function sortRequestsByStartDate(requestA, requestB) {
      return requestA.startDate.localeCompare(requestB.startDate); // sort date strings alphanumerically
    }

    function getResource(resourceData) {
      // all resources should have the same schema
      return Object.assign(
        {
          id: null,
          bikeNumber: null,
          name: null,
          location: null,
          isCluster: false,
          isVariant: false,
          category: null,
          imageUrl: null,
          size: null,
          sizeLabel: null,
          variantIndex: null,
          cls: null,
          requestsWithNewMessages: [],
          children: [],
          requests: []
        },
        resourceData
      );
    }

    function getEvent(eventData) {
      // all events should have the same schema
      return Object.assign(
        {
          resourceId: null,
          bookingId: null,
          startDate: null,
          endDate: null,
          rawStartDate: null,
          rawEndDate: null,
          requestsCount: null,
          isCluster: false,
          isPending: false,
          isAccepted: false,
          isNotAvailable: false,
          hasNewMessage: false,
          isChangingStatus: false,
          clusterEventId: null,
          duration: null,
          rider: null,
          contact: null,
          reason: null,
          comment: null,
          resourceEventId: null
        },
        eventData
      );
    }
  });
