import Modal from 'bootstrap/js/dist/modal';

import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';

const PENDING_RESERVATION_KEY = 'quaiAntique.pendingReservation';
const MOCK_MAX_CAPACITY = 30;
const DEFAULT_GUESTS = 2;
const MIN_GUESTS = 1;
const MAX_GUESTS = 12;

// Ces horaires locaux seront remplacés par les horaires administrables de l’API Symfony.
const MOCK_OPENING_HOURS = {
  0: [{ name: 'Midi', start: '12:00', end: '15:00' }],
  1: [],
  2: [
    { name: 'Midi', start: '12:00', end: '14:00' },
    { name: 'Soir', start: '19:00', end: '22:30' },
  ],
  3: [
    { name: 'Midi', start: '12:00', end: '14:00' },
    { name: 'Soir', start: '19:00', end: '22:30' },
  ],
  4: [
    { name: 'Midi', start: '12:00', end: '14:00' },
    { name: 'Soir', start: '19:00', end: '22:30' },
  ],
  5: [
    { name: 'Midi', start: '12:00', end: '14:00' },
    { name: 'Soir', start: '19:00', end: '22:30' },
  ],
  6: [
    { name: 'Midi', start: '12:00', end: '15:00' },
    { name: 'Soir', start: '19:00', end: '23:00' },
  ],
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDate(dateValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }

  const date = new Date(`${dateValue}T12:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTime(time) {
  return time.replace(':', ' h ');
}

function generateServiceSlots(service) {
  const slots = [];
  const start = timeToMinutes(service.start);
  const end = timeToMinutes(service.end);

  for (let minutes = start; minutes <= end; minutes += 15) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

// Cette simulation déterministe sera remplacée par les disponibilités réelles de l’API.
function getMockRemainingPlaces(date, time) {
  const source = `${date}-${time}`;
  let hash = 0;

  for (const character of source) {
    hash = ((hash * 31) + character.charCodeAt(0)) >>> 0;
  }

  return hash % (MOCK_MAX_CAPACITY + 1);
}

function getServicesForDate(dateValue) {
  const date = parseDate(dateValue);

  if (!date) {
    return [];
  }

  return MOCK_OPENING_HOURS[date.getDay()] ?? [];
}

function getAvailableSlots(dateValue, guests) {
  return getServicesForDate(dateValue).flatMap((service) => (
    generateServiceSlots(service).map((time) => {
      const remainingPlaces = getMockRemainingPlaces(dateValue, time);

      return {
        service: service.name,
        time,
        remainingPlaces,
        isAvailable: Number.isInteger(guests) && remainingPlaces >= guests,
      };
    })
  ));
}

function readPendingReservation(today) {
  const initialState = {
    guests: DEFAULT_GUESTS,
    date: '',
    allergies: '',
    time: '',
  };

  try {
    const storedValue = sessionStorage.getItem(PENDING_RESERVATION_KEY);

    if (!storedValue) {
      return initialState;
    }

    const storedReservation = JSON.parse(storedValue);
    const guests = Number(storedReservation.guests);
    const date = typeof storedReservation.date === 'string' ? storedReservation.date : '';

    return {
      guests: Number.isInteger(guests) && guests >= MIN_GUESTS && guests <= MAX_GUESTS
        ? guests
        : DEFAULT_GUESTS,
      date: date >= today ? date : '',
      allergies: typeof storedReservation.allergies === 'string'
        ? storedReservation.allergies
        : '',
      time: date >= today && typeof storedReservation.time === 'string'
        ? storedReservation.time
        : '',
    };
  } catch {
    return initialState;
  }
}

function savePendingReservation(state) {
  try {
    sessionStorage.setItem(PENDING_RESERVATION_KEY, JSON.stringify(state));
  } catch {
    // La page reste utilisable si le stockage de session est indisponible.
  }
}

function clearPendingReservation() {
  try {
    sessionStorage.removeItem(PENDING_RESERVATION_KEY);
  } catch {
    // La remise à zéro visuelle reste possible si le stockage est indisponible.
  }
}

export function ReservationPage() {
  return `
    ${Header()}
    <div class="reservation-page">
      <section class="reservation-intro section" aria-labelledby="reservation-page-title">
        <div class="container site-container reservation-intro__content">
          <p class="section-eyebrow">Votre table au Quai Antique</p>
          <h1 id="reservation-page-title">Réserver une table</h1>
          <p>
            Choisissez votre date, le nombre de couverts et un créneau disponible.
            La confirmation définitive nécessitera ensuite un compte client.
          </p>
        </div>
      </section>

      <section class="reservation-section section" aria-label="Formulaire et récapitulatif de réservation">
        <div class="container site-container reservation-layout">
          <form class="reservation-form" id="reservation-form" novalidate>
            <div class="reservation-form__fields">
              <div class="reservation-field">
                <label for="reservation-guests">Nombre de couverts</label>
                <input
                  class="form-control"
                  id="reservation-guests"
                  name="guests"
                  type="number"
                  min="${MIN_GUESTS}"
                  max="${MAX_GUESTS}"
                  value="${DEFAULT_GUESTS}"
                  aria-describedby="reservation-guests-help reservation-guests-error"
                  required
                >
                <p class="reservation-field__help" id="reservation-guests-help">
                  Pour plus de 12 personnes, veuillez contacter le restaurant.
                </p>
                <p class="reservation-error" id="reservation-guests-error"></p>
              </div>

              <div class="reservation-field">
                <label for="reservation-date">Date</label>
                <input
                  class="form-control"
                  id="reservation-date"
                  name="date"
                  type="date"
                  aria-describedby="reservation-date-error"
                  required
                >
                <p class="reservation-error" id="reservation-date-error"></p>
              </div>

              <div class="reservation-field reservation-field--full">
                <label for="reservation-allergies">Allergies éventuelles</label>
                <textarea
                  class="form-control"
                  id="reservation-allergies"
                  name="allergies"
                  rows="4"
                  aria-describedby="reservation-allergies-help"
                ></textarea>
                <p class="reservation-field__help" id="reservation-allergies-help">
                  Signalez toute allergie ou intolérance connue.
                </p>
              </div>
            </div>

            <fieldset class="reservation-slots">
              <legend>Choisir un créneau</legend>
              <p class="reservation-slots__hint">
                Les disponibilités simulées sont actualisées sans rechargement.
              </p>
              <div
                class="reservation-services"
                id="reservation-services"
                tabindex="-1"
                aria-live="polite"
                aria-atomic="true"
              >
                <p class="reservation-empty">Sélectionnez une date pour afficher les créneaux.</p>
              </div>
              <p class="reservation-error" id="reservation-time-error"></p>
            </fieldset>
          </form>

          <aside class="reservation-summary" aria-labelledby="reservation-summary-title">
            <p class="section-eyebrow">Votre demande</p>
            <h2 id="reservation-summary-title">Récapitulatif</h2>
            <dl class="reservation-summary__list" aria-live="polite" aria-atomic="true">
              <div>
                <dt>Couverts</dt>
                <dd id="reservation-summary-guests">2 couverts</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd id="reservation-summary-date">Date à sélectionner</dd>
              </div>
              <div>
                <dt>Heure</dt>
                <dd id="reservation-summary-time">Créneau à sélectionner</dd>
              </div>
              <div>
                <dt>Allergies</dt>
                <dd id="reservation-summary-allergies">Aucune allergie renseignée</dd>
              </div>
            </dl>

            <div class="reservation-actions">
              <button
                class="btn btn-primary"
                id="reservation-submit"
                type="submit"
                form="reservation-form"
                disabled
              >
                Confirmer la réservation
              </button>
              <button class="reservation-clear" id="reservation-clear" type="button">
                Effacer la saisie
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>

    <div
      class="modal fade reservation-auth-modal"
      id="reservation-auth-modal"
      tabindex="-1"
      aria-labelledby="reservation-auth-modal-title"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title" id="reservation-auth-modal-title">Connexion requise</h2>
            <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button>
          </div>
          <div class="modal-body">
            <p>
              Votre saisie est conservée. Connectez-vous ou créez un compte
              pour finaliser cette réservation.
            </p>
          </div>
          <div class="modal-footer reservation-auth-modal__actions">
            <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">
              Continuer la saisie
            </button>
            <a class="btn btn-secondary" href="/inscription" data-link>Créer un compte</a>
            <a class="btn btn-primary" href="/connexion" data-link>Se connecter</a>
          </div>
        </div>
      </div>
    </div>
    ${Footer()}
  `;
}

export function initReservationPage() {
  const form = document.querySelector('#reservation-form');

  if (!form) {
    return undefined;
  }

  const guestsInput = form.querySelector('#reservation-guests');
  const dateInput = form.querySelector('#reservation-date');
  const allergiesInput = form.querySelector('#reservation-allergies');
  const servicesContainer = form.querySelector('#reservation-services');
  const guestsError = form.querySelector('#reservation-guests-error');
  const dateError = form.querySelector('#reservation-date-error');
  const timeError = form.querySelector('#reservation-time-error');
  const submitButton = document.querySelector('#reservation-submit');
  const clearButton = document.querySelector('#reservation-clear');
  const summaryGuests = document.querySelector('#reservation-summary-guests');
  const summaryDate = document.querySelector('#reservation-summary-date');
  const summaryTime = document.querySelector('#reservation-summary-time');
  const summaryAllergies = document.querySelector('#reservation-summary-allergies');
  const authModalElement = document.querySelector('#reservation-auth-modal');

  const requiredElements = [
    guestsInput,
    dateInput,
    allergiesInput,
    servicesContainer,
    guestsError,
    dateError,
    timeError,
    submitButton,
    clearButton,
    summaryGuests,
    summaryDate,
    summaryTime,
    summaryAllergies,
    authModalElement,
  ];

  if (requiredElements.some((element) => !element)) {
    return undefined;
  }

  const today = getLocalDateValue();
  const state = readPendingReservation(today);
  const authModal = Modal.getOrCreateInstance(authModalElement);
  const listeners = [];

  dateInput.min = today;
  guestsInput.value = String(state.guests);
  dateInput.value = state.date;
  allergiesInput.value = state.allergies;

  function addListener(element, eventName, handler) {
    element.addEventListener(eventName, handler);
    listeners.push(() => element.removeEventListener(eventName, handler));
  }

  function getGuests() {
    return Number(guestsInput.value);
  }

  function isGuestsValid() {
    const guests = getGuests();
    return Number.isInteger(guests) && guests >= MIN_GUESTS && guests <= MAX_GUESTS;
  }

  function isDateValid() {
    return Boolean(parseDate(dateInput.value)) && dateInput.value >= today;
  }

  function getCurrentSlots() {
    return isDateValid() && isGuestsValid()
      ? getAvailableSlots(dateInput.value, getGuests())
      : [];
  }

  function isSelectedTimeValid() {
    return getCurrentSlots().some((slot) => slot.time === state.time && slot.isAvailable);
  }

  function updateFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function updateErrors(showTimeError = false) {
    updateFieldError(
      guestsInput,
      guestsError,
      isGuestsValid() ? '' : 'Choisissez un nombre de couverts compris entre 1 et 12.',
    );
    updateFieldError(
      dateInput,
      dateError,
      !dateInput.value && showTimeError
        ? 'Sélectionnez une date.'
        : (!dateInput.value || isDateValid() ? '' : 'Choisissez une date valide à partir d’aujourd’hui.'),
    );
    timeError.textContent = showTimeError && !isSelectedTimeValid()
      ? 'Choisissez un créneau disponible.'
      : '';
  }

  function updateSummary() {
    const guests = getGuests();
    const selectedDate = parseDate(dateInput.value);
    const allergies = allergiesInput.value.trim();

    summaryGuests.textContent = isGuestsValid()
      ? `${guests} ${guests > 1 ? 'couverts' : 'couvert'}`
      : 'Nombre de couverts à corriger';
    summaryDate.textContent = selectedDate && isDateValid()
      ? dateFormatter.format(selectedDate)
      : 'Date à sélectionner';
    summaryTime.textContent = isSelectedTimeValid()
      ? formatTime(state.time)
      : 'Créneau à sélectionner';
    summaryAllergies.textContent = allergies || 'Aucune allergie renseignée';
  }

  function updateSubmitButton() {
    submitButton.disabled = !(isGuestsValid() && isDateValid() && isSelectedTimeValid());
  }

  function persistState() {
    state.guests = guestsInput.value;
    state.date = dateInput.value;
    state.allergies = allergiesInput.value;
    savePendingReservation(state);
  }

  function createSlotButton(slot) {
    const isSelected = slot.time === state.time && slot.isAvailable;
    const statusText = slot.isAvailable
      ? `${slot.remainingPlaces} place${slot.remainingPlaces === 1 ? '' : 's'} restante${slot.remainingPlaces === 1 ? '' : 's'}`
      : 'Indisponible';
    const accessibleStatus = slot.isAvailable
      ? `disponible, ${statusText}`
      : `indisponible pour ${getGuests()} couvert${getGuests() > 1 ? 's' : ''}`;

    return `
      <button
        class="reservation-slot${isSelected ? ' reservation-slot--selected' : ''}"
        type="button"
        data-reservation-time="${slot.time}"
        aria-pressed="${isSelected}"
        aria-label="${formatTime(slot.time)}, ${accessibleStatus}"
        ${slot.isAvailable ? '' : 'disabled'}
      >
        <span class="reservation-slot__time">${formatTime(slot.time)}</span>
        <span class="reservation-slot__status">${statusText}</span>
      </button>
    `;
  }

  function renderServices() {
    if (!dateInput.value) {
      state.time = '';
      servicesContainer.innerHTML = '<p class="reservation-empty">Sélectionnez une date pour afficher les créneaux.</p>';
      return;
    }

    if (!isDateValid()) {
      state.time = '';
      servicesContainer.innerHTML = '<p class="reservation-empty">Choisissez une date valide à partir d’aujourd’hui.</p>';
      return;
    }

    if (!isGuestsValid()) {
      state.time = '';
      servicesContainer.innerHTML = '<p class="reservation-empty">Corrigez le nombre de couverts pour afficher les disponibilités.</p>';
      return;
    }

    const services = getServicesForDate(dateInput.value);
    const allSlots = getAvailableSlots(dateInput.value, getGuests());

    if (services.length === 0) {
      state.time = '';
      servicesContainer.innerHTML = '<p class="reservation-empty">Le restaurant est fermé ce jour-là.</p>';
      return;
    }

    if (!allSlots.some((slot) => slot.time === state.time && slot.isAvailable)) {
      state.time = '';
    }

    servicesContainer.innerHTML = services
      .map((service, index) => {
        const serviceSlots = allSlots.filter((slot) => slot.service === service.name);
        const serviceId = `reservation-service-${index}`;

        return `
          <section class="reservation-service" aria-labelledby="${serviceId}">
            <h2 id="${serviceId}">${service.name}</h2>
            <div class="reservation-slot-grid">
              ${serviceSlots.map(createSlotButton).join('')}
            </div>
          </section>
        `;
      })
      .join('');
  }

  function refreshPage({ showTimeError = false } = {}) {
    renderServices();
    updateErrors(showTimeError);
    updateSummary();
    updateSubmitButton();
    persistState();
  }

  function handleGuestsInput() {
    refreshPage();
  }

  function handleDateInput() {
    state.time = '';
    refreshPage();
  }

  function handleAllergiesInput() {
    updateSummary();
    persistState();
  }

  function handleSlotClick(event) {
    const slotButton = event.target.closest('[data-reservation-time]');

    if (!slotButton || slotButton.disabled) {
      return;
    }

    state.time = slotButton.dataset.reservationTime;
    refreshPage();
  }

  function handleSubmit(event) {
    event.preventDefault();
    refreshPage({ showTimeError: true });

    if (!isGuestsValid() || !isDateValid() || !isSelectedTimeValid()) {
      const firstInvalidField = form.querySelector('.is-invalid') ?? servicesContainer;
      firstInvalidField.focus?.();
      return;
    }

    savePendingReservation({
      guests: getGuests(),
      date: dateInput.value,
      allergies: allergiesInput.value,
      time: state.time,
    });
    authModal.show();
  }

  function handleClear() {
    clearPendingReservation();
    state.guests = DEFAULT_GUESTS;
    state.date = '';
    state.allergies = '';
    state.time = '';
    guestsInput.value = String(DEFAULT_GUESTS);
    dateInput.value = '';
    allergiesInput.value = '';
    refreshPage();
    clearPendingReservation();
    guestsInput.focus();
  }

  addListener(guestsInput, 'input', handleGuestsInput);
  addListener(dateInput, 'change', handleDateInput);
  addListener(allergiesInput, 'input', handleAllergiesInput);
  addListener(servicesContainer, 'click', handleSlotClick);
  addListener(form, 'submit', handleSubmit);
  addListener(clearButton, 'click', handleClear);

  refreshPage();

  return () => {
    listeners.forEach((removeListener) => removeListener());
    authModal.hide();
    authModal.dispose();
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
  };
}
