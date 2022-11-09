import './bike-event.css';

function statusRenderer({ eventRecord, resourceRecord, translations }) {
  const { isCluster } = resourceRecord;
  const { isPending, isAccepted, isNotAvailable, requestsCount } = eventRecord;
  if (isCluster && isNotAvailable) {
    const bikesLabel =
      requestsCount === 1 ?
      translations['shared.event'] :
      translations['shared.events'];
    return `
      <span class="event-status ellipsis bikes-count">
        ${requestsCount} ${bikesLabel}
      </span>
    `;
  }
  if (isCluster) {
    const bikesLabel =
      requestsCount === 1
        ? translations['shared.request']
        : translations['shared.requests'];
    return `
      <span class="event-status ellipsis bikes-count">
        ${requestsCount} ${bikesLabel}
      </span>
    `;
  }
  if (isPending) {
    return `
      <span class="event-status ellipsis">
        <i class="fa fa-clock-o" aria-hidden="true"></i>
        ${translations['booking-calendar.event.request-waiting']}
      </span>
    `;
  }
  if (isAccepted) {
    return `
      <span class="event-status ellipsis">
        <i class="fa fa-check-circle-o" aria-hidden="true"></i>
        ${translations['booking-calendar.event.accepted']}
      </span>
    `;
  }
  if (isNotAvailable) {
    return `
      ${eventRecord.reason ? translations[eventRecord.reason] : ''}
      <span class="event-status ellipsis">
        <i class="fa fa-times-circle-o" aria-hidden="true"></i>
        ${translations['booking-calendar.event.not-available']}
      </span>
    `;
  }
  return '';
}

export function bikeEventRenderer({
  eventRecord,
  resourceRecord,
  tplData,
  translations
}) {
  const { name, isCluster } = resourceRecord;
  const {
    rider,
    isPending,
    isAccepted,
    isNotAvailable,
    isChangingStatus
  } = eventRecord;

  tplData.cls['changing-status'] = isChangingStatus;
  tplData.cls.pending = isPending;
  tplData.cls.accepted = isAccepted;
  tplData.cls['not-available'] = isNotAvailable;
  tplData.cls.cluster = isCluster;
  tplData.cls['is-narrow'] = Math.floor(tplData.width) <= 50;

  const html = `
    <div class="event-name ellipsis">${isCluster || !rider ? name : rider}</div>
    ${statusRenderer({ eventRecord, resourceRecord, translations })}
  `;

  return html;
}
