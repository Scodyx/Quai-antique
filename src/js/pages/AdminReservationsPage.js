import Modal from 'bootstrap/js/dist/modal';

import { AdminLayout, initAdminLayout } from '../components/admin/AdminLayout.js';
import { cleanupBootstrapOverlayState } from '../utils/bootstrapCleanup.js';
import { formatTime } from '../utils/formatters.js';
import { escapeHtml } from '../utils/textUtils.js';

const VALID_STATUSES = ['Confirmée', 'En attente'];

function getLocalIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function shiftLocalDate(value, dayOffset) {
  const date = parseLocalIsoDate(value);
  if (!date) return getLocalIsoDate();
  date.setDate(date.getDate() + dayOffset);
  return getLocalIsoDate(date);
}

function relativeLocalDate(dayOffset) {
  return shiftLocalDate(getLocalIsoDate(), dayOffset);
}

// Ces données fictives seront remplacées par les réservations récupérées depuis l’API Symfony.
const MOCK_RESERVATIONS = [
  { id: 301, date: relativeLocalDate(-1), time: '12:15', firstName: 'Aline', lastName: 'Exemple', email: 'aline.exemple@example.fr', guests: 2, allergies: '', service: 'Midi', status: 'Confirmée' },
  { id: 302, date: relativeLocalDate(-1), time: '19:30', firstName: 'Bastien', lastName: 'Démo', email: 'bastien.demo@example.fr', guests: 4, allergies: 'Lactose', service: 'Soir', status: 'Annulée' },
  { id: 303, date: relativeLocalDate(0), time: '12:00', firstName: 'Camille', lastName: 'Fictive', email: 'camille.fictive@example.fr', guests: 2, allergies: 'Fruits à coque', service: 'Midi', status: 'Confirmée' },
  { id: 304, date: relativeLocalDate(0), time: '12:45', firstName: 'Dorian', lastName: 'Test', email: 'dorian.test@example.fr', guests: 3, allergies: '', service: 'Midi', status: 'En attente' },
  { id: 305, date: relativeLocalDate(0), time: '19:15', firstName: 'Élise', lastName: 'Prototype', email: 'elise.prototype@example.fr', guests: 5, allergies: 'Œufs', service: 'Soir', status: 'Confirmée' },
  { id: 306, date: relativeLocalDate(0), time: '20:30', firstName: 'Farid', lastName: 'Maquette', email: 'farid.maquette@example.fr', guests: 2, allergies: '', service: 'Soir', status: 'Annulée' },
  { id: 307, date: relativeLocalDate(1), time: '12:30', firstName: 'Gaëlle', lastName: 'Scénario', email: 'gaelle.scenario@example.fr', guests: 4, allergies: 'Gluten', service: 'Midi', status: 'Confirmée' },
  { id: 308, date: relativeLocalDate(1), time: '19:45', firstName: 'Hugo', lastName: 'Exemple', email: 'hugo.exemple@example.fr', guests: 6, allergies: '', service: 'Soir', status: 'En attente' },
  { id: 309, date: relativeLocalDate(2), time: '13:00', firstName: 'Inès', lastName: 'Démo', email: 'ines.demo@example.fr', guests: 2, allergies: 'Arachides', service: 'Midi', status: 'Confirmée' },
  { id: 310, date: relativeLocalDate(2), time: '20:00', firstName: 'Jules', lastName: 'Fictif', email: 'jules.fictif@example.fr', guests: 3, allergies: '', service: 'Soir', status: 'Confirmée' },
  { id: 311, date: relativeLocalDate(4), time: '12:15', firstName: 'Lina', lastName: 'Test', email: 'lina.test@example.fr', guests: 5, allergies: '', service: 'Midi', status: 'En attente' },
  { id: 312, date: relativeLocalDate(5), time: '19:00', firstName: 'Malo', lastName: 'Prototype', email: 'malo.prototype@example.fr', guests: 2, allergies: 'Poisson', service: 'Soir', status: 'Confirmée' },
];

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

