import './bike-column.css';

function newBadgeRenderer({ record, translations }) {
  const { requestsWithNewMessages } = record;
  return requestsWithNewMessages && requestsWithNewMessages.length > 0
    ? `<span
         data-id="new-messages-badge"
         class="booking-calendar__badge booking-calendar__badge--blue booking-calendar__badge--chevron booking-calendar__badge--clickable">
         ${translations['shared.label_new']}
       </span>`
    : '';
}

function bikeMetaInfoRenderer({ record, translations }) {
  const { id, children, isCluster, sizeLabel, bikeNumber } = record;
  let content = '';

  const sizeDisplay = `
    <dt>${translations['booking.overview.size']}:</dt>
    <dd>${sizeLabel}</dd>
  `;

  if (isCluster) {
    content += `
      <dt>${translations['booking-calendar.bike-variants']}:</dt>
      <dd>${children.length}</dd>
      ${newBadgeRenderer({ record, translations })}
    `;
  } else {
    content += `
      <dt>${translations['shared.id']}:</dt>
      <dd>${bikeNumber ? bikeNumber : id}</dd>
      ${sizeDisplay}
      ${newBadgeRenderer({ record, translations })}
    `;
  }

  return `
    <dl class="bike-meta">
      ${content}
    </dl>
  `;
}

export function bikeColumnRenderer({ cellElement, record, translations }) {
  cellElement.classList.add('bike-column');

  let html = '';
  const { name, imageUrl, isVariant, variantIndex } = record;
  if (isVariant) {
    html += `
      <div class="variant-index">${variantIndex}</div>
      ${bikeMetaInfoRenderer({ record, translations })}
    `;
  } else {
    html += `
      <div class="bike-img-wrap"><img class="bike-img" src="${imageUrl}" alt="${name}" /></div>
      <div class="bike-details">
        <p class="bike-name" title="${name}">${name}</p>
        ${bikeMetaInfoRenderer({ record, translations })}
      </div>
    `;
  }
  return html;
}
