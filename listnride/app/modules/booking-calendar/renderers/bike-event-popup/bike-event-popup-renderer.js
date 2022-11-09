import moment from 'moment';

import './bike-event-popup.css';

function badgeRenderer({ eventRecord, translations }) {
  const { isPending, isAccepted } = eventRecord;

  let badgeModifiers = '';
  let icon = '';
  let label = '';

  if (isPending) {
    badgeModifiers += 'booking-calendar__badge--blue';
    icon += '<i class="fa fa-clock-o" aria-hidden="true"></i>';
    label += translations['booking-calendar.event.waiting'];
  }

  if (isAccepted) {
    badgeModifiers += 'booking-calendar__badge--green';
    label += translations['booking-calendar.event.accepted'];
  }

  return `
    <span class="booking-calendar__badge ${badgeModifiers}">
      ${icon} ${label}
    </span>
  `;
}

function bookingConfirmationRenderer({ eventRecord, translations }) {
  const { isPending } = eventRecord;
  if (!isPending) {
    return '';
  }
  return `
    <section class="bike-event-popup__section">
      <button
        type="button"
        data-id="reject-booking"
        class="md-button md-raised md-ink-ripple md-warn bike-event-popup__confirmation-button"
        hide-on-click>
        ${translations['message.reject']}
      </button>
      <button
        type="button"
        data-id="accept-booking"
        class="md-button md-raised md-ink-ripple md-primary bike-event-popup__confirmation-button"
        hide-on-click>
        ${translations['message.accept']}
      </button>
    </section>
  `;
}

function bikeDetailsRenderer({ eventRecord, translations, getters }) {
  const datesFormat = 'DD.MM.YYYY';
  const pickupFormat = 'HH:mm';
  const { name, size, category, sizeLabel } = eventRecord.resource;
  const {
    startDate,
    endDate,
    rawStartDate,
    rawEndDate,
    bookingId,
    rider,
    contact
  } = eventRecord;
  const formattedStart = moment.utc(rawStartDate).format(datesFormat);
  const formattedEnd = moment.utc(rawEndDate).format(datesFormat);

  return `
    <div class="bike-event-popup__name-wrap">
      <span class="bike-event-popup__name">
        ${name} - ${getters.getCategoryLabel(category)}
      </span>
      ${badgeRenderer({ eventRecord, translations })}
    </div>

    <section class="bike-event-popup__section">
      <div>
        <div>${translations['booking.overview.size']}</div>
        <div>${translations['booking-calendar.event.date']}</div>
        <div>${translations['booking-calendar.event.pickup']}</div>
        <div>${translations['booking.calendar.return-time']}</div>
        <div>${translations['booking-calendar.event.booking-id']}</div>
      </div>

      <div>
        <div>${sizeLabel}</div>
        <div>${formattedStart} - ${formattedEnd}</div>
        <div>${moment.utc(rawStartDate).format(pickupFormat)}</div>
        <div>${moment.utc(rawEndDate).format(pickupFormat)}</div>
        <div>${bookingId}</div>
      </div>
    </section>

    <section class="bike-event-popup__section">
      <div>
        <div>${translations['booking-calendar.event.rider']}</div>
        <div>${translations['booking-calendar.event.contact']}</div>
      </div>

      <div>
        <div>${rider}</div>
        <div>${contact}</div>
      </div>
    </section>

    ${bookingConfirmationRenderer({ eventRecord, translations })}

    <a
      class="bike-event-popup__link"
      href="${getters.getBookingHref(bookingId)}"
      hide-on-click>
      ${translations['booking-calendar.event.view-booking']}
    </a>
  `;
}

function notAvailableEventPopupRenderer({ translations, getters, eventRecord }) {
  const datesFormat = 'DD.MM.YYYY, HH:mm';
  const {
    startDate,
    duration,
  } = eventRecord;
  const formattedStart = moment(startDate).format(datesFormat);
  const formattedEnd = moment(startDate).add(duration, 'seconds').format(datesFormat);

  return `
    <header class="bike-event-popup__header">
      ${translations['booking-calendar.event.not-available-header']}
    </header>
    <p class="bike-event-popup__description">
      ${translations['booking-calendar.event.date']} : ${formattedStart} - ${formattedEnd}
      <br>
      ${eventRecord.reason ? translations['booking-calendar.reason'] + ': ' + translations[eventRecord.reason] : ''}
      <br>
      ${eventRecord.comment ? eventRecord.comment : translations['booking-calendar.event.not-available-text']}
    </p>
    <a
      class="bike-event-popup__link ng-hide"
      href="${getters.getBikeListingsHref()}">
      ${translations['booking-calendar.event.see-settings']}
    </a>
  `;
}

export function bikeEventPopupRenderer({ eventRecord, translations, getters }) {
  const {
    isPending,
    isAccepted,
    isNotAvailable,
    isChangingStatus,
    isCluster
  } = eventRecord;

  if (isChangingStatus || isCluster) {
    /* do not draw a popup */
    return;
  }

  if (isPending || isAccepted) {
    return bikeDetailsRenderer({ eventRecord, translations, getters });
  }

  if (isNotAvailable) {
    return notAvailableEventPopupRenderer({
      translations,
      getters,
      eventRecord
    });
  }
}