function formatDate(value) {
  const date = parseLocalIsoDate(value);
  return date ? dateFormatter.format(date) : 'Date invalide';
}

function getServiceFromTime(time) {
  return Number(time.slice(0, 2)) < 17 ? 'Midi' : 'Soir';
}

function getDayStatistics(reservations, selectedDate) {
  const dayReservations = reservations.filter((reservation) => reservation.date === selectedDate);
  return [
    { label: 'Nombre de réservations', value: dayReservations.length, detail: 'Toutes les réservations du jour, annulations comprises' },
    { label: 'Couverts prévus', value: dayReservations.filter((reservation) => reservation.status !== 'Annulée').reduce((sum, reservation) => sum + reservation.guests, 0), detail: 'Les réservations annulées sont exclues' },
    { label: 'Réservations confirmées', value: dayReservations.filter((reservation) => reservation.status === 'Confirmée').length, detail: 'Réservations dont le statut est confirmé' },
    { label: 'Réservations en attente', value: dayReservations.filter((reservation) => reservation.status === 'En attente').length, detail: 'Demandes restant à confirmer' },
  ];
}

function filterReservations(reservations, filters) {
  const query = filters.search.trim().toLocaleLowerCase('fr-FR');
  return reservations
    .filter((reservation) => reservation.date === filters.date)
    .filter((reservation) => filters.service === 'all' || reservation.service === filters.service)
    .filter((reservation) => filters.status === 'all' || reservation.status === filters.status)
    .filter((reservation) => {
      if (!query) return true;
      return `${reservation.firstName} ${reservation.lastName} ${reservation.email}`
        .toLocaleLowerCase('fr-FR')
        .includes(query);
    })
    .sort((first, second) => first.time.localeCompare(second.time));
}

function statusClass(status) {
  if (status === 'Confirmée') return 'confirmed';
  if (status === 'En attente') return 'pending';
  return 'cancelled';
}

function reservationActions(reservation) {
  if (reservation.status === 'Annulée') return '<span class="admin-reservations__no-action">Aucune action</span>';
  const client = `${reservation.firstName} ${reservation.lastName}`;
  return `
    <div class="admin-reservations__actions">
      <button class="btn btn-secondary" type="button" data-edit-reservation="${reservation.id}" aria-label="Modifier la réservation de ${escapeHtml(client)} à ${escapeHtml(formatTime(reservation.time))}">Modifier</button>
      <button class="btn admin-reservations__cancel-button" type="button" data-cancel-reservation="${reservation.id}" aria-label="Annuler la réservation de ${escapeHtml(client)} à ${escapeHtml(formatTime(reservation.time))}">Annuler</button>
    </div>
  `;
}

function createDesktopRows(reservations) {
  return reservations.map((reservation) => `
    <tr class="${reservation.status === 'Annulée' ? 'admin-reservations__row--cancelled' : ''}">
      <td>${escapeHtml(formatTime(reservation.time))}</td>
      <td><strong>${escapeHtml(reservation.firstName)} ${escapeHtml(reservation.lastName)}</strong><span>${escapeHtml(reservation.email)}</span></td>
      <td>${reservation.service}</td><td>${reservation.guests}</td>
      <td>${escapeHtml(reservation.allergies || 'Aucune allergie renseignée')}</td>
      <td><span class="admin-status admin-status--${statusClass(reservation.status)}">${reservation.status}</span></td>
      <td>${reservationActions(reservation)}</td>
    </tr>
  `).join('');
}

function createMobileCards(reservations) {
  return reservations.map((reservation) => `
    <article class="admin-reservation-card${reservation.status === 'Annulée' ? ' admin-reservation-card--cancelled' : ''}">
      <div class="admin-reservation-card__heading"><h3>${escapeHtml(formatTime(reservation.time))} — ${escapeHtml(reservation.firstName)} ${escapeHtml(reservation.lastName)}</h3><span class="admin-status admin-status--${statusClass(reservation.status)}">${reservation.status}</span></div>
      <p class="admin-reservation-card__email">${escapeHtml(reservation.email)}</p>
      <dl><div><dt>Service</dt><dd>${reservation.service}</dd></div><div><dt>Couverts</dt><dd>${reservation.guests}</dd></div><div><dt>Allergies</dt><dd>${escapeHtml(reservation.allergies || 'Aucune allergie renseignée')}</dd></div></dl>
      ${reservationActions(reservation)}
    </article>
  `).join('');
}

