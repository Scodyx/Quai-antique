import Modal from 'bootstrap/js/dist/modal';

import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

// Ces informations fictives seront remplacées par celles du client connecté fournies par l’API Symfony.
const MOCK_CLIENT = {
  firstName: 'Camille',
  lastName: 'Martin',
  email: 'camille.martin@example.fr',
  defaultGuests: 2,
  allergies: 'Fruits à coque',
};

function getRelativeIsoDate(dayOffset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Ces réservations seront remplacées par celles du client récupérées depuis l’API Symfony.
const MOCK_RESERVATIONS = [
  { id: 101, date: getRelativeIsoDate(12), time: '19:30', guests: 2, allergies: 'Fruits à coque', status: 'Confirmée', canEdit: false, canCancel: true },
  { id: 102, date: getRelativeIsoDate(30), time: '12:30', guests: 4, allergies: '', status: 'Confirmée', canEdit: true, canCancel: true },
  { id: 103, date: getRelativeIsoDate(-20), time: '20:00', guests: 2, allergies: '', status: 'Passée', canEdit: false, canCancel: false },
  { id: 104, date: getRelativeIsoDate(-8), time: '13:00', guests: 3, allergies: 'Lactose', status: 'Annulée', canEdit: false, canCancel: false },
];

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(dateValue) {
  return dateFormatter.format(new Date(`${dateValue}T12:00:00`));
}

function formatTime(time) {
  return time.replace(':', ' h ');
}

function prepareProfileData(inputs) {
  return {
    firstName: normalizeName(inputs.firstName.value),
    lastName: normalizeName(inputs.lastName.value),
    email: inputs.email.value.trim(),
  };
}

function preparePreferencesData(inputs) {
  return {
    defaultGuests: Number(inputs.defaultGuests.value),
    allergies: inputs.allergies.value.trim(),
  };
}

function prepareReservationUpdate(reservationId, inputs) {
  return {
    id: reservationId,
    guests: Number(inputs.guests.value),
    allergies: inputs.allergies.value.trim(),
  };
}

function prepareReservationCancellation(reservationId) {
  return { id: reservationId, status: 'Annulée' };
}

function createReservationCard(reservation) {
  const isCancelled = reservation.status === 'Annulée';
  const actions = reservation.canEdit || reservation.canCancel
    ? `
      <div class="account-reservation__actions">
        ${reservation.canEdit ? `<button class="btn btn-secondary" type="button" data-edit-reservation="${reservation.id}">Modifier la réservation du ${escapeHtml(formatDate(reservation.date))}</button>` : ''}
        ${reservation.canCancel ? `<button class="btn account-btn-danger-outline" type="button" data-cancel-reservation="${reservation.id}">Annuler la réservation du ${escapeHtml(formatDate(reservation.date))}</button>` : ''}
      </div>
    `
    : '<p class="account-reservation__no-action">Aucune action disponible pour cette réservation.</p>';

  return `
    <article class="account-reservation${isCancelled ? ' account-reservation--cancelled' : ''}">
      <div class="account-reservation__heading">
        <h4>${escapeHtml(formatDate(reservation.date))} à ${escapeHtml(formatTime(reservation.time))}</h4>
        <span class="account-status account-status--${reservation.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}">${escapeHtml(reservation.status)}</span>
      </div>
      <dl class="account-reservation__details">
        <div><dt>Couverts</dt><dd>${reservation.guests}</dd></div>
        <div><dt>Allergies</dt><dd>${escapeHtml(reservation.allergies || 'Aucune allergie renseignée')}</dd></div>
      </dl>
      ${actions}
    </article>
  `;
}

export function AccountPage() {
  return `
    ${Header()}
    <main class="account-page">
      <section class="account-intro section" aria-labelledby="account-title">
        <div class="container site-container account-intro__content">
          <p class="section-eyebrow">Espace client</p>
          <h1 id="account-title">Mon compte</h1>
          <p>Gérez vos informations, vos préférences et vos réservations depuis un espace unique.</p>
          <nav class="account-nav" aria-label="Navigation dans mon compte">
            <a href="#profil">Profil</a>
            <a href="#preferences">Préférences</a>
            <a href="#mes-reservations">Mes réservations</a>
            <a href="#suppression-compte">Suppression du compte</a>
          </nav>
        </div>
      </section>

      <div class="container site-container account-layout">
        <div class="account-live alert d-none" id="account-live" role="status" aria-live="polite"></div>

        <section class="account-card" id="profil" aria-labelledby="profile-title">
          <div class="account-card__heading">
            <p class="section-eyebrow">Informations personnelles</p>
            <h2 id="profile-title">Profil</h2>
          </div>
          <form class="account-form" id="profile-form" novalidate>
            <div class="account-form__grid">
              <div class="account-field">
                <label for="account-first-name">Prénom</label>
                <input class="form-control" id="account-first-name" type="text" autocomplete="given-name" value="${escapeHtml(MOCK_CLIENT.firstName)}" aria-describedby="account-first-name-error" required>
                <p class="account-error" id="account-first-name-error"></p>
              </div>
              <div class="account-field">
                <label for="account-last-name">Nom</label>
                <input class="form-control" id="account-last-name" type="text" autocomplete="family-name" value="${escapeHtml(MOCK_CLIENT.lastName)}" aria-describedby="account-last-name-error" required>
                <p class="account-error" id="account-last-name-error"></p>
              </div>
              <div class="account-field account-field--full">
                <label for="account-email">Adresse e-mail</label>
                <input class="form-control" id="account-email" type="email" autocomplete="email" value="${escapeHtml(MOCK_CLIENT.email)}" aria-describedby="account-email-error" required>
                <p class="account-error" id="account-email-error"></p>
              </div>
            </div>
            <button class="btn btn-primary" type="submit">Enregistrer le profil</button>
          </form>
        </section>

        <section class="account-card" id="preferences" aria-labelledby="preferences-title">
          <div class="account-card__heading">
            <p class="section-eyebrow">Réservations plus rapides</p>
            <h2 id="preferences-title">Préférences</h2>
          </div>
          <form class="account-form" id="preferences-form" novalidate>
            <div class="account-form__grid">
              <div class="account-field">
                <label for="account-default-guests">Nombre de convives par défaut</label>
                <input class="form-control" id="account-default-guests" type="number" min="1" max="12" value="${MOCK_CLIENT.defaultGuests}" aria-describedby="account-default-guests-help account-default-guests-error" required>
                <p class="account-help" id="account-default-guests-help">Cette valeur préremplira vos futures réservations.</p>
                <p class="account-error" id="account-default-guests-error"></p>
              </div>
              <div class="account-field account-field--full">
                <label for="account-allergies">Allergies ou intolérances <span>(facultatif)</span></label>
                <textarea class="form-control" id="account-allergies" rows="4" aria-describedby="account-allergies-help">${escapeHtml(MOCK_CLIENT.allergies)}</textarea>
                <p class="account-help" id="account-allergies-help">Ces informations serviront à préremplir vos futures réservations.</p>
              </div>
            </div>
            <button class="btn btn-primary" type="submit">Enregistrer les préférences</button>
          </form>
        </section>

        <section class="account-card" id="mes-reservations" aria-labelledby="reservations-title">
          <div class="account-card__heading account-card__heading--row">
            <div><p class="section-eyebrow">Votre historique</p><h2 id="reservations-title">Mes réservations</h2></div>
            <a class="btn btn-secondary" href="/reservation" data-link>Nouvelle réservation</a>
          </div>
          <div id="account-reservations"></div>
        </section>

        <section class="account-card account-danger-zone" id="suppression-compte" aria-labelledby="delete-account-title">
          <p class="section-eyebrow">Zone sensible</p>
          <h2 id="delete-account-title">Supprimer mon compte</h2>
          <p>Cette action supprimera ultérieurement vos informations personnelles, vos préférences et votre accès à l’espace client.</p>
          <button class="btn btn-danger" id="open-delete-account" type="button">Supprimer mon compte</button>
        </section>
      </div>
    </main>

    <div class="modal fade account-modal" id="edit-reservation-modal" tabindex="-1" aria-labelledby="edit-reservation-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
        <div class="modal-header"><h2 class="modal-title" id="edit-reservation-title">Modifier la réservation</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
        <form id="edit-reservation-form" novalidate>
          <div class="modal-body">
            <p class="account-help">La modification de la date ou de l’heure sera disponible après le branchement au système réel de réservation.</p>
            <div class="account-field"><label for="edit-reservation-guests">Nombre de couverts</label><input class="form-control" id="edit-reservation-guests" type="number" min="1" max="12" aria-describedby="edit-reservation-guests-error" required><p class="account-error" id="edit-reservation-guests-error"></p></div>
            <div class="account-field"><label for="edit-reservation-allergies">Allergies <span>(facultatif)</span></label><textarea class="form-control" id="edit-reservation-allergies" rows="4"></textarea></div>
          </div>
          <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Fermer</button><button class="btn btn-primary" type="submit">Enregistrer la modification</button></div>
        </form>
      </div></div>
    </div>

    <div class="modal fade account-modal" id="cancel-reservation-modal" tabindex="-1" aria-labelledby="cancel-reservation-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
        <div class="modal-header"><h2 class="modal-title" id="cancel-reservation-title">Annuler la réservation</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
        <div class="modal-body"><p>Voulez-vous vraiment annuler cette réservation ?</p><dl class="account-cancel-summary" id="cancel-reservation-summary"></dl></div>
        <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Conserver la réservation</button><button class="btn btn-danger" id="confirm-cancellation" type="button">Annuler la réservation</button></div>
      </div></div>
    </div>

    <div class="modal fade account-modal" id="delete-account-modal" tabindex="-1" aria-labelledby="delete-account-modal-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
        <div class="modal-header"><h2 class="modal-title" id="delete-account-modal-title">Confirmer la suppression du compte</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
        <div class="modal-body"><p>Saisissez exactement <strong>SUPPRIMER</strong> pour confirmer votre demande.</p><div class="account-field"><label for="delete-account-confirmation">Texte de confirmation</label><input class="form-control" id="delete-account-confirmation" type="text" autocomplete="off" aria-describedby="delete-account-confirmation-help"><p class="account-help" id="delete-account-confirmation-help">Le texte doit correspondre exactement, en lettres majuscules.</p></div></div>
        <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Conserver mon compte</button><button class="btn btn-danger" id="confirm-delete-account" type="button" disabled>Supprimer définitivement mon compte</button></div>
      </div></div>
    </div>
    ${Footer()}
  `;
}

export function initAccountPage() {
  const profileForm = document.querySelector('#profile-form');
  const preferencesForm = document.querySelector('#preferences-form');
  const reservationsContainer = document.querySelector('#account-reservations');
  const liveRegion = document.querySelector('#account-live');
  const editModalElement = document.querySelector('#edit-reservation-modal');
  const cancelModalElement = document.querySelector('#cancel-reservation-modal');
  const deleteModalElement = document.querySelector('#delete-account-modal');

  if (!profileForm || !preferencesForm || !reservationsContainer || !liveRegion || !editModalElement || !cancelModalElement || !deleteModalElement) return undefined;

  const client = { ...MOCK_CLIENT };
  const reservations = MOCK_RESERVATIONS.map((reservation) => ({ ...reservation }));
  const listeners = [];
  let selectedReservationId = null;
  const editModal = Modal.getOrCreateInstance(editModalElement);
  const cancelModal = Modal.getOrCreateInstance(cancelModalElement);
  const deleteModal = Modal.getOrCreateInstance(deleteModalElement);

  const profileInputs = { firstName: profileForm.querySelector('#account-first-name'), lastName: profileForm.querySelector('#account-last-name'), email: profileForm.querySelector('#account-email') };
  const profileErrors = { firstName: profileForm.querySelector('#account-first-name-error'), lastName: profileForm.querySelector('#account-last-name-error'), email: profileForm.querySelector('#account-email-error') };
  const preferenceInputs = { defaultGuests: preferencesForm.querySelector('#account-default-guests'), allergies: preferencesForm.querySelector('#account-allergies') };
  const guestsError = preferencesForm.querySelector('#account-default-guests-error');
  const editForm = document.querySelector('#edit-reservation-form');
  const editInputs = { guests: editForm?.querySelector('#edit-reservation-guests'), allergies: editForm?.querySelector('#edit-reservation-allergies') };
  const editGuestsError = editForm?.querySelector('#edit-reservation-guests-error');
  const cancelSummary = document.querySelector('#cancel-reservation-summary');
  const confirmCancellation = document.querySelector('#confirm-cancellation');
  const openDeleteAccount = document.querySelector('#open-delete-account');
  const deleteConfirmation = document.querySelector('#delete-account-confirmation');
  const confirmDeleteAccount = document.querySelector('#confirm-delete-account');

  if (Object.values(profileInputs).some((item) => !item) || Object.values(profileErrors).some((item) => !item) || Object.values(preferenceInputs).some((item) => !item) || !guestsError || !editForm || Object.values(editInputs).some((item) => !item) || !editGuestsError || !cancelSummary || !confirmCancellation || !openDeleteAccount || !deleteConfirmation || !confirmDeleteAccount) return undefined;

  function addListener(element, eventName, handler) {
    element.addEventListener(eventName, handler);
    listeners.push(() => element.removeEventListener(eventName, handler));
  }

  function announce(message, type = 'success') {
    liveRegion.textContent = message;
    liveRegion.className = `account-live alert alert-${type}`;
  }

  function setError(input, error, message) {
    error.textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  function validateName(key, label) {
    const input = profileInputs[key];
    input.value = normalizeName(input.value);
    let message = '';
    if (!input.value) message = `Saisissez votre ${label}.`;
    else if (input.value.length < 2) message = `Votre ${label} doit contenir au moins 2 caractères.`;
    else if (!NAME_PATTERN.test(input.value)) message = `Votre ${label} peut contenir des lettres, espaces, apostrophes et traits d’union.`;
    return setError(input, profileErrors[key], message);
  }

  function validateEmail() {
    profileInputs.email.value = profileInputs.email.value.trim();
    const message = !profileInputs.email.value ? 'Saisissez votre adresse e-mail.' : (!profileInputs.email.validity.valid ? 'Saisissez une adresse e-mail valide.' : '');
    return setError(profileInputs.email, profileErrors.email, message);
  }

  function validateGuests(input, error) {
    const guests = Number(input.value);
    const valid = Number.isInteger(guests) && guests >= 1 && guests <= 12;
    return setError(input, error, valid ? '' : 'Choisissez un nombre de convives compris entre 1 et 12.');
  }

  function renderReservations() {
    const future = reservations.filter((reservation) => reservation.status === 'Confirmée');
    const history = reservations.filter((reservation) => reservation.status !== 'Confirmée');
    reservationsContainer.innerHTML = `
      <div class="account-reservation-group"><h3>Réservations à venir</h3><div class="account-reservation-grid">${future.length ? future.map(createReservationCard).join('') : '<p>Aucune réservation à venir.</p>'}</div></div>
      <div class="account-reservation-group"><h3>Historique</h3><div class="account-reservation-grid">${history.length ? history.map(createReservationCard).join('') : '<p>Aucun historique.</p>'}</div></div>
    `;
  }

  function findSelectedReservation() {
    return reservations.find((reservation) => reservation.id === selectedReservationId);
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    const valid = [validateName('firstName', 'prénom'), validateName('lastName', 'nom'), validateEmail()];
    if (valid.includes(false)) { profileForm.querySelector('.is-invalid')?.focus(); return; }
    Object.assign(client, prepareProfileData(profileInputs));
    // Le futur appel de mise à jour du profil dans l’API Symfony sera effectué ici.
    announce('Les informations sont valides. Elles seront enregistrées lors du branchement à l’API Symfony.');
  }

  function handlePreferencesSubmit(event) {
    event.preventDefault();
    if (!validateGuests(preferenceInputs.defaultGuests, guestsError)) { preferenceInputs.defaultGuests.focus(); return; }
    Object.assign(client, preparePreferencesData(preferenceInputs));
    // Le futur appel de mise à jour des préférences dans l’API Symfony sera effectué ici.
    announce('Les préférences sont valides. Elles seront enregistrées lors du branchement à l’API Symfony.');
  }

  function handleReservationAction(event) {
    const editButton = event.target.closest('[data-edit-reservation]');
    const cancelButton = event.target.closest('[data-cancel-reservation]');
    if (!editButton && !cancelButton) return;
    selectedReservationId = Number((editButton ?? cancelButton).dataset[editButton ? 'editReservation' : 'cancelReservation']);
    const reservation = findSelectedReservation();
    if (!reservation) return;
    if (editButton && reservation.canEdit) {
      editInputs.guests.value = String(reservation.guests);
      editInputs.allergies.value = reservation.allergies;
      document.querySelector('#edit-reservation-title').textContent = `Modifier la réservation du ${formatDate(reservation.date)}`;
      setError(editInputs.guests, editGuestsError, '');
      editModal.show();
    } else if (cancelButton && reservation.canCancel) {
      cancelSummary.innerHTML = `<div><dt>Date</dt><dd>${escapeHtml(formatDate(reservation.date))}</dd></div><div><dt>Heure</dt><dd>${escapeHtml(formatTime(reservation.time))}</dd></div><div><dt>Couverts</dt><dd>${reservation.guests}</dd></div>`;
      cancelModal.show();
    }
  }

  function handleEditSubmit(event) {
    event.preventDefault();
    if (!validateGuests(editInputs.guests, editGuestsError)) { editInputs.guests.focus(); return; }
    const reservation = findSelectedReservation();
    if (!reservation) return;
    Object.assign(reservation, prepareReservationUpdate(selectedReservationId, editInputs));
    // Le futur appel de modification de réservation dans l’API Symfony sera effectué ici.
    renderReservations();
    editModal.hide();
    announce('La modification est simulée. Elle sera enregistrée par l’API Symfony ultérieurement.');
  }

  function handleCancellation() {
    const reservation = findSelectedReservation();
    if (!reservation) return;
    Object.assign(reservation, prepareReservationCancellation(selectedReservationId), { canEdit: false, canCancel: false });
    // Le futur appel d’annulation de réservation dans l’API Symfony sera effectué ici.
    renderReservations();
    cancelModal.hide();
    announce('L’annulation est simulée. Elle sera enregistrée par l’API Symfony ultérieurement.');
  }

  function handleDeleteConfirmationInput() {
    confirmDeleteAccount.disabled = deleteConfirmation.value !== 'SUPPRIMER';
  }

  function handleDeleteAccount() {
    if (deleteConfirmation.value !== 'SUPPRIMER') return;
    // Le futur appel de suppression du compte dans l’API Symfony sera effectué ici.
    deleteModal.hide();
    announce('La demande est valide. La suppression réelle sera réalisée par l’API Symfony.');
  }

  function openDeleteModal() {
    deleteConfirmation.value = '';
    confirmDeleteAccount.disabled = true;
    deleteModal.show();
  }

  addListener(profileForm, 'submit', handleProfileSubmit);
  addListener(preferencesForm, 'submit', handlePreferencesSubmit);
  addListener(reservationsContainer, 'click', handleReservationAction);
  addListener(editForm, 'submit', handleEditSubmit);
  addListener(confirmCancellation, 'click', handleCancellation);
  addListener(openDeleteAccount, 'click', openDeleteModal);
  addListener(deleteConfirmation, 'input', handleDeleteConfirmationInput);
  addListener(confirmDeleteAccount, 'click', handleDeleteAccount);
  renderReservations();

  return () => {
    listeners.forEach((removeListener) => removeListener());
    [editModal, cancelModal, deleteModal].forEach((modal) => { modal.hide(); modal.dispose(); });
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
  };
}