function createIndicators(statistics) {
  return statistics.map((indicator) => `
    <article class="admin-reservations-indicator"><p>${indicator.label}</p><strong>${indicator.value}</strong><span>${indicator.detail}</span></article>
  `).join('');
}

function prepareReservationUpdate(id, inputs) {
  return {
    id,
    date: inputs.date.value,
    time: inputs.time.value,
    guests: Number(inputs.guests.value),
    allergies: inputs.allergies.value.trim().replace(/\s+/g, ' '),
    status: inputs.status.value,
  };
}

function prepareCancellation(id) {
  return { id, status: 'Annulée' };
}

function createModals() {
  return `
    <div class="modal fade admin-reservations-modal" id="admin-edit-reservation-modal" tabindex="-1" aria-labelledby="admin-edit-reservation-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content">
        <div class="modal-header"><div><h2 class="modal-title" id="admin-edit-reservation-title">Modifier une réservation</h2><p id="admin-edit-client"></p></div><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
        <form id="admin-edit-reservation-form" novalidate>
          <div class="modal-body"><div class="admin-reservations-modal__grid">
            <div class="admin-reservations-field"><label for="admin-edit-date">Date</label><input class="form-control" id="admin-edit-date" type="date" aria-describedby="admin-edit-date-error" required><p class="admin-reservations-error" id="admin-edit-date-error"></p></div>
            <div class="admin-reservations-field"><label for="admin-edit-time">Heure</label><input class="form-control" id="admin-edit-time" type="time" step="900" aria-describedby="admin-edit-time-help admin-edit-time-error" required><p class="admin-reservations-help" id="admin-edit-time-help">Choisissez un horaire par intervalle de quinze minutes.</p><p class="admin-reservations-error" id="admin-edit-time-error"></p></div>
            <div class="admin-reservations-field"><label for="admin-edit-guests">Nombre de couverts</label><input class="form-control" id="admin-edit-guests" type="number" min="1" max="12" aria-describedby="admin-edit-guests-error" required><p class="admin-reservations-error" id="admin-edit-guests-error"></p></div>
            <div class="admin-reservations-field"><label for="admin-edit-status">Statut</label><select class="form-select" id="admin-edit-status" aria-describedby="admin-edit-status-error" required><option value="Confirmée">Confirmée</option><option value="En attente">En attente</option></select><p class="admin-reservations-error" id="admin-edit-status-error"></p></div>
            <div class="admin-reservations-field admin-reservations-field--full"><label for="admin-edit-allergies">Allergies <span>(facultatif)</span></label><textarea class="form-control" id="admin-edit-allergies" rows="4"></textarea></div>
          </div><p class="admin-reservations-help">Les horaires exacts et la disponibilité seront validés ultérieurement par l’API Symfony.</p></div>
          <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Fermer</button><button class="btn btn-primary" type="submit">Enregistrer la modification</button></div>
        </form>
      </div></div>
    </div>

    <div class="modal fade admin-reservations-modal" id="admin-cancel-reservation-modal" tabindex="-1" aria-labelledby="admin-cancel-reservation-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
        <div class="modal-header"><h2 class="modal-title" id="admin-cancel-reservation-title">Confirmer l’annulation</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
        <div class="modal-body"><p>Cette réservation restera visible avec le statut « Annulée ».</p><dl class="admin-reservations-cancel-summary" id="admin-cancel-summary"></dl></div>
        <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Conserver la réservation</button><button class="btn btn-danger" id="admin-confirm-cancellation" type="button">Confirmer l’annulation</button></div>
      </div></div>
    </div>
  `;
}

export function AdminReservationsPage() {
  const today = getLocalIsoDate();
  return AdminLayout(`
    <header class="admin-reservations-intro"><p class="admin-eyebrow">Administration</p><h1>Gestion des réservations</h1><p>Consultez, filtrez et mettez à jour les réservations du restaurant. Les données affichées sont simulées.</p></header>
    <div class="admin-reservations-live alert d-none" id="admin-reservations-live" role="status" aria-live="polite" tabindex="-1"></div>

    <section class="admin-reservations-panel" aria-labelledby="admin-filters-title">
      <h2 id="admin-filters-title">Filtres</h2>
      <div class="admin-reservations-filters">
        <div class="admin-reservations-field admin-reservations-field--date"><label for="admin-filter-date">Date des réservations</label><input class="form-control" id="admin-filter-date" type="date" value="${today}"></div>
        <div class="admin-reservations-field"><label for="admin-filter-service">Service</label><select class="form-select" id="admin-filter-service"><option value="all">Tous les services</option><option value="Midi">Midi</option><option value="Soir">Soir</option></select></div>
        <div class="admin-reservations-field"><label for="admin-filter-status">Statut</label><select class="form-select" id="admin-filter-status"><option value="all">Tous les statuts</option><option value="Confirmée">Confirmée</option><option value="En attente">En attente</option><option value="Annulée">Annulée</option></select></div>
        <div class="admin-reservations-field"><label for="admin-filter-search">Rechercher un client</label><input class="form-control" id="admin-filter-search" type="search" autocomplete="off" placeholder="Nom ou e-mail"></div>
      </div>
      <div class="admin-reservations-date-actions"><button class="btn btn-secondary" id="admin-previous-day" type="button">Jour précédent</button><button class="btn btn-secondary" id="admin-today" type="button">Aujourd’hui</button><button class="btn btn-secondary" id="admin-next-day" type="button">Jour suivant</button><button class="btn admin-reservations-reset" id="admin-reset-filters" type="button">Réinitialiser les filtres</button></div>
    </section>

    <section class="admin-reservations-panel" aria-labelledby="admin-day-summary-title"><div class="admin-reservations-section-heading"><h2 id="admin-day-summary-title">Indicateurs du <span id="admin-selected-date-label"></span></h2></div><div class="admin-reservations-indicators" id="admin-reservations-indicators"></div></section>

    <section class="admin-reservations-panel" aria-labelledby="admin-list-title">
      <div class="admin-reservations-section-heading"><div><h2 id="admin-list-title">Réservations</h2><p id="admin-results-summary"></p></div></div>
      <div id="admin-reservations-results" aria-live="polite"></div>
    </section>
    ${createModals()}
  `);
}

export function initAdminReservationsPage() {
  const cleanupAdminLayout = initAdminLayout();
  const results = document.querySelector('#admin-reservations-results');
  const indicators = document.querySelector('#admin-reservations-indicators');
  const selectedDateLabel = document.querySelector('#admin-selected-date-label');
  const resultsSummary = document.querySelector('#admin-results-summary');
  const liveRegion = document.querySelector('#admin-reservations-live');
  const filters = { date: document.querySelector('#admin-filter-date'), service: document.querySelector('#admin-filter-service'), status: document.querySelector('#admin-filter-status'), search: document.querySelector('#admin-filter-search') };
  const previousDay = document.querySelector('#admin-previous-day');
  const todayButton = document.querySelector('#admin-today');
  const nextDay = document.querySelector('#admin-next-day');
  const resetButton = document.querySelector('#admin-reset-filters');
  const editModalElement = document.querySelector('#admin-edit-reservation-modal');
  const cancelModalElement = document.querySelector('#admin-cancel-reservation-modal');
  const editForm = document.querySelector('#admin-edit-reservation-form');
  const confirmCancellation = document.querySelector('#admin-confirm-cancellation');
  const cancelSummary = document.querySelector('#admin-cancel-summary');
  const editClient = document.querySelector('#admin-edit-client');

  const required = [results, indicators, selectedDateLabel, resultsSummary, liveRegion, ...Object.values(filters), previousDay, todayButton, nextDay, resetButton, editModalElement, cancelModalElement, editForm, confirmCancellation, cancelSummary, editClient];
  if (required.some((element) => !element)) { cleanupAdminLayout?.(); return undefined; }

  const editInputs = { date: editForm.querySelector('#admin-edit-date'), time: editForm.querySelector('#admin-edit-time'), guests: editForm.querySelector('#admin-edit-guests'), allergies: editForm.querySelector('#admin-edit-allergies'), status: editForm.querySelector('#admin-edit-status') };
  const editErrors = { date: editForm.querySelector('#admin-edit-date-error'), time: editForm.querySelector('#admin-edit-time-error'), guests: editForm.querySelector('#admin-edit-guests-error'), status: editForm.querySelector('#admin-edit-status-error') };
  if ([...Object.values(editInputs), ...Object.values(editErrors)].some((element) => !element)) { cleanupAdminLayout?.(); return undefined; }

  const reservations = MOCK_RESERVATIONS.map((reservation) => ({ ...reservation }));
  const listeners = [];
  const editModal = Modal.getOrCreateInstance(editModalElement);
  const cancelModal = Modal.getOrCreateInstance(cancelModalElement);
  let selectedReservationId = null;
  let focusLiveRegionAfterModal = false;

  function addListener(element, eventName, handler) { element.addEventListener(eventName, handler); listeners.push(() => element.removeEventListener(eventName, handler)); }
  function getFilters() { return { date: filters.date.value, service: filters.service.value, status: filters.status.value, search: filters.search.value.trim() }; }
  function announce(message) { liveRegion.textContent = message; liveRegion.className = 'admin-reservations-live alert alert-success'; }
  function setError(input, error, message) { error.textContent = message; input.classList.toggle('is-invalid', Boolean(message)); input.setAttribute('aria-invalid', String(Boolean(message))); return !message; }

  function render() {
    const currentFilters = getFilters();
    const filtered = filterReservations(reservations, currentFilters);
    selectedDateLabel.textContent = formatDate(currentFilters.date);
    indicators.innerHTML = createIndicators(getDayStatistics(reservations, currentFilters.date));
    resultsSummary.textContent = `${filtered.length} réservation${filtered.length > 1 ? 's' : ''} correspondant aux critères.`;
    if (!filtered.length) {
      results.innerHTML = '<p class="admin-reservations-empty">Aucune réservation ne correspond aux critères sélectionnés.</p>';
      return;
    }
    results.innerHTML = `
      <div class="admin-reservations-table-wrap"><table class="admin-reservations-table"><caption>Réservations du ${escapeHtml(formatDate(currentFilters.date))}</caption><thead><tr><th scope="col">Heure</th><th scope="col">Client</th><th scope="col">Service</th><th scope="col">Couverts</th><th scope="col">Allergies</th><th scope="col">Statut</th><th scope="col">Actions</th></tr></thead><tbody>${createDesktopRows(filtered)}</tbody></table></div>
      <div class="admin-reservation-card-list" aria-label="Réservations du ${escapeHtml(formatDate(currentFilters.date))}">${createMobileCards(filtered)}</div>
    `;
  }

  function findReservation() { return reservations.find((reservation) => reservation.id === selectedReservationId); }
  function changeDay(offset) { filters.date.value = shiftLocalDate(filters.date.value, offset); render(); }
  function resetFilters() { filters.date.value = getLocalIsoDate(); filters.service.value = 'all'; filters.status.value = 'all'; filters.search.value = ''; render(); filters.date.focus(); }

  function handleActions(event) {
    const editButton = event.target.closest('[data-edit-reservation]');
    const cancelButton = event.target.closest('[data-cancel-reservation]');
    if (!editButton && !cancelButton) return;
    selectedReservationId = Number((editButton ?? cancelButton).dataset[editButton ? 'editReservation' : 'cancelReservation']);
    const reservation = findReservation();
    if (!reservation || reservation.status === 'Annulée') return;
    const client = `${reservation.firstName} ${reservation.lastName}`;
    if (editButton) {
      editInputs.date.value = reservation.date; editInputs.time.value = reservation.time; editInputs.guests.value = String(reservation.guests); editInputs.allergies.value = reservation.allergies; editInputs.status.value = reservation.status;
      editClient.textContent = client;
      document.querySelector('#admin-edit-reservation-title').textContent = `Modifier la réservation de ${client}`;
      Object.keys(editErrors).forEach((key) => setError(editInputs[key], editErrors[key], ''));
      editModal.show();
    } else {
      cancelSummary.innerHTML = `<div><dt>Client</dt><dd>${escapeHtml(client)}</dd></div><div><dt>Date</dt><dd>${escapeHtml(formatDate(reservation.date))}</dd></div><div><dt>Heure</dt><dd>${escapeHtml(formatTime(reservation.time))}</dd></div><div><dt>Couverts</dt><dd>${reservation.guests}</dd></div>`;
      cancelModal.show();
    }
  }

  function validateEditForm() {
    const validDate = Boolean(parseLocalIsoDate(editInputs.date.value));
    const validTime = /^([01]\d|2[0-3]):(00|15|30|45)$/.test(editInputs.time.value);
    const guests = Number(editInputs.guests.value);
    return [
      setError(editInputs.date, editErrors.date, validDate ? '' : 'Choisissez une date valide.'),
      setError(editInputs.time, editErrors.time, validTime ? '' : 'Choisissez une heure valide par intervalle de quinze minutes.'),
      setError(editInputs.guests, editErrors.guests, Number.isInteger(guests) && guests >= 1 && guests <= 12 ? '' : 'Choisissez un nombre de couverts compris entre 1 et 12.'),
      setError(editInputs.status, editErrors.status, VALID_STATUSES.includes(editInputs.status.value) ? '' : 'Choisissez le statut Confirmée ou En attente.'),
    ].every(Boolean);
  }

  function handleEditSubmit(event) {
    event.preventDefault();
    if (!validateEditForm()) { editForm.querySelector('.is-invalid')?.focus(); return; }
    const reservation = findReservation();
    if (!reservation) return;
    const update = prepareReservationUpdate(selectedReservationId, editInputs);
    // La disponibilité réelle et les horaires exacts seront vérifiés par l’API Symfony avant modification.
    Object.assign(reservation, update, { service: getServiceFromTime(update.time) });
    render(); announce('La modification est simulée. Elle sera enregistrée par l’API Symfony ultérieurement.');
    focusLiveRegionAfterModal = true; editModal.hide();
  }

  function handleCancellation() {
    const reservation = findReservation();
    if (!reservation) return;
    // Le futur appel d’annulation à l’API Symfony utilisera cet objet non sensible.
    Object.assign(reservation, prepareCancellation(selectedReservationId));
    render(); announce('L’annulation est simulée. Elle sera enregistrée par l’API Symfony ultérieurement.');
    focusLiveRegionAfterModal = true; cancelModal.hide();
  }

  function focusAfterModal() { if (focusLiveRegionAfterModal) { focusLiveRegionAfterModal = false; liveRegion.focus(); } }
  addListener(filters.date, 'change', render); addListener(filters.service, 'change', render); addListener(filters.status, 'change', render); addListener(filters.search, 'input', render);
  addListener(previousDay, 'click', () => changeDay(-1)); addListener(todayButton, 'click', () => { filters.date.value = getLocalIsoDate(); render(); }); addListener(nextDay, 'click', () => changeDay(1)); addListener(resetButton, 'click', resetFilters);
  addListener(results, 'click', handleActions); addListener(editForm, 'submit', handleEditSubmit); addListener(confirmCancellation, 'click', handleCancellation);
  addListener(editModalElement, 'hidden.bs.modal', focusAfterModal); addListener(cancelModalElement, 'hidden.bs.modal', focusAfterModal);
  render();

  return () => {
    listeners.forEach((removeListener) => removeListener());
    [editModal, cancelModal].forEach((modal) => { modal.hide(); modal.dispose(); });
    cleanupBootstrapOverlayState();
    cleanupAdminLayout?.();
  };
}
